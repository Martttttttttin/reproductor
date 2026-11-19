import { DatabaseSync } from 'node:sqlite'; // SQLite incluido en Node 22+ (no requiere compilar)
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(__dirname, '..');
// Se puede cambiar con la variable de entorno MEDIA_DIR (útil para pruebas)
export const MEDIA_DIR = process.env.MEDIA_DIR
  ? path.resolve(process.env.MEDIA_DIR)
  : path.join(ROOT, 'media');
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(ROOT, 'data');

fs.mkdirSync(MEDIA_DIR, { recursive: true });
fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(path.join(DATA_DIR, 'popi.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS albums (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT NOT NULL,          -- nombre para mostrar
    folder  TEXT NOT NULL UNIQUE,   -- carpeta real dentro de /media
    artist  TEXT,
    cover   TEXT,                   -- ruta relativa a /media (o NULL)
    sort    INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS songs (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    album_id  INTEGER NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    title     TEXT NOT NULL,
    artist    TEXT,
    file      TEXT NOT NULL,        -- ruta relativa a /media
    cover     TEXT,                 -- portada propia de la canción (opcional)
    duration  REAL NOT NULL DEFAULT 0,
    track     INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_songs_album ON songs(album_id, track);
`);
