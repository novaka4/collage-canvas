import { useState, useCallback, useRef } from 'react';
import { VideoItem } from '@/types/video';
import { toast } from 'sonner';

export const useVideoCollage = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addVideo = useCallback((file: File, dropX?: number, dropY?: number) => {
    const url = URL.createObjectURL(file);
    const id = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const canvasWidth = canvasRef.current?.offsetWidth || 800;
    const canvasHeight = canvasRef.current?.offsetHeight || 450;
    
    // Use drop position if provided, otherwise random
    const x = dropX !== undefined ? Math.max(0, Math.min(dropX - 150, canvasWidth - 300)) : Math.random() * (canvasWidth - 300);
    const y = dropY !== undefined ? Math.max(0, Math.min(dropY - 100, canvasHeight - 200)) : Math.random() * (canvasHeight - 200);
    
    const newVideo: VideoItem = {
      id,
      src: url,
      name: file.name,
      x,
      y,
      width: 300,
      height: 200,
    };

    setVideos((prev) => [...prev, newVideo]);
    setSelectedId(id);
    toast.success(`Added "${file.name}"`);
  }, []);

  const moveVideo = useCallback((id: string, x: number, y: number) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, x, y } : v))
    );
  }, []);

  const resizeVideo = useCallback((id: string, width: number, height: number, x: number, y: number) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, width, height, x, y } : v))
    );
  }, []);

  const deleteVideo = useCallback((id: string) => {
    setVideos((prev) => {
      const video = prev.find((v) => v.id === id);
      if (video) {
        URL.revokeObjectURL(video.src);
      }
      return prev.filter((v) => v.id !== id);
    });
    if (selectedId === id) {
      setSelectedId(null);
    }
    toast.success('Video removed');
  }, [selectedId]);

  const clearAll = useCallback(() => {
    videos.forEach((v) => URL.revokeObjectURL(v.src));
    setVideos([]);
    setSelectedId(null);
    toast.success('All videos cleared');
  }, [videos]);

  const autoArrange = useCallback(() => {
    if (!canvasRef.current || videos.length === 0) return;

    const canvasWidth = canvasRef.current.offsetWidth;
    const canvasHeight = canvasRef.current.offsetHeight;
    const count = videos.length;

    // Calculate grid dimensions
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);

    const cellWidth = canvasWidth / cols;
    const cellHeight = canvasHeight / rows;
    const padding = 8;

    setVideos((prev) =>
      prev.map((video, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);

        return {
          ...video,
          x: col * cellWidth + padding,
          y: row * cellHeight + padding,
          width: cellWidth - padding * 2,
          height: cellHeight - padding * 2,
        };
      })
    );

    toast.success('Videos arranged in grid');
  }, [videos.length]);

  const exportCollage = useCallback(async () => {
    if (!canvasRef.current || videos.length === 0) return;

    setIsExporting(true);
    toast.info('Starting export... This may take a moment.');

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = 1920;
      canvas.height = 1080;

      const scaleX = 1920 / canvasRef.current.offsetWidth;
      const scaleY = 1080 / canvasRef.current.offsetHeight;

      // Get all video elements
      const videoElements = canvasRef.current.querySelectorAll('video');
      const videoData: { el: HTMLVideoElement; video: VideoItem }[] = [];

      videos.forEach((video, index) => {
        const el = videoElements[index];
        if (el) {
          videoData.push({ el, video });
        }
      });

      // Record using MediaRecorder
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video-collage-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
        toast.success('Export complete! Video downloaded.');
      };

      // Reset videos to start
      videoData.forEach(({ el }) => {
        el.currentTime = 0;
        el.play();
      });

      mediaRecorder.start();

      // Record frames for 10 seconds
      const duration = 10000;
      const frameRate = 30;
      const frameInterval = 1000 / frameRate;
      let elapsed = 0;

      const drawFrame = () => {
        ctx.fillStyle = '#0d0f12';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        videoData.forEach(({ el, video }) => {
          ctx.drawImage(
            el,
            video.x * scaleX,
            video.y * scaleY,
            video.width * scaleX,
            video.height * scaleY
          );
        });

        elapsed += frameInterval;
        if (elapsed < duration) {
          setTimeout(drawFrame, frameInterval);
        } else {
          mediaRecorder.stop();
          videoData.forEach(({ el }) => el.pause());
        }
      };

      setTimeout(drawFrame, 100);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
      setIsExporting(false);
    }
  }, [videos]);

  return {
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
  };
};
