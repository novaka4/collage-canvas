import React, { useRef, useEffect, useState } from 'react';
import { VideoItem } from '@/types/video';
import VideoElement from './VideoElement';

interface CanvasProps {
  videos: VideoItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMoveVideo: (id: string, x: number, y: number) => void;
  onResizeVideo: (id: string, width: number, height: number, x: number, y: number) => void;
  onDeleteVideo: (id: string) => void;
  onAddVideo: (file: File, dropX?: number, dropY?: number) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

const Canvas: React.FC<CanvasProps> = ({
  videos,
  selectedId,
  onSelect,
  onMoveVideo,
  onResizeVideo,
  onDeleteVideo,
  onAddVideo,
  canvasRef,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateRect = () => {
      if (canvasRef.current) {
        setCanvasRect(canvasRef.current.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [canvasRef]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelect(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length === 0) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dropX = e.clientX - rect.left;
    const dropY = e.clientY - rect.top;

    videoFiles.forEach((file, index) => {
      // Offset each video slightly when dropping multiple
      onAddVideo(file, dropX + index * 20, dropY + index * 20);
    });
  };

  return (
    <div
      ref={canvasRef}
      className={`canvas-container w-full aspect-video rounded-lg border transition-colors ${
        isDragOver ? 'border-primary border-2 bg-primary/5' : 'border-border'
      }`}
      onClick={handleCanvasClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {videos.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
          <p className="text-muted-foreground text-lg">Drag & drop videos here</p>
          <p className="text-muted-foreground/60 text-sm">or use the Add Video button</p>
        </div>
      )}
      
      {videos.map((video) => (
        <VideoElement
          key={video.id}
          video={video}
          isSelected={selectedId === video.id}
          onSelect={onSelect}
          onMove={onMoveVideo}
          onResize={onResizeVideo}
          onDelete={onDeleteVideo}
          canvasRect={canvasRect}
        />
      ))}
    </div>
  );
};

export default Canvas;
