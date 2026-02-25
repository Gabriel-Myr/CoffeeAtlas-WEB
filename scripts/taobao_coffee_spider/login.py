"""淘宝登录脚本 - 保存 Cookie 用于爬虫"""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright
from playwright_stealth.stealth import Stealth


async def login_and_save_cookies():
    """登录淘宝并保存 Cookie"""
    print("=" * 50)
    print("淘宝登录助手")
    print("=" * 50)
    print("\n请在打开的浏览器中登录淘宝账号")
    print("登录成功后，程序会自动保存 Cookie\n")
    print("等待 60 秒让您登录...\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,  # 非无头模式，方便登录
            args=['--disable-blink-features=AutomationControlled']
        )

        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        )

        page = await context.new_page()

        # 应用 stealth
        stealth = Stealth()
        await stealth.apply_stealth_async(page)

        # 访问淘宝首页
        await page.goto("https://www.taobao.com/", wait_until='networkidle')
        print("已打开淘宝首页")

        # 等待用户登录（60秒超时）
        print("等待登录中... (60秒)")
        await asyncio.sleep(60)

        # 检查是否登录成功
        await page.goto("https://www.taobao.com/", wait_until='networkidle')
        content = await page.content()

        # 获取 Cookie
        cookies = await context.cookies()

        # 保存 Cookie
        cookie_file = Path(__file__).parent.parent.parent / "data" / "taobao_cookies.json"
        cookie_file.parent.mkdir(parents=True, exist_ok=True)

        with open(cookie_file, 'w', encoding='utf-8') as f:
            json.dump(cookies, f, ensure_ascii=False, indent=2)

        print(f"\nCookie 已保存到: {cookie_file}")
        print(f"共保存 {len(cookies)} 个 Cookie")

        print("\n请在浏览器中关闭窗口完成操作")
        await asyncio.sleep(5)
        await browser.close()


if __name__ == "__main__":
    asyncio.run(login_and_save_cookies())
