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

        page = await context.new_page()

        # 应用 stealth
        stealth = Stealth()
        await stealth.apply_stealth_async(page)

        url = "https://s.taobao.com/search?q=咖啡豆"
        print(f"访问: {url}")

        await page.goto(url, wait_until='load', timeout=60000)
        await asyncio.sleep(15)

        # 滚动页面
        for i in range(5):
            await page.mouse.wheel(0, 800)
            await asyncio.sleep(1)

        # 提取第一个 itemWrapper 的完整内容
        item = await page.query_selector('.itemWrapper')
        if item:
            html = await item.inner_html()
            print("\n第一个 itemWrapper 完整内容:")
            print(html[:2000])
        else:
            print("未找到 itemWrapper")

        await browser.close()


if __name__ == "__main__":
    asyncio.run(debug())
