// src/components/YouTubePlayer.tsx
// Native implementation (Android/iOS). Web uses YouTubePlayer.web.tsx.
import React from 'react';
import YoutubeIframe from 'react-native-youtube-iframe';

export interface YouTubePlayerProps {
  width: number;
  height: number;
  videoId: string;
  play: boolean;
  onChangeState?: (state: 'playing' | 'paused' | 'ended' | string) => void;
  onError?: (error: string) => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  width,
  height,
  videoId,
  play,
  onChangeState,
  onError,
}) => (
  <YoutubeIframe
    width={width}
    height={height}
    play={play}
    videoId={videoId}
    onChangeState={onChangeState}
    onError={onError}
    forceAndroidAutoplay={true}
    initialPlayerParams={{
      rel: false,
      modestbranding: true,
      controls: true,
      preventFullScreen: false,
    }}
    webViewProps={{
      allowsInlineMediaPlayback: true,
      mediaPlaybackRequiresUserAction: false,
      domStorageEnabled: true,
      javaScriptEnabled: true,
      androidHardwareAccelerationDisabled: false,
      androidLayerType: 'hardware',
    }}
  />
);

