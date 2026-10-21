# Bloque 1 — Auditoría y rediseño del hero

## Auditoría previa

Se inspeccionaron `package.json`, dependencias instaladas, `BrandScene.vue`, `ChromeSymbol.vue`, `ribbon-geometry.ts`, `brand-scene.store.ts`, fases de dominio, CSS global, composable de movimiento reducido, configuración de Vite y ESLint.

Versiones instaladas: Vue 3.5.44, TresJS core 4.3.6, cientos 4.3.1, Three 0.175.0, GSAP 3.15.0, Pinia 2.3.1, TypeScript 5.7.3 y Vite 6.4.4. Se verificaron las APIs contra los tipos y el código de estas versiones.

Problemas encontrados:

- La trayectoria CatmullRom de la cinta omitía el arco superior reconocible del isotipo.
- El barrido rectangular tenía extremos abiertos, caras con winding hacia dentro y vértices compartidos que mezclaban normales entre caras distintas. `DoubleSide` ocultaba el problema de orientación.
- Metalness 1 sin mapa de entorno: las luces puntuales y el ambiente no producían reflejos de estudio adecuados.
- La cámara se pasaba como objeto literal con tipos incompatibles con TresJS 4.3; una animación GSAP aceptaba un elemento posiblemente indefinido. El typecheck inicial falló con dos errores.
- ESLint no tenía parser TypeScript para los scripts Vue; el lint inicial falló.
- El PNG de fallback incluía el símbolo de Apple y duplicaba el wordmark.
- La detección aceptaba WebGL 1, que Three r175 no admite. La señal de escena lista no verificaba un frame renderizado y no había plazo de seguridad para la carga.
- El loop podía recorrer giros completos y perder legibilidad de frente. La preferencia de movimiento reducido se leía después del montaje inicial.

## Geometría elegida

Se eligió `Shape` + `ExtrudeGeometry` biselada frente a reparar la cinta: fija una silueta frontal deliberada, cierra ambos extremos y proporciona profundidad real. La alternativa GLB sería preferible para reproducir exactamente las torsiones del original, pero no existe ese activo en el repositorio.

`symbol-outline.ts` contiene curvas Bézier trazadas a partir de la referencia. Se comparten con el fallback vectorial. El badge mide aproximadamente 3 unidades de alto, con profundidad 0.25 y biseles de grosor 0.055 y ancho 0.035. Los vértices coincidentes se sueldan con tolerancia 0.00001; los planos frontal y posterior conservan normales planas para evitar facetas falsas.

La prueba del navegador verificó 5.856 vértices, 11.708 triángulos, cero bordes abiertos/no manifold, cero triángulos degenerados, normales unitarias y volumen firmado positivo. El material utiliza su culling frontal normal.

La S sigue siendo una aproximación del contorno, sin la torsión de cinta exacta del logotipo. No se presenta como un modelo original aprobado.

## Material e iluminación

`studio-environment.ts` encapsula el material y el estudio. El material físico usa color plateado, metalness 1, roughness 0.18, clearcoat 0.28 y envMapIntensity final 1.05. La cámara usa FOV 35°, posición Z 6.1, aspecto adaptado por TresJS, salida sRGB, tone mapping ACES y exposición 0.95.

PMREM hornea una escena de reflectores rectangulares a una textura de entorno una sola vez. El reflector frontal mantiene visible la plata; los laterales y superior describen los biseles y el contorno. La escena visible conserva un fondo transparente sobre el negro radial del hero. No hay descarga de HDR ni generación de cubemap por frame.

Key, fill y rim tienen funciones separadas. Un `RectAreaLight` real recorre el frente durante el barrido; no se superpone una capa blanca. Se inicializa su tabla de uniformes compatible con Three r175.

Referencias de API: [ExtrudeGeometry](https://threejs.org/docs/#api/en/geometries/ExtrudeGeometry), [PMREMGenerator](https://threejs.org/docs/#api/en/extras/PMREMGenerator). Los parámetros concretos se verificaron localmente con Three 0.175.0.

## Coreografía

Una sola timeline de `brand-intro.ts` controla escena y DOM:

1. `dark`, 0–0.28 s: sin iluminación ni reflejos, texto oculto.
2. `reveal`, desde 0.28 s: aumento progresivo de entorno, key, fill y rim.
3. `rotate`, desde 1.25 s: giro de Y −1.12 a −0.08 rad, easing `power3.inOut`.
4. `shine`, desde 3.35 s: área luminosa de izquierda a derecha y apagado gradual.
5. `wordmark`, desde 4.15 s: SELC, IMPORT y descriptor secuenciales.
6. `idle`, a los 5.5 s: empieza `useLoop`, condicionado a `introComplete`.

El giro continuo se limita a ±0.3 rad alrededor de la orientación frontal y añade una oscilación mínima en X. La introducción y el loop nunca escriben simultáneamente la rotación. El delta se limita después de una suspensión de pestaña.

## Resiliencia y rendimiento

- `BrandCanvas.vue` se importa de forma diferida: el texto y el fallback no dependen del bundle WebGL.
- Detección exclusiva de WebGL 2, liberando el contexto de prueba.
- Señal de escena lista tras renderizar un frame con el entorno creado.
- Fallback SVG si falta WebGL, hay un fallo de montaje, se pierde el contexto o no llega el primer frame en ocho segundos. La transición revela inmediatamente el texto y cancela la timeline.
- Tras pérdida de contexto se mantiene el fallback durante esa visita. Una recarga vuelve a intentar la escena.
- Movimiento reducido leído antes del montaje y observado durante la sesión. Cancela GSAP, fija el estado final y evita giro y scroll animado. Renderer bajo demanda en ese estado, fuera del viewport y en pestaña oculta.
- DPR limitado a 1.75; sin sombras, postprocesado, descargas HDR ni cubemaps dinámicos.
- El componente libera geometría, material, PMREM, área luminosa y callbacks de frame. Se invoca además `TresCanvas.dispose()` para liberar renderer, listas de render y contexto en TresJS 4.
- Se limpian timeline, contexto GSAP/ScrollTrigger, observer, temporizador y listeners. La prueba de pérdida de contexto observa la liberación de geometría y material, la llamada a dispose del renderer y el contexto GPU perdido. Los contadores de texturas compartidas de Three no se usan como prueba de fugas después de perder el contexto.
- Canvas decorativo, H1 textual accesible, enlace para saltar presentación y foco visible. Los gestos de scroll móvil no quedan capturados por el canvas.
- `.qa/` está excluida del watcher de Vite para evitar bloqueos de archivos del perfil de Chrome en Windows.

## Sustitución futura por GLB

El grupo `symbol` de `ChromeSymbol.vue` es el contrato visual de la coreografía. Sustituir únicamente su hijo procedural por el `gltf.scene` cargado; centrarlo en el origen, escalarlo a unos 3.1 de alto y orientar su frente hacia +Z. Aplicar el mismo material a las mallas aprobadas y liberar sus recursos al desmontar. Mantener ese grupo y el `BrandSceneRig` conserva la cámara, iluminación, GSAP y loop. `ribbon-geometry.ts` queda como fábrica aislada de la aproximación actual. No se descarga un GLB externo ni se implementa un cargador sin un activo real.

## Archivos

Creados:

- `src/brand/presentation/components/symbol-outline.ts`
- `src/brand/presentation/components/studio-environment.ts`
- `src/brand/presentation/components/brand-intro.ts`
- `src/brand/presentation/components/BrandMark.vue`
- `src/brand/presentation/components/BrandCanvas.vue`
- `public/assets/brand/favicon.svg`
- `scripts/check-hero-browser.mjs`

Modificados:

- `src/brand/presentation/components/ribbon-geometry.ts`
- `src/brand/presentation/components/ChromeSymbol.vue`
- `src/brand/presentation/views/BrandScene.vue`
- `src/shared/composables/useReducedMotion.ts`
- `src/styles/main.css`
- `eslint.config.js`
- `vite.config.ts`
- `index.html`
- `.gitignore`
- `package.json` y `package-lock.json`
- `README.md` y este documento

El store y las fases de dominio se inspeccionaron y se conservaron. La sección existente del Bloque 2 mantiene su contenido y estilos.

Dependencia de desarrollo añadida: `@typescript-eslint/parser`, necesaria para ejecutar el lint que antes fallaba al interpretar TypeScript. Sin nuevas dependencias de producción.

## Verificación ejecutada

- `npm.cmd run typecheck`: correcto.
- `npm.cmd run lint`: correcto.
- `npm.cmd run build`: correcto. Vite advierte del peso del chunk de Three/Tres; se difiere su carga, sin ocultar esa advertencia.
- `node scripts/check-hero-browser.mjs`: correcto en Chrome headless instalado, usando SwiftShader.
- Seis tamaños: 1920×1080, 1366×768, 768×1024, 390×844, 320×568 y 844×390. Sin overflow horizontal, símbolo íntegro dentro de cámara y sin solapamiento entre texto y control de scroll.
- Se verificaron las seis fases en orden, el movimiento posterior, topología de la malla, movimiento reducido inicial y durante la entrada, fallback sin WebGL, pérdida de contexto y liberación de recursos GPU.
- Cero excepciones, errores de consola o errores de red en esa prueba. Capturas desktop/móvil e informe en `.qa/`.
- Se inspeccionaron visualmente las capturas de desktop y móvil.

## Límites

La fidelidad exacta del isotipo requiere un GLB aprobado de Blender. La validación de navegador usa un renderizador de software: no sustituye medir rendimiento y revisar el acabado en dispositivos físicos con otras GPU. El chunk 3D continúa siendo grande, aunque no bloquea el contenido principal. No se han publicado cambios ni desarrollado el catálogo.
