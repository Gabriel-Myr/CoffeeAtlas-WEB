"""调试脚本 - 查找商品容器"""
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

        page = await context.new_page()

        # 应用 stealth
        stealth = Stealth()
        await stealth.apply_stealth_async(page)

        url = "https://s.taobao.com/search?q=咖啡豆"
        print(f"访问: {url}")

        await page.goto(url, wait_until='load', timeout=60000)
        await asyncio.sleep(20)

        # 滚动页面多次
        for i in range(10):
            await page.mouse.wheel(0, 1000)
            await asyncio.sleep(1)

        # 使用 JavaScript 查找商品数据
        result = await page.evaluate("""
            () => {
                // 查找包含商品数量的元素
                const info = {};

                // 查找搜索结果容器
                const containers = document.querySelectorAll('div[class*="container"], div[class*="list"], div[class*="List"], div[id*="list"], div[id*="List"]');
                info.containers = Array.from(containers).map(c => ({
                    class: c.className,
                    childCount: c.children.length,
                    innerHTMLLength: c.innerHTML.length
                }));

                // 尝试直接提取页面中的 JSON 数据
                const scripts = document.querySelectorAll('script');
                const jsonData = [];
                scripts.forEach(s => {
                    const text = s.innerHTML;
                    if (text.includes('itemList') || text.includes('auctions') || text.includes('nid')) {
                        jsonData.push(text.substring(0, 500));
                    }
                });
                info.scriptsWithData = jsonData.length;

                return info;
            }
        """)

        print(f"\n容器信息: {result['containers']}")
        print(f"包含商品数据的 script 数量: {result['scriptsWithData']}")

        # 直接提取页面中的商品数据
        items = await page.evaluate("""
            () => {
                const items = [];

                // 尝试从页面中的 JavaScript 变量获取数据
                try {
                    // 尝试多种 window 变量
                    const possibleVars = ['g_page_config', 'g_config', 'window.g_page_config', 'itemList', 'g_shoplist'];
                    for (const varName of possibleVars) {
                        let data = null;
                        try {
                            data = eval(varName);
                        } catch (e) {}

                        if (data && typeof data === 'object') {
                            console.log('Found:', varName, Object.keys(data));
                        }
                    }
                } catch (e) {
                    console.log('Error:', e);
                }

                return items;
            }
        """)

        # 保存页面内容用于分析
        content = await page.content()
        with open('debug_full.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"\n已保存完整页面到 debug_full.html")

        await browser.close()


if __name__ == "__main__":
    asyncio.run(debug())
