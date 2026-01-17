export interface VideoItem {
  id: string;
  src: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';
