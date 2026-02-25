# 淘宝咖啡豆爬虫实施计划

> **For Claude:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development

**Goal:** 构建一个淘宝咖啡豆商品数据爬虫系统，支持本地和云端定时运行，自动获取并清洗咖啡豆商品数据。

**Architecture:** 采用模块化设计，将爬虫、数据清洗、配置分离。爬虫使用 requests 库模拟浏览器请求，数据清洗独立模块处理，GitHub Actions 实现云端定时任务。

**Tech Stack:** Python 3.x, requests, beautifulsoup4, lxml, pandas, GitHub Actions

---

## 阶段一：创建项目结构和配置文件

### Task 1: 创建爬虫脚本目录结构

**Files:**
- Create: `scripts/taobao-coffee-spider/`

**Step 1: 创建目录**

```bash
mkdir -p scripts/taobao-coffee-spider
mkdir -p data
```

**Step 2: 验证目录创建成功**

Run: `ls -la scripts/taobao-coffee-spider/`
Expected: 目录存在且为空

---

### Task 2: 创建配置文件 config.py

**Files:**
- Create: `scripts/taobao-coffee-spider/config.py`

**Step 1: 写入配置文件**

```python
"""淘宝爬虫配置文件"""
import os
from pathlib import Path

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent.parent

# 爬虫配置
SPIDER_CONFIG = {
    "keyword": "咖啡豆",
    "max_pages": 5,
    "delay_range": (1, 3),
    "max_retry": 3,
    "timeout": 10,
}

# 输出配置
OUTPUT_CONFIG = {
    "raw_data_file": PROJECT_ROOT / "data" / "coffee-beans.json",
    "cleaned_data_file": PROJECT_ROOT / "data" / "coffee-beans-cleaned.json",
    "csv_data_file": PROJECT_ROOT / "data" / "coffee-beans.csv",
}

# 请求头配置
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Referer": "https://www.taobao.com/",
}

# 定时任务配置（GitHub Actions 用）
SCHEDULE_CONFIG = {
    "daily": "0 0 * * *",  # 每天 UTC 0:00 (= 北京时间 8:00)
    "weekly": "0 0 * * 0",  # 每周日 UTC 0:00
}
```

**Step 2: 验证文件创建**

Run: `ls scripts/taobao-coffee-spider/config.py`
Expected: 文件存在

---

### Task 3: 创建 requirements.txt

**Files:**
- Create: `scripts/taobao-coffee-spider/requirements.txt`

**Step 1: 写入依赖文件**

```
requests>=2.31.0
beautifulsoup4>=4.12.0
lxml>=4.9.0
pandas>=2.0.0
```

**Step 2: 验证文件创建**

Run: `ls scripts/taobao-coffee-spider/requirements.txt`
Expected: 文件存在

---

## 阶段二：实现爬虫核心模块

### Task 4: 实现爬虫主程序 spider.py

**Files:**
- Create: `scripts/taobao-coffee-spider/spider.py`

**Step 1: 写入爬虫代码**

```python
"""淘宝爬虫主程序"""
import re
import time
import random
import json
import requests
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
from .config import SPIDER_CONFIG, OUTPUT_CONFIG, HEADERS


class TaobaoCoffeeSpider:
    """淘宝咖啡豆爬虫类"""

    def __init__(self, keyword: str = None, max_pages: int = None):
        self.keyword = keyword or SPIDER_CONFIG["keyword"]
        self.max_pages = max_pages or SPIDER_CONFIG["max_pages"]
        self.delay_range = SPIDER_CONFIG["delay_range"]
        self.max_retry = SPIDER_CONFIG["max_retry"]
        self.timeout = SPIDER_CONFIG["timeout"]

        self.session = requests.Session()
        self._setup_session()
        self.data = []

    def _setup_session(self):
        """初始化会话配置"""
        self.session.headers.update(HEADERS)

    def _random_delay(self):
        """随机延迟控制"""
        delay = random.uniform(*self.delay_range)
        time.sleep(delay)

    def _get_search_url(self, page: int = 1) -> str:
        """生成搜索URL"""
        start = (page - 1) * 44
        return f"https://s.taobao.com/search?q={self.keyword}&s={start}"

    def _rotate_headers(self):
        """动态轮换请求头"""
        user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        ]
        self.session.headers["User-Agent"] = random.choice(user_agents)

    def request_with_retry(self, url: str) -> Optional[requests.Response]:
        """带重试机制的请求方法"""
        for attempt in range(self.max_retry):
            try:
                self._random_delay()
                self._rotate_headers()

                response = self.session.get(url, timeout=self.timeout)

                if response.status_code != 200:
                    print(f"请求异常，状态码：{response.status_code}，第{attempt+1}次重试")
                    continue

                if "验证" in response.text or "滑块" in response.text:
                    print("触发反爬验证，需要处理验证码")
                    time.sleep(30)
                    continue

                return response

            except requests.RequestException as e:
                print(f"网络请求异常：{e}，第{attempt+1}次重试")
                if attempt == self.max_retry - 1:
                    print("重试次数已达上限，放弃请求")
                    return None

        return None

    def parse_search_page(self, html: str) -> List[Dict]:
        """解析搜索页面"""
        if not html:
            return []

        items = []

        # 方法1: 尝试从JSON数据中提取
        script_data = self._extract_json_data(html)
        if script_data:
            items.extend(self._parse_json_items(script_data))

        # 方法2: 从HTML中提取备选数据
        soup = BeautifulSoup(html, 'lxml')
        html_items = self._parse_html_items(soup)
        items.extend(html_items)

        return items

    def _extract_json_data(self, html: str) -> Optional[Dict]:
        """从页面脚本中提取JSON数据"""
        try:
            # 匹配淘宝页面中的JSON数据
            patterns = [
                r'g_page_config\s*=\s*(\{.*?\})\s*;',
                r'window\.g_shoplist\s*=\s*(\[.*?\])\s*;',
                r'"itemList":\s*(\[.*?\])',
            ]

            for pattern in patterns:
                match = re.search(pattern, html, re.DOTALL)
                if match:
                    json_str = match.group(1)
                    return json.loads(json_str)

        except (json.JSONDecodeError, AttributeError) as e:
            print(f"JSON数据提取失败：{e}")

        return None

    def _parse_json_items(self, data: Dict) -> List[Dict]:
        """解析JSON格式的商品数据"""
        items = []
        try:
            # 尝试多种数据结构
            auctions = data
            if "mods" in data:
                auctions = data.get("mods", {}).get("itemlist", {}).get("data", {}).get("auctions", [])
            elif "items" in data:
                auctions = data.get("items", [])

            if not isinstance(auctions, list):
                auctions = []

            for item in auctions:
                item_info = {
                    "item_id": item.get("nid", ""),
                    "title": item.get("title", ""),
                    "price": item.get("view_price", item.get("price", "0")),
                    "sales": item.get("view_sales", item.get("sales", "0")),
                    "shop": item.get("nick", item.get("shop", "")),
                    "location": item.get("item_loc", item.get("location", "")),
                    "image_url": item.get("pic_url", item.get("image", "")),
                    "detail_url": item.get("detail_url", item.get("url", "")),
                    "crawl_time": time.strftime("%Y-%m-%d %H:%M:%S"),
                }
                items.append(item_info)

        except Exception as e:
            print(f"解析JSON商品数据失败：{e}")

        return items

    def _parse_html_items(self, soup: BeautifulSoup) -> List[Dict]:
        """从HTML中提取商品数据"""
        items = []

        # 尝试多种选择器
        selectors = [
            ".item",
            ".item-wrap",
            "[data-itemid]",
            ".product-item",
        ]

        for selector in selectors:
            elements = soup.select(selector)
            if elements:
                for elem in elements:
                    try:
                        title_elem = elem.select_one(".title, .item-title, [class*='title']")
                        price_elem = elem.select_one(".price, .item-price, [class*='price']")
                        sales_elem = elem.select_one(".deal-cnt, .sale-num, [class*='sale']")

                        if title_elem:
                            item_info = {
                                "item_id": elem.get("data-itemid", ""),
                                "title": title_elem.get_text(strip=True),
                                "price": price_elem.get_text(strip=True) if price_elem else "0",
                                "sales": sales_elem.get_text(strip=True) if sales_elem else "0",
                                "shop": "",
                                "location": "",
                                "image_url": "",
                                "detail_url": "",
                                "crawl_time": time.strftime("%Y-%m-%d %H:%M:%S"),
                            }
                            items.append(item_info)
                    except Exception:
                        continue
                break

        return items

    def run(self) -> List[Dict]:
        """运行爬虫主流程"""
        print(f"开始爬取关键词 '{self.keyword}'，最多{self.max_pages}页")

        for page in range(1, self.max_pages + 1):
            print(f"正在爬取第{page}页...")

            url = self._get_search_url(page)
            response = self.request_with_retry(url)

            if not response:
                print(f"第{page}页请求失败")
                continue

            page_items = self.parse_search_page(response.text)

            if not page_items:
                print(f"第{page}页未解析到商品数据")
                time.sleep(10)
                continue

            self.data.extend(page_items)
            print(f"第{page}页获取到{len(page_items)}条商品数据")
            time.sleep(random.uniform(2, 5))

        print(f"爬取完成，共获取{len(self.data)}条商品数据")
        return self.data

    def save_to_file(self, filename: str = None):
        """保存数据到文件"""
        if not filename:
            filename = OUTPUT_CONFIG["raw_data_file"]

        with open(filename, "w", encoding="utf-8") as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)

        print(f"数据已保存至：{filename}")
        return filename


if __name__ == "__main__":
    spider = TaobaoCoffeeSpider()
    data = spider.run()
    if data:
        spider.save_to_file()
```

**Step 2: 验证文件创建**

Run: `ls scripts/taobao-coffee-spider/spider.py`
Expected: 文件存在

---

### Task 5: 实现数据清洗模块 cleaner.py

**Files:**
- Create: `scripts/taobao-coffee-spider/cleaner.py`

**Step 1: 写入清洗代码**

```python
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
```

**Step 2: 验证文件创建**

Run: `ls scripts/taobao-coffee-spider/cleaner.py`
Expected: 文件存在

---

### Task 6: 创建入口脚本 main.py

**Files:**
- Create: `scripts/taobao-coffee-spider/main.py`

**Step 1: 写入入口代码**

```python
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
```

**Step 2: 创建 __init__.py**

```bash
touch scripts/taobao-coffee-spider/__init__.py
```

**Step 3: 验证文件创建**

Run: `ls -la scripts/taobao-coffee-spider/`
Expected: 目录包含所有文件

---

## 阶段三：创建 GitHub Actions 工作流

### Task 7: 创建每日定时任务 workflow

**Files:**
- Create: `.github/workflows/spider-daily.yml`

**Step 1: 写入 workflow 文件**

```yaml
name: Daily Coffee Spider

on:
  schedule:
    - cron: "0 0 * * *"  # 每天 UTC 0:00 (北京时间 8:00)
  workflow_dispatch:  # 允许手动触发

jobs:
  crawl:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r scripts/taobao-coffee-spider/requirements.txt

      - name: Run spider
        run: |
          python scripts/taobao-coffee-spider/main.py --keyword "咖啡豆" --pages 3

      - name: Commit and push data
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: 更新咖啡豆数据 $(date +'%Y-%m-%d')"
          file_pattern: "data/*.json data/*.csv"
```

**Step 2: 验证文件创建**

Run: `ls .github/workflows/spider-daily.yml`
Expected: 文件存在

---

### Task 8: 创建每周定时任务 workflow

**Files:**
- Create: `.github/workflows/spider-weekly.yml`

**Step 1: 写入 workflow 文件**

```yaml
name: Weekly Coffee Spider

on:
  schedule:
    - cron: "0 0 * * 0"  # 每周日 UTC 0:00
  workflow_dispatch:

jobs:
  crawl:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r scripts/taobao-coffee-spider/requirements.txt

      - name: Run spider
        run: |
          python scripts/taobao-coffee-spider/main.py --keyword "咖啡豆" --pages 5

      - name: Commit and push data
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: 每周咖啡豆数据更新 $(date +'%Y-%m-%d')"
          file_pattern: "data/*.json data/*.csv"
```

**Step 2: 验证文件创建**

Run: `ls .github/workflows/spider-weekly.yml`
Expected: 文件存在

---

## 阶段四：本地运行配置

### Task 9: 创建本地运行说明

**Files:**
- Create: `scripts/taobao-coffee-spider/README.md`

**Step 1: 写入说明文档**

```markdown
# 淘宝咖啡豆爬虫

## 安装

```bash
pip install -r scripts/taobao-coffee-spider/requirements.txt
```

## 本地运行

### 基本用法

```bash
python scripts/taobao-coffee-spider/main.py
```

### 指定参数

```bash
# 指定关键词和页数
python scripts/taobao-coffee-spider/main.py --keyword "意式咖啡豆" --pages 3

# 跳过数据清洗
python scripts/taobao-coffee-spider/main.py --skip-clean
```

### 本地定时任务 (macOS)

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每天早上8点运行）
0 8 * * * /usr/bin/python3 /Users/gabi/CoffeeStories-WebDB/scripts/taobao-coffee-spider/main.py >> /Users/gabi/CoffeeStories-WebDB/data/spider.log 2>&1
```

## 数据输出

- `data/coffee-beans.json` - 原始数据
- `data/coffee-beans-cleaned.json` - 清洗后数据
- `data/coffee-beans.csv` - CSV 格式
```

**Step 2: 验证文件创建**

Run: `ls scripts/taobao-coffee-spider/README.md`
Expected: 文件存在

---

## 阶段五：验证测试

### Task 10: 安装依赖并测试运行

**Step 1: 安装依赖**

```bash
cd /Users/gabi/CoffeeStories-WebDB
pip install -r scripts/taobao-coffee-spider/requirements.txt
```

**Step 2: 创建 data 目录**

```bash
mkdir -p data
```

**Step 3: 运行爬虫（测试用1页）**

```bash
python scripts/taobao-coffee-spider/main.py --keyword "咖啡豆" --pages 1
```

**预期结果:**
- 成功创建 data/coffee-beans.json
- 成功创建 data/coffee-beans-cleaned.json
- 成功创建 data/coffee-beans.csv

---

## 总结

完成以上任务后，你将拥有：

1. **完整的爬虫系统** (`scripts/taobao-coffee-spider/`)
   - spider.py - 爬虫主程序
   - cleaner.py - 数据清洗模块
   - config.py - 配置文件
   - main.py - 入口脚本

2. **数据输出目录** (`data/`)
   - coffee-beans.json
   - coffee-beans-cleaned.json
   - coffee-beans.csv

3. **GitHub Actions 定时任务**
   - 每日自动更新
   - 每周自动更新
   - 支持手动触发
