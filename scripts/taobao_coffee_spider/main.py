#!/usr/bin/env python3
"""淘宝咖啡豆爬虫入口脚本"""
import argparse
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from scripts.taobao_coffee_spider.spider import TaobaoCoffeeSpider
from scripts.taobao_coffee_spider.cleaner import DataCleaner


def main():
    parser = argparse.ArgumentParser(description="淘宝咖啡豆爬虫")
    parser.add_argument("--keyword", "-k", type=str, default="咖啡豆", help="搜索关键词")
    parser.add_argument("--pages", "-p", type=int, default=5, help="爬取页数")
    parser.add_argument("--skip-clean", action="store_true", help="跳过数据清洗")

    args = parser.parse_args()

    print("=" * 50)
    print("淘宝咖啡豆数据爬虫")
    print("=" * 50)

    # 1. 爬取数据
    print("\n[1/2] 开始爬取数据...")
    spider = TaobaoCoffeeSpider(keyword=args.keyword, max_pages=args.pages)
    data = spider.run()

    if not data:
        print("未获取到任何数据，程序退出")
        sys.exit(1)

    # 保存原始数据
    spider.save_to_file()

    # 2. 数据清洗
    if not args.skip_clean:
        print("\n[2/2] 开始清洗数据...")
        project_root = Path(__file__).parent.parent.parent
        raw_file = project_root / "data" / "coffee-beans.json"

        cleaner = DataCleaner()
        cleaner.load_from_file(str(raw_file))
        cleaner.clean()

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

    print("\n完成！")


if __name__ == "__main__":
    main()
