/**
 * 제과제빵 재료 데이터베이스
 * 자동완성 검색용 재료 목록
 */

export interface IngredientInfo {
  name: string
  category: 'flour' | 'liquid' | 'fat' | 'sugar' | 'egg' | 'dairy' | 'leavening' | 'salt' | 'flavoring' | 'nut' | 'fruit' | 'chocolate' | 'other'
  aliases?: string[]  // 별칭 (검색용)
  moisture?: number   // 수분 함량 (%)
  isFlour?: boolean   // 밀가루류 여부
}

// 카테고리별 재료 데이터
export const INGREDIENT_DATABASE: IngredientInfo[] = [
  // ===== 밀가루류 =====
  { name: '강력분', category: 'flour', aliases: ['강력밀가루', '빵밀가루', 'bread flour'], moisture: 14, isFlour: true },
  { name: '중력분', category: 'flour', aliases: ['중력밀가루', 'all purpose flour', 'AP flour'], moisture: 14, isFlour: true },
  { name: '박력분', category: 'flour', aliases: ['박력밀가루', '케이크밀가루', 'cake flour'], moisture: 14, isFlour: true },
  { name: '통밀가루', category: 'flour', aliases: ['전립분', 'whole wheat flour'], moisture: 14, isFlour: true },
  { name: '호밀가루', category: 'flour', aliases: ['라이밀가루', 'rye flour'], moisture: 14, isFlour: true },
  { name: '쌀가루', category: 'flour', aliases: ['멥쌀가루', 'rice flour'], moisture: 14, isFlour: true },
  { name: '찹쌀가루', category: 'flour', aliases: ['glutinous rice flour'], moisture: 14, isFlour: true },
  { name: '아몬드가루', category: 'flour', aliases: ['아몬드파우더', 'almond flour', 'almond powder'], moisture: 5 },
  { name: '코코넛가루', category: 'flour', aliases: ['coconut flour'], moisture: 5 },
  { name: '옥수수전분', category: 'flour', aliases: ['콘스타치', 'corn starch'], moisture: 12 },
  { name: '타피오카전분', category: 'flour', aliases: ['타피오카분', 'tapioca starch'], moisture: 12 },
  { name: '감자전분', category: 'flour', aliases: ['potato starch'], moisture: 12 },

  // ===== 액체류 =====
  { name: '물', category: 'liquid', aliases: ['water'], moisture: 100 },
  { name: '우유', category: 'liquid', aliases: ['milk', '흰우유'], moisture: 87 },
  { name: '두유', category: 'liquid', aliases: ['soy milk'], moisture: 90 },
  { name: '아몬드우유', category: 'liquid', aliases: ['almond milk'], moisture: 95 },
  { name: '귀리우유', category: 'liquid', aliases: ['oat milk', '오트밀크'], moisture: 90 },
  { name: '코코넛밀크', category: 'liquid', aliases: ['coconut milk'], moisture: 70 },
  { name: '연유', category: 'liquid', aliases: ['condensed milk', '가당연유'], moisture: 27 },

  // ===== 유지류 =====
  { name: '버터', category: 'fat', aliases: ['butter', '무염버터', '유염버터'], moisture: 18 },  // USDA: 15-20%
  { name: '무염버터', category: 'fat', aliases: ['unsalted butter'], moisture: 18 },
  { name: '가염버터', category: 'fat', aliases: ['salted butter'], moisture: 18 },
  { name: '마가린', category: 'fat', aliases: ['margarine'], moisture: 16 },
  { name: '식용유', category: 'fat', aliases: ['vegetable oil', '샐러드유', '콩기름'], moisture: 0 },
  { name: '올리브유', category: 'fat', aliases: ['olive oil', '올리브오일'], moisture: 0 },
  { name: '포도씨유', category: 'fat', aliases: ['grape seed oil'], moisture: 0 },
  { name: '코코넛오일', category: 'fat', aliases: ['coconut oil', '코코넛유'], moisture: 0 },
  { name: '쇼트닝', category: 'fat', aliases: ['shortening'], moisture: 0 },
  { name: '라드', category: 'fat', aliases: ['lard', '돼지기름'], moisture: 0 },

  // ===== 당류 =====
  { name: '설탕', category: 'sugar', aliases: ['sugar', '백설탕', '정백당'], moisture: 0 },
  { name: '황설탕', category: 'sugar', aliases: ['brown sugar', '갈색설탕'], moisture: 3 },
  { name: '흑설탕', category: 'sugar', aliases: ['dark brown sugar', '머스코바도'], moisture: 5 },
  { name: '슈가파우더', category: 'sugar', aliases: ['powdered sugar', '분당', '아이싱슈가'], moisture: 0 },
  { name: '꿀', category: 'sugar', aliases: ['honey', '벌꿀'], moisture: 17 },
  { name: '물엿', category: 'sugar', aliases: ['corn syrup', '옥수수시럽'], moisture: 20 },
  { name: '메이플시럽', category: 'sugar', aliases: ['maple syrup'], moisture: 33 },
  { name: '조청', category: 'sugar', aliases: ['rice syrup', '쌀조청'], moisture: 22 },
  { name: '올리고당', category: 'sugar', aliases: ['oligosaccharide'], moisture: 25 },
  { name: '트레할로스', category: 'sugar', aliases: ['trehalose'], moisture: 0 },

  // ===== 계란류 =====
  { name: '계란', category: 'egg', aliases: ['egg', '달걀', '전란'], moisture: 75 },
  { name: '전란', category: 'egg', aliases: ['whole egg'], moisture: 75 },
  { name: '난황', category: 'egg', aliases: ['egg yolk', '계란노른자', '노른자'], moisture: 50 },
  { name: '난백', category: 'egg', aliases: ['egg white', '계란흰자', '흰자'], moisture: 88 },
  { name: '계란노른자', category: 'egg', aliases: ['yolk'], moisture: 50 },
  { name: '계란흰자', category: 'egg', aliases: ['white'], moisture: 88 },

  // ===== 유제품 =====
  { name: '생크림', category: 'dairy', aliases: ['heavy cream', 'whipping cream', '휘핑크림'], moisture: 60 },
  { name: '사워크림', category: 'dairy', aliases: ['sour cream'], moisture: 74 },  // Wikipedia: ~74%
  { name: '크림치즈', category: 'dairy', aliases: ['cream cheese'], moisture: 55 },
  { name: '마스카포네', category: 'dairy', aliases: ['mascarpone'], moisture: 50 },
  { name: '리코타치즈', category: 'dairy', aliases: ['ricotta'], moisture: 72 },
  { name: '요거트', category: 'dairy', aliases: ['yogurt', '요구르트', '플레인요거트'], moisture: 85 },
  { name: '그릭요거트', category: 'dairy', aliases: ['greek yogurt'], moisture: 75 },
  { name: '버터밀크', category: 'dairy', aliases: ['buttermilk'], moisture: 90 },
  { name: '탈지분유', category: 'dairy', aliases: ['skim milk powder', '분유'], moisture: 3 },

  // ===== 팽창제 =====
  { name: '인스턴트이스트', category: 'leavening', aliases: ['instant yeast', '인스턴트드라이이스트'], moisture: 4 },  // 3-5% 연구자료
  { name: '드라이이스트', category: 'leavening', aliases: ['active dry yeast', '활성건조이스트'], moisture: 7 },  // 7-8% 연구자료
  { name: '생이스트', category: 'leavening', aliases: ['fresh yeast', '생효모', '압착이스트'], moisture: 70 },
  { name: '베이킹파우더', category: 'leavening', aliases: ['baking powder', 'BP'], moisture: 0 },
  { name: '베이킹소다', category: 'leavening', aliases: ['baking soda', '중조', '탄산수소나트륨'], moisture: 0 },

  // ===== 소금 =====
  { name: '소금', category: 'salt', aliases: ['salt', '정제소금', '꽃소금'], moisture: 0 },
  { name: '천일염', category: 'salt', aliases: ['sea salt'], moisture: 2 },

  // ===== 향료/첨가물 =====
  { name: '바닐라익스트랙', category: 'flavoring', aliases: ['vanilla extract', '바닐라에센스'], moisture: 50 },
  { name: '바닐라빈', category: 'flavoring', aliases: ['vanilla bean'], moisture: 25 },
  { name: '바닐라오일', category: 'flavoring', aliases: ['vanilla oil'], moisture: 0 },
  { name: '럼', category: 'flavoring', aliases: ['rum', '럼주'], moisture: 60 },
  { name: '아마레또', category: 'flavoring', aliases: ['amaretto'], moisture: 50 },
  { name: '시나몬', category: 'flavoring', aliases: ['cinnamon', '시나몬파우더', '계피가루'], moisture: 10 },
  { name: '레몬즙', category: 'flavoring', aliases: ['lemon juice'], moisture: 90 },
  { name: '레몬제스트', category: 'flavoring', aliases: ['lemon zest', '레몬껍질'], moisture: 80 },
  { name: '오렌지제스트', category: 'flavoring', aliases: ['orange zest', '오렌지껍질'], moisture: 80 },
  { name: '커피', category: 'flavoring', aliases: ['coffee', '에스프레소'], moisture: 95 },
  { name: '인스턴트커피', category: 'flavoring', aliases: ['instant coffee', '커피파우더'], moisture: 3 },
  { name: '녹차가루', category: 'flavoring', aliases: ['matcha', '말차파우더', '말차'], moisture: 5 },
  { name: '코코아파우더', category: 'flavoring', aliases: ['cocoa powder', '코코아가루', '카카오파우더'], moisture: 5 },

  // ===== 견과류 =====
  { name: '아몬드', category: 'nut', aliases: ['almond', '아몬드슬라이스', '아몬드홀'], moisture: 5 },
  { name: '호두', category: 'nut', aliases: ['walnut'], moisture: 4 },
  { name: '피칸', category: 'nut', aliases: ['pecan'], moisture: 4 },
  { name: '헤이즐넛', category: 'nut', aliases: ['hazelnut', '개암'], moisture: 5 },
  { name: '피스타치오', category: 'nut', aliases: ['pistachio'], moisture: 4 },
  { name: '캐슈넛', category: 'nut', aliases: ['cashew'], moisture: 5 },
  { name: '마카다미아', category: 'nut', aliases: ['macadamia'], moisture: 2 },
  { name: '땅콩', category: 'nut', aliases: ['peanut'], moisture: 6 },

  // ===== 과일 =====
  { name: '건포도', category: 'fruit', aliases: ['raisin', '레이즌'], moisture: 15 },
  { name: '건크랜베리', category: 'fruit', aliases: ['dried cranberry', '크랜베리'], moisture: 16 },  // USDA: 16%
  { name: '건블루베리', category: 'fruit', aliases: ['dried blueberry'], moisture: 15 },
  { name: '사과', category: 'fruit', aliases: ['apple'], moisture: 85 },
  { name: '바나나', category: 'fruit', aliases: ['banana'], moisture: 75 },
  { name: '딸기', category: 'fruit', aliases: ['strawberry'], moisture: 90 },
  { name: '블루베리', category: 'fruit', aliases: ['blueberry'], moisture: 85 },
  { name: '오렌지필', category: 'fruit', aliases: ['candied orange peel', '설탕절임오렌지'], moisture: 20 },

  // ===== 초콜릿 =====
  { name: '다크초콜릿', category: 'chocolate', aliases: ['dark chocolate', '다크커버춰'], moisture: 1 },
  { name: '밀크초콜릿', category: 'chocolate', aliases: ['milk chocolate', '밀크커버춰'], moisture: 1 },
  { name: '화이트초콜릿', category: 'chocolate', aliases: ['white chocolate', '화이트커버춰'], moisture: 1 },
  { name: '초코칩', category: 'chocolate', aliases: ['chocolate chips'], moisture: 1 },
  { name: '카카오닙스', category: 'chocolate', aliases: ['cacao nibs', '카카오닙'], moisture: 3 },
  { name: '카카오버터', category: 'chocolate', aliases: ['cocoa butter', '코코아버터'], moisture: 0 },

  // ===== 기타 =====
  { name: '젤라틴', category: 'other', aliases: ['gelatin', '판젤라틴', '가루젤라틴'], moisture: 10 },
  { name: '한천', category: 'other', aliases: ['agar', '우뭇가사리'], moisture: 20 },
  { name: '펙틴', category: 'other', aliases: ['pectin'], moisture: 10 },
  { name: '몰트', category: 'other', aliases: ['malt', '몰트시럽', '맥아시럽', '디아스타제'], moisture: 20 },
]

// 검색용 재료명 목록 (이름 + 별칭)
export const ALL_INGREDIENT_NAMES: string[] = INGREDIENT_DATABASE.flatMap(
  ing => [ing.name, ...(ing.aliases || [])]
).filter((name, index, self) => self.indexOf(name) === index) // 중복 제거

// 재료명으로 정보 찾기
export function findIngredientInfo(name: string): IngredientInfo | undefined {
  const nameLower = name.toLowerCase()
  return INGREDIENT_DATABASE.find(
    ing => ing.name.toLowerCase() === nameLower ||
           ing.aliases?.some(alias => alias.toLowerCase() === nameLower)
  )
}

// 카테고리별 재료 목록
export function getIngredientsByCategory(category: IngredientInfo['category']): string[] {
  return INGREDIENT_DATABASE
    .filter(ing => ing.category === category)
    .map(ing => ing.name)
}

// 밀가루류 목록
export function getFlourIngredients(): string[] {
  return INGREDIENT_DATABASE
    .filter(ing => ing.isFlour)
    .map(ing => ing.name)
}

// 기본 재료명 목록 (자동완성용)
export const PRIMARY_INGREDIENT_NAMES: string[] = INGREDIENT_DATABASE.map(ing => ing.name)
