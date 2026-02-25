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
