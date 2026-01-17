import React, { useRef } from 'react';
import { Plus, Download, Trash2, Grid3X3 } from 'lucide-react';

interface ToolbarProps {
  onAddVideo: (file: File) => void;
  onExport: () => void;
  onClearAll: () => void;
  onAutoArrange: () => void;
  videoCount: number;
  isExporting: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddVideo,
  onExport,
  onClearAll,
  onAutoArrange,
  videoCount,
  isExporting,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('video/')) {
          onAddVideo(file);
        }
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="toolbar">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      
      <button
        className="toolbar-button primary"
        onClick={() => fileInputRef.current?.click()}
      >
        <Plus size={18} />
        Add Videos
      </button>
      
      <button
        className="toolbar-button"
        onClick={onAutoArrange}
        disabled={videoCount === 0}
      >
        <Grid3X3 size={18} />
        Auto Arrange
      </button>
      
      <div className="flex-1" />
      
      <span className="text-sm text-muted-foreground px-3">
        {videoCount} video{videoCount !== 1 ? 's' : ''}
      </span>
      
      <button
        className="toolbar-button"
        onClick={onClearAll}
        disabled={videoCount === 0}
      >
        <Trash2 size={18} />
        Clear All
      </button>
      
      <button
        className="toolbar-button primary"
        onClick={onExport}
        disabled={videoCount === 0 || isExporting}
      >
        <Download size={18} />
        {isExporting ? 'Exporting...' : 'Export'}
      </button>
    </div>
  );
};

export default Toolbar;
