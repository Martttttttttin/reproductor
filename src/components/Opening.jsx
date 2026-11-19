import { useEffect, useRef, useState } from 'react';

export default function Opening({ onComplete }) {
  const [phase, setPhase] = useState('video');
  const [needsPlay, setNeedsPlay] = useState(true);
  const video = useRef(null);

  useEffect(() => {
    if (phase !== 'message') return;
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  const start = () => {
    video.current?.play().then(() => setNeedsPlay(false)).catch(() => setNeedsPlay(true));
  };

  return (
    <div className="opening">
      {phase === 'video' ? (
        <>
          <video ref={video} className={`opening-video${needsPlay ? ' opening-video--hidden' : ''}`} playsInline preload="auto" onEnded={() => setPhase('message')} onError={() => setPhase('message')}>
            <source src="/img/hola_popi_corregido.mp4" type="video/mp4" />
          </video>
          {needsPlay && <button className="pill pill--glass opening-play" onClick={start}>Ver sorpresa ▶</button>}
        </>
      ) : (
        <p className="opening-message">feliz 20 añitos alfajor</p>
      )}
    </div>
  );
}