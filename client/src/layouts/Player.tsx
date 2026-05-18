import { MediaPlayer, MediaProvider } from '@vidstack/react';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

export default function Player() {
  return (
    <MediaPlayer
      title="YouTube Video"
      src="https://www.youtube.com/watch?v=A2LvibgPrnQ"
      controls={false}
      autoPlay
      aspectRatio=''
      muted
      playsInline
    >
      <MediaProvider />
    </MediaPlayer>
  );
}