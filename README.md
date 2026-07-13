# Invitación de boda (plantilla propia)

Plantilla estática (HTML/CSS/JS puro, sin backend) inspirada en el patrón típico de sitios de invitación de boda: hero con video/foto de fondo, historia, detalles del evento, itinerario en línea de tiempo, regalos, vestimenta, playlist de Spotify, preguntas frecuentes, confirmación de asistencia (RSVP), contacto y un carrusel de fotos al final. Todo el código es original — reemplaza el contenido de ejemplo por el tuyo.

## Cómo verla localmente

No necesitas instalar nada. Basta con levantar un servidor estático simple (los navegadores bloquean `fetch`/módulos si abres el `index.html` directamente con `file://`):

```bash
cd invitacion-boda
python3 -m http.server 8000
```

Luego abre `http://localhost:8000` en tu navegador.

## Qué reemplazar

- **`index.html`**: nombres, fecha, textos de cada sección, direcciones, links de WhatsApp, datos bancarios, ítems de la lista de regalos, link real de tu playlist de Spotify (`src` del iframe).
- **`js/script.js`**: la constante `WEDDING_DATE` al inicio controla la cuenta regresiva.
- **`assets/images/`**: coloca tus fotos con estos nombres (o cambia las rutas en `index.html`):
  - `hero-poster.jpg` (imagen de respaldo mientras carga el video del hero)
  - `pareja-historia.jpg`, `galeria-1.jpg` … `galeria-5.jpg` (carrusel del final), `ceremonia.jpg`, `recepcion.jpg`, `parallax-1.jpg`, `vestimenta.jpg`, `playlist-poster.jpg`, `contacto.jpg`
- **`assets/video/`**: `hero-background.mp4` (video de fondo del hero) y `playlist-media.mp4` (video/foto de fondo de la sección playlist).
- **`assets/audio/`**: `background-song.mp3` (canción que suena al activar el botón de música flotante).

## Funcionalidades incluidas

- Nav sticky que cambia de transparente a sólido al hacer scroll, con menú hamburguesa en mobile.
- Animaciones de aparición (fade + slide) al hacer scroll, usando `IntersectionObserver`.
- Cuenta regresiva en vivo hasta la fecha del matrimonio.
- Botón flotante de música de fondo (play/pause).
- Secciones "full-bleed" (foto/video a toda altura + panel de texto) para Vestimenta y Playlist.
- Franja parallax decorativa entre secciones.
- Sección de regalos con datos de transferencia + modal con lista de regalos.
- Playlist embebida de Spotify con tabs "Playlist" / "Sugerencias", modal para sugerir canción (guardado en `localStorage`, contador de sugerencias).
- Preguntas frecuentes en formato acordeón (clic para expandir/cerrar cada pregunta).
- RSVP por invitado (Asistiré / No asistiré) que guarda la respuesta en `localStorage` y muestra el estado "ya confirmado" con opción de "Modificar respuesta", igual que en las plataformas de invitación reales.
- Carrusel de fotos continuo con auto-scroll (se pausa al pasar el mouse) al final de la página, con clic para ampliar cada foto.

## Qué NO incluye (a propósito)

No tiene backend real: las sugerencias de canciones y el RSVP se guardan solo en el navegador (`localStorage`), no se envían a nadie. Si más adelante quieres que los datos de RSVP o regalos lleguen a un correo/planilla real, se puede conectar a un servicio como Formspree, Google Apps Script o una función serverless — avísame y lo agregamos.
