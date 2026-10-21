# SELC IMPORT — imagotipo completo en 3D

El hero presenta un modelo GLB completo: S, manzana y hoja, letras SELC, IMPORT, líneas laterales y descriptor. Todas las piezas tienen superficies cerradas, espesor real y material metálico PBR. El modelo permanece en pantalla; no se transforma en una imagen al terminar la entrada.

## Desarrollo

```sh
npm install
npm run dev -- --port 5173 --strictPort
npm run typecheck
npm run lint
npm test
npm run build
```

En PowerShell con scripts deshabilitados, usar `npm.cmd`. Abrir http://localhost:5173.

Modelo independiente: `public/assets/brand/selc-imagotype.glb`. Se puede importar en Blender o cualquier visor glTF 2.0. No contiene imágenes ni texturas del logo.

## Comportamiento

- Introducción GSAP con iluminación gradual, giro, barrido y aparición de las letras 3D por grupos.
- El conjunto completo permanece como geometría WebGL y gira lentamente dentro de un rango legible.
- Cámara ortográfica para mantener las proporciones frontales de la composición de referencia.
- Fondo negro, materiales cromados y entorno de estudio generado localmente.
- La imagen original se conserva intacta y solo se muestra como fallback cuando falla WebGL o se solicita movimiento reducido. El header usa contornos vectoriales locales, no una imagen.
- EXPLORAR y el scroll libre conducen al catálogo interactivo de iPhone, con datos y fotografías del PDF de octubre de 2026, filtros, variantes y enlaces de WhatsApp.

Consulta [docs/CATALOG.md](docs/CATALOG.md) para la integración del catálogo, sus fuentes y las pruebas de navegación y compra.

La iconografía Lucide, los botones reutilizables y las microinteracciones están descritos en [docs/MICROINTERACTIONS.md](docs/MICROINTERACTIONS.md). `npm run test:microinteractions` comprueba teclado, hover, active, disabled, filtros rápidos y movimiento reducido con el navegador de pruebas.

El rediseño comercial, las rutas de detalle, la navegación y el estado compartido entre páginas están documentados en [docs/CATALOG-REDESIGN.md](docs/CATALOG-REDESIGN.md), con changelog, comprobaciones y limitaciones.

## Regenerar el modelo

Con Vite activo y un Chrome de pruebas con un perfil independiente y `--headless=new --remote-debugging-port=9333`:

```sh
node scripts/bake-imagotype.mjs
npm test
npm run test:browser
```

Node 22 o superior proporciona WebSocket nativo. El script extrae los contornos del texto suministrado, reconstruye los sólidos, modela el isotipo con curvas manuales y exporta el GLB. No usa IA para redibujar la marca, fuentes sustitutas, servicios externos ni nuevas dependencias. Cerrar Chrome y su puerto de depuración al terminar.

Capturas e informe de navegador: `.qa/imagotype-3d-*.png` y `.qa/imagotype-3d-report.json`.

Consulta [docs/IMAGOTYPE-3D.md](docs/IMAGOTYPE-3D.md) para la construcción, verificación y límites de fidelidad.
