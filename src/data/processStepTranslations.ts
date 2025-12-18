/**
 * 공정 단계 다국어 번역 데이터베이스
 * 한국어 ↔ 영어 양방향 검색 지원
 */

export interface ProcessStepTranslation {
  id: string;
  ko: string;
  en: string;
  aliases?: {
    ko?: string[];
    en?: string[];
  };
}

// ============ 공정 단계 번역 데이터베이스 ============

export const PROCESS_STEP_TRANSLATIONS: ProcessStepTranslation[] = [
  // ===== 계량 및 준비 =====
  { id: 'measure', ko: '재료 계량', en: 'Measure ingredients', aliases: { ko: ['계량', '재료 준비'], en: ['Weigh ingredients', 'Prep ingredients'] } },
  { id: 'sift', ko: '체치기', en: 'Sift', aliases: { ko: ['가루 체치기', '밀가루 체치기'], en: ['Sifting', 'Sift flour'] } },
  { id: 'soften_butter', ko: '버터 실온화', en: 'Soften butter', aliases: { ko: ['버터 부드럽게'], en: ['Room temperature butter'] } },

  // ===== 믹싱 =====
  { id: 'first_mix', ko: '1차 믹싱', en: 'First mixing', aliases: { ko: ['1차 반죽', '초벌 믹싱'], en: ['Initial mixing', 'First knead'] } },
  { id: 'second_mix', ko: '2차 믹싱', en: 'Second mixing', aliases: { ko: ['2차 반죽', '마무리 믹싱'], en: ['Final mixing', 'Second knead'] } },
  { id: 'add_butter', ko: '버터 첨가', en: 'Add butter', aliases: { ko: ['버터 추가', '버터 넣기'], en: ['Incorporate butter'] } },
  { id: 'knead', ko: '반죽', en: 'Knead', aliases: { ko: ['반죽하기', '치대기'], en: ['Kneading'] } },
  { id: 'hand_knead', ko: '손반죽', en: 'Hand knead', aliases: { ko: ['손으로 반죽'], en: ['Hand kneading', 'Manual kneading'] } },
  { id: 'window_test', ko: '글루텐 체크', en: 'Window pane test', aliases: { ko: ['막 형성 확인', '글루텐 확인'], en: ['Gluten check', 'Membrane test'] } },

  // ===== 발효 =====
  { id: 'first_ferment', ko: '1차 발효', en: 'First fermentation', aliases: { ko: ['1차 발효', '벌크 발효'], en: ['Bulk fermentation', 'First rise'] } },
  { id: 'second_ferment', ko: '2차 발효', en: 'Second fermentation', aliases: { ko: ['2차 발효', '최종 발효'], en: ['Final proof', 'Second rise', 'Proofing'] } },
  { id: 'intermediate_proof', ko: '중간 발효', en: 'Intermediate proofing', aliases: { ko: ['벤치타임', '휴지'], en: ['Bench rest', 'Bench time'] } },
  { id: 'cold_ferment', ko: '저온 발효', en: 'Cold fermentation', aliases: { ko: ['냉장 발효', '오버나이트'], en: ['Overnight fermentation', 'Retarding'] } },

  // ===== 성형 =====
  { id: 'divide', ko: '분할', en: 'Divide', aliases: { ko: ['반죽 분할', '분할하기'], en: ['Dividing', 'Portion'] } },
  { id: 'round', ko: '둥글리기', en: 'Round', aliases: { ko: ['둥글리기', '라운딩'], en: ['Rounding', 'Pre-shaping'] } },
  { id: 'divide_round', ko: '분할 및 둥글리기', en: 'Divide and round', aliases: { ko: ['분할/둥글리기'], en: ['Divide and pre-shape'] } },
  { id: 'shape', ko: '성형', en: 'Shape', aliases: { ko: ['모양잡기', '성형하기'], en: ['Shaping', 'Final shaping'] } },
  { id: 'pan', ko: '패닝', en: 'Pan', aliases: { ko: ['팬에 넣기', '팬닝'], en: ['Panning', 'Place in pan'] } },
  { id: 'shape_pan', ko: '성형 및 패닝', en: 'Shape and pan', aliases: { ko: ['성형/패닝'], en: ['Shape and place'] } },

  // ===== 굽기 =====
  { id: 'preheat', ko: '오븐 예열', en: 'Preheat oven', aliases: { ko: ['예열', '오븐 가열'], en: ['Preheating'] } },
  { id: 'bake', ko: '굽기', en: 'Bake', aliases: { ko: ['굽기', '베이킹'], en: ['Baking'] } },
  { id: 'steam', ko: '스팀', en: 'Steam', aliases: { ko: ['스팀 주입', '증기'], en: ['Steam injection'] } },
  { id: 'score', ko: '칼집', en: 'Score', aliases: { ko: ['쿠프', '칼집 넣기'], en: ['Scoring', 'Slash'] } },

  // ===== 마무리 =====
  { id: 'cool', ko: '식히기', en: 'Cool', aliases: { ko: ['냉각', '식힘'], en: ['Cooling'] } },
  { id: 'unmold', ko: '탈형', en: 'Unmold', aliases: { ko: ['틀에서 빼기', '꺼내기'], en: ['Remove from pan', 'Demold'] } },
  { id: 'glaze', ko: '글레이즈', en: 'Glaze', aliases: { ko: ['윤기 바르기', '시럽 바르기'], en: ['Glazing'] } },
  { id: 'decorate', ko: '장식', en: 'Decorate', aliases: { ko: ['데코레이션', '마무리'], en: ['Decorating', 'Finish'] } },

  // ===== 케이크/페이스트리 =====
  { id: 'cream_butter', ko: '버터 크림화', en: 'Cream butter', aliases: { ko: ['버터 휘핑', '버터 풀기'], en: ['Cream the butter'] } },
  { id: 'add_sugar', ko: '설탕 첨가', en: 'Add sugar', aliases: { ko: ['설탕 넣기'], en: ['Incorporate sugar'] } },
  { id: 'add_eggs', ko: '계란 첨가', en: 'Add eggs', aliases: { ko: ['계란 넣기', '달걀 추가'], en: ['Add eggs gradually'] } },
  { id: 'fold', ko: '폴딩', en: 'Fold', aliases: { ko: ['접기', '섞어넣기'], en: ['Folding', 'Fold in'] } },
  { id: 'whip_cream', ko: '크림 휘핑', en: 'Whip cream', aliases: { ko: ['생크림 휘핑'], en: ['Whipping cream'] } },
  { id: 'meringue', ko: '머랭 만들기', en: 'Make meringue', aliases: { ko: ['머랭 휘핑'], en: ['Meringue'] } },
  { id: 'chill', ko: '냉장', en: 'Chill', aliases: { ko: ['냉장고에 넣기', '차갑게'], en: ['Refrigerate'] } },
  { id: 'freeze', ko: '냉동', en: 'Freeze', aliases: { ko: ['얼리기', '냉동고'], en: ['Freezing'] } },

  // ===== 탕종/사전반죽 =====
  { id: 'tangzhong', ko: '탕종 만들기', en: 'Make tangzhong', aliases: { ko: ['탕종 제조', '호화'], en: ['Water roux', 'Tangzhong'] } },
  { id: 'poolish', ko: '폴리쉬 만들기', en: 'Make poolish', aliases: { ko: ['폴리쉬 제조'], en: ['Poolish'] } },
  { id: 'biga', ko: '비가 만들기', en: 'Make biga', aliases: { ko: ['비가 제조'], en: ['Biga'] } },
  { id: 'levain', ko: '르방 만들기', en: 'Make levain', aliases: { ko: ['르방 제조', '천연발효종'], en: ['Sourdough starter', 'Levain'] } },
];

// ============ 키워드 패턴 (부분 매칭용) ============

export const PROCESS_KEYWORD_PATTERNS: { pattern: RegExp; en: string }[] = [
  // 믹싱 패턴
  { pattern: /믹싱|반죽/i, en: 'mixing' },
  { pattern: /저속/i, en: 'low speed' },
  { pattern: /중속/i, en: 'medium speed' },
  { pattern: /고속/i, en: 'high speed' },

  // 발효 패턴
  { pattern: /발효/i, en: 'fermentation' },
  { pattern: /1차/i, en: 'first' },
  { pattern: /2차/i, en: 'second' },

  // 온도/습도 패턴
  { pattern: /(\d+)°C/i, en: '$1°C' },
  { pattern: /(\d+)%/i, en: '$1%' },
  { pattern: /(\d+)분/i, en: '$1 min' },
  { pattern: /(\d+)시간/i, en: '$1 hour(s)' },

  // 기타 패턴
  { pattern: /분할/i, en: 'divide' },
  { pattern: /둥글리기/i, en: 'round' },
  { pattern: /성형/i, en: 'shape' },
  { pattern: /패닝/i, en: 'pan' },
  { pattern: /굽기|굽다/i, en: 'bake' },
  { pattern: /식히/i, en: 'cool' },
];

// ============ 유틸리티 함수 ============

/**
 * 한글 공정 단계를 영어로 번역 (포괄적 패턴 매칭)
 */
export function translateProcessStep(text: string, targetLang: 'ko' | 'en' = 'en'): string {
  if (targetLang === 'ko') return text;
  if (!text) return '';

  // 1. 정확한 매칭 시도
  const exactMatch = PROCESS_STEP_TRANSLATIONS.find(
    t => t.ko === text || t.aliases?.ko?.includes(text)
  );
  if (exactMatch) return exactMatch.en;

  // 2. 전체 문장 패턴 매핑 (우선순위 높음)
  const sentencePatterns: [RegExp, string][] = [
    // 믹싱/반죽 관련
    [/버터를?\s*제외한?\s*(모든\s*)?재료를?\s*믹싱/g, 'Mix all ingredients except butter'],
    [/버터\s*제외\s*(모든\s*)?재료\s*믹싱/g, 'Mix all ingredients except butter'],
    [/버터를?\s*넣고\s*최종단계까지\s*반죽/g, 'Add butter and knead to final stage'],
    [/버터\s*넣고\s*최종단계까지\s*반죽/g, 'Add butter and knead to final stage'],
    [/최종단계까지\s*반죽/g, 'Knead to final stage'],
    [/최종단계까지\s*믹싱/g, 'Mix to final stage'],
    [/글루텐이?\s*(\d+)%\s*형성되면/g, 'When $1% gluten is developed,'],
    [/글루텐\s*형성/g, 'gluten development'],

    // 발효 관련
    [/1차\s*발효\s*(\d+)-?(\d+)?\s*분/g, 'First rise $1-$2 min'],
    [/1차\s*발효\s*(\d+)\s*분/g, 'First rise $1 min'],
    [/2차\s*발효\s*(\d+)-?(\d+)?\s*분/g, 'Final proof $1-$2 min'],
    [/2차\s*발효\s*(\d+)\s*분/g, 'Final proof $1 min'],
    [/중간\s*발효\s*(\d+)\s*분/g, 'Bench rest $1 min'],

    // 분할/성형 관련
    [/(\d+)등분하여\s*둥글리기/g, 'Divide into $1 pieces and round'],
    [/분할\s*(및|하여)?\s*둥글리기/g, 'Divide and round'],
    [/분할하여\s*둥글리기/g, 'Divide and round'],
    [/둥글리기\s*후\s*(\d+)\s*분\s*휴지/g, 'Round and rest $1 min'],
    [/(\d+)\s*분\s*휴지/g, 'Rest $1 min'],
    [/벤치타임\s*(\d+)\s*분/g, 'Bench rest $1 min'],

    // 성형 관련
    [/성형하여\s*식빵틀에\s*넣기/g, 'Shape and place in loaf pan'],
    [/식빵틀에\s*넣기/g, 'Place in loaf pan'],
    [/바게트\s*모양으로\s*성형/g, 'Shape into baguette'],
    [/브리오슈\s*모양으로\s*성형/g, 'Shape into brioche'],
    [/삼각형으로\s*밀어/g, 'Roll into triangle'],
    [/길쭉하게\s*밀어서/g, 'Roll into a long strip'],
    [/넓게\s*펴서/g, 'Flatten out'],
    [/오므려\s*성형/g, 'Fold and seal'],
    [/이음매가?\s*아래로\s*가게\s*놓고/g, 'Place seam-side down'],

    // 굽기 관련
    [/(\d+)\s*도에서\s*(\d+)-?(\d+)?\s*분\s*굽기/g, 'Bake at $1°C for $2-$3 min'],
    [/(\d+)도에서\s*(\d+)\s*분\s*굽기/g, 'Bake at $1°C for $2 min'],
    [/달걀물\s*바르고/g, 'Brush with egg wash,'],
    [/스팀\s*필수/g, 'steam required'],
    [/쿠프\s*넣고/g, 'Score,'],

    // 기타 조리법
    [/상온\s*버터를?\s*조금씩\s*넣으며/g, 'Gradually add room temperature butter'],
    [/완전히\s*흡수시키기/g, 'until fully absorbed'],
    [/매끈하고\s*광택나는\s*상태/g, 'until smooth and glossy'],
    [/냉장\s*보관/g, 'refrigerate'],
    [/냉장에서\s*(\d+)\s*시간/g, 'in fridge for $1 hours'],
    [/상온에서\s*(\d+)-?(\d+)?\s*시간/g, 'at room temperature for $1-$2 hours'],
    [/틀의\s*(\d+)%\s*까지/g, 'until $1% of pan height'],
    [/틀의\s*(\d+)%/g, '$1% of pan'],

    // 탕종/폴리쉬/기타 제법
    [/【탕종】/g, '[Tangzhong]'],
    [/【본반죽】/g, '[Main Dough]'],
    [/【폴리쉬】/g, '[Poolish]'],
    [/탕종:?/g, 'Tangzhong:'],
    [/폴리쉬:?/g, 'Poolish:'],
    [/오토리즈:?/g, 'Autolyse:'],
    [/(\d+)-?(\d+)?°?C까지\s*(저어가며\s*)?가열/g, 'Heat (stirring) to $1-$2°C'],
    [/랩\s*씌워/g, 'Cover with plastic wrap'],
    [/하룻밤\s*권장/g, 'overnight recommended'],
    [/폴딩\s*(\d+)회/g, '$1 folds'],
    [/(\d+)\s*분마다\s*폴딩/g, 'Fold every $1 min'],

    // 소금빵/충전물 관련
    [/가염버터를?\s*넣고\s*말기/g, 'Add salted butter and roll up'],
    [/굵은\s*소금을?\s*뿌리고/g, 'Sprinkle with coarse salt,'],
    [/검은깨\s*뿌려/g, 'sprinkle with black sesame'],
    [/크림\s*(\d+)g씩\s*넣고/g, 'Add $1g of cream,'],
    [/팥앙금\s*넣고/g, 'Add red bean paste,'],
    [/(\d+)g씩\s*둥글게\s*만들어\s*준비/g, 'Prepare $1g balls'],

    // 소보로/토핑 관련
    [/소보로:\s*/g, 'Streusel: '],
    [/반죽:\s*/g, 'Dough: '],
    [/크림화/g, 'cream together'],
    [/소보로\s*토핑\s*올리기/g, 'Top with streusel'],

    // 커스터드/크림 관련
    [/커스터드\s*크림을?\s*미리\s*만들어/g, 'Prepare custard cream in advance'],
    [/소시지에\s*감아\s*성형/g, 'Wrap around sausage'],
    [/케첩.*머스타드\s*뿌려\s*마무리/g, 'Finish with ketchup and mustard'],
  ];

  // 3. 개별 단어/용어 매핑
  const termMap: Record<string, string> = {
    // 동작
    '믹싱합니다': 'Mix',
    '믹싱': 'mix',
    '반죽합니다': 'Knead',
    '반죽': 'dough',
    '넣고': 'add and',
    '넣기': 'add',
    '넣어': 'add',
    '섞어': 'mix',
    '섞기': 'mix',
    '저어가며': 'while stirring',
    '굽기': 'bake',
    '굽습니다': 'Bake',

    // 재료
    '버터': 'butter',
    '달걀': 'egg',
    '달걀물': 'egg wash',
    '우유': 'milk',
    '물': 'water',
    '설탕': 'sugar',
    '소금': 'salt',
    '이스트': 'yeast',
    '밀가루': 'flour',
    '강력분': 'bread flour',
    '박력분': 'cake flour',
    '팥앙금': 'red bean paste',
    '커스터드': 'custard',
    '소시지': 'sausage',

    // 발효/시간
    '발효': 'fermentation',
    '휴지': 'rest',
    '분': 'min',
    '시간': 'hour',
    '약불': 'low heat',
    '중불': 'medium heat',

    // 성형
    '둥글리기': 'round',
    '성형': 'shape',
    '분할': 'divide',
    '펴서': 'flatten',
    '말기': 'roll up',
    '밀어': 'roll out',
    '감아': 'wrap',

    // 온도/설정
    '도': '°C',
    '상온': 'room temperature',
    '냉장': 'refrigerated',
    '냉동': 'frozen',

    // 상태
    '형성': 'develop',
    '완전히': 'fully',
    '최종단계': 'final stage',
    '흡수': 'absorb',

    // 기타
    '준비': 'prepare',
    '다시': 'again',
    '후': 'after',
    '전': 'before',
    '및': 'and',
    '또는': 'or',
    '에서': 'at',
    '까지': 'until',
  };

  let translated = text;

  // 먼저 전체 문장 패턴 적용
  for (const [pattern, replacement] of sentencePatterns) {
    translated = translated.replace(pattern, replacement as string);
  }

  // 남은 한글 단어에 대해 개별 용어 치환
  for (const [ko, en] of Object.entries(termMap)) {
    translated = translated.replace(new RegExp(ko, 'g'), en);
  }

  // 숫자+단위 패턴 정리
  translated = translated
    .replace(/(\d+)\s*g/g, '$1g')
    .replace(/(\d+)\s*°C/g, '$1°C')
    .replace(/(\d+)\s*min/g, '$1 min')
    .replace(/\s+/g, ' ')
    .trim();

  return translated;
}

/**
 * 공정 단계 검색 (양방향)
 */
export function findProcessStep(name: string): ProcessStepTranslation | undefined {
  const normalizedName = name.toLowerCase().trim();

  return PROCESS_STEP_TRANSLATIONS.find(step =>
    step.ko.toLowerCase() === normalizedName ||
    step.en.toLowerCase() === normalizedName ||
    step.aliases?.ko?.some(a => a.toLowerCase() === normalizedName) ||
    step.aliases?.en?.some(a => a.toLowerCase() === normalizedName)
  );
}

/**
 * 공정 단계 이름 가져오기
 */
export function getProcessStepName(step: ProcessStepTranslation, lang: 'ko' | 'en'): string {
  return lang === 'ko' ? step.ko : step.en;
}
