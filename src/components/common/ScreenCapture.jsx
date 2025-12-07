import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

const ScreenCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [customFileName, setCustomFileName] = useState('레시피');
  const selectionRef = useRef(null);

  // 캡처 완료 후 저장 다이얼로그 표시
  const handleCaptureComplete = (blob) => {
    setCapturedBlob(blob);
    setShowSaveDialog(true);
  };

  // 파일 저장
  const saveFile = async (filename) => {
    if (!capturedBlob) return;
    
    try {
      // Blob을 Base64로 변환
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result;
        
        try {
          // 서버로 전송하여 루트 디렉토리에 저장
          const response = await fetch('http://localhost:3001/api/save-screenshot', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageData: base64data,
              filename: filename.endsWith('.png') ? filename : `${filename}.png`
            })
          });
          
          const result = await response.json();
          
          if (result.success) {
            alert(`파일이 저장되었습니다:\n${result.filename}${result.overwritten ? ' (덮어쓰기)' : ''}`);
          } else {
            throw new Error(result.error || '저장 실패');
          }
        } catch (error) {
          console.error('서버 저장 실패:', error);
          // 서버가 실행 중이지 않을 경우 브라우저 다운로드로 폴백
          const url = URL.createObjectURL(capturedBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
          a.click();
          URL.revokeObjectURL(url);
          
          alert('서버가 실행되지 않아 다운로드 폴더에 저장되었습니다.');
        }
      };
      
      reader.readAsDataURL(capturedBlob);
    } catch (error) {
      console.error('저장 실패:', error);
      alert('파일 저장에 실패했습니다.');
    } finally {
      // 초기화
      setShowSaveDialog(false);
      setCapturedBlob(null);
      setCustomFileName('레시피');
    }
  };

  // 전체 화면 캡처
  const captureFullScreen = async () => {
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        logging: false,
        scale: window.devicePixelRatio,
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          handleCaptureComplete(blob);
        }
      }, 'image/png');
    } catch (error) {
      console.error('캡처 실패:', error);
      alert('화면 캡처에 실패했습니다.');
    } finally {
      setIsCapturing(false);
    }
  };

  // 영역 선택 캡처 시작
  const startAreaCapture = () => {
    setIsSelecting(true);
    setSelection(null);
  };

  // 마우스 다운 이벤트
  const handleMouseDown = (e) => {
    if (!isSelecting) return;
    
    const rect = document.body.getBoundingClientRect();
    setStartPoint({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // 마우스 이동 이벤트
  const handleMouseMove = (e) => {
    if (!isSelecting || !startPoint) return;
    
    const rect = document.body.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    setSelection({
      left: Math.min(startPoint.x, currentX),
      top: Math.min(startPoint.y, currentY),
      width: Math.abs(currentX - startPoint.x),
      height: Math.abs(currentY - startPoint.y)
    });
  };

  // 마우스 업 이벤트
  const handleMouseUp = async () => {
    if (!isSelecting || !selection || selection.width < 10 || selection.height < 10) {
      setIsSelecting(false);
      setSelection(null);
      setStartPoint(null);
      return;
    }

    setIsCapturing(true);
    setIsSelecting(false);
    
    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        logging: false,
        scale: window.devicePixelRatio,
        x: selection.left,
        y: selection.top,
        width: selection.width,
        height: selection.height
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          handleCaptureComplete(blob);
        }
      }, 'image/png');
    } catch (error) {
      console.error('영역 캡처 실패:', error);
      alert('영역 캡처에 실패했습니다.');
    } finally {
      setIsCapturing(false);
      setSelection(null);
      setStartPoint(null);
    }
  };

  // ESC 키로 취소
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isSelecting) {
          setIsSelecting(false);
          setSelection(null);
          setStartPoint(null);
        }
        if (showSaveDialog) {
          setShowSaveDialog(false);
          setCapturedBlob(null);
          setCustomFileName('레시피');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSelecting, showSaveDialog]);

  // 마우스 이벤트 리스너
  useEffect(() => {
    if (isSelecting) {
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isSelecting, startPoint, selection]);

  return (
    <>
      {/* 캡처 버튼들 */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        <button
          onClick={captureFullScreen}
          disabled={isCapturing || isSelecting}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          title="전체 화면 캡처"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          전체 캡처
        </button>
        
        <button
          onClick={startAreaCapture}
          disabled={isCapturing || isSelecting}
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          title="드래그로 영역 선택"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          영역 캡처
        </button>
      </div>

      {/* 영역 선택 중일 때 오버레이 */}
      {isSelecting && (
        <div 
          className="fixed inset-0 z-[9998] cursor-crosshair"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            pointerEvents: 'auto'
          }}
        >
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg">
            드래그하여 캡처할 영역을 선택하세요 (ESC로 취소)
          </div>
        </div>
      )}

      {/* 선택 영역 표시 */}
      {selection && isSelecting && (
        <div
          ref={selectionRef}
          className="fixed border-2 border-blue-500 bg-blue-100 bg-opacity-20 z-[9999] pointer-events-none"
          style={{
            left: `${selection.left}px`,
            top: `${selection.top}px`,
            width: `${selection.width}px`,
            height: `${selection.height}px`
          }}
        >
          <div className="absolute -bottom-6 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            {Math.round(selection.width)} × {Math.round(selection.height)}
          </div>
        </div>
      )}

      {/* 캡처 중 표시 */}
      {isCapturing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm">캡처 중...</p>
          </div>
        </div>
      )}

      {/* 저장 다이얼로그 */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">캡처한 이미지 저장</h3>
            
            <div className="space-y-4">
              {/* 기본 파일명으로 저장 */}
              <button
                onClick={() => saveFile('레시피.png')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                레시피.png로 저장 (덮어쓰기)
              </button>
              
              {/* 타임스탬프 포함 파일명으로 저장 */}
              <button
                onClick={() => {
                  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                  saveFile(`레시피_${timestamp}.png`);
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                날짜/시간 포함하여 저장 (새 파일)
              </button>
              
              {/* 사용자 정의 파일명 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  또는 파일명 직접 입력:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customFileName}
                    onChange={(e) => setCustomFileName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customFileName.trim()) {
                        saveFile(customFileName.trim());
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="파일명 입력"
                  />
                  <button
                    onClick={() => {
                      if (customFileName.trim()) {
                        saveFile(customFileName.trim());
                      }
                    }}
                    disabled={!customFileName.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    저장
                  </button>
                </div>
              </div>
              
              {/* 취소 버튼 */}
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setCapturedBlob(null);
                  setCustomFileName('레시피');
                }}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                취소 (ESC)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScreenCapture;