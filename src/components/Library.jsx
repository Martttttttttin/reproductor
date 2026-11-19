import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faHouse, faPlay, faShuffle } from '@fortawesome/free-solid-svg-icons';
import { usePlayer } from '../PlayerContext.jsx';
import { formatTime } from '../utils.js';
import Cover from './Cover.jsx';
import NowBar from './NowBar.jsx';
import MenuSheet from './MenuSheet.jsx';

export default function Library({ onPlayer, onHome }) {
  const { status, albums, current, isPlaying, playSong, togglePlay, playRandom } = usePlayer();
  const [menuOpen, setMenuOpen] = useState(false);

  const onRow = (song) => {
    if (current?.id === song.id) togglePlay();
    else playSong(song);
  };

  const menuItems = [
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

  return (
    <section className="stage stage--pack view-enter">
      {/* Lista de canciones separadas por álbum */}
      <div className="panel list-panel">
        {status === 'loading' && <p className="empty">Cargando…</p>}
        {status === 'error' && (
          <p className="empty">No se pudo cargar la biblioteca. Intenta recargar la página.</p>
        )}
        {status === 'ready' && albums.length === 0 && (
          <p className="empty">
            Aún no hay canciones. Copia tus audios en <code>media/Nombre del álbum/</code>.
          </p>
        )}

        {albums.map((album) => (
          <div className="album" key={album.id}>
            <header className="album-head">
              <Cover src={album.cover} className="cover--sm" />
              <div className="album-meta">
                <h2>{album.name}</h2>
                {album.artist && <p>{album.artist}</p>}
              </div>
            </header>

            {album.songs.map((song) => {
              const active = current?.id === song.id;
              return (
                <button
                  key={song.id}
                  className={`row${active ? ' row--active' : ''}`}
                  onClick={() =>
                    onRow({
                      ...song,
                      artist: song.artist || album.artist || '',
                      cover: song.cover || album.cover,
                      albumName: album.name,
                    })
                  }
                >
                  <Cover src={song.cover || album.cover} />
                  <span className="row-text">
                    <strong>{song.title}</strong>
                    <small>{song.artist || album.artist}</small>
                  </span>
                  <span className="row-time">{formatTime(song.duration)}</span>
                  <span className="row-state" aria-hidden="true">
                    {active && isPlaying ? (
                      <span className="eq">
                        <i />
                        <i />
                        <i />
                      </span>
                    ) : active ? (
                      <FontAwesomeIcon icon={faPlay} />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Canción sonando: solo aparece si hay algo reproduciéndose */}
      <NowBar onOpen={onPlayer} />

      <button className="pill pill--wood menu-btn" onClick={() => setMenuOpen(true)}>
        <FontAwesomeIcon icon={faBars} />
        Menú
      </button>

      {menuOpen && <MenuSheet items={menuItems} onClose={() => setMenuOpen(false)} />}
    </section>
  );
}
