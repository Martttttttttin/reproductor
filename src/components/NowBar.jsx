import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { usePlayer } from '../PlayerContext.jsx';
import Cover from './Cover.jsx';

/**
 * Barra de la canción que suena. Solo aparece si hay algo reproduciéndose.
 * Al tocarla se abre el reproductor.
 */
export default function NowBar({ onOpen }) {
  const { current, isPlaying, togglePlay } = usePlayer();
  if (!current) return null;

  return (
    <div
      className="panel now-bar"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
      aria-label="Abrir reproductor"
    >
      <Cover src={current.cover} className="cover--md" />
      <span className="now-text">
        <strong>{current.title}</strong>
        <small>{current.artist}</small>
      </span>
      <button
        className="round round--red"
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
      >
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
      </button>
    </div>
  );
}
