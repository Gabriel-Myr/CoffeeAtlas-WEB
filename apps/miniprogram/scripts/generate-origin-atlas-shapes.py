#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import tempfile
from pathlib import Path
from typing import Iterable
from urllib.request import urlopen

from shapely.geometry import GeometryCollection, MultiPolygon, Polygon, shape
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / 'src/utils/origin-atlas-shapes.generated.ts'
CACHE_DIR = Path(tempfile.gettempdir()) / 'coffeeatlas-origin-atlas'
CACHE_DIR.mkdir(parents=True, exist_ok=True)

ADMIN0_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson'
ADMIN0_CACHE = CACHE_DIR / 'ne_10m_admin_0_countries.geojson'
ADMIN1_URL = 'https://www.geoboundaries.org/data/geoBoundaries-3_0_0/CHN/ADM1/geoBoundaries-3_0_0-CHN-ADM1.geojson'
ADMIN1_CACHE = CACHE_DIR / 'geoBoundaries-3_0_0-CHN-ADM1.geojson'

TARGET_SIZE = 240.0
PADDING = 8.0
SIMPLIFY_EPSILON = 0.18

COUNTRY_CODES = {
    '印尼': 'IDN',
    '越南': 'VNM',
    '也门': 'YEM',
    '埃塞俄比亚': 'ETH',
    '肯尼亚': 'KEN',
    '卢旺达': 'RWA',
    '坦桑尼亚': 'TZA',
    '乌干达': 'UGA',
    '墨西哥': 'MEX',
    '危地马拉': 'GTM',
    '洪都拉斯': 'HND',
    '尼加拉瓜': 'NIC',
    '哥斯达黎加': 'CRI',
    '巴拿马': 'PAN',
    '萨尔瓦多': 'SLV',
    '哥伦比亚': 'COL',
    '巴西': 'BRA',
    '秘鲁': 'PER',
    '厄瓜多尔': 'ECU',
    '玻利维亚': 'BOL',
}

ADM1_SHAPES = {
    '云南': 'Yunnan',
}

COUNTRY_POLYGON_RATIO = {
    '印尼': 0.003,
    '也门': 0.03,
    '厄瓜多尔': 0.03,
}

CONTINENT_POLYGON_RATIO = {
    'asia': 0.006,
    'africa': 0.006,
    'americas': 0.01,
}


def fetch_geojson(url: str, cache_path: Path) -> dict:
    if not cache_path.exists():
        with urlopen(url, timeout=180) as response:
            cache_path.write_text(response.read().decode('utf-8'), encoding='utf-8')
    return json.loads(cache_path.read_text(encoding='utf-8'))


def collect_polygons(geometry) -> list[Polygon]:
    if geometry.is_empty:
        return []
    if isinstance(geometry, Polygon):
        return [geometry]
    if isinstance(geometry, MultiPolygon):
        return list(geometry.geoms)
    if isinstance(geometry, GeometryCollection):
        polygons: list[Polygon] = []
        for part in geometry.geoms:
            polygons.extend(collect_polygons(part))
        return polygons
    return []


def keep_significant_polygons(polygons: Iterable[Polygon], ratio: float) -> list[Polygon]:
    polygon_list = [polygon for polygon in polygons if polygon.area > 0]
    if not polygon_list:
        return []
    largest_area = max(polygon.area for polygon in polygon_list)
    cutoff = largest_area * ratio
    kept = [polygon for polygon in polygon_list if polygon.area >= cutoff]
    return kept or [max(polygon_list, key=lambda polygon: polygon.area)]


def mercator_x(lon: float) -> float:
    return math.radians(lon)


def mercator_y(lat: float) -> float:
    clamped = max(min(lat, 85.0), -85.0)
    lat_rad = math.radians(clamped)
    return math.log(math.tan(math.pi / 4 + lat_rad / 2))


def project_ring(ring) -> list[tuple[float, float]]:
    points: list[tuple[float, float]] = []
    for lon, lat in ring.coords:
        points.append((mercator_x(float(lon)), mercator_y(float(lat))))
    return points


def format_number(value: float) -> str:
    text = f'{value:.1f}'.rstrip('0').rstrip('.')
    return text if text else '0'


def perpendicular_distance(point: tuple[float, float], start: tuple[float, float], end: tuple[float, float]) -> float:
    if start == end:
        return math.dist(point, start)
    start_x, start_y = start
    end_x, end_y = end
    point_x, point_y = point
    numerator = abs((end_y - start_y) * point_x - (end_x - start_x) * point_y + end_x * start_y - end_y * start_x)
    denominator = math.hypot(end_y - start_y, end_x - start_x)
    return numerator / denominator


def rdp(points: list[tuple[float, float]], epsilon: float) -> list[tuple[float, float]]:
    if len(points) <= 2:
        return points
    start = points[0]
    end = points[-1]
    max_distance = -1.0
    index = -1
    for offset, point in enumerate(points[1:-1], start=1):
        distance = perpendicular_distance(point, start, end)
        if distance > max_distance:
            max_distance = distance
            index = offset
    if max_distance <= epsilon or index == -1:
        return [start, end]
    left = rdp(points[: index + 1], epsilon)
    right = rdp(points[index:], epsilon)
    return left[:-1] + right


def simplify_ring(points: list[tuple[float, float]]) -> list[tuple[float, float]]:
    if len(points) <= 5:
        return points
    open_ring = points[:-1]
    simplified = rdp(open_ring, SIMPLIFY_EPSILON)
    if len(simplified) < 3:
        simplified = open_ring[:3]
    simplified.append(simplified[0])
    return simplified


def geometry_to_svg(polygons: list[Polygon]) -> tuple[str, str, str]:
    projected_rings = [project_ring(polygon.exterior) for polygon in polygons if len(polygon.exterior.coords) >= 4]
    if not projected_rings:
        raise ValueError('No polygon rings available for SVG export.')

    xs = [point[0] for ring in projected_rings for point in ring]
    ys = [point[1] for ring in projected_rings for point in ring]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    width = max_x - min_x
    height = max_y - min_y
    scale = (TARGET_SIZE - 2 * PADDING) / max(width, height)

    normalized_rings: list[list[tuple[float, float]]] = []
    for ring in projected_rings:
        normalized_ring: list[tuple[float, float]] = []
        for x_value, y_value in ring:
            normalized_ring.append(
                (
                    (x_value - min_x) * scale + PADDING,
                    (max_y - y_value) * scale + PADDING,
                )
            )
        normalized_rings.append(simplify_ring(normalized_ring))

    svg_width = width * scale + 2 * PADDING
    svg_height = height * scale + 2 * PADDING
    aspect_ratio = svg_width / svg_height if svg_height else 1
    if aspect_ratio > 1.25:
        frame = 'landscape'
    elif aspect_ratio < 0.82:
        frame = 'portrait'
    else:
        frame = 'balanced'

    commands: list[str] = []
    for ring in normalized_rings:
        head_x, head_y = ring[0]
        coordinates = [f'{format_number(head_x)} {format_number(head_y)}']
        for x_value, y_value in ring[1:]:
            coordinates.append(f'{format_number(x_value)} {format_number(y_value)}')
        commands.append('M ' + ' '.join(coordinates) + ' Z')

    path = ' '.join(commands)
    view_box = f'0 0 {format_number(svg_width)} {format_number(svg_height)}'
    return path, view_box, frame


def continent_filter(continent_id: str, properties: dict) -> bool:
    continent = properties.get('CONTINENT')
    admin = properties.get('ADMIN')
    if continent_id == 'asia':
        return continent == 'Asia'
    if continent_id == 'africa':
        return continent == 'Africa'
    if continent_id == 'americas':
        return continent in {'North America', 'South America'} and admin != 'Greenland'
    return False


def build_shape_maps(admin0_features: list[dict], admin1_features: list[dict]) -> tuple[dict, dict]:
    continent_shapes: dict[str, dict[str, str]] = {}
    for continent_id, ratio in CONTINENT_POLYGON_RATIO.items():
        continent_geometries = [
            shape(feature['geometry']) for feature in admin0_features if continent_filter(continent_id, feature['properties'])
        ]
        unioned = unary_union(continent_geometries)
        polygons = keep_significant_polygons(collect_polygons(unioned), ratio)
        path, view_box, frame = geometry_to_svg(polygons)
        continent_shapes[continent_id] = {
            'path': path,
            'viewBox': view_box,
            'silhouetteFrame': frame,
        }

    country_shapes: dict[str, dict[str, str]] = {}
    for label, code in COUNTRY_CODES.items():
        geometry = next(shape(feature['geometry']) for feature in admin0_features if feature['properties'].get('ADM0_A3') == code)
        polygons = keep_significant_polygons(collect_polygons(geometry), COUNTRY_POLYGON_RATIO.get(label, 0.01))
        path, view_box, frame = geometry_to_svg(polygons)
        country_shapes[label] = {
            'path': path,
            'viewBox': view_box,
            'silhouetteFrame': frame,
        }

    for label, region_name in ADM1_SHAPES.items():
        geometry = next(
            shape(feature['geometry']) for feature in admin1_features if feature['properties'].get('shapeName') == region_name
        )
        polygons = keep_significant_polygons(collect_polygons(geometry), COUNTRY_POLYGON_RATIO.get(label, 0.01))
        path, view_box, frame = geometry_to_svg(polygons)
        country_shapes[label] = {
            'path': path,
            'viewBox': view_box,
            'silhouetteFrame': frame,
        }

    return continent_shapes, country_shapes


def to_ts_object(mapping: dict[str, dict[str, str]]) -> str:
    lines: list[str] = ['{']
    for key, value in mapping.items():
        lines.append(f"  {json.dumps(key, ensure_ascii=False)}: {{")
        lines.append(f"    path: {json.dumps(value['path'], ensure_ascii=False)},")
        lines.append(f"    viewBox: {json.dumps(value['viewBox'], ensure_ascii=False)},")
        lines.append(f"    silhouetteFrame: {json.dumps(value['silhouetteFrame'])},")
        lines.append('  },')
    lines.append('}')
    return '\n'.join(lines)


def main() -> None:
    admin0_data = fetch_geojson(ADMIN0_URL, ADMIN0_CACHE)
    admin1_data = fetch_geojson(ADMIN1_URL, ADMIN1_CACHE)
    continent_shapes, country_shapes = build_shape_maps(admin0_data['features'], admin1_data['features'])
    source = """export type AtlasSilhouetteFrame = 'landscape' | 'portrait' | 'balanced';

export interface AtlasShapeDefinition {
  path: string;
  viewBox: string;
  silhouetteFrame: AtlasSilhouetteFrame;
}

export const GENERATED_CONTINENT_SHAPES: Record<'asia' | 'africa' | 'americas', AtlasShapeDefinition> = """ + to_ts_object(continent_shapes) + """;

export const GENERATED_COUNTRY_SHAPES: Record<string, AtlasShapeDefinition> = """ + to_ts_object(country_shapes) + ";\n"
    OUTPUT_PATH.write_text(source, encoding='utf-8')
    print(f'Wrote {OUTPUT_PATH}')


if __name__ == '__main__':
    main()
