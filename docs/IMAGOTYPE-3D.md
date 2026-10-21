# Imagotipo completo — reconstrucción 3D

## Resultado

Se sustituyó el fundido a imagen por un modelo GLB que permanece en la escena. El conjunto incluye S, manzana, hoja, SELC, IMPORT, líneas y descriptor. El modelo tiene 52 mallas cerradas y cinco materiales físicos, sin imágenes, texturas de color, mapas normales ni planos que simulen la marca impresa.

Activo entregado: `public/assets/brand/selc-imagotype.glb`.

- glTF binario 2.0.
- 2.669.924 bytes, aproximadamente 2.55 MiB.
- 72.866 vértices y 145.584 triángulos.
- 52 sólidos: cinco piezas del isotipo, cuatro letras SELC, ocho piezas IMPORT/líneas y 35 caracteres/separadores del descriptor.
- Cuatro grupos para coreografía: `isotype`, `wordmark`, `import`, `descriptor`.
- Cero imágenes y cero texturas de la marca embebidas.

El entorno PMREM de estudio se genera en ejecución y es una reflexión física; no contiene la imagen del logo.

## Fidelidad y construcción

El archivo suministrado `selc-original.png` sigue siendo la referencia, sin alteraciones. Su SHA-256 permanece:

```text
fe759eba872920bba9e2d0256926db56635685fcda9f9982638082810f67c6f5
```

Los contornos de SELC, IMPORT, sus líneas y el descriptor se obtienen del raster suministrado mediante extracción determinista de bordes y simplificación de 0.28 píxeles. No se sustituye la tipografía por una fuente similar. Se conservan coordenadas, espaciados y huecos originales.

La S se reconstruye con curvas Bézier manuales que distinguen cinta principal, retorno posterior y cara inferior. Esto evita convertir sombras oscuras de la imagen en agujeros o bordes recortados. La manzana y la hoja se modelan manualmente a partir de su posición y contorno en la referencia. No se genera otra imagen de la marca.

Cada contorno se extruye con bisel y se cierra por delante, detrás y los lados. La cinta recibe subdivisión y una superficie de relieve real. Las letras SELC tienen una curvatura frontal muy leve; IMPORT, las líneas y el descriptor tienen espesor propio. Se sueldan vértices, se calculan normales y se ajustan las normales de las superficies curvas.

La cara inferior de la S incorpora normales suavizadas para que su reflejo pase de plata a oscuro hacia la derecha, evitando la franja blanca horizontal. Su contorno alcanza el retorno de la cinta principal, con un pequeño solape oculto, y su profundidad converge con esa superficie para cerrar la abertura también durante el giro. El ajuste afecta únicamente a `S_lower_ribbon`; conserva su espesor, bisel y material, además de las otras 51 mallas.

La cámara ortográfica conserva las proporciones frontales y el sistema global de coordenadas 1280×949. La iluminación ACES/sRGB y los materiales metálicos producen reflejos en tiempo real.

## Experiencia

La introducción revela el isotipo, gira el conjunto, barre una luz de área y muestra secuencialmente las letras 3D. Al terminar continúa el mismo modelo, con movimiento lento acotado a ±0.22 rad en Y y oscilación mínima en X.

La imagen original no está presente en el hero cuando WebGL funciona normalmente. El header compacto utiliza los contornos vectoriales del lettering, por lo que tampoco introduce un PNG en ese recorrido. La imagen se reserva para movimiento reducido y fallback WebGL.

El scroll puede omitir la introducción y fijar inmediatamente el modelo completo. No se cambia a una imagen al pulsar el indicador. La navegación continúa libre y el header aparece cuando el protagonista se ha desvanecido hacia la sección siguiente.

## Archivos nuevos

- `public/assets/brand/selc-imagotype.glb`
- `src/brand/presentation/assets/imagotype-contours.json`
- `src/brand/presentation/components/imagotype-model.ts`
- `src/brand/presentation/components/trace-imagotype.ts`
- `scripts/bake-imagotype.mjs`
- `scripts/cdp-client.mjs`
- `scripts/check-imagotype-model.mjs`
- Este documento, `docs/IMAGOTYPE-3D.md`.

## Archivos actualizados

- `BrandScene.vue`, `ChromeSymbol.vue`, `BrandCanvas.vue`, `BrandMark.vue`.
- `brand-intro.ts` y `studio-environment.ts`.
- `src/styles/main.css`, `index.html` y `package.json` (solo comandos de pruebas).
- `scripts/check-hero-browser.mjs`.
- `README.md`, `docs/IMPLEMENTATION.md` y la nota histórica en `docs/OFFICIAL-BRAND.md`.

Sin dependencias nuevas. El store, las fases de dominio y el Bloque 2 se conservan.

## Verificación

Resultados ejecutados sobre esta versión:

- `npm.cmd run typecheck`: correcto.
- `npm.cmd run lint`: correcto.
- `npm.cmd test`: correcto, 52 sólidos validados.
- `npm.cmd run test:browser`: correcto, seis tamaños y cero errores de navegador.
- `npm.cmd run build`: correcto. Vite conserva la advertencia por el tamaño del módulo 3D, que se carga de forma diferida.

`npm test` examina el GLB binario entregado, sin depender del código que lo construye. Comprueba espesores positivos, normales unitarias, ausencia de triángulos degenerados, volumen firmado positivo y dos caras incidentes por cada arista de cada sólido. También verifica 52 piezas y cero imágenes/texturas.

La prueba de navegador comprueba la permanencia del canvas tras la introducción, 52 mallas con material metálico y grosor real, cero imágenes en el hero normal, las seis fases, giro continuo, cámara y layout en seis tamaños, salto de introducción conservando 3D, header vectorial, movimiento reducido y pérdida/ausencia de WebGL. La inspección de desmontaje observa la liberación de 52 geometrías, cinco materiales, renderer y contexto.

Capturas frontal, móvil y en ángulo, junto con el informe, se guardan en `.qa/imagotype-3d-*`. La captura en ángulo se toma del renderer real mostrando los costados de símbolo, letras, líneas y descriptor.

## Límites de fidelidad

Este es un modelo nuevo reconstruido a partir de una referencia raster, no un archivo 3D oficial del cliente. El raster no aporta el reverso ni la profundidad original; el grosor, relieve y superficies posteriores son decisiones de modelado. La S y la manzana pueden requerir ajustes de contorno tras revisión del cliente. Los reflejos cambian con luces y ángulo, de modo que no reproducen estáticamente cada brillo del PNG.

El modelo se entrega editable como geometría GLB y con su fuente TypeScript para poder ajustar esas superficies. La comprobación visual usa Chrome con SwiftShader y no mide rendimiento en GPU o teléfonos físicos. El mayor peso del GLB y del motor 3D es parte del coste de mantener geometría real.
