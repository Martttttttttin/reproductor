import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompactDisc, faMusic } from '@fortawesome/free-solid-svg-icons';
import NowBar from './NowBar.jsx';

/**
 * Empaque de inicio: título, botón a la biblioteca y,
 * si hay una canción sonando, la barra de la canción (abre el reproductor).
 */
export default function Gift({ onLibrary, onPlayer }) {
  return (
    <section className="stage stage--pack view-enter">
      <div className="panel gift-card">
        <FontAwesomeIcon icon={faMusic} className="gift-note" />
        <h1>Reproductor de música de K-popi</h1>
      </div>

      <NowBar onOpen={onPlayer} />

      <button className="pill pill--red gift-btn" onClick={onLibrary}>
        <FontAwesomeIcon icon={faCompactDisc} />
        Ir a biblioteca
      </button>

    </section>
  );
}
