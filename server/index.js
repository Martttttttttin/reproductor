import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { db, MEDIA_DIR, ROOT } from './db.js';
import { scanLibrary } from './scan.js';

const PORT = Number(process.env.PORT) || 3001;
const app = express();

// Audios y portadas (express.static soporta "Range", necesario para arrastrar la barra)
app.use('/media', express.static(MEDIA_DIR, { maxAge: '1h', dotfiles: 'ignore' }));

const mediaUrl = (relPath) =>
  relPath ? '/media/' + relPath.split('/').map(encodeURIComponent).join('/') : null;

app.get('/api/albums', (_req, res) => {
  const albums = db.prepare('SELECT * FROM albums ORDER BY sort').all();
  const songs = db.prepare('SELECT * FROM songs ORDER BY album_id, track, id').all();

  const byAlbum = new Map(albums.map((a) => [a.id, []]));
  for (const s of songs) {
    byAlbum.get(s.album_id)?.push({
      id: s.id,
      title: s.title,
      artist: s.artist,
      duration: s.duration,
      url: mediaUrl(s.file),
      cover: mediaUrl(s.cover),
    });
  }

  res.json(
    albums.map((a) => ({
      id: a.id,
      name: a.name,
      artist: a.artist,
      cover: mediaUrl(a.cover),
      songs: byAlbum.get(a.id),
    }))
  );
});

// Vuelve a leer la carpeta /media (por si agregas canciones con el servidor encendido)
app.post('/api/rescan', async (_req, res) => {
  try {
    res.json(await scanLibrary({ quiet: true }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// En producción (npm run build && npm start) sirve también el frontend compilado
const dist = path.join(ROOT, 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

await scanLibrary();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API lista en http://localhost:${PORT}`);
});
