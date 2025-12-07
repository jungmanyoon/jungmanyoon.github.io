import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '..')

// 정리할 파일 패턴
const patterns = [
  /\.tmp$/,
  /\.bak$/,
  /_old\./,
  /_backup\./,
  /^test\d+\./,
  /Copy of/
]

// 제외할 디렉토리
const excludeDirs = ['node_modules', '.git', 'dist', 'build']

function cleanDirectory(dirPath) {
  try {
    const files = fs.readdirSync(dirPath)
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(file)) {
          cleanDirectory(filePath)
        }
      } else {
        // 파일이 정리 패턴과 일치하는지 확인
        const shouldDelete = patterns.some(pattern => pattern.test(file))
        
        if (shouldDelete) {
          console.log(`삭제: ${filePath}`)
          fs.unlinkSync(filePath)
        }
      }
    })
  } catch (error) {
    console.error(`에러 발생: ${error.message}`)
  }
}

console.log('임시 파일 정리 시작...')
cleanDirectory(projectRoot)
console.log('정리 완료!')