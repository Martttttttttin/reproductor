import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faBackwardStep,
  faCompactDisc,
  faForwardStep,
  faHouse,
  faMusic,
  faPause,
  faPlay,
  faRepeat,
  faShuffle,
} from '@fortawesome/free-solid-svg-icons';
import { usePlayer } from '../PlayerContext.jsx';
import { formatTime } from '../utils.js';
import MenuSheet from './MenuSheet.jsx';

export default function PlayerView({ onLibrary, onHome }) {
  const {
    current,
    isPlaying,
    time,
    duration,
    shuffle,
    repeat,
    togglePlay,
    onPrevTap,
    next,
    seek,
    toggleShuffle,
    cycleRepeat,
    playRandom,
  } = usePlayer();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuItems = [
    { key: 'library', icon: faCompactDisc, label: 'Biblioteca', onClick: onLibrary },
    { key: 'home', icon: faHouse, label: 'Inicio', onClick: onHome },
    {
      key: 'random',
      icon: faShuffle,
      label: 'Reproducir aleatorio',
      onClick: () => {
        setMenuOpen(false);
        playRandom();
      },
    },
  ];

  // Mientras se arrastra la barra no se compite con el tiempo real del audio
  const [scrub, setScrub] = useState(null);
  const max = duration || 0;
  const value = scrub ?? Math.min(time, max || time);
  const pct = max ? Math.min(100, (value / max) * 100) : 0;

  const commit = () => {
    if (scrub != null) {
      seek(scrub);
      setScrub(null);
    }
  };

  return (
    <section className="stage stage--pack view-enter">
      <div className="panel title-bar">
        <strong>{current?.title ?? 'Sin canción'}</strong>
      </div>

      <div
        className="panel art"
        style={current?.cover ? { '--cover': `url("${current.cover}")` } : undefined}
      >
        {current?.cover ? (
          <img key={current.id} src={current.cover} alt={`Portada de ${current.title}`} />
        ) : (
          <FontAwesomeIcon icon={faMusic} className="art-note" />
        )}
      </div>

      <div className="progress">
        <span>{formatTime(value)}</span>
        <input
          type="range"
          min="0"
          max={max || 1}
          step="0.1"
          value={value}
          style={{ '--pct': `${pct}%` }}
          onChange={(e) => setScrub(Number(e.target.value))}
          onPointerUp={commit}
          onTouchEnd={commit}
          onKeyUp={commit}
          onBlur={commit}
          aria-label="Posición de la canción"
        />
        <span>{formatTime(max)}</span>
      </div>

      <div className="panel controls">
        <button
          className={`ctl${shuffle ? ' ctl--on' : ''}`}
          onClick={toggleShuffle}
          aria-label="Aleatorio"
          aria-pressed={shuffle}
        >
          <FontAwesomeIcon icon={faShuffle} />
        </button>

        <button className="ctl" onClick={onPrevTap} aria-label="Anterior (1 toque: reiniciar, 2 toques: anterior)">
          <FontAwesomeIcon icon={faBackwardStep} />
        </button>

        <button
          className="round round--red round--xl"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
        </button>

        <button className="ctl" onClick={next} aria-label="Siguiente">
          <FontAwesomeIcon icon={faForwardStep} />
        </button>

        <button
          className={`ctl${repeat !== 'off' ? ' ctl--on' : ''}`}
          onClick={cycleRepeat}
          aria-label={`Repetir: ${repeat === 'off' ? 'no' : repeat === 'all' ? 'todas' : 'una'}`}
        >
          <FontAwesomeIcon icon={faRepeat} />
          {repeat === 'one' && <sup className="ctl-badge">1</sup>}
        </button>
      </div>

      <button className="pill pill--wood menu-btn" onClick={() => setMenuOpen(true)}>
        <FontAwesomeIcon icon={faBars} />
        Menú
      </button>

      {menuOpen && <MenuSheet items={menuItems} onClose={() => setMenuOpen(false)} />}
    </section>
  );
}
