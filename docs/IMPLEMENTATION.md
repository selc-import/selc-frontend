# Bloque 1 — arquitectura actual

La implementación activa es el imagotipo completo como modelo GLB. El antiguo fundido entre una S aproximada y un PNG fue sustituido por geometría persistente. Véase [IMAGOTYPE-3D.md](IMAGOTYPE-3D.md).

## Componentes

- `BrandScene.vue`: composición, accesibilidad, ciclo de vida, fallback, observers y ScrollTrigger. Mantiene el canvas tras la introducción; el scroll o los enlaces pueden adelantar al estado final 3D.
- `BrandCanvas.vue`: TresCanvas, cámara ortográfica con frustum manual que conserva el aspecto original, ACES, salida sRGB y DPR limitado a 1.75. Libera explícitamente el renderer al desmontar.
- `ChromeSymbol.vue`: carga el GLB con GLTFLoader, instala el entorno PMREM y emite el rig tras un frame renderizado. Usa `useLoop` para un giro lento exclusivamente después de la timeline. Las cuatro partes se conservan como nodos de geometría.
- `brand-intro.ts`: única timeline de seis fases y función para fijar el estado final. Anima material, luz y grupos 3D; no contiene una transición a imagen.
- `studio-environment.ts`: reflectores de estudio horneados una vez en PMREM, key, fill, rim y barrido mediante área luminosa real.
- `BrandMark.vue`: header compacto con contornos SVG del texto original; PNG completo únicamente para fallback.

## Fuente del modelo

`imagotype-model.ts` construye los sólidos y conserva las coordenadas globales del arte original. `imagotype-contours.json` contiene contornos de referencia. `trace-imagotype.ts` realiza la extracción geométrica del lettering durante la generación, fuera de la aplicación productiva.

`scripts/bake-imagotype.mjs` carga estas fuentes en un Chrome local y exporta `public/assets/brand/selc-imagotype.glb` mediante GLTFExporter. No se necesita volver a generar el modelo para ejecutar la aplicación.

El descriptor y las letras se extruyen respetando huecos y contornos. Las curvas principales de S, la cinta inferior y el retorno posterior están modelados a mano desde la referencia. La manzana y la hoja también se reconstruyen manualmente; no se importó ni generó una nueva marca mediante un trazador automático.

Los archivos de la antigua S aislada `ribbon-geometry.ts` y `symbol-outline.ts` no forman parte de la escena activa.

## Estados y limpieza

Se conservan Pinia y las fases tipadas de dominio: dark, reveal, rotate, shine, wordmark e idle. `wordmark` ahora anima sólidos 3D de texto. `idle` mantiene el modelo completo visible y permite el loop. GSAP y el loop no escriben simultáneamente las rotaciones.

Con movimiento reducido inicial se presenta el fallback estático sin cargar GLB. Una activación posterior cancela la entrada o el loop, desmonta el canvas y muestra el original. Lo mismo ocurre tras un fallo de contexto o una carga que supere diez segundos.

Se liberan las 52 geometrías, cinco materiales, entorno PMREM, luz de área, renderer y contexto. Una carga GLB que termina después del desmontaje también se desecha. Se limpian observers, timers, callbacks de frame, GSAP, ScrollTrigger y listeners.

## Preservación

La imagen original permanece sin modificaciones. El respaldo inicial es el commit Git `5ada457`; el estado previo al modelado completo se guardó con `git diff --binary` en `.qa/before-full-3d.patch`. La sección existente del Bloque 2 conserva texto y estilos.
