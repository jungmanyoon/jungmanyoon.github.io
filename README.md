# 제과제빵 레시피 변환 시스템 종합 가이드

## 📚 목차

1. [제빵 제법 변환 알고리즘](01-baking-methods.md)
2. [팬 크기별 조정 시스템](02-pan-size-adjustments.md)
3. [환경 요인 보정](03-environmental-factors.md)
4. [레시피 데이터 구조](04-recipe-data-structure.md)
5. [UI/UX 설계](05-ui-ux-design.md)
6. [기술 스택과 아키텍처](06-technical-architecture.md)
7. [공유 및 협업 기능](07-sharing-collaboration.md)
8. [신뢰성 확보 방안](08-reliability-validation.md)
9. [얼음과 온도 제어 시스템](09-ice-temperature-control.md)
10. [팬 카테고리화 및 사용자 설정](10-pan-categorization-system.md)
11. [무료 웹 애플리케이션 배포](11-free-web-deployment.md)
12. [알고리즘 및 수식 종합](12-algorithm-formulas.md)
13. [데이터 아키텍처 설계](13-data-architecture.md)

## 🔧 개발자를 위한 필수 문서

- [코드 작성 규칙](CODE_CONVENTIONS.md) - 프로젝트 코딩 스타일 가이드
- [개발 규칙](DEVELOPMENT_RULES.md) - 개발 시 반드시 확인해야 할 사항
- [소프트웨어 아키텍처](SOFTWARE_ARCHITECTURE.md) - 설계 원칙과 패턴
- [Claude 규칙](.claude-rules) - AI 어시스턴트 자동 인식 규칙

## 🎯 프로젝트 개요

이 문서는 제과제빵 레시피를 다양한 제법과 환경에 맞게 자동으로 변환해주는 **무료 웹 애플리케이션** 개발을 위한 종합 가이드입니다.

### 📝 문서 출처
이 프로젝트는 세 가지 LLM(Claude, ChatGPT, Google Gemini)의 분석을 통합하여 작성되었습니다:
- **Claude**: 과학적 알고리즘과 정밀한 계산 공식
- **ChatGPT**: 실용적인 UI/UX 설계와 시스템 구현
- **Google Gemini**: 체계적인 데이터 구조와 3단계 개발 로드맵 

### 주요 기능

- **제빵 제법 자동 변환**: 스트레이트법, 저온숙성법, 폴리쉬법, 중종법 등
- **팬 크기별 정밀 조정**: 다양한 팬 규격에 맞는 자동 재료 계산
- **환경 요인 보정**: 온도, 습도, 고도에 따른 레시피 조정
- **사용자 친화적 인터페이스**: 직관적이고 반응형 웹 애플리케이션
- **협업 및 공유**: 레시피 공유와 커뮤니티 기능

### 목표 사용자

- 홈베이커: 쉽고 정확한 레시피 변환
- 전문 제빵사: 대량 생산을 위한 정밀한 계산
- 제과제빵 학생: 다양한 제법 학습과 실습

## 🚀 시작하기

### 빠른 시작 (Windows)
1. `run.bat` 파일을 더블클릭하여 개발 서버 실행
2. 브라우저에서 http://localhost:5173 으로 접속
3. 빌드: `run.bat build`
4. 미리보기: `run.bat preview`

### 빠른 시작 (Mac/Linux)
```bash
chmod +x start.sh
./start.sh
```

### 수동 설치 및 실행
```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 프로덕션 빌드
npm run build

# 4. 빌드 결과 미리보기
npm run preview
```

### 시스템 요구사항
- Node.js 14.0 이상
- 최신 웹 브라우저 (Chrome, Firefox, Safari, Edge)

## 💡 핵심 원칙

1. **과학적 정확성**: 베이커스 퍼센트를 기반으로 한 정밀한 계산
2. **실용성**: 실제 베이킹 환경에서 검증된 공식 적용
3. **사용자 중심**: 직관적이고 편리한 인터페이스
4. **확장성**: 새로운 제법과 기능 추가 가능한 구조

## 📖 참고 자료

- ChainBaker의 제빵 이론
- Bake with Jack의 팬 크기 계산법
- Food52의 프리퍼먼트 가이드
- 전문 제과제빵 서적 및 논문