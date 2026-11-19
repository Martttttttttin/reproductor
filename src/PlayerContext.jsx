import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const PlayerContext = createContext(null);
export const usePlayer = () => useContext(PlayerContext);

const DOUBLE_TAP_MS = 280;

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);

  const [albums, setAlbums] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [currentId, setCurrentId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off'); // off | all | one

  const history = useRef([]); // ids de canciones ya reproducidas (para "anterior")
  const prevTimer = useRef(null);

  // ---- Carga de la biblioteca ------------------------------------------
  useEffect(() => {
    let alive = true;
    fetch('/api/albums')
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then((data) => {
        if (!alive) return;
        setAlbums(data);
        setStatus('ready');
      })
      .catch(() => alive && setStatus('error'));
    return () => {
      alive = false;
    };
  }, []);

  // Cola = todas las canciones, álbum por álbum, con datos del álbum a mano
  const songs = useMemo(
    () =>
      albums.flatMap((al) =>
        al.songs.map((s) => ({
          ...s,
          artist: s.artist || al.artist || '',
          cover: s.cover || al.cover || null,
          albumName: al.name,
        }))
      ),
    [albums]
  );
  const current = songs.find((s) => s.id === currentId) ?? null;

  // Refs con el último estado, para usarlos dentro de eventos del <audio>
  const live = useRef({});
  live.current = { songs, currentId, shuffle, repeat };

  // ---- Reproducción -----------------------------------------------------
  const loadAndPlay = useCallback((song) => {
    const audio = audioRef.current;
    if (!audio || !song) return;
    audio.src = song.url;
    audio.currentTime = 0;
    setTime(0);
    setDuration(song.duration || 0);
    setCurrentId(song.id);
    audio.play().catch(() => {});
  }, []);

  const playSong = useCallback(
    (song) => {
      const { currentId: cur } = live.current;
      if (cur != null && cur !== song.id) history.current.push(cur);
      loadAndPlay(song);
    },
    [loadAndPlay]
  );

  const pickNext = useCallback((auto) => {
    const { songs: list, currentId: cur, shuffle: shuf, repeat: rep } = live.current;
    if (!list.length) return null;
    const idx = list.findIndex((s) => s.id === cur);

    if (shuf && list.length > 1) {
      let n;
      do n = Math.floor(Math.random() * list.length);
      while (n === idx);
      return list[n];
    }
    if (idx < list.length - 1) return list[idx + 1];
    // Llegó al final de la lista
    if (rep === 'all' || !auto) return list[0];
    return null;
  }, []);

  const next = useCallback(
    (auto = false) => {
      const song = pickNext(auto);
      if (song) playSong(song);
      else {
        // Fin de la lista sin repetir: se detiene
        const audio = audioRef.current;
        audio.pause();
        audio.currentTime = 0;
        setTime(0);
      }
    },
    [pickNext, playSong]
  );

  const previous = useCallback(() => {
    const { songs: list, currentId: cur } = live.current;
    if (!list.length) return;
    const back = history.current.pop();
    const target =
      list.find((s) => s.id === back) ??
      list[(list.findIndex((s) => s.id === cur) - 1 + list.length) % list.length];
    loadAndPlay(target);
  }, [loadAndPlay]);

  const restart = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setTime(0);
    audio.play().catch(() => {});
  }, []);

  /** 1 toque = volver a reproducir · 2 toques seguidos = canción anterior */
  const onPrevTap = useCallback(() => {
    if (prevTimer.current) {
      clearTimeout(prevTimer.current);
      prevTimer.current = null;
      previous();
      return;
    }
    prevTimer.current = setTimeout(() => {
      prevTimer.current = null;
      restart();
    }, DOUBLE_TAP_MS);
  }, [previous, restart]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    const { songs: list, currentId: cur } = live.current;
    if (cur == null) {
      if (list.length) loadAndPlay(list[0]);
      return;
    }
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, [loadAndPlay]);

  const seek = useCallback((t) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = t;
    setTime(t);
  }, []);

  const toggleShuffle = useCallback(() => setShuffle((v) => !v), []);
  const cycleRepeat = useCallback(
    () => setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')),
    []
  );

  const playRandom = useCallback(() => {
    const list = live.current.songs;
    if (!list.length) return;
    setShuffle(true);
    playSong(list[Math.floor(Math.random() * list.length)]);
  }, [playSong]);

  // ---- Eventos del <audio> ----------------------------------------------
  const onEnded = useCallback(() => {
    if (live.current.repeat === 'one') restart();
    else next(true);
  }, [next, restart]);

  // ---- Controles del sistema (pantalla bloqueada / auriculares) ---------
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;
    if (current) {
      ms.metadata = new window.MediaMetadata({
        title: current.title,
        artist: current.artist,
        album: current.albumName,
        artwork: current.cover ? [{ src: current.cover }] : [],
      });
    }
    ms.setActionHandler('play', () => audioRef.current?.play());
    ms.setActionHandler('pause', () => audioRef.current?.pause());
    ms.setActionHandler('previoustrack', previous);
    ms.setActionHandler('nexttrack', () => next(false));
  }, [current, previous, next]);

  const value = {
    status,
    albums,
    songs,
    current,
    isPlaying,
    time,
    duration,
    shuffle,
    repeat,
    playSong,
    togglePlay,
    onPrevTap,
    next: () => next(false),
    seek,
    toggleShuffle,
    cycleRepeat,
    playRandom,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setDuration(d);
        }}
        onEnded={onEnded}
      />
    </PlayerContext.Provider>
  );
}
