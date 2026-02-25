"""Playwright 版淘宝爬虫 - 使用无头浏览器 + 反检测"""
import asyncio
import re
import time
import json
import random
from pathlib import Path
from typing import List, Dict, Optional
from playwright.async_api import async_playwright, Page, Browser
from playwright_stealth.stealth import Stealth


class TaobaoPlaywrightSpider:
    """淘宝爬虫类 - Playwright 版本（带反检测）"""

    def __init__(self, keyword: str = None, max_pages: int = 5, use_cookie: bool = True):
        self.keyword = keyword or "咖啡豆"
        self.max_pages = max_pages
        self.use_cookie = use_cookie
        self.data: List[Dict] = []
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None

    def _get_cookie_file(self) -> Path:
        """获取 Cookie 文件路径"""
        return Path(__file__).parent.parent.parent / "data" / "taobao_cookies.json"

    async def _init_browser(self):
        """初始化浏览器（带反检测）"""
        playwright = await async_playwright().start()

        # 使用 stealth 模式启动浏览器
        self.browser = await playwright.chromium.launch(
            headless=True,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
            ]
        )

        context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale='zh-CN',
            timezone_id='Asia/Shanghai',
        )

        # 尝试加载 Cookie
        cookie_file = self._get_cookie_file()
        if self.use_cookie and cookie_file.exists():
            try:
                with open(cookie_file, 'r', encoding='utf-8') as f:
                    cookies = json.load(f)
                await context.add_cookies(cookies)
                print(f"已加载 {len(cookies)} 个 Cookie")
            except Exception as e:
                print(f"加载 Cookie 失败: {e}")

        self.page = await context.new_page()

        # 应用 stealth 反检测
        stealth = Stealth()
        await stealth.apply_stealth_async(self.page)

    async def _close_browser(self):
        """关闭浏览器"""
        if self.browser:
            await self.browser.close()

    def _get_search_url(self, page: int = 1) -> str:
        """生成搜索URL"""
        start = (page - 1) * 44
        return f"https://s.taobao.com/search?q={self.keyword}&s={start}"

    async def _random_delay(self):
        """随机延迟"""
        delay = random.uniform(2, 5)
        await asyncio.sleep(delay)

    async def _scroll_page(self):
        """滚动页面以触发懒加载"""
        for _ in range(5):
            await self.page.mouse.wheel(0, 800)
            await asyncio.sleep(0.8)

    async def request_with_retry(self, url: str) -> Optional[str]:
        """带重试的请求"""
        max_retry = 3

        for attempt in range(max_retry):
            try:
                await self._random_delay()

                # 使用 domcontentloaded 替代 networkidle
                await self.page.goto(url, wait_until='domcontentloaded', timeout=45000)

                # 等待页面加载完成
                await self.page.wait_for_load_state('networkidle', timeout=30000)

                # 检查是否被反爬
                content = await self.page.content()
                if "验证" in content or "滑块" in content or "请点击验证" in content:
                    print(f"触发反爬验证，第{attempt + 1}次重试")
                    await asyncio.sleep(30)
                    continue

                return content

            except Exception as e:
                print(f"请求异常：{e}，第{attempt + 1}次重试")
                if attempt == max_retry - 1:
                    return None
                await asyncio.sleep(5)

        return None

    async def parse_search_page(self, html: str) -> List[Dict]:
        """解析搜索页面"""
        if not html:
            return []

        items = []

        # 方法1: 从页面提取 JSON 数据
        try:
            patterns = [
                r'g_page_config\s*=\s*(\{.*?\})\s*;',
                r'window\.g_shoplist\s*=\s*(\[.*?\])\s*;',
            ]

            for pattern in patterns:
                match = re.search(pattern, html, re.DOTALL)
                if match:
                    try:
                        data = json.loads(match.group(1))
                        auctions = data.get('mods', {}).get('itemlist', {}).get('data', {}).get('auctions', [])
                        for item in auctions:
                            item_info = {
                                'item_id': item.get('nid', ''),
                                'title': item.get('title', ''),
                                'price': item.get('view_price', ''),
                                'sales': item.get('view_sales', '0'),
                                'shop': item.get('nick', ''),
                                'location': item.get('item_loc', ''),
                                'image_url': item.get('pic_url', ''),
                                'detail_url': 'https:' + item.get('detail_url', '') if item.get('detail_url', '').startswith('//') else item.get('detail_url', ''),
                                'crawl_time': time.strftime("%Y-%m-%d %H:%M:%S"),
                            }
                            items.append(item_info)
                        if items:
                            return items
                    except:
                        pass
        except Exception as e:
            print(f"JSON解析失败: {e}")

        # 方法2: 使用 Playwright 选择器直接提取（淘宝新版页面结构）
        try:
            # 等待页面加载
            await asyncio.sleep(3)

            # 滚动页面
            await self._scroll_page()

            # 使用更通用的选择器 - 基于元素属性和结构
            # 查找商品卡片容器
            product_selectors = [
                '[class*="itemWrapper"]',
                '[class*="ItemCard"]',
                '[class*="goodsItem"]',
                '.item',
            ]

            for selector in product_selectors:
                try:
                    await self.page.wait_for_selector(selector, timeout=5000)
                    products = await self.page.query_selector_all(selector)

                    if products and len(products) > 5:
                        print(f"使用选择器 '{selector}' 找到 {len(products)} 个商品")

                        for product in products:
                            try:
                                # 查找标题 - 通用的 class 选择器
                                title_elem = await product.query_selector('[class*="title"]')
                                title = await title_elem.inner_text() if title_elem else ''

                                # 查找价格
                                price_elem = await product.query_selector('[class*="price"]')
                                price = await price_elem.inner_text() if price_elem else ''

                                # 查找销量
                                sales_elem = await product.query_selector('[class*="sale"]')
                                sales = await sales_elem.inner_text() if sales_elem else '0'

                                # 查找店铺
                                shop_elem = await product.query_selector('[class*="shop"]')
                                shop = await shop_elem.inner_text() if shop_elem else ''

                                # 查找图片
                                img_elem = await product.query_selector('img')
                                image_url = ''
                                if img_elem:
                                    image_url = await img_elem.get_attribute('src') or await img_elem.get_attribute('data-src') or ''

                                # 查找详情链接
                                link_elem = await product.query_selector('a')
                                detail_url = ''
                                if link_elem:
                                    detail_url = await link_elem.get_attribute('href') or ''

                                if title and len(title) > 2:
                                    item_info = {
                                        'item_id': '',
                                        'title': title.strip(),
                                        'price': price.strip(),
                                        'sales': sales.strip(),
                                        'shop': shop.strip(),
                                        'location': '',
                                        'image_url': image_url,
                                        'detail_url': detail_url,
                                        'crawl_time': time.strftime("%Y-%m-%d %H:%M:%S"),
                                    }
                                    items.append(item_info)
                            except:
                                continue

                        if items:
                            return items
                except:
                    continue
        except Exception as e:
            print(f"选择器解析失败: {e}")

        # 方法3: 使用 JavaScript 直接提取页面数据
        try:
            js_data = await self.page.evaluate("""
                () => {
                    const items = [];
                    // 查找所有商品卡片
                    const cards = document.querySelectorAll('[class*="itemWrapper"], [class*="ItemCard"]');
                    cards.forEach(card => {
                        try {
                            // 尝试获取标题
                            const titleEl = card.querySelector('[class*="title"]');
                            const title = titleEl ? titleEl.innerText.trim() : '';

                            // 尝试获取价格
                            const priceEl = card.querySelector('[class*="price"]');
                            const price = priceEl ? priceEl.innerText.trim() : '';

                            // 尝试获取销量
                            const saleEl = card.querySelector('[class*="sale"]');
                            const sales = saleEl ? saleEl.innerText.trim() : '0';

                            // 尝试获取店铺
                            const shopEl = card.querySelector('[class*="shop"]');
                            const shop = shopEl ? shopEl.innerText.trim() : '';

                            // 尝试获取图片
                            const imgEl = card.querySelector('img');
                            const imageUrl = imgEl ? (imgEl.src || imgEl.dataset.src || '') : '';

                            // 尝试获取链接
                            const linkEl = card.querySelector('a');
                            const detailUrl = linkEl ? linkEl.href : '';

                            if (title && title.length > 2) {
                                items.push({
                                    title,
                                    price,
                                    sales,
                                    shop,
                                    imageUrl,
                                    detailUrl
                                });
                            }
                        } catch (e) {}
                    });
                    return items;
                }
            """)

            if js_data and len(js_data) > 0:
                print(f"JavaScript 提取到 {len(js_data)} 个商品")
                for item in js_data:
                    items.append({
                        'item_id': '',
                        'title': item.get('title', ''),
                        'price': item.get('price', ''),
                        'sales': item.get('sales', '0'),
                        'shop': item.get('shop', ''),
                        'location': '',
                        'image_url': item.get('imageUrl', ''),
                        'detail_url': item.get('detailUrl', ''),
                        'crawl_time': time.strftime("%Y-%m-%d %H:%M:%S"),
                    })
                return items
        except Exception as e:
            print(f"JavaScript 提取失败: {e}")

        return items

    async def run(self) -> List[Dict]:
        """运行爬虫"""
        print(f"开始爬取关键词 '{self.keyword}'，最多{self.max_pages}页")

        await self._init_browser()

        try:
            for page in range(1, self.max_pages + 1):
                print(f"正在爬取第{page}页...")

                url = self._get_search_url(page)
                html = await self.request_with_retry(url)

                if not html:
                    print(f"第{page}页请求失败")
                    continue

                # 滚动页面触发懒加载
                await self._scroll_page()
                await asyncio.sleep(2)

                # 解析页面
                page_items = await self.parse_search_page(html)

                if not page_items:
                    print(f"第{page}页未解析到商品数据")
                    await asyncio.sleep(10)
                    continue

                self.data.extend(page_items)
                print(f"第{page}页获取到{len(page_items)}条商品数据")

                # 随机延迟
                await asyncio.sleep(random.uniform(3, 7))

        finally:
            await self._close_browser()

        print(f"爬取完成，共获取{len(self.data)}条商品数据")
        return self.data

    def save_to_file(self, filename: str = None):
        """保存数据到文件"""
        if not filename:
            import os
            os.makedirs('data', exist_ok=True)
            filename = f"data/taobao_{self.keyword}_{time.strftime('%Y%m%d_%H%M%S')}.json"

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)

        print(f"数据已保存至：{filename}")
        return filename


async def main():
    """主函数"""
    spider = TaobaoPlaywrightSpider(keyword="咖啡豆", max_pages=1)
    data = await spider.run()

    if data:
        spider.save_to_file()
    else:
        print("未获取到数据")


if __name__ == "__main__":
    asyncio.run(main())
