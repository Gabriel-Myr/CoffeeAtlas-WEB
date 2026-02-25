"""调试脚本 - 检查淘宝页面结构"""
import asyncio
import json
import re
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

        page = await context.new_page()

        # 应用 stealth
        stealth = Stealth()
        await stealth.apply_stealth_async(page)

        url = "https://s.taobao.com/search?q=咖啡豆"
        print(f"访问: {url}")

        try:
            await page.goto(url, wait_until='load', timeout=60000)
            print("页面加载完成")

            # 等待一段时间让 JS 执行
            await asyncio.sleep(10)

            # 滚动页面触发懒加载
            for i in range(5):
                await page.mouse.wheel(0, 800)
                await asyncio.sleep(1)

            # 获取页面标题
            title = await page.title()
            print(f"页面标题: {title}")

            content = await page.content()
            print(f"页面内容长度: {len(content)}")

            # 尝试提取 JSON 数据
            print("\n尝试提取 JSON 数据:")
            patterns = [r'g_page_config\s*=\s*(\{.*?\})']

            found_data = False
            for pattern in patterns:
                match = re.search(pattern, content)
                if match:
                    print(f"找到 g_page_config!")
                    try:
                        json_str = match.group(1)
                        data = json.loads(json_str)
                        print(f"JSON 解析成功!")
                        print(f"keys: {list(data.keys())[:10]}")

                        if 'mods' in data:
                            print(f"mods keys: {list(data.get('mods', {}).keys())}")
                            found_data = True
                    except Exception as e:
                        print(f"JSON 解析失败: {e}")

            if not found_data:
                # 尝试其他方式获取数据
                print("\n尝试其他方式...")

                # 检查是否跳转到登录页
                if "login" in content.lower() or "登录" in content:
                    print("检测到可能需要登录")

                # 检查是否有验证码
                if "验证" in content:
                    print("检测到验证码")

            # 保存页面内容
            with open('debug_page.html', 'w', encoding='utf-8') as f:
                f.write(content)
            print("\n已保存页面到 debug_page.html")

        except Exception as e:
            print(f"错误: {e}")
            import traceback
            traceback.print_exc()

        await browser.close()


if __name__ == "__main__":
    asyncio.run(debug())
