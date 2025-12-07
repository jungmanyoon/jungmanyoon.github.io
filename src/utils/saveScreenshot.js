// 서버 사이드 스크린샷 저장을 위한 유틸리티
// 이 파일은 Node.js 환경에서 실행되어야 합니다

const fs = require('fs');
const path = require('path');

// Base64 이미지를 파일로 저장
function saveScreenshotToRoot(base64Data, filename = '레시피.png') {
  try {
    // base64 데이터에서 헤더 제거
    const base64Image = base64Data.replace(/^data:image\/png;base64,/, '');
    
    // 프로젝트 루트 디렉토리 경로
    const rootDir = path.join(__dirname, '..', '..');
    const filePath = path.join(rootDir, filename);
    
    // 버퍼로 변환하여 파일 저장
    const buffer = Buffer.from(base64Image, 'base64');
    fs.writeFileSync(filePath, buffer);
    
    console.log(`Screenshot saved to: ${filePath}`);
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Failed to save screenshot:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { saveScreenshotToRoot };