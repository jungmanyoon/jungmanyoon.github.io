/**
 * 재료명 다국어 번역 데이터베이스
 * 한국어 ↔ 영어 양방향 검색 지원
 */

export interface IngredientTranslation {
  id: string;
  ko: string;
  en: string;
  aliases?: {
    ko?: string[];
    en?: string[];
  };
  category: string;
  cupWeight?: number;  // 1 US cup 당 그램
}

// ============ 재료 번역 데이터베이스 ============

export const INGREDIENT_TRANSLATIONS: IngredientTranslation[] = [
  // ===== 밀가루류 (Flour) =====
  {
    id: 'bread_flour',
    ko: '강력분',
    en: 'Bread Flour',
    aliases: { ko: ['강력밀가루', '고글루텐밀가루'], en: ['High Gluten Flour', 'Strong Flour'] },
    category: 'flour',
    cupWeight: 127
  },
  {
    id: 'all_purpose_flour',
    ko: '중력분',
    en: 'All-Purpose Flour',
    aliases: { ko: ['중력밀가루', '다목적밀가루'], en: ['Plain Flour', 'AP Flour'] },
    category: 'flour',
    cupWeight: 125
  },
  {
    id: 'cake_flour',
    ko: '박력분',
    en: 'Cake Flour',
    aliases: { ko: ['박력밀가루', '케이크가루'], en: ['Pastry Flour', 'Soft Flour'] },
    category: 'flour',
    cupWeight: 114
  },
  {
    id: 'whole_wheat_flour',
    ko: '통밀가루',
    en: 'Whole Wheat Flour',
    aliases: { ko: ['통밀분', '전립분'], en: ['Wholemeal Flour', 'Graham Flour'] },
    category: 'flour',
    cupWeight: 120
  },
  {
    id: 'rye_flour',
    ko: '호밀가루',
    en: 'Rye Flour',
    aliases: { ko: ['호밀분'] },
    category: 'flour',
    cupWeight: 102
  },
  {
    id: 'rice_flour',
    ko: '쌀가루',
    en: 'Rice Flour',
    aliases: { ko: ['미분'] },
    category: 'flour',
    cupWeight: 158
  },
  {
    id: 'almond_flour',
    ko: '아몬드가루',
    en: 'Almond Flour',
    aliases: { ko: ['아몬드분말', '아몬드파우더'], en: ['Almond Meal', 'Ground Almonds'] },
    category: 'flour',
    cupWeight: 96
  },
  {
    id: 'semolina',
    ko: '세몰리나',
    en: 'Semolina',
    aliases: { ko: ['듀럼밀가루'], en: ['Durum Wheat'] },
    category: 'flour',
    cupWeight: 167
  },

  // ===== 당류 (Sugar) =====
  {
    id: 'white_sugar',
    ko: '백설탕',
    en: 'Granulated Sugar',
    aliases: { ko: ['설탕', '정백당'], en: ['White Sugar', 'Table Sugar'] },
    category: 'sugar',
    cupWeight: 200
  },
  {
    id: 'brown_sugar',
    ko: '황설탕',
    en: 'Brown Sugar',
    aliases: { ko: ['갈색설탕', '흑설탕'], en: ['Light Brown Sugar', 'Dark Brown Sugar'] },
    category: 'sugar',
    cupWeight: 220
  },
  {
    id: 'powdered_sugar',
    ko: '슈가파우더',
    en: 'Powdered Sugar',
    aliases: { ko: ['분당', '가루설탕'], en: ["Confectioner's Sugar", 'Icing Sugar'] },
    category: 'sugar',
    cupWeight: 120
  },
  {
    id: 'honey',
    ko: '꿀',
    en: 'Honey',
    aliases: { ko: ['벌꿀', '천연꿀'] },
    category: 'sugar',
    cupWeight: 340
  },
  {
    id: 'maple_syrup',
    ko: '메이플시럽',
    en: 'Maple Syrup',
    aliases: { ko: ['단풍시럽'] },
    category: 'sugar',
    cupWeight: 322
  },
  {
    id: 'corn_syrup',
    ko: '물엿',
    en: 'Corn Syrup',
    aliases: { ko: ['옥수수시럽'], en: ['Light Corn Syrup'] },
    category: 'sugar',
    cupWeight: 340
  },

  // ===== 유지류 (Fat) =====
  {
    id: 'butter',
    ko: '버터',
    en: 'Butter',
    aliases: { ko: ['무염버터', '가염버터'], en: ['Unsalted Butter', 'Salted Butter'] },
    category: 'fat',
    cupWeight: 227
  },
  {
    id: 'vegetable_oil',
    ko: '식용유',
    en: 'Vegetable Oil',
    aliases: { ko: ['식물성기름', '샐러드유'], en: ['Cooking Oil'] },
    category: 'fat',
    cupWeight: 218
  },
  {
    id: 'olive_oil',
    ko: '올리브오일',
    en: 'Olive Oil',
    aliases: { ko: ['올리브유'], en: ['Extra Virgin Olive Oil', 'EVOO'] },
    category: 'fat',
    cupWeight: 216
  },
  {
    id: 'shortening',
    ko: '쇼트닝',
    en: 'Shortening',
    aliases: { ko: ['식물성쇼트닝'], en: ['Vegetable Shortening'] },
    category: 'fat',
    cupWeight: 205
  },
  {
    id: 'lard',
    ko: '라드',
    en: 'Lard',
    aliases: { ko: ['돼지기름'] },
    category: 'fat',
    cupWeight: 205
  },
  {
    id: 'coconut_oil',
    ko: '코코넛오일',
    en: 'Coconut Oil',
    aliases: { ko: ['코코넛기름', '야자유'] },
    category: 'fat',
    cupWeight: 218
  },

  // ===== 유제품 (Dairy) =====
  {
    id: 'milk',
    ko: '우유',
    en: 'Milk',
    aliases: { ko: ['흰우유', '전유'], en: ['Whole Milk'] },
    category: 'dairy',
    cupWeight: 244
  },
  {
    id: 'heavy_cream',
    ko: '생크림',
    en: 'Heavy Cream',
    aliases: { ko: ['휘핑크림', '동물성크림'], en: ['Whipping Cream', 'Heavy Whipping Cream'] },
    category: 'dairy',
    cupWeight: 238
  },
  {
    id: 'sour_cream',
    ko: '사워크림',
    en: 'Sour Cream',
    category: 'dairy',
    cupWeight: 242
  },
  {
    id: 'cream_cheese',
    ko: '크림치즈',
    en: 'Cream Cheese',
    category: 'dairy',
    cupWeight: 232
  },
  {
    id: 'yogurt',
    ko: '요거트',
    en: 'Yogurt',
    aliases: { ko: ['요구르트', '플레인요거트'], en: ['Plain Yogurt', 'Greek Yogurt'] },
    category: 'dairy',
    cupWeight: 245
  },
  {
    id: 'buttermilk',
    ko: '버터밀크',
    en: 'Buttermilk',
    category: 'dairy',
    cupWeight: 245
  },
  {
    id: 'condensed_milk',
    ko: '연유',
    en: 'Condensed Milk',
    aliases: { ko: ['가당연유'], en: ['Sweetened Condensed Milk'] },
    category: 'dairy',
    cupWeight: 306
  },
  {
    id: 'evaporated_milk',
    ko: '무가당연유',
    en: 'Evaporated Milk',
    category: 'dairy',
    cupWeight: 252
  },
  {
    id: 'milk_powder',
    ko: '분유',
    en: 'Milk Powder',
    aliases: { ko: ['탈지분유'], en: ['Dry Milk', 'Powdered Milk'] },
    category: 'dairy',
    cupWeight: 68
  },

  // ===== 계란류 (Egg) =====
  {
    id: 'egg',
    ko: '계란',
    en: 'Egg',
    aliases: { ko: ['달걀', '전란'], en: ['Whole Egg'] },
    category: 'egg'
  },
  {
    id: 'egg_yolk',
    ko: '노른자',
    en: 'Egg Yolk',
    aliases: { ko: ['난황'] },
    category: 'egg'
  },
  {
    id: 'egg_white',
    ko: '흰자',
    en: 'Egg White',
    aliases: { ko: ['난백'] },
    category: 'egg'
  },

  // ===== 이스트/발효 (Yeast) =====
  {
    id: 'yeast',
    ko: '이스트',
    en: 'Yeast',
    aliases: { ko: ['드라이이스트', '효모'], en: ['Dry Yeast'] },
    category: 'yeast'
  },
  {
    id: 'instant_yeast',
    ko: '인스턴트 이스트',
    en: 'Instant Yeast',
    aliases: { ko: ['인스턴트드라이이스트', '인스턴트 드라이이스트', '인스턴트 드라이 이스트', 'SAF이스트', 'IDY'], en: ['Instant Dry Yeast', 'Rapid Rise Yeast', 'IDY'] },
    category: 'yeast'
  },
  {
    id: 'active_dry_yeast',
    ko: '액티브 드라이 이스트',
    en: 'Active Dry Yeast',
    aliases: { ko: ['드라이이스트'], en: ['ADY'] },
    category: 'yeast'
  },
  {
    id: 'fresh_yeast',
    ko: '생이스트',
    en: 'Fresh Yeast',
    aliases: { ko: ['압착이스트', '케이크이스트'], en: ['Compressed Yeast', 'Cake Yeast'] },
    category: 'yeast'
  },
  {
    id: 'sourdough_starter',
    ko: '천연발효종',
    en: 'Sourdough Starter',
    aliases: { ko: ['르방', '사워도우스타터'], en: ['Levain', 'Natural Starter'] },
    category: 'yeast'
  },
  {
    id: 'baking_powder',
    ko: '베이킹파우더',
    en: 'Baking Powder',
    category: 'yeast'
  },
  {
    id: 'baking_soda',
    ko: '베이킹소다',
    en: 'Baking Soda',
    aliases: { ko: ['중조', '탄산수소나트륨'], en: ['Bicarbonate of Soda'] },
    category: 'yeast'
  },

  // ===== 소금/조미료 (Salt) =====
  {
    id: 'salt',
    ko: '소금',
    en: 'Salt',
    aliases: { ko: ['정제염', '꽃소금'], en: ['Table Salt', 'Fine Salt'] },
    category: 'salt',
    cupWeight: 288
  },
  {
    id: 'sea_salt',
    ko: '천일염',
    en: 'Sea Salt',
    aliases: { ko: ['바다소금'] },
    category: 'salt'
  },
  {
    id: 'kosher_salt',
    ko: '코셔소금',
    en: 'Kosher Salt',
    aliases: { en: ['Coarse Salt'] },
    category: 'salt'
  },

  // ===== 액체류 (Liquid) =====
  {
    id: 'water',
    ko: '물',
    en: 'Water',
    category: 'liquid',
    cupWeight: 237
  },
  {
    id: 'warm_water',
    ko: '따뜻한 물',
    en: 'Warm Water',
    aliases: { ko: ['미온수'] },
    category: 'liquid',
    cupWeight: 237
  },
  {
    id: 'cold_water',
    ko: '찬물',
    en: 'Cold Water',
    aliases: { ko: ['냉수'] },
    category: 'liquid',
    cupWeight: 237
  },

  // ===== 첨가물 (Additive) =====
  {
    id: 'vanilla_extract',
    ko: '바닐라 익스트랙',
    en: 'Vanilla Extract',
    aliases: { ko: ['바닐라에센스', '바닐라향'] },
    category: 'additive'
  },
  {
    id: 'vanilla_bean',
    ko: '바닐라빈',
    en: 'Vanilla Bean',
    aliases: { ko: ['바닐라콩'] },
    category: 'additive'
  },
  {
    id: 'cocoa_powder',
    ko: '코코아파우더',
    en: 'Cocoa Powder',
    aliases: { ko: ['코코아가루'], en: ['Unsweetened Cocoa'] },
    category: 'additive',
    cupWeight: 86
  },
  {
    id: 'chocolate_chips',
    ko: '초콜릿칩',
    en: 'Chocolate Chips',
    aliases: { ko: ['초코칩'] },
    category: 'additive',
    cupWeight: 170
  },
  {
    id: 'cinnamon',
    ko: '시나몬',
    en: 'Cinnamon',
    aliases: { ko: ['계피', '계피가루'], en: ['Ground Cinnamon'] },
    category: 'additive'
  },
  {
    id: 'nutmeg',
    ko: '넛맥',
    en: 'Nutmeg',
    aliases: { ko: ['육두구'] },
    category: 'additive'
  },
  {
    id: 'cardamom',
    ko: '카다몬',
    en: 'Cardamom',
    category: 'additive'
  },
  {
    id: 'lemon_zest',
    ko: '레몬제스트',
    en: 'Lemon Zest',
    aliases: { ko: ['레몬껍질'] },
    category: 'additive'
  },
  {
    id: 'orange_zest',
    ko: '오렌지제스트',
    en: 'Orange Zest',
    aliases: { ko: ['오렌지껍질'] },
    category: 'additive'
  },
  {
    id: 'diastatic_malt',
    ko: '디아스타틱 몰트',
    en: 'Diastatic Malt',
    aliases: { ko: ['맥아분말', '몰트파우더'], en: ['Malt Powder'] },
    category: 'additive'
  },
  {
    id: 'vital_wheat_gluten',
    ko: '활성글루텐',
    en: 'Vital Wheat Gluten',
    aliases: { ko: ['글루텐가루'] },
    category: 'additive'
  },

  // ===== 견과류 (Nuts) =====
  {
    id: 'walnuts',
    ko: '호두',
    en: 'Walnuts',
    category: 'additive',
    cupWeight: 117
  },
  {
    id: 'almonds',
    ko: '아몬드',
    en: 'Almonds',
    category: 'additive',
    cupWeight: 143
  },
  {
    id: 'pecans',
    ko: '피칸',
    en: 'Pecans',
    category: 'additive',
    cupWeight: 109
  },
  {
    id: 'hazelnuts',
    ko: '헤이즐넛',
    en: 'Hazelnuts',
    aliases: { ko: ['개암'] },
    category: 'additive',
    cupWeight: 135
  },
  {
    id: 'hazelnut_flour',
    ko: '헤이즐넛가루',
    en: 'Hazelnut Flour',
    aliases: { ko: ['헤이즐넛분말', '헤이즐넛파우더'], en: ['Hazelnut Meal', 'Ground Hazelnuts'] },
    category: 'flour',
    cupWeight: 112
  },
  {
    id: 'flaxseed',
    ko: '아마씨',
    en: 'Flaxseed',
    aliases: { ko: ['아마씨드', '플랙시드'], en: ['Linseed', 'Flax'] },
    category: 'additive'
  },
  {
    id: 'chia_seeds',
    ko: '치아씨드',
    en: 'Chia Seeds',
    aliases: { ko: ['치아시드'] },
    category: 'additive'
  },

  // ===== 과일류 (Fruits) =====
  {
    id: 'raisins',
    ko: '건포도',
    en: 'Raisins',
    category: 'additive',
    cupWeight: 165
  },
  {
    id: 'dried_cranberries',
    ko: '건크랜베리',
    en: 'Dried Cranberries',
    aliases: { en: ['Craisins'] },
    category: 'additive',
    cupWeight: 120
  },
  {
    id: 'candied_fruit',
    ko: '설탕절임과일',
    en: 'Candied Fruit',
    aliases: { ko: ['과일절임'] },
    category: 'additive'
  },
  {
    id: 'apple_sauce',
    ko: '사과소스',
    en: 'Apple Sauce',
    aliases: { ko: ['애플소스', '사과퓨레'], en: ['Applesauce', 'Apple Puree'] },
    category: 'additive'
  },
  {
    id: 'banana',
    ko: '바나나',
    en: 'Banana',
    aliases: { ko: ['으깬바나나'], en: ['Mashed Banana'] },
    category: 'additive'
  },

  // ===== 식물성 대체유 (Plant Milk) =====
  {
    id: 'soy_milk',
    ko: '두유',
    en: 'Soy Milk',
    aliases: { ko: ['콩우유'], en: ['Soya Milk'] },
    category: 'dairy'
  },
  {
    id: 'almond_milk',
    ko: '아몬드우유',
    en: 'Almond Milk',
    aliases: { ko: ['아몬드밀크'] },
    category: 'dairy'
  },
  {
    id: 'oat_milk',
    ko: '귀리우유',
    en: 'Oat Milk',
    aliases: { ko: ['오트밀크', '귀리밀크'] },
    category: 'dairy'
  },
  {
    id: 'coconut_cream',
    ko: '코코넛크림',
    en: 'Coconut Cream',
    aliases: { ko: ['코코넛밀크'] },
    category: 'dairy'
  },
  {
    id: 'greek_yogurt',
    ko: '그릭요거트',
    en: 'Greek Yogurt',
    aliases: { ko: ['그리스요거트'] },
    category: 'dairy'
  },
  {
    id: 'mascarpone',
    ko: '마스카포네',
    en: 'Mascarpone',
    aliases: { ko: ['마스카르포네'] },
    category: 'dairy'
  },

  // ===== 추가 유지류 (Additional Fats) =====
  {
    id: 'margarine',
    ko: '마가린',
    en: 'Margarine',
    category: 'fat'
  },

  // ===== 전분류 (Starch) =====
  {
    id: 'corn_starch',
    ko: '옥수수전분',
    en: 'Corn Starch',
    aliases: { ko: ['콘스타치'], en: ['Cornstarch', 'Maize Starch'] },
    category: 'flour'
  },
  {
    id: 'potato_starch',
    ko: '감자전분',
    en: 'Potato Starch',
    category: 'flour'
  },
  {
    id: 'tapioca_starch',
    ko: '타피오카전분',
    en: 'Tapioca Starch',
    aliases: { ko: ['타피오카분말'], en: ['Tapioca Flour'] },
    category: 'flour'
  },

  // ===== 초콜릿류 (Chocolate) =====
  {
    id: 'dark_chocolate',
    ko: '다크초콜릿',
    en: 'Dark Chocolate',
    aliases: { ko: ['다크초코', '쓴초콜릿'], en: ['Bittersweet Chocolate'] },
    category: 'additive'
  },
  {
    id: 'milk_chocolate',
    ko: '밀크초콜릿',
    en: 'Milk Chocolate',
    aliases: { ko: ['밀크초코'] },
    category: 'additive'
  },

  // ===== 겔화제 (Gelling Agents) =====
  {
    id: 'gelatin',
    ko: '젤라틴',
    en: 'Gelatin',
    aliases: { ko: ['젤라틴분말', '판젤라틴'], en: ['Gelatine', 'Sheet Gelatin'] },
    category: 'additive'
  },
  {
    id: 'agar',
    ko: '한천',
    en: 'Agar',
    aliases: { ko: ['우뭇가사리', '아가'], en: ['Agar-Agar'] },
    category: 'additive'
  },
  {
    id: 'aquafaba',
    ko: '아쿠아파바',
    en: 'Aquafaba',
    aliases: { ko: ['병아리콩물'] },
    category: 'additive'
  },

  // ===== 베이킹 보조재 (Baking Aids) =====
  {
    id: 'cream_of_tartar',
    ko: '크림오브타르타르',
    en: 'Cream of Tartar',
    aliases: { ko: ['주석산수소칼륨'] },
    category: 'additive'
  }
];

// ============ 검색 함수 ============

/**
 * ID로 재료 찾기
 */
export function getIngredientById(id: string): IngredientTranslation | undefined {
  return INGREDIENT_TRANSLATIONS.find(ing => ing.id === id);
}

/**
 * 한국어 이름으로 재료 찾기 (별칭 포함)
 */
export function findIngredientByKorean(name: string): IngredientTranslation | undefined {
  // 공백 제거하여 비교 (띄어쓰기 차이 허용)
  const normalizedName = name.toLowerCase().trim();
  const noSpaceName = normalizedName.replace(/\s+/g, '');

  return INGREDIENT_TRANSLATIONS.find(ing => {
    const ingKo = ing.ko.toLowerCase();
    const ingKoNoSpace = ingKo.replace(/\s+/g, '');

    // 정확한 매칭
    if (ingKo === normalizedName) return true;
    // 공백 무시 매칭
    if (ingKoNoSpace === noSpaceName) return true;

    // alias 매칭 (공백 무시)
    if (ing.aliases?.ko?.some(alias => {
      const aliasLower = alias.toLowerCase();
      return aliasLower === normalizedName || aliasLower.replace(/\s+/g, '') === noSpaceName;
    })) return true;

    return false;
  });
}

/**
 * 영어 이름으로 재료 찾기 (별칭 포함)
 */
export function findIngredientByEnglish(name: string): IngredientTranslation | undefined {
  // 공백 제거하여 비교 (띄어쓰기 차이 허용)
  const normalizedName = name.toLowerCase().trim();
  const noSpaceName = normalizedName.replace(/\s+/g, '');

  return INGREDIENT_TRANSLATIONS.find(ing => {
    const ingEn = ing.en.toLowerCase();
    const ingEnNoSpace = ingEn.replace(/\s+/g, '');

    // 정확한 매칭
    if (ingEn === normalizedName) return true;
    // 공백 무시 매칭
    if (ingEnNoSpace === noSpaceName) return true;

    // alias 매칭 (공백 무시)
    if (ing.aliases?.en?.some(alias => {
      const aliasLower = alias.toLowerCase();
      return aliasLower === normalizedName || aliasLower.replace(/\s+/g, '') === noSpaceName;
    })) return true;

    return false;
  });
}

/**
 * 아무 언어로나 재료 찾기
 */
export function findIngredient(name: string): IngredientTranslation | undefined {
  return findIngredientByKorean(name) || findIngredientByEnglish(name);
}

/**
 * 재료 이름 번역 (한국어 → 영어)
 */
export function translateToEnglish(koreanName: string): string {
  const ingredient = findIngredientByKorean(koreanName);
  return ingredient?.en || koreanName;
}

/**
 * 재료 이름 번역 (영어 → 한국어)
 */
export function translateToKorean(englishName: string): string {
  const ingredient = findIngredientByEnglish(englishName);
  return ingredient?.ko || englishName;
}

/**
 * 현재 언어에 따른 재료 이름 가져오기
 */
export function getIngredientName(
  ingredient: IngredientTranslation,
  language: 'ko' | 'en'
): string {
  return language === 'ko' ? ingredient.ko : ingredient.en;
}

/**
 * 카테고리별 재료 목록
 */
export function getIngredientsByCategory(category: string): IngredientTranslation[] {
  return INGREDIENT_TRANSLATIONS.filter(ing => ing.category === category);
}

/**
 * 자동완성용 재료 검색
 */
export function searchIngredients(
  query: string,
  language: 'ko' | 'en',
  limit: number = 10
): IngredientTranslation[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  return INGREDIENT_TRANSLATIONS
    .filter(ing => {
      const mainName = language === 'ko' ? ing.ko : ing.en;
      const aliases = language === 'ko' ? ing.aliases?.ko : ing.aliases?.en;

      if (mainName.toLowerCase().includes(normalizedQuery)) return true;
      if (aliases?.some(alias => alias.toLowerCase().includes(normalizedQuery))) return true;
      return false;
    })
    .slice(0, limit);
}

/**
 * 베이킹 노트/설명 번역 (한국어 → 영어)
 * 대체재료 주의사항 등에서 사용되는 일반적인 베이킹 용어 번역
 */
export function translateBakingNote(note: string, targetLang: 'ko' | 'en' = 'en'): string {
  if (targetLang === 'ko') return note;
  if (!note) return '';

  // 한글 → 영어 베이킹 용어 매핑
  const termMap: Record<string, string> = {
    // 일반 베이킹 용어
    '고형분': 'solids content',
    '수분': 'moisture',
    '감안': 'considering',
    '추가': 'add',
    '감소': 'reduce',
    '권장': 'recommended',
    '필요': 'needed',
    '효과': 'effect',
    '차이': 'difference',
    '손실': 'loss',
    '촉촉': 'moist',
    '쫄깃': 'chewy',
    '부드러': 'soft',
    '단단': 'firm',
    '풍미': 'flavor',
    '질감': 'texture',
    // 특성/지표
    '단맛': 'sweetness',
    '지수': 'index',
    '활성도': 'activity',
    '농도': 'concentration',
    '비율': 'ratio',
    '함량': 'content',
    '강도': 'intensity',
    '점도': 'viscosity',
    '당도': 'sugar content',
    '산도': 'acidity',
    '염도': 'salinity',
    // 단위/수량
    '큰술': 'tbsp',
    '작은술': 'tsp',
    '티스푼': 'tsp',
    '테이블스푼': 'tbsp',
    '컵': 'cup',
    '분': 'min',
    '시간': 'hour',
    '개': 'pcs',
    '조각': 'pieces',
    // 재료 관련
    '버터': 'butter',
    '설탕': 'sugar',
    '밀가루': 'flour',
    '계란': 'egg',
    '우유': 'milk',
    '물': 'water',
    '소금': 'salt',
    '글루텐': 'gluten',
    '전분': 'starch',
    // 공정
    '발효': 'fermentation',
    '반죽': 'dough',
    '굽기': 'baking',
    '혼합': 'mixing',
    '방치': 'resting',
    '불림': 'soaking',
    '예비발효': 'proofing',
    // 기타
    '약간': 'slightly',
    '정도': 'about',
    '가량': 'approximately',
  };

  let translated = note;

  // 숫자+% 패턴 유지
  // 각 한글 용어를 영어로 치환
  for (const [ko, en] of Object.entries(termMap)) {
    translated = translated.replace(new RegExp(ko, 'g'), en);
  }

  return translated;
}

export default {
  INGREDIENT_TRANSLATIONS,
  getIngredientById,
  findIngredientByKorean,
  findIngredientByEnglish,
  findIngredient,
  translateToEnglish,
  translateToKorean,
  getIngredientName,
  getIngredientsByCategory,
  searchIngredients,
  translateBakingNote
};
