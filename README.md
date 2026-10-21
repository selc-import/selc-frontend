# SELC IMPORT — Bloque 1

Hero Vue 3 + TypeScript + TresJS con identidad cromada, iluminación de estudio y presentación de seis fases. El Bloque 2 conserva su sección existente.

## Desarrollo local

```sh
npm install
npm run dev -- --port 5173 --strictPort
npm run typecheck
npm run lint
npm run build
```

En PowerShell con scripts deshabilitados, usar `npm.cmd` en lugar de `npm`.
Abrir http://localhost:5173. Se mantienen las dependencias de producción originales.

## Decisiones visuales

La S es una aproximación trazada manualmente desde `public/assets/brand/selc-original.png`, extruida y biselada. No es una letra de una fuente. La escena y el fallback SVG omiten el símbolo de Apple. El logotipo SELC también utiliza contornos SVG locales inspirados en las proporciones de la referencia.

El cromo utiliza un entorno PMREM generado localmente con reflectores de estudio; no requiere descargar HDR, imágenes ni fuentes. La escena 3D se carga de forma diferida. Con movimiento reducido se muestra directamente el estado final y se renderiza bajo demanda.

## Verificación del navegador

Con Vite activo y un Chrome de pruebas iniciado con `--headless=new --remote-debugging-port=9333` y un perfil independiente, ejecutar:

```sh
node scripts/check-hero-browser.mjs
```

Requiere Node 22 o superior, que proporciona WebSocket nativo. Usa el navegador instalado; no instala Playwright ni otras dependencias. Guarda capturas y el informe en `.qa/`, ignorada por Git y el observador de Vite. El puerto de depuración es exclusivamente local y debe cerrarse al terminar la revisión.

Comprueba la coreografía, la topología real de la geometría, el encuadre y layout en seis tamaños, movimiento reducido inicial y durante la entrada, pérdida de contexto, liberación de recursos GPU y ausencia de WebGL.

Consulta [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) para la auditoría, archivos, decisiones y limitaciones.
