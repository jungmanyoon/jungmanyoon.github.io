/**
 * ResizeHandle - 드래그로 크기 조절 가능한 핸들 컴포넌트
 */

import React, { useCallback, useRef, useEffect } from 'react';

interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
  onResizeEnd?: () => void;
  className?: string;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  direction,
  onResize,
  onResizeEnd,
  className = '',
}) => {
  const isDragging = useRef(false);
  const startPos = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startPos.current = direction === 'horizontal' ? e.clientX : e.clientY;
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, [direction]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - startPos.current;
      startPos.current = currentPos;
      onResize(delta);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        onResizeEnd?.();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [direction, onResize, onResizeEnd]);

  const baseClasses = direction === 'horizontal'
    ? 'w-1 cursor-col-resize hover:bg-blue-400 active:bg-blue-500 transition-colors'
    : 'h-1 cursor-row-resize hover:bg-blue-400 active:bg-blue-500 transition-colors';

  return (
    <div
      className={`${baseClasses} bg-transparent group flex items-center justify-center ${className}`}
      onMouseDown={handleMouseDown}
    >
      {/* 시각적 힌트 */}
      {direction === 'horizontal' ? (
        <div className="w-0.5 h-8 bg-gray-300 group-hover:bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      ) : (
        <div className="h-0.5 w-8 bg-gray-300 group-hover:bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
};

export default ResizeHandle;
