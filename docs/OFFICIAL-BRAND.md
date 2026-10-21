# Actualización — fidelidad al logotipo oficial

> Documento histórico de la etapa de imagen oficial. La implementación activa
> fue sustituida por el [imagotipo completo en geometría 3D](IMAGOTYPE-3D.md),
> conforme a la aclaración posterior del usuario. El fundido descrito aquí ya
> no forma parte del recorrido normal.

## Respaldo y recurso original

La carpeta inicialmente no era un repositorio Git. Se creó el repositorio local y el commit de respaldo `5ada457` antes de modificar esta actualización. No se sustituyó el recurso original ni se sobrescribió una rama previa.

Fuente de verdad: `public/assets/brand/selc-original.png`, 1280×949, 229.809 bytes.

SHA-256:

```text
fe759eba872920bba9e2d0256926db56635685fcda9f9982638082810f67c6f5
```

El hash del archivo servido coincide con el archivo local y el original del respaldo. No se recodificó, trazó, retocó ni filtró la imagen. La manzana incluida se conserva como parte de ese recurso.

## Cambios implementados

- La identidad final pasa del símbolo aproximado y las letras SVG al archivo original completo. Se conservan silueta, brillo original, manzana, tipografía, proporciones, líneas y descriptor.
- La S procedural cromada se conserva exclusivamente como entrada cinematográfica. Una timeline GSAP coordina luces, giro, barrido y disolución progresiva al original.
- La transición dura 1.4 s, alineando antes el contenedor 3D con el símbolo del archivo. La malla sigue siendo una aproximación; no se pretende que sea la identidad oficial.
- Finalizada la entrada, el canvas se desmonta y libera la GPU. El logo oficial queda estable y legible.
- Se retiraron los dos eslóganes adicionales, el header tipográfico anterior y el índice decorativo del footer. El indicador de scroll usa solamente una etiqueta de navegación.
- El header compacto toma un encuadre CSS del mismo recurso oficial, sin deformación. Permanece oculto mientras se muestra el logo principal y aparece después de su salida al hacer scroll.
- Fondo negro, escalado proporcional al tamaño real de la imagen, encuadre completo en desktop y móvil, sin filtros ni recortes del logo principal.
- Movimiento reducido inicial: logo oficial inmediato y ninguna descarga del componente WebGL. Cambiar la preferencia durante la entrada también libera la escena y muestra el original.
- Ausencia de WebGL, pérdida de contexto y plazo de preparación de tres segundos: fallback al mismo recurso oficial.
- La navegación no espera la entrada: scroll, indicador y enlace de salto pueden omitirla. La sección existente de continuación/Bloque 2 conserva contenido y estilos.
- Favicon y preload apuntan al recurso oficial. Se retiró el favicon SVG aproximado para evitar conservar otra interpretación activa de la marca.

## Archivos modificados

- `src/brand/presentation/views/BrandScene.vue`: composición, fallback original, ciclo de vida, scroll y header.
- `src/brand/presentation/components/BrandMark.vue`: representación del activo oficial y encuadre compacto, reemplazando letras y símbolo SVG aproximados.
- `src/brand/presentation/components/brand-intro.ts`: coreografía 3D hacia la identidad oficial.
- `src/brand/presentation/components/ChromeSymbol.vue`: escena limitada a la entrada; se retira el loop permanente.
- `src/brand/presentation/components/BrandCanvas.vue`: fondo negro y contrato actualizado del componente 3D.
- `src/styles/main.css`: encuadre original, responsive y header sin duplicación de identidad.
- `index.html`: favicon oficial, preload y título descriptivo.
- `scripts/check-hero-browser.mjs`: verificación de fidelidad y los nuevos estados de la presentación.
- `README.md` y `docs/IMPLEMENTATION.md`: documentación actualizada.

## Archivos nuevos y retirados

Nuevo: este documento, `docs/OFFICIAL-BRAND.md`.

Retirado: `public/assets/brand/favicon.svg`, sustituido por el recurso original. Su versión anterior permanece en el respaldo Git.

No se añadieron dependencias ni se modificaron `package.json` o `package-lock.json`. El store, fases de dominio, composable de accesibilidad, geometría y estudio se conservaron.

## Comprobaciones ejecutadas

- `npm.cmd run typecheck`: correcto.
- `npm.cmd run lint`: correcto.
- `npm.cmd run build`: correcto. Se mantiene la advertencia de Vite por el tamaño del módulo 3D, que se carga de forma diferida.
- `node scripts/check-hero-browser.mjs`: correcto, Chrome headless instalado con SwiftShader.
- Hash SHA-256 local y servido iguales al original. `git diff --exit-code -- public/assets/brand/selc-original.png` sin diferencias.
- Seis fases verificadas en orden. La opacidad de ambos elementos se comprobó durante la disolución, antes de llegar al estado oficial estable.
- Liberación observada de geometría, material y renderer; contexto GPU perdido y cero geometrías restantes tras el desmontaje.
- Seis tamaños: 1920×1080, 1366×768, 768×1024, 390×844, 320×568 y 844×390. Imagen íntegra, proporción original, sin overflow horizontal ni solapamiento con el indicador.
- Movimiento reducido inicial y activado durante la entrada; se verificó que el primer caso no solicita `BrandCanvas.vue`.
- Fallback sin WebGL y pérdida de contexto durante la entrada.
- Header compacto tras desaparecer el hero y navegación durante la introducción.
- Cero excepciones de navegador, errores de consola o recursos rotos en esa prueba.
- Inspección visual de capturas desktop, móvil, transición y header compacto.

Capturas e informe generados en `.qa/official-logo-*.png` y `.qa/official-logo-report.json`. Son artefactos locales ignorados por Git.

## Limitaciones

El logotipo oficial es raster y conserva la resolución original; no se inventó una versión SVG. El fondo y los márgenes propios del archivo se mantienen, por lo que pueden distinguirse sutilmente de la superficie negra de la página. En móvil el conjunto se reduce proporcionalmente para conservar todo el descriptor, sin agrandar elementos por separado.

La S de entrada continúa siendo una aproximación tridimensional y presenta diferencias con el símbolo del original durante la disolución. Un GLB oficial permitiría reproducir su geometría exacta. El estado final siempre es la imagen original.

La revisión usa renderizado de software y no mide rendimiento en GPU o teléfonos físicos. La sección de catálogo sigue siendo la continuación existente; esta tarea no desarrolla el Bloque 2.
