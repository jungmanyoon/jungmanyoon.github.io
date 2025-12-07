#!/usr/bin/env python3
"""
Recipe Book - Baking Recipe Converter
Python launcher for development server
"""

import os
import sys
import subprocess
import time
import signal
from pathlib import Path

# 현재 스크립트 디렉토리로 이동
script_dir = Path(__file__).parent.absolute()
os.chdir(script_dir)

# 프로세스 리스트 (종료 시 정리용)
processes = []

def cleanup(signum=None, frame=None):
    """종료 시 모든 하위 프로세스 정리"""
    print("\n종료 중...")
    for p in processes:
        try:
            p.terminate()
            p.wait(timeout=5)
        except:
            try:
                p.kill()
            except:
                pass
    sys.exit(0)

# 종료 신호 핸들러 등록
signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

def check_node():
    """Node.js 설치 확인"""
    try:
        result = subprocess.run(['node', '--version'], 
                              capture_output=True, 
                              text=True, 
                              shell=True)
        if result.returncode == 0:
            print(f"Node.js 버전: {result.stdout.strip()}")
            return True
    except:
        pass
    return False

def check_package_json():
    """package.json 파일 존재 확인"""
    return Path('package.json').exists()

def main():
    """메인 실행 함수"""
    print("Recipe Book - Baking Recipe Converter")
    print("=" * 37)
    print()
    
    # package.json 확인
    if not check_package_json():
        print("ERROR: package.json not found")
        input("Press Enter to exit...")
        sys.exit(1)
    
    # Node.js 확인
    if not check_node():
        print("ERROR: Node.js is not installed")
        print("Please install Node.js from https://nodejs.org/")
        input("Press Enter to exit...")
        sys.exit(1)
    
    try:
        # Screenshot 서버 시작
        print("Starting screenshot server...")
        screenshot_process = subprocess.Popen(
            ['node', 'server/screenshot-server.cjs'],
            cwd=script_dir,
            shell=True,
            creationflags=subprocess.CREATE_NEW_CONSOLE if sys.platform == 'win32' else 0
        )
        processes.append(screenshot_process)
        
        print(f"Screenshot server will save files to: {script_dir}")
        print()
        
        # 서버 시작 대기
        print("Waiting for servers to initialize...")
        time.sleep(3)
        
        # 개발 서버 시작
        print("Starting development server...")
        print()
        print("Press Ctrl+C to stop all servers")
        print("-" * 40)
        print()
        
        # npm run dev 실행 (메인 프로세스로 실행)
        dev_process = subprocess.Popen(
            ['npm', 'run', 'dev'],
            cwd=script_dir,
            shell=True
        )
        processes.append(dev_process)
        
        # 개발 서버 프로세스 대기
        dev_process.wait()
        
    except KeyboardInterrupt:
        print("\n\nStopping servers...")
    except Exception as e:
        print(f"\nError: {e}")
    finally:
        cleanup()

if __name__ == "__main__":
    main()