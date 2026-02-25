"""数据清洗模块"""
import re
import json
import pandas as pd
from typing import List, Dict
from pathlib import Path


class DataCleaner:
    """数据清洗类"""

    def __init__(self, data: List[Dict] = None):
        self.data = data or []

    def load_from_file(self, filepath: str) -> List[Dict]:
        """从文件加载数据"""
        with open(filepath, "r", encoding="utf-8") as f:
            self.data = json.load(f)
        return self.data

    def clean(self) -> List[Dict]:
        """执行数据清洗"""
        print(f"开始清洗数据，原始数据 {len(self.data)} 条")

        # 步骤1: 去除重复
        self._deduplicate()
        print(f"去重后 {len(self.data)} 条")

        # 步骤2: 过滤无效数据
        self._filter_invalid()
        print(f"过滤无效数据后 {len(self.data)} 条")

        # 步骤3: 标准化字段
        self._normalize_fields()
        print(f"字段标准化后 {len(self.data)} 条")

        # 步骤4: 排序
        self._sort_by_price()

        return self.data

    def _deduplicate(self):
        """去除重复商品"""
        seen = set()
        unique_data = []

        for item in self.data:
            item_id = item.get("item_id", "")
            if item_id and item_id not in seen:
                seen.add(item_id)
                unique_data.append(item)

        self.data = unique_data

    def _filter_invalid(self):
        """过滤无效数据"""
        valid_data = []

        for item in self.data:
            # 过滤价格为空或异常
            price = item.get("price", "0")
            if not price or price == "0" or price == "0.0":
                continue

            # 过滤标题为空
            title = item.get("title", "")
            if not title or len(title) < 2:
                continue

            # 过滤违禁词（简单示例）
            forbidden_words = ["违规", "违禁", "假货"]
            if any(word in title for word in forbidden_words):
                continue

            valid_data.append(item)

        self.data = valid_data

    def _normalize_fields(self):
        """标准化字段格式"""
        for item in self.data:
            # 价格标准化
            price = item.get("price", "0")
            price_match = re.search(r"(\d+\.?\d*)", str(price))
            item["price"] = float(price_match.group(1)) if price_match else 0.0

            # 销量标准化
            sales = item.get("sales", "0")
            sales_match = re.search(r"(\d+)", str(sales))
            item["sales"] = int(sales_match.group(1)) if sales_match else 0

            # 图片URL补全
            image_url = item.get("image_url", "")
            if image_url and not image_url.startswith("http"):
                item["image_url"] = "https:" + image_url

            # 详情页URL补全
            detail_url = item.get("detail_url", "")
            if detail_url and not detail_url.startswith("http"):
                item["detail_url"] = "https:" + detail_url

    def _sort_by_price(self):
        """按价格排序"""
        self.data.sort(key=lambda x: x.get("price", 0))

    def save_to_json(self, filepath: str):
        """保存为JSON"""
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)
        print(f"清洗后数据已保存至：{filepath}")

    def save_to_csv(self, filepath: str):
        """保存为CSV"""
        df = pd.DataFrame(self.data)
        df.to_csv(filepath, index=False, encoding="utf-8-sig")
        print(f"CSV数据已保存至：{filepath}")

    def get_statistics(self) -> Dict:
        """获取数据统计信息"""
        if not self.data:
            return {}

        prices = [item.get("price", 0) for item in self.data]
        sales = [item.get("sales", 0) for item in self.data]

        return {
            "total_count": len(self.data),
            "avg_price": round(sum(prices) / len(prices), 2) if prices else 0,
            "min_price": min(prices) if prices else 0,
            "max_price": max(prices) if prices else 0,
            "total_sales": sum(sales),
            "avg_sales": round(sum(sales) / len(sales), 2) if sales else 0,
        }


if __name__ == "__main__":
    import sys
    from pathlib import Path

    # 测试清洗功能
    project_root = Path(__file__).parent.parent.parent
    raw_file = project_root / "data" / "coffee-beans.json"

    if raw_file.exists():
        cleaner = DataCleaner()
        cleaner.load_from_file(str(raw_file))
        cleaned_data = cleaner.clean()

        # 保存清洗后数据
        cleaned_file = project_root / "data" / "coffee-beans-cleaned.json"
        cleaner.save_to_json(str(cleaned_file))

        csv_file = project_root / "data" / "coffee-beans.csv"
        cleaner.save_to_csv(str(csv_file))

        # 打印统计
        stats = cleaner.get_statistics()
        print("\n数据统计：")
        for k, v in stats.items():
            print(f"  {k}: {v}")
