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
    bringToFront,
    sendToBack,
    autoArrange,
    exportCollage,
    setSelectedId,
  } = useVideoCollage();

  return (
    <div className="h-screen bg-background p-4 flex flex-col overflow-hidden">
      <header className="flex items-center gap-3 mb-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Film className="w-4 h-4 text-primary" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">Video Collage Editor</h1>
      </header>

      <Toolbar
        onAddVideo={addVideo}
        onExport={exportCollage}
        onClearAll={clearAll}
        onAutoArrange={autoArrange}
        videoCount={videos.length}
        isExporting={isExporting}
      />

      <div className="flex-1 mt-2 min-h-0">
        <Canvas
          videos={videos}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onMoveVideo={moveVideo}
          onResizeVideo={resizeVideo}
          onDeleteVideo={deleteVideo}
          onAddVideo={addVideo}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          canvasRef={canvasRef as React.RefObject<HTMLDivElement>}
        />
      </div>

      <footer className="mt-2 text-center shrink-0">
        <p className="text-xs text-muted-foreground">
          Click to select, drag to move, corners to resize. Export at {Math.round(window.innerWidth)}x{Math.round(window.innerHeight - 150)}px
        </p>
      </footer>
    </div>
  );
};

export default Index;
