import { createClient } from '@supabase/supabase-js';

// 从环境变量或 .env 文件加载配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lkadpxktijdtibftuuwi.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrYWRweGt0aWpkdGliZnR1dXdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2MTUxNiwiZXhwIjoyMDg2NjM3NTE2fQ.bmiravHx9Gb9EhhPTDteo-Rlr0WKN7Bi7r0dScZrdtc';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const roasters = [
  // 国际知名品牌
  {
    name: 'LAVAZZA',
    name_en: 'LAVAZZA',
    country_code: 'IT',
    city: '都灵',
    description: '意大利顶级咖啡品牌，1895年创立，主打黑牌浓缩咖啡系列，是全球意式咖啡的领导者。',
    website_url: 'https://www.lavazza.com',
    is_public: true
  },
  {
    name: 'illy',
    name_en: 'illy',
    country_code: 'IT',
    city: '的里雅斯特',
    description: '意大利顶级咖啡品牌，1933年创立，以单品咖啡豆供应商闻名，坚持9种阿拉比卡咖啡豆配比。',
    website_url: 'https://www.illy.com',
    is_public: true
  },
  {
    name: 'UCC',
    name_en: 'UCC',
    country_code: 'JP',
    city: '东京',
    description: '日本知名咖啡品牌，1933年创立，定点精心培养咖啡豆，在全球拥有多个咖啡种植基地。',
    website_url: 'https://www.ucc.co.jp',
    is_public: true
  },
  {
    name: "Peet's Coffee",
    name_en: "Peet's Coffee",
    country_code: 'US',
    city: '伯克利',
    description: '美国精品咖啡品牌，1966年创立，深度烘焙的开创者，被誉为"咖啡界祖师爷"，对精品咖啡发展影响深远。',
    website_url: 'https://www.peets.com',
    is_public: true
  },
  {
    name: '星巴克',
    name_en: 'Starbucks',
    country_code: 'US',
    city: '西雅图',
    description: '全球最大咖啡连锁店，1971年创立，以咖啡豆起家，现已遍布全球，成为现代咖啡文化的代名词。',
    website_url: 'https://www.starbucks.com',
    is_public: true
  },
  {
    name: '%Arabica',
    name_en: '%Arabica',
    country_code: 'HK',
    city: '香港',
    description: '高端精品咖啡品牌，2013年创立于香港，以极简设计和精品咖啡著称，全球门店超过100家。',
    website_url: 'https://arabica.co',
    is_public: true
  },
  // 国内精品咖啡品牌
  {
    name: '布蕾克Cafebreak',
    name_en: 'Cafebreak',
    country_code: 'CN',
    city: '上海',
    description: '国货之光，2021年创立，与2024WBC冠军合作，年产能12.6万吨，致力于打造中国精品咖啡标杆。',
    website_url: 'https://cafebreak.cn',
    is_public: true
  },
  {
    name: 'MANNER COFFEE',
    name_en: 'MANNER',
    country_code: 'CN',
    city: '上海',
    description: '国内精品小馆先驱，2015年创立，全国门店超过1000家，以高性价比的精品咖啡著称。',
    website_url: 'https://mannershop.com',
    is_public: true
  },
  {
    name: 'M Stand',
    name_en: 'M Stand',
    country_code: 'CN',
    city: '上海',
    description: '精品咖啡连锁品牌，2017年创立，以高端设计和独特产品矩阵著称，全国门店超过500家。',
    website_url: 'https://mstand.cn',
    is_public: true
  },
  {
    name: 'Seesaw',
    name_en: 'Seesaw',
    country_code: 'CN',
    city: '上海',
    description: '国内精品咖啡先驱，2012年创立，坚持精品咖啡理念，拥有自己的烘焙工厂和咖啡学院。',
    website_url: 'https://seesawcoffee.com',
    is_public: true
  },
  {
    name: '挪瓦咖啡',
    name_en: 'Nowwa',
    country_code: 'CN',
    city: '上海',
    description: '新锐咖啡连锁品牌，2019年创立，全国门店超过1500家，以高品质和便捷服务著称。',
    website_url: 'https://nowwa.com',
    is_public: true
  },
  {
    name: '麦隆咖啡',
    name_en: 'MELLOWER',
    country_code: 'CN',
    city: '上海',
    description: '精品咖啡品牌，2010年创立，集咖啡豆烘焙、门店连锁、咖啡培训于一体。',
    website_url: 'https://mellowercoffee.com',
    is_public: true
  },
  {
    name: '辛鹿咖啡',
    name_en: 'SinloyCoffee',
    country_code: 'CN',
    city: '昆明',
    description: '云南咖啡代表品牌，2008年创立，专注云南精品咖啡，致力于推广中国本土咖啡。',
    website_url: 'https://sinloy.com',
    is_public: true
  },
  // 云南本土品牌
  {
    name: '后谷咖啡',
    name_en: 'Hougu Coffee',
    country_code: 'CN',
    city: '德宏',
    description: '德宏本土品牌，集咖啡种植、深加工、贸易为一体，是云南咖啡的重要代表企业。',
    website_url: 'https://hougucoffee.com',
    is_public: true
  },
  {
    name: '云咖',
    name_en: 'Yunnan Coffee',
    country_code: 'CN',
    city: '昆明',
    description: '云南咖啡厂，1992年成立，年生产能力1000吨，是云南咖啡产业的重要企业。',
    website_url: '',
    is_public: true
  },
  // 其他国内精品咖啡品牌
  {
    name: '鱼眼咖啡',
    name_en: 'Fish Eye Coffee',
    country_code: 'CN',
    city: '北京',
    description: '中国精品咖啡品牌，以独特的烘焙理念和创新的咖啡产品著称。',
    website_url: 'https://fisheyecoffee.com',
    is_public: true
  },
  {
    name: 'M2M咖啡',
    name_en: 'M2M',
    country_code: 'CN',
    city: '上海',
    description: '中国新锐咖啡品牌，专注精品咖啡豆烘焙，为咖啡爱好者提供高品质咖啡。',
    website_url: 'https://m2mcoffee.cn',
    is_public: true
  },
  {
    name: '豆叔咖啡',
    name_en: 'Doushu Coffee',
    country_code: 'CN',
    city: '北京',
    description: '北京精品咖啡品牌，专注咖啡豆烘焙，以其独特的烘焙风格受到咖啡爱好者喜爱。',
    website_url: '',
    is_public: true
  },
  {
    name: '乔治队长',
    name_en: 'Captain George',
    country_code: 'CN',
    city: '上海',
    description: '上海精品咖啡品牌，以其高品质的单一产地咖啡豆和专业的烘焙技术著称。',
    website_url: '',
    is_public: true
  },
  {
    name: '每日咖啡',
    name_en: 'Daily Coffee',
    country_code: 'CN',
    city: '杭州',
    description: '杭州精品咖啡品牌，致力于为日常咖啡爱好者提供优质、平价的精品咖啡。',
    website_url: '',
    is_public: true
  },
  {
    name: '微焙咖啡',
    name_en: 'Micro Roast',
    country_code: 'CN',
    city: '上海',
    description: '上海精品咖啡烘焙品牌，坚持小批量新鲜烘焙，专注于单一产地咖啡。',
    website_url: '',
    is_public: true
  },
  {
    name: 'Manner Coffee',
    name_en: 'Manner',
    country_code: 'AU',
    city: '悉尼',
    description: '澳大利亚精品咖啡品牌，以其高质量的咖啡和友好的社区氛围著称。',
    website_url: 'https://mannersydney.com.au',
    is_public: true
  }
];

async function insertRoasters() {
  console.log(`开始插入 ${roasters.length} 家烘焙商数据...`);

  const { data, error } = await supabase
    .from('roasters')
    .insert(roasters)
    .select();

  if (error) {
    console.error('插入数据时出错:', error);
    process.exit(1);
  }

  console.log(`成功插入 ${data.length} 家烘焙商!`);
  console.log('插入的烘焙商列表:');
  data.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.name} (${r.city}, ${r.country_code})`);
  });
}

insertRoasters();
