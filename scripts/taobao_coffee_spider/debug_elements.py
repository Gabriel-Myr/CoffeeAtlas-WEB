"""调试脚本 - 检查淘宝页面元素"""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright
from playwright_stealth.stealth import Stealth


async def debug():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--disable-blink-features=AutomationControlled']
        )

        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        )

        # 加载 Cookie
        cookie_file = Path(__file__).parent.parent.parent / "data" / "taobao_cookies.json"
        if cookie_file.exists():
            with open(cookie_file, 'r', encoding='utf-8') as f:
                cookies = json.load(f)
            await context.add_cookies(cookies)
            print(f"已加载 {len(cookies)} 个 Cookie")

        page = await context.new_page()

        # 应用 stealth
        stealth = Stealth()
        await stealth.apply_stealth_async(page)

        url = "https://s.taobao.com/search?q=咖啡豆"
        print(f"访问: {url}")

        try:
            await page.goto(url, wait_until='load', timeout=60000)
            await asyncio.sleep(15)  # 等待更长时间

            # 滚动页面
            for i in range(5):
                await page.mouse.wheel(0, 800)
                await asyncio.sleep(1)

            # 使用 JavaScript 提取页面信息
            result = await page.evaluate("""
                () => {
                    const info = {
                        allClassNames: [],
                        itemCards: [],
                        titles: [],
                        prices: [],
                    };

                    // 获取所有元素的 class
                    const allElements = document.querySelectorAll('*');
                    const classes = new Set();
                    allElements.forEach(el => {
                        if (el.className && typeof el.className === 'string') {
                            classes.add(el.className);
                        }
                    });
                    info.allClassNames = Array.from(classes).slice(0, 50);

                    // 查找包含 item 或 card 的元素
                    const cards = document.querySelectorAll('[class*="item"], [class*="Card"], [class*="Item"]');
                    info.itemCards = cards.length;

                    // 查找标题元素
                    const titles = document.querySelectorAll('[class*="title"], [class*="Title"]');
                    info.titles = titles.length;

                    // 查找价格元素
                    const prices = document.querySelectorAll('[class*="price"], [class*="Price"]');
                    info.prices = prices.length;

                    return info;
                }
            """)

            print(f"\n页面分析结果:")
            print(f"  商品卡片数量: {result['itemCards']}")
            print(f"  标题元素数量: {result['titles']}")
            print(f"  价格元素数量: {result['prices']}")
            print(f"\n部分 class 名称:")
            for cls in result['allClassNames'][:20]:
                print(f"  {cls}")

            # 尝试提取商品数据
            items = await page.evaluate("""
                () => {
                    const items = [];
                    // 尝试查找所有可能包含商品信息的容器
                    const selectors = [
                        '[class*="itemWrapper"]',
                        '[class*="ItemCard"]',
                        '[class*="item"]',
                        '[class*="Card"]',
                    ];

                    for (const sel of selectors) {
                        const els = document.querySelectorAll(sel);
                        if (els.length > 10) {
                            console.log('Found selector:', sel, 'count:', els.length);
                            els.forEach(el => {
                                const html = el.outerHTML;
                                if (html.length > 100 && html.length < 5000) {
                                    items.push({
                                        class: el.className,
                                        html: html.substring(0, 500)
                                    });
                                }
                            });
                            break;
                        }
                    }
                    return items.slice(0, 3);
                }
            """)

            print(f"\n找到 {len(items)} 个可能的商品元素:")
            for i, item in enumerate(items):
                print(f"\n--- 商品 {i+1} ---")
                print(f"Class: {item['class']}")
                print(f"HTML: {item['html'][:300]}...")

        except Exception as e:
            print(f"错误: {e}")
            import traceback
            traceback.print_exc()

        await browser.close()


if __name__ == "__main__":
    asyncio.run(debug())
