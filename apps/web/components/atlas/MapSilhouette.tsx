import { GEO_CONFIG } from '@/lib/geo-data';

interface MapSilhouetteProps {
  path: string;
  color: string;
  className?: string;
  detail?: boolean;
  interactive?: boolean;
}

export default function MapSilhouette({
  path,
  color,
  className = '',
  detail = false,
  interactive = false,
}: MapSilhouetteProps) {
  return (
    <svg
      viewBox={GEO_CONFIG.VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      className={[
        'h-full w-full transition-transform duration-700 ease-out',
        interactive ? 'group-hover:scale-[1.06]' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <path d={path} fill={color} opacity="0.14" transform="translate(0 6)" />
      <path
        d={path}
        fill={`${color}22`}
        stroke={color}
        strokeWidth={detail ? 2 : GEO_CONFIG.STROKE_WIDTH}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {detail ? (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={GEO_CONFIG.CONTOUR_STROKE_WIDTH}
          strokeDasharray="4 4"
          opacity="0.48"
          transform="translate(8 7) scale(0.84)"
        />
      ) : null}
    </svg>
  );
}
