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

    def __init__(self, keyword: str = None, max_pages: int = None, delay=(1, 3), max_retry=3):
        self.keyword = keyword or SPIDER_CONFIG["keyword"]
        self.max_pages = max_pages or SPIDER_CONFIG["max_pages"]
        self.delay_range = delay
        self.max_retry = max_retry
        self.timeout = SPIDER_CONFIG["timeout"]

        self.session = requests.Session()
        self._setup_session()
        self.data = []

    def _setup_session(self):
        """初始化会话配置"""
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Referer': 'https://www.taobao.com/',
        })

    def _random_delay(self):
        """随机延迟控制（模拟人类行为）"""
        delay = random.uniform(*self.delay_range)
        time.sleep(delay)

    def _get_search_url(self, page: int = 1) -> str:
        """生成搜索URL（2025年淘宝搜索接口）"""
        # 淘宝搜索页每页44个商品
        start = (page - 1) * 44
        return f"https://s.taobao.com/search?q={self.keyword}&s={start}"

    def _rotate_headers(self):
        """动态轮换请求头（降低检测概率）"""
        user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        ]

        headers = {
            'User-Agent': random.choice(user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
            'Referer': 'https://www.taobao.com/'
        }

        self.session.headers.update(headers)

    def _handle_anti_spider(self):
        """处理反爬机制"""
        print("触发反爬验证，增加延迟后重试...")
        time.sleep(30)

    def request_with_retry(self, url: str, **kwargs) -> Optional[requests.Response]:
        """带重试机制的请求方法"""
        for attempt in range(self.max_retry):
            try:
                self._random_delay()  # 请求前延迟
                self._rotate_headers()

                response = self.session.get(url, timeout=self.timeout, **kwargs)

                # 检查是否被反爬（状态码异常或包含验证页面）
                if response.status_code != 200:
                    print(f"请求异常，状态码：{response.status_code}，第{attempt+1}次重试")
                    continue

                if "验证" in response.text or "滑块" in response.text:
                    print("触发反爬验证，需要处理验证码")
                    self._handle_anti_spider()
                    continue

                return response

            except requests.RequestException as e:
                print(f"网络请求异常：{e}，第{attempt+1}次重试")
                if attempt == self.max_retry - 1:
                    print("重试次数已达上限，放弃请求")
                    return None

        return None

    def parse_search_page(self, html: str) -> List[Dict]:
        """解析搜索页面，提取商品列表"""
        if not html:
            return []

        soup = BeautifulSoup(html, 'lxml')
        items = []

        # 方法1：尝试从JSON数据中提取（淘宝数据主要存储方式）
        script_data = self._extract_json_data(html)
        if script_data:
            items.extend(self._parse_json_items(script_data))

        # 方法2：从HTML中提取备选数据
        html_items = self._parse_html_items(soup)
        items.extend(html_items)

        return items

    def _extract_json_data(self, html: str) -> Optional[Dict]:
        """从页面脚本中提取JSON数据（淘宝主要数据存储方式）"""
        try:
            # 匹配淘宝页面中的JSON数据
            pattern = r'g_page_config\s*=\s*(\{.*?\})\s*;\s*g_srp_loadCss'
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
            # 淘宝JSON数据结构（2025年版本）
            auctions = data.get('mods', {}).get('itemlist', {}).get('data', {}).get('auctions', [])

            for item in auctions:
                item_info = {
                    'item_id': item.get('nid'),
                    'title': item.get('title'),
                    'price': item.get('view_price'),
                    'sales': item.get('view_sales', '0人付款'),
                    'shop': item.get('nick'),
                    'location': item.get('item_loc'),
                    'image_url': item.get('pic_url'),
                    'detail_url': item.get('detail_url'),
                    'crawl_time': time.strftime("%Y-%m-%d %H:%M:%S"),
                }
                items.append(item_info)

        except Exception as e:
            print(f"解析JSON商品数据失败：{e}")

        return items

    def _parse_html_items(self, soup: BeautifulSoup) -> List[Dict]:
        """从HTML中提取商品数据"""
        items = []

        # 尝试多种选择器
        selectors = [".item", ".item-wrap", "[data-itemid]", ".product-item"]

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

    def _handle_font_encryption(self, price_text: str) -> float:
        """处理字体加密（淘宝价格反爬关键）"""
        # 淘宝字体加密映射表（需要定期更新）
        font_mapping = {
            '': '0',
            '': '1',
            '': '2',
            '': '3',
            '': '4',
            '': '5',
            '': '6',
            '': '7',
            '': '8',
            '': '9'
        }

        # 替换加密字符
        for encrypted_char, real_char in font_mapping.items():
            price_text = price_text.replace(encrypted_char, real_char)

        # 提取数字
        price_match = re.search(r'(\d+\.?\d*)', price_text)
        return float(price_match.group(1)) if price_match else 0.0

    def run(self) -> List[Dict]:
        """运行爬虫主流程"""
        print(f"开始爬取关键词 '{self.keyword}'，最多{self.max_pages}页")

        for page in range(1, self.max_pages + 1):
            print(f"正在爬取第{page}页...")

            # 生成URL
            url = self._get_search_url(page)

            # 发送请求
            response = self.request_with_retry(url)
            if not response:
                print(f"第{page}页请求失败")
                continue

            # 解析页面
            page_items = self.parse_search_page(response.text)

            if not page_items:
                print(f"第{page}页未解析到商品数据")
                # 可能是反爬机制触发，增加延迟
                time.sleep(10)
                continue

            self.data.extend(page_items)
            print(f"第{page}页获取到{len(page_items)}条商品数据")

            # 随机延迟，避免请求过于频繁
            time.sleep(random.uniform(2, 5))

        print(f"爬取完成，共获取{len(self.data)}条商品数据")
        return self.data

    def save_to_file(self, filename: str = None):
        """保存数据到文件"""
        if not filename:
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            filename = f"taobao_{self.keyword}_{timestamp}.json"

        # 确保输出目录存在
        import os
        os.makedirs(os.path.dirname(filename) if os.path.dirname(filename) else '.', exist_ok=True)

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)

        print(f"数据已保存至：{filename}")
        return filename


if __name__ == "__main__":
    spider = TaobaoCoffeeSpider()
    data = spider.run()
    if data:
        spider.save_to_file()
