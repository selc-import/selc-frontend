# Rediseño del catálogo web SELC IMPORT

## Resultado y recorrido

Se implementó el rediseño dentro del proyecto Vue existente. El recorrido es: hero original → introducción breve → búsqueda y filtros → productos → pedidos especiales → cómo comprar → contacto y condiciones.

El hero conserva su escena, logo, animaciones, geometría, materiales, fallback y estilos. En `BrandScene.vue` solo se añadió el slot `navigation` alrededor del enlace de marca existente. La composición `app` utiliza ese punto para ampliar el encabezado que aparece al salir del hero. No se monta una segunda portada. EXPLORAR sigue enlazando a `#continuar`.

## Changelog

| Área | Cambio |
| --- | --- |
| Navegación | Marca original, iPhones, Cómo comprar, Contacto y acceso a WhatsApp. Encabezado fijo de dos filas en móvil, estado activo según la sección y márgenes de scroll que dejan visibles los encabezados. |
| Exploración | Generaciones como controles de selección, búsqueda con limpieza, contador de resultados y orden nativo. Se eliminó la frase «Precios en soles · Fotos referenciales». |
| Tarjetas | Fotos completas sin recortar el equipo, nombre y capacidad legibles, precio, acceso al detalle y consulta con WhatsApp. Se retiraron fichas técnicas, divisores y badges repetidos de las tarjetas. |
| Detalle | Rutas `/iphone/:productId`, fotografía existente, capacidad, precio publicado con fecha, especificaciones y variantes reales. La versión elegida actualiza el precio y la consulta. |
| Estado compartido | El cuerpo de la lógica de `useCatalog` se conserva dentro de un store Pinia. Se mantienen generación, búsqueda, orden y variante entre catálogo y detalle. |
| Retorno | El enlace al catálogo lleva a los filtros y sitúa allí el foco. Atrás del navegador restaura la posición y el foco en el producto del que se partió. Las transiciones entre páginas son inmediatas; los enlaces de sección conservan scroll suave. |
| Información comercial | Beneficios documentados agrupados; caja incluida junto al recorrido de compra. Contacto de asesores y condiciones al final, con confirmación de precio/disponibilidad y una aclaración global de fotos referenciales. |
| Motion | Elevación de 3 px, zoom 1.025, entradas de 8 px con stagger de 55 ms, indicador de filtros y feedback de presión. Cada componente limpia su GSAP, listeners y observers. Movimiento reducido respetado desde el inicio y al cambiar la preferencia. |
| Errores | Vista para modelo/ruta inexistente, estado de búsqueda sin resultados y fallback cuando una foto falla. El nombre, precio y consulta siguen disponibles aunque no se cargue la imagen. |

## WhatsApp: procedencia y uso

Se integró la geometría reconocible de WhatsApp desde el [SVG de Simple Icons](https://github.com/simple-icons/simple-icons/blob/develop/icons/whatsapp.svg), biblioteca compatible publicada bajo [CC0](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md). El [recurso de marca de Meta](https://about.meta.com/brand/resources/whatsapp/whatsapp-brand/) solicitó inicio de sesión, por lo que se utilizó la biblioteca compatible permitida en el encargo.

El archivo descargado se conserva en `public/assets/icons/whatsapp.svg`; `WhatsAppLogo.vue` reproduce el mismo path, sin deformación, con viewBox 24 × 24 y relleno monocromo. La prueba de catálogo compara el path del recurso con el que se renderiza. Se usa en consulta de producto, navegación y asesores. No se sustituyó por un teléfono, emoji o burbuja genérica y no se añadieron botones flotantes duplicados.

Los números `51977591210` y `51949092211`, y el módulo de mensajes `application/whatsapp.ts`, permanecen idénticos. Los enlaces externos conservan `noopener noreferrer` y etiquetas accesibles. No se añadió ninguna dependencia.

## Referencias revisadas

Se accedió al contenido y a la estructura de navegación de las tres referencias obligatorias:

- [iShop Perú](https://pe.tiendasishop.com/): navegación por familias, búsqueda visible y separación entre explorar un modelo y consultar sus detalles.
- [Mac Center Perú](https://mac-center.com.pe/): organización por categorías y acceso comercial a asesoría.
- [Apple Compare](https://www.apple.com/iphone/compare/): selección de modelos e información técnica organizada para su lectura.

De esa revisión se adoptó una jerarquía de exploración y detalle adecuada a siete modelos. No se copiaron sus diseños, textos, fotografías, precios, promociones ni catálogo. No hubo navegador integrado disponible para inspección visual interactiva de los sitios externos. La revisión visual se realizó sobre el proyecto local con capturas de su infraestructura de pruebas Chrome/CDP.

## Arquitectura

- `app/components/StorefrontNavigation.vue`: navegación y seguimiento de sección. Usa el BrandMark existente.
- `app/views/StorefrontView.vue`: compone los slots de marca, navegación y catálogo.
- `app/views/ProductRouteView.vue`: marco de navegación y vista de detalle, con carga diferida.
- `app/router.ts`: rutas, anclas, compensación de encabezado, foco y restauración de scroll.
- `catalog/application/useCatalog.ts`: estado Pinia con la API de presentación anterior.
- `catalog/application/catalog.queries.ts`: consulta de producto y créditos a partir de los datos centralizados.
- `catalog/presentation`: catálogo, detalle, tarjetas, fotografía con fallback y footer comercial compartido.
- `shared/presentation`: botones e iconografía reutilizables; el SVG de marca usa relleno y los iconos de interfaz conservan su trazo.

`infrastructure/selc-catalog.ts` y `application/whatsapp.ts` mantienen sus hashes originales. También se conservan los hashes del PNG de marca, GLB, ChromeSymbol.vue y CSS original de marca. La prueba de microinteracciones restaura en memoria únicamente el wrapper del slot de navegación y compara el resto de BrandScene.vue con la versión anterior.

## Comprobaciones

```sh
npm run typecheck
npm run lint
npm run build
npm test
npm run test:browser
npm run test:catalog
npm run test:microinteractions
```

`test:browser` conserva la prueba de regresión del hero: sus seis fases, 52 mallas, encuadre responsive, salto de introducción, movimiento reducido, fallo de WebGL y liberación de recursos.

`test:catalog` comprueba precios/capacidades de los siete modelos, búsqueda combinada, filtros, orden, rutas de detalle directas, ambas variantes del 14 Pro, estado Pinia, Atrás, foco, anclas, icono auténtico, fotografías, fallback, condiciones, contactos y enlaces seguros. Se verifica el catálogo de 280 a 1920 px y los detalles a 280, 320, 390, 768 y 1024 px, sin desbordamientos. No envía mensajes.

`test:microinteractions` verifica teclado, indicador, conservación de nodos y animaciones, hover/active/disabled, limpieza de búsqueda, filtrado rápido, movimiento reducido y desmontaje sin ScrollTriggers pendientes. Los informes y PNG se guardan en `.qa/`, ignorado por Git.

## Límites

- No hay inventario, colores disponibles ni precios en tiempo real. Se muestran los valores del documento de octubre de 2026 para confirmar con un asesor.
- Hay una fotografía autorizada por modelo en el catálogo suministrado; se conserva esa imagen, sin inventar una galería ni generar nuevas vistas.
- La inspección visual externa estuvo limitada como se indica arriba; la QA local sí incluye escritorio, tablet y móvil.
- El build conserva el aviso de tamaño del chunk WebGL existente, que se carga de forma asíncrona.
- En un hosting estático debe mantenerse el fallback SPA a `index.html` para abrir directamente `/iphone/...`. Vite lo soporta en la vista local.
