const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// 미들웨어 설정
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 스크린샷 저장 엔드포인트
app.post('/api/save-screenshot', (req, res) => {
  try {
    const { imageData, filename = '레시피.png' } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }
    
    // base64 데이터에서 헤더 제거
    const base64Image = imageData.replace(/^data:image\/png;base64,/, '');
    
    // 파일명 정리 (빈 문자열이거나 undefined인 경우 기본값 사용)
    let safeFilename = filename && filename.trim() ? filename.trim() : '레시피.png';
    
    // .png 확장자 확인
    if (!safeFilename.endsWith('.png')) {
      safeFilename += '.png';
    }
    
    // 파일명에서 문제가 될 수 있는 문자 제거
    safeFilename = safeFilename.replace(/[<>:"|?*]/g, '_');
    
    // 프로젝트 루트 디렉토리에 저장
    const rootDir = path.join(__dirname, '..');
    const filePath = path.join(rootDir, safeFilename);
    
    // 이미 파일이 존재하는지 확인
    const fileExists = fs.existsSync(filePath);
    
    // 버퍼로 변환하여 파일 저장
    const buffer = Buffer.from(base64Image, 'base64');
    fs.writeFileSync(filePath, buffer);
    
    console.log(`Screenshot saved to: ${filePath}`);
    
    res.json({ 
      success: true, 
      path: filePath,
      filename: safeFilename,
      overwritten: fileExists
    });
  } catch (error) {
    console.error('Failed to save screenshot:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Screenshot server running on http://localhost:${PORT}`);
  console.log('Ready to save screenshots to project root directory');
});