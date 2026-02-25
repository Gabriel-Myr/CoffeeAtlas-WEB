"""调试脚本 - 检查淘宝搜索结果页面"""
import asyncio
import json
import re
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
            await asyncio.sleep(10)

            # 滚动页面
            for i in range(5):
                await page.mouse.wheel(0, 800)
                await asyncio.sleep(1)

            title = await page.title()
            print(f"页面标题: {title}")

            content = await page.content()
            print(f"页面内容长度: {len(content)}")

            # 检查页面内容
            if "登录" in content and "请登录" in content:
                print("检测到未登录状态")
            elif "验证" in content:
                print("检测到验证码")
            else:
                print("页面加载正常")

            # 尝试提取 JSON 数据
            print("\n尝试提取 JSON 数据:")
            patterns = [r'g_page_config\s*=\s*(\{.*?\})']

            for pattern in patterns:
                match = re.search(pattern, content)
                if match:
                    print(f"找到 g_page_config!")
                    try:
                        json_str = match.group(1)
                        data = json.loads(json_str)
                        print(f"JSON 解析成功!")
                        print(f"keys: {list(data.keys())[:15]}")

                        if 'mods' in data:
                            print(f"mods keys: {list(data.get('mods', {}).keys())}")
                            itemlist = data.get('mods', {}).get('itemlist', {})
                            print(f"itemlist keys: {list(itemlist.keys())}")
                    except Exception as e:
                        print(f"JSON 解析失败: {e}")

            # 保存页面用于调试
            with open('debug_search.html', 'w', encoding='utf-8') as f:
                f.write(content)
            print("\n已保存页面到 debug_search.html")

        except Exception as e:
            print(f"错误: {e}")
            import traceback
            traceback.print_exc()

        await browser.close()


if __name__ == "__main__":
    asyncio.run(debug())
