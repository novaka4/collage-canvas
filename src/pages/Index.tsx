import React from 'react';
import Canvas from '@/components/Canvas';
import Toolbar from '@/components/Toolbar';
import { useVideoCollage } from '@/hooks/useVideoCollage';
import { Film } from 'lucide-react';

const Index = () => {
  const {
    videos,
    selectedId,
    isExporting,
    canvasRef,
    addVideo,
    moveVideo,
    resizeVideo,
    deleteVideo,
    clearAll,
    autoArrange,
    exportCollage,
    setSelectedId,
  } = useVideoCollage();

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      <header className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Film className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Video Collage Editor</h1>
          <p className="text-sm text-muted-foreground">Drag, resize, and export your video mashups</p>
        </div>
      </header>

      <Toolbar
        onAddVideo={addVideo}
        onExport={exportCollage}
        onClearAll={clearAll}
        onAutoArrange={autoArrange}
        videoCount={videos.length}
        isExporting={isExporting}
      />

      <div className="flex-1 mt-4 min-h-0">
        <Canvas
          videos={videos}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onMoveVideo={moveVideo}
          onResizeVideo={resizeVideo}
          onDeleteVideo={deleteVideo}
          onAddVideo={addVideo}
          canvasRef={canvasRef as React.RefObject<HTMLDivElement>}
        />
      </div>

      <footer className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Tip: Click a video to select, drag to move, use corners to resize. Export creates a 10-second WebM video.
        </p>
      </footer>
    </div>
  );
};

export default Index;
