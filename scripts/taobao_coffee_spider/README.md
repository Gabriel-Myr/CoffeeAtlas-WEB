# 淘宝咖啡豆爬虫

## 安装

```bash
pip install -r scripts/taobao_coffee_spider/requirements.txt
```

## 本地运行

### 基本用法

```bash
python scripts/taobao_coffee_spider/main.py
```

### 指定参数

```bash
# 指定关键词和页数
python scripts/taobao_coffee_spider/main.py --keyword "意式咖啡豆" --pages 3

# 跳过数据清洗
python scripts/taobao_coffee_spider/main.py --skip-clean
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
