// src/components/YouTubePlayer.web.tsx
// Web implementation: official YouTube IFrame embed, controlled via the IFrame postMessage API.
import React, { useCallback, useEffect, useRef } from 'react';
import type { YouTubePlayerProps } from './YouTubePlayer';

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  width,
  height,
  videoId,
  play,
  onChangeState,
}) => {
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  const send = useCallback((func: string) => {
    frameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
      '*'
    );
  }, []);

  useEffect(() => {
    send(play ? 'playVideo' : 'pauseVideo');
  }, [play, send]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.source !== frameRef.current?.contentWindow || typeof e.data !== 'string') return;
      try {
        const msg = JSON.parse(e.data);
        if (msg.event === 'onStateChange') {
          if (msg.info === 1) onChangeState?.('playing');
          else if (msg.info === 2) onChangeState?.('paused');
          else if (msg.info === 0) onChangeState?.('ended');
        }
      } catch {
        // ignore non-JSON messages
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onChangeState]);

  const src =
    `https://www.youtube.com/embed/${videoId}` +
    `?enablejsapi=1&rel=0&modestbranding=1&playsinline=1&origin=${encodeURIComponent(
      window.location.origin
    )}`;

  return React.createElement('iframe', {
    ref: frameRef,
    src,
    title: 'YouTube video player',
    width,
    height,
    style: { border: 0, display: 'block' },
    allow: 'encrypted-media; picture-in-picture; fullscreen',
    allowFullScreen: true,
    onLoad: () =>
      frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*'),
  });
};

