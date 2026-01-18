import React, { useRef, useEffect } from 'react';
import { VideoItem, ResizeHandle } from '@/types/video';
import { X, ArrowUp, ArrowDown } from 'lucide-react';

interface VideoElementProps {
  video: VideoItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  canvasRect: DOMRect | null;
}

const VideoElement: React.FC<VideoElementProps> = ({
  video,
  isSelected,
  onSelect,
  onMove,
  onResize,
  onDelete,
  onBringToFront,
  onSendToBack,
  canvasRect,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isDragging = useRef(false);
  const isResizing = useRef<ResizeHandle | null>(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0, mouseX: 0, mouseY: 0 });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [video.src]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(video.id);
    
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    
    isDragging.current = true;
    startPos.current = {
      x: video.x,
      y: video.y,
      width: video.width,
      height: video.height,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeStart = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    onSelect(video.id);
    
    isResizing.current = handle;
    startPos.current = {
      x: video.x,
      y: video.y,
      width: video.width,
      height: video.height,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!canvasRect) return;

    const deltaX = e.clientX - startPos.current.mouseX;
    const deltaY = e.clientY - startPos.current.mouseY;

    if (isDragging.current) {
      const newX = Math.max(0, Math.min(startPos.current.x + deltaX, canvasRect.width - video.width));
      const newY = Math.max(0, Math.min(startPos.current.y + deltaY, canvasRect.height - video.height));
      onMove(video.id, newX, newY);
    }

    if (isResizing.current) {
      const minSize = 100;
      let newX = startPos.current.x;
      let newY = startPos.current.y;
      let newWidth = startPos.current.width;
      let newHeight = startPos.current.height;

      switch (isResizing.current) {
        case 'se':
          newWidth = Math.max(minSize, startPos.current.width + deltaX);
          newHeight = Math.max(minSize, startPos.current.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(minSize, startPos.current.width - deltaX);
          newHeight = Math.max(minSize, startPos.current.height + deltaY);
          newX = startPos.current.x + startPos.current.width - newWidth;
          break;
        case 'ne':
          newWidth = Math.max(minSize, startPos.current.width + deltaX);
          newHeight = Math.max(minSize, startPos.current.height - deltaY);
          newY = startPos.current.y + startPos.current.height - newHeight;
          break;
        case 'nw':
          newWidth = Math.max(minSize, startPos.current.width - deltaX);
          newHeight = Math.max(minSize, startPos.current.height - deltaY);
          newX = startPos.current.x + startPos.current.width - newWidth;
          newY = startPos.current.y + startPos.current.height - newHeight;
          break;
      }

      onResize(video.id, newWidth, newHeight, newX, newY);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    isResizing.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`video-item ${isSelected ? 'selected' : ''}`}
      style={{
        left: video.x,
        top: video.y,
        width: video.width,
        height: video.height,
        zIndex: video.zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      <video
        ref={videoRef}
        src={video.src}
        className="w-full h-full object-cover pointer-events-none"
        loop
        muted
        playsInline
      />
      
      {isSelected && (
        <>
          <button
            className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:scale-110 transition-transform z-10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(video.id);
            }}
          >
            <X size={14} />
          </button>
          
          {/* Layer controls */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            <button
              className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                onBringToFront(video.id);
              }}
              title="Bring to front"
            >
              <ArrowUp size={14} />
            </button>
            <button
              className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                onSendToBack(video.id);
              }}
              title="Send to back"
            >
              <ArrowDown size={14} />
            </button>
          </div>
          
          <div className="resize-handle corner-nw" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
          <div className="resize-handle corner-ne" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
          <div className="resize-handle corner-sw" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
          <div className="resize-handle corner-se" onMouseDown={(e) => handleResizeStart(e, 'se')} />
        </>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="text-xs text-white truncate">{video.name}</p>
      </div>
    </div>
  );
};

export default VideoElement;
