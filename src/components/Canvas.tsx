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
  canvasRef: React.RefObject<HTMLDivElement>;
}

const Canvas: React.FC<CanvasProps> = ({
  videos,
  selectedId,
  onSelect,
  onMoveVideo,
  onResizeVideo,
  onDeleteVideo,
  canvasRef,
}) => {
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

  return (
    <div
      ref={canvasRef}
      className="canvas-container w-full aspect-video rounded-lg border border-border"
      onClick={handleCanvasClick}
    >
      {videos.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground text-lg">Add videos to start creating your collage</p>
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
