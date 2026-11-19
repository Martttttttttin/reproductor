# Reproductor Popi 🎂

Reproductor de música con estilo de empaque Terrabusi.
**React (Vite)** + **Node/Express** + **SQLite (`node:sqlite`, incluido en Node 22+)**.

## Flujo de pantallas

1. Imagen del chico + botón **Ver mensaje**
2. Modal con blur: "Feliz cumpleaños Popi" + botón **Ver regalo**
3. Empaque: "Reproductor de música de K-pop" + botón **Ir a biblioteca**
4. **Biblioteca**: canciones separadas por álbum, barra de la canción sonando (solo si hay algo sonando) y botón **Menú**
5. **Reproductor** (al tocar la barra de la canción): portada, barra arrastrable, aleatorio / anterior / play-pausa / siguiente / repetir. **Menú** vuelve a la biblioteca.

Anterior: **1 toque** = volver a reproducir la canción · **2 toques** = canción anterior.
Repetir alterna: apagado → todas → una (aparece un "1").

## Cómo usarlo

```bash
npm install      # requiere Node 22.5 o superior
npm run dev        # abre http://localhost:5173
```

### Agregar canciones (sin tocar la base de datos)

Copia tus audios dentro de `media/`, **una carpeta por álbum**:

```
media/
├── 01 - Nombre del álbum/
│   ├── cover.jpg            ← portada del álbum (opcional)
│   ├── 01 Canción uno.mp3
│   ├── 02 Canción dos.mp3
│   └── 02 Canción dos.jpg   ← portada propia de esa canción (opcional)
└── 02 - Otro álbum/
    └── ...
```

- Título, artista, número de pista y **duración** se leen de las etiquetas del mp3
  (si no tiene etiquetas, se usa el nombre del archivo).
- El número inicial de la carpeta ("01 - ") solo sirve para ordenar y no se muestra.
- Si el álbum no tiene `cover.jpg`, se usa la portada incrustada en el mp3 (si existe).
- Formatos: mp3, m4a, aac, ogg, opus, wav, flac.

La biblioteca se reconstruye sola cada vez que arranca el servidor.
Para actualizarla sin reiniciar: `npm run scan`  (o `POST /api/rescan`).

La base de datos queda en `data/popi.db` con las tablas `albums` y `songs`
(guarda solo las **rutas** de los archivos, no el audio).

## Publicarlo

```bash
npm run build      # genera /dist
npm start          # sirve frontend + API en http://localhost:3001
```

Necesita un hosting que ejecute Node (Render, Railway, un VPS…). Copia también la carpeta `media/`.
Para que cargue rápido en el celular conviene tener los mp3 a 192 kbps o menos.

## Probarlo desde el celular (misma red wifi)

`npm run dev` muestra una dirección "Network" (`http://192.168.x.x:5173`). Ábrela en el celular.

## Ajustar posiciones

Todo lo que va sobre el empaque está en `src/styles.css`, en porcentajes sobre la imagen
(`.list-panel`, `.now-bar`, `.title-bar`, `.art`, `.progress`, `.controls`, `.menu-btn`).
Las imágenes están en `public/img/` (`intro.webp`, `empaque.webp`).

## Fuente e iconos

- **Clash Display** se carga desde Fontshare (`index.html`). Si quieres que funcione sin internet,
  descarga los `.woff2` y decláralos con `@font-face` en `styles.css`.
- Iconos: Font Awesome (`@fortawesome/react-fontawesome`).

## Publicar en Netlify

Configura el comando de compilación `npm run build` y el directorio de publicación `dist`. La compilación genera la biblioteca y copia los archivos de `media/` a `dist/media/`. Asegúrate de que las canciones y portadas estén incluidas en el repositorio o en los archivos que subes a Netlify. Para agregar canciones, vuelve a desplegar el sitio. Node 22.5 o superior es necesario para generar la biblioteca.
