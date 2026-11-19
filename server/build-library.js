import fs from 'node:fs';
import path from 'node:path';
import { ROOT, MEDIA_DIR, db } from './db.js';
import { scanLibrary } from './scan.js';

await scanLibrary();
const dist = path.join(ROOT, 'dist');
fs.cpSync(MEDIA_DIR, path.join(dist, 'media'), { recursive: true });
const url = (p) => p ? '/media/' + p.split('/').map(encodeURIComponent).join('/') : null;
const albums = db.prepare('SELECT * FROM albums ORDER BY sort').all();
const songs = db.prepare('SELECT * FROM songs ORDER BY album_id, track, id').all();
const library = albums.map((a) => ({
  id: a.id, name: a.name, artist: a.artist, cover: url(a.cover),
  songs: songs.filter((s) => s.album_id === a.id).map((s) => ({
    id: s.id, title: s.title, artist: s.artist, duration: s.duration,
    url: url(s.file), cover: url(s.cover),
  })),
}));
fs.writeFileSync(path.join(dist, 'albums.json'), JSON.stringify(library));
console.log(`Biblioteca estática: ${library.length} álbumes, ${songs.length} canciones.`);
db.close();