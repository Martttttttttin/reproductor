import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseFile, selectCover } from 'music-metadata';
import { db, MEDIA_DIR } from './db.js';

const AUDIO_EXT = new Set(['.mp3', '.m4a', '.aac', '.ogg', '.opus', '.wav', '.flac']);
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp'];
const USER_COVERS = '_covers'; // portadas puestas por ti (ver findUserCover)
const COVER_CACHE = '_cache'; // portadas extraídas de las etiquetas del audio (se genera solo)

const collator = new Intl.Collator('es', { numeric: true, sensitivity: 'base' });

/** "01 - Mi álbum" -> "Mi álbum" */
const cleanName = (s) => s.replace(/^\s*\d{1,3}\s*[-_.)]\s*/, '').trim() || s;

const rel = (...parts) => parts.join('/'); // rutas relativas siempre con "/"

function findImage(dir, baseNames) {
  for (const base of baseNames) {
    for (const ext of IMAGE_EXT) {
      const file = base + ext;
      if (fs.existsSync(path.join(dir, file))) return file;
    }
  }
  return null;
}

const norm = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

/**
 * Busca en media/_covers una imagen cuyo nombre se parezca al del álbum:
 * "getup.webp" -> álbum "GET UP", "likeyou.webp" -> "I'LL LIKE YOU", etc.
 * (ignora mayúsculas, espacios, guiones y signos; vale que uno contenga al otro).
 * Si hay varias, gana el .webp, luego .jpg y por último .png.
 */
function findUserCover(folder) {
  const dir = path.join(MEDIA_DIR, USER_COVERS);
  if (!fs.existsSync(dir)) return null;
  const target = norm(cleanName(folder));
  const extRank = ['.webp', '.jpg', '.jpeg', '.png'];
  let best = null;
  for (const file of fs.readdirSync(dir)) {
    const ext = path.extname(file).toLowerCase();
    if (!extRank.includes(ext)) continue;
    const stem = norm(path.basename(file, ext));
    let score = 0;
    if (stem === target) score = 2;
    else if (stem.length >= 4 && (target.includes(stem) || stem.includes(target))) score = 1;
    if (!score) continue;
    const rank = extRank.indexOf(ext);
    // Prioriza el formato (.webp primero) y, a igualdad de formato, el nombre más parecido
    if (!best || rank < best.rank || (rank === best.rank && score > best.score)) {
      best = { file, score, rank };
    }
  }
  return best ? rel(USER_COVERS, best.file) : null;
}

function extFromMime(mime = '') {
  if (mime.includes('png')) return '.png';
  if (mime.includes('webp')) return '.webp';
  return '.jpg';
}

function saveEmbeddedCover(metadata, slug) {
  const pic = selectCover(metadata.common.picture);
  if (!pic) return null;
  const dir = path.join(MEDIA_DIR, COVER_CACHE);
  fs.mkdirSync(dir, { recursive: true });
  const file = slug + extFromMime(pic.format);
  fs.writeFileSync(path.join(dir, file), pic.data);
  return rel(COVER_CACHE, file);
}

export async function scanLibrary({ quiet = false } = {}) {
  const log = quiet ? () => {} : console.log;

  const folders = fs
    .readdirSync(MEDIA_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort(collator.compare);

  const albums = [];

  for (const folder of folders) {
    const dir = path.join(MEDIA_DIR, folder);
    const files = fs
      .readdirSync(dir)
      .filter((f) => AUDIO_EXT.has(path.extname(f).toLowerCase()))
      .sort(collator.compare);
    if (!files.length) continue;

    const songs = [];
    let albumArtist = null;
    let albumCover = findImage(dir, ['cover', 'portada', 'folder']);
    if (albumCover) albumCover = rel(folder, albumCover);
    else albumCover = findUserCover(folder);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base = path.basename(file, path.extname(file));
      let meta = null;
      try {
        meta = await parseFile(path.join(dir, file), { duration: true });
      } catch (err) {
        log(`  ! No pude leer ${folder}/${file}: ${err.message}`);
      }

      const common = meta?.common ?? {};
      if (!albumArtist) albumArtist = common.albumartist || common.artist || null;

      // Portada propia: <nombre-de-la-cancion>.jpg junto al audio
      const ownCover = findImage(dir, [base]);

      if (!albumCover && meta) {
        const slug = `${folder}`.replace(/[^\w.-]+/g, '_');
        const saved = saveEmbeddedCover(meta, slug);
        if (saved) albumCover = saved;
      }

      songs.push({
        title: common.title || cleanName(base),
        artist: common.artist || null,
        file: rel(folder, file),
        cover: ownCover ? rel(folder, ownCover) : null,
        duration: meta?.format?.duration ?? 0,
        track: common.track?.no || i + 1,
      });
    }

    songs.sort((a, b) => a.track - b.track || collator.compare(a.file, b.file));
    albums.push({
      folder,
      name: cleanName(folder),
      artist: albumArtist,
      cover: albumCover,
      songs,
    });
  }

  const insertAlbum = db.prepare(
    'INSERT INTO albums (name, folder, artist, cover, sort) VALUES (@name, @folder, @artist, @cover, @sort)'
  );
  const insertSong = db.prepare(
    `INSERT INTO songs (album_id, title, artist, file, cover, duration, track)
     VALUES (@album_id, @title, @artist, @file, @cover, @duration, @track)`
  );

  db.exec('BEGIN');
  try {
    db.exec('DELETE FROM songs; DELETE FROM albums;');
    albums.forEach((al, idx) => {
      const { lastInsertRowid } = insertAlbum.run({
        name: al.name,
        folder: al.folder,
        artist: al.artist,
        cover: al.cover,
        sort: idx,
      });
      al.songs.forEach((s) => insertSong.run({ ...s, album_id: Number(lastInsertRowid) }));
    });
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  const total = albums.reduce((n, a) => n + a.songs.length, 0);
  log(`Biblioteca lista: ${albums.length} álbum(es), ${total} canción(es).`);
  return { albums: albums.length, songs: total };
}

// Permite ejecutar:  npm run scan
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  scanLibrary().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}