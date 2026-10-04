export interface RoomState {
  roomId: string;
  videoUrl: string;
  playing: boolean;
  currentTime: number;
  playbackRate: number;
  updatedAt: number;
  subtitle: string;
}
