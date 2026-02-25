const XLSX = require('xlsx');

// 读取数据
const workbook = XLSX.readFile('/Users/gabi/Downloads/Coffeebuff.xlsx');
const sheetName = workbook.SheetNames[0];
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

// === 剔除关键词 ===
const excludeKeywords = [
  '意式', '拼配', 'SOE', 'espresso', '意未满', 'omni', '冷萃专用',
  '滤杯', '挂耳架', '挂耳包', '邮费', '挂耳', '组合装', '套装',
  '滤泡', '茶包', '挂耳氮气', '尝鲜装', '试喝'
];

function shouldExclude(name) {
  return excludeKeywords.some(kw => name.includes(kw));
}

// === 产地映射 ===
const countryMap = {
  '埃塞俄比亚': '埃塞俄比亚', '埃塞': '埃塞俄比亚',
  '埃塞西达摩': '埃塞俄比亚', '埃塞耶加': '埃塞俄比亚',
  '哥伦比亚': '哥伦比亚',
  '肯尼亚': '肯尼亚', '肯尼亚Kenya': '肯尼亚',
  '巴拿马': '巴拿马', '巴拿马千峰': '巴拿马', '巴拿马失落大陆': '巴拿马',
  '萨尔瓦多': '萨尔瓦多',
  '哥斯达黎加': '哥斯达黎加',
  '印尼': '印度尼西亚', '苏门答腊': '印度尼西亚',
  '洪都拉斯': '洪都拉斯',
  '尼加拉瓜': '尼加拉瓜',
  '云南': '云南', '中国云南': '云南',
  '厄瓜多尔': '厄瓜多尔',
  '卢旺达': '卢旺达',
  '危地马拉': '危地马拉',
  '巴西': '巴西',
  '巴布亚新几内亚': '巴布亚新几内亚', 'PNG': '巴布亚新几内亚',
  '秘鲁': '秘鲁',
  '坦桑尼亚': '坦桑尼亚',
};

function extractCountry(name) {
  for (const [key, value] of Object.entries(countryMap)) {
    if (name.includes(key)) return value;
  }
  return '';
}

// === 庄园识别 - 手动映射关键庄园 ===
function extractEstate(name) {
  const estates = [];
  
  // 按顺序匹配（更精确的放前面）
  const estateMap = [
    // 埃塞
    { pattern: '果丁丁', estate: '果丁丁' },
    { pattern: '格兰纳', estate: '格兰纳' },
    { pattern: '栀子绿茶', estate: '栀子绿茶' },
    { pattern: 'ALO COFFEE', estate: 'ALO COFFEE' },
    { pattern: '班莎', estate: '班莎' },
    { pattern: 'Bombe', estate: '班莎' },
    { pattern: '圣塔维尼', estate: '圣塔维尼' },
    { pattern: 'TOH处理站', estate: '西达摩TOH处理站' },
    { pattern: '卡拉莫', estate: '卡拉莫' },
    { pattern: 'Danche', estate: 'Danche' },
    { pattern: '单车', estate: '单车' },
    
    // 哥伦比亚
    { pattern: '米兰庄园', estate: '米兰庄园' },
    { pattern: '珍宝庄园', estate: '珍宝庄园' },
    { pattern: '希望庄园', estate: '希望庄园' },
    { pattern: '独木舟庄园', estate: '独木舟庄园' },
    { pattern: '尖峰庄园', estate: '尖峰庄园' },
    { pattern: '圣洁庄园', estate: '圣洁庄园' },
    { pattern: '娜玲珑岩峰庄园', estate: '娜玲珑岩峰庄园' },
    
    // 巴拿马
    { pattern: '失落大陆', estate: '失落大陆' },
    { pattern: '莎朵咖啡卡米斯特庄园', estate: '卡米斯特庄园' },
    { pattern: '卡米斯特庄园', estate: '卡米斯特庄园' },
    { pattern: '千峰庄园', estate: '千峰庄园' },
    
    // 哥斯达黎加
    { pattern: '雪松庄园', estate: '雪松庄园' },
    { pattern: '科佩庄园', estate: '科佩庄园' },
    
    // 卢旺达
    { pattern: '诺娃庄园', estate: '诺娃庄园' },
    
    // 萨尔瓦多
    { pattern: '橙子咖啡', estate: '橙子咖啡' },
    { pattern: '帕拉伊索庄园', estate: '帕拉伊索庄园' },
    
    // 尼加拉瓜
    { pattern: '帕拉伊索庄园', estate: '帕拉伊索庄园' },
    
    // 秘鲁
    { pattern: '洛里芬德庄园', estate: '洛里芬德庄园' },
    { pattern: '赏花庄园', estate: '赏花庄园' },
    { pattern: '玛格丽特庄园', estate: '玛格丽特庄园' },
    
    // 坦桑尼亚
    { pattern: '小红莓', estate: '小红莓' },
    
    // 云南
    { pattern: '信岗', estate: '信岗庄园' },
    { pattern: '赤道丛林', estate: '赤道丛林' },
    
    // 厄瓜多尔
    { pattern: '风车瑰夏', estate: '风车庄园' },
  ];
  
  for (const { pattern, estate } of estateMap) {
    if (name.includes(pattern) && !estates.includes(estate)) {
      estates.push(estate);
    }
  }
  
  return estates.join(', ');
}

// === 品种识别 (整体匹配) ===
const varietyPatterns = [
  { regex: /74158/, name: '74158' },
  { regex: /74110/, name: '74110' },
  { regex: /74112/, name: '74112' },
  { regex: /74140/, name: '74140' },
  { regex: /SL28(?!\d)/, name: 'SL28' },
  { regex: /SL34/, name: 'SL34' },
  { regex: /SL09/, name: 'SL09' },
  { regex: /瑰夏|Geisha/i, name: '瑰夏' },
  { regex: /红波旁/, name: '红波旁' },
  { regex: /粉波旁/, name: '粉波旁' },
  { regex: /条纹波旁/, name: '条纹波旁' },
  { regex: /波旁(?![^,\s])/, name: '波旁' },
  { regex: /卡蒂姆/, name: '卡蒂姆' },
  { regex: /Tabi|塔比/, name: 'Tabi' },
  { regex: /Papayo|木瓜/, name: 'Papayo' },
  { regex: /希爪|AjiGesha|cgle/i, name: '希爪' },
  { regex: /帕卡马拉/, name: '帕卡马拉' },
  { regex: /卡米斯特/, name: '卡米斯特' },
  { regex: /尖身波旁/, name: '尖身波旁' },
];

function extractVariety(name) {
  const found = [];
  for (const p of varietyPatterns) {
    if (p.regex.test(name)) {
      found.push(p.name);
    }
  }
  return found.join(', ');
}

// === 处理法识别 (优先长词) ===
const processPatterns = [
  '双重厌氧水洗', '双重水洗', '双重厌氧', '厌氧蜜处理', '厌氧水洗', '厌氧日晒', '厌氧',
  '白蜜处理', '半水洗', '湿刨', '蜜处理', '日晒', '水洗',
  '氮气发酵', '二氧化碳发酵', '96h厌氧', '96厌氧',
  'CM蜜处理', 'CM日晒', 'CM', '去果皮发酵', '黑蜜处理'
];

function extractProcess(name) {
  for (const p of processPatterns) {
    if (name.includes(p)) return p;
  }
  return '';
}

// === 产季 ===
const harvestPatterns = ['26产季', '25产季', '2026', '2025', '24产季', '23产季'];

function extractHarvest(name) {
  for (const p of harvestPatterns) {
    if (name.includes(p)) {
      if (p === '2026') return '2026';
      if (p === '2025') return '2025';
      if (p === '24产季') return '2024';
      if (p === '23产季') return '2023';
      return p;
    }
  }
  return '';
}

// 清洗数据
const cleaned = [];
const excluded = [];

data.forEach((row, idx) => {
  const name = row['商品名称'];
  
  if (!name || shouldExclude(name)) {
    excluded.push({ ...row, 原因: '需剔除' });
    return;
  }

  const country = extractCountry(name);
  const estate = extractEstate(name);
  const variety = extractVariety(name);
  const process = extractProcess(name);
  const harvest = extractHarvest(name);

  cleaned.push({
    '商品名称': name,
    '店铺名称': row['店铺名称'],
    '销量': row['销量'],
    '图片链接': row['图片链接'],
    '商品链接': row['商品链接'],
    '商品ID': row['商品ID'],
    '产地': country,
    '庄园': estate,
    '品种': variety,
    '处理法': process,
    '产季': harvest
  });
});

// 输出结果
console.log('=== 清洗结果 ===');
console.log(`原始数据: ${data.length} 条`);
console.log(`保留数据: ${cleaned.length} 条`);
console.log(`剔除数据: ${excluded.length} 条`);

// 显示庄园提取结果
console.log('\n=== 庄园提取结果 ===');
cleaned.forEach((row, i) => {
  console.log(`${i+1}. ${row['庄园'] || '(无)'}`);
});

// 保存清洗后的数据
const outputBook = XLSX.utils.book_new();
const outputSheet = XLSX.utils.json_to_sheet(cleaned);
XLSX.utils.book_append_sheet(outputBook, outputSheet, '清洗后');
XLSX.writeFile(outputBook, '/Users/gabi/Downloads/Coffeebuff_清洗后.xlsx');

console.log('\n✅ 已保存到: /Users/gabi/Downloads/Coffeebuff_清洗后.xlsx');
