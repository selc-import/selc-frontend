# Accesorios incluidos, productos individuales y promos

Se conserva el modelo `Product` del repositorio y sus capas, según la opción confirmada. El proyecto no tiene `ProductEntity`, `BaseEntity` ni `product.service.ts`; no se introduce una jerarquía de clases para productos. `Product` ahora es una unión discriminada por `category`, de modo que un accesorio no necesita especificaciones ficticias de iPhone.

Los tres conceptos tienen responsabilidades distintas:

- `includedAccessories?: string[]` describe la caja del iPhone. Los siete modelos contienen `Cubo`, `Cable`, `Case` y `Mica`; la lista no tiene precio ni acciones de compra.
- Los seis accesorios son productos de categoría `Accesorios`, con precio y stock propios. Se consultan individualmente por WhatsApp.
- `PromoEntity` representa un combo con cantidades y precio propios. Sus ítems no se convierten en productos del catálogo ni en contenido incluido con un iPhone.

## Datos comerciales

| Producto individual | Precio | Stock |
| --- | --- | --- |
| Case MagSafe (carga inalámbrica) | S/ 14.99 | disponible |
| Cubo de carga | S/ 35 | disponible |
| Cable C a C o C a Lightning | S/ 19.90 | disponible |
| Vidrio Mate Ceramic Shield | S/ 9.90 | disponible |
| AirPods 4ta Generación | S/ 179.90 | disponible |
| AirPods Pro 2da Generación | S/ 129.90 | disponible |

Precios de las ofertas nuevas, registrados en el orden del mensaje de SELC IMPORT. En la web, todas las promos se presentan de menor a mayor precio de venta:

| Oferta | Precio común | Precio de oferta |
| --- | --- | --- |
| 😏 PACK INFIEL | S/ 469.60 | S/ 249.99 |
| 🕵️ PACK DOBLE VIDA | S/ 139.78 | S/ 109.90 |
| 💘 PACK CRUSH | S/ 164.79 | S/ 124.99 |
| 🪫 PACK SALVAVIDAS | S/ 69.89 | S/ 54.90 |
| 🎓 PACK UNIVERSITARIO | S/ 64.80 | S/ 52.90 |
| 🎂 PACK CUMPLE | S/ 199.80 | S/ 119.99 |
| 🏭 PACK MAYORISTA | S/ 549 | S/ 320 |
| 💰REVENDEDOR AIRPODS | S/ 704.40 | S/ 369.99 |
| 💰SOLO CABLES 12 | S/ 238.80 | S/ 179.90 |
| 💰SOLO CUBOS 12 | S/ 420 | S/ 189.90 |
| 💰PACK 8 | S/ 219.60 | S/ 159.90 |
| ⚡SOLO CABLES 6 | S/ 119.40 | S/ 94.90 |
| ⚡ SOLO CUBOS 6 | S/ 210 | S/ 99.90 |

Las cantidades, textos y orden también se conservan en `promo.mock-data.ts`. Cada oferta muestra el precio común tachado, el nuevo precio en dorado y mayor tamaño, el emoji 🔥, una etiqueta de porcentaje y el ahorro en soles. Por ejemplo, PACK INFIEL ahorra S/ 219.61. Los porcentajes se redondean hacia abajo y el ahorro se calcula en céntimos para evitar errores de coma flotante.

Las dos promos anteriores se integran en la misma grilla según su precio de venta. No muestran precios tachados porque no se suministró un precio común para ellas:

| Promo | Contenido | Precio |
| --- | --- | --- |
| Combo Esencial | 2 cubos, 1 cable C a C o C a Lightning y 1 AirPods 4ta Generación | S/ 139.99 |
| Promo Emprendedora | 6 cubos y 6 cables C a C o C a Lightning | S/ 200 |

El resumen de la entidad usa multiplicadores y conjunciones, por ejemplo `6 × Cubo y 6 × Cable C a C o C a Lightning`, para conservar los nombres comerciales. La validación exige identificador, nombre, descripción, precio finito positivo y al menos un ítem con nombre y cantidad entera positiva. El precio común opcional debe ser finito y mayor que el precio de oferta a nivel de céntimos. Se copian y congelan los ítems al construir la entidad.

## Presentación y carga

La cabecera incluye iPhones, Accesorios, Cómo comprar y Contacto. Accesorios enlaza a `/#accesorios`, selecciona su categoría y limpia búsquedas previas, también desde el detalle de un iPhone. iPhones vuelve a la exploración y restablece Todos. El enlace directo a `/#accesorios` funciona al abrir o recargar la página.

El filtro se deriva de los productos cargados: Todos, iPhone 17, 16, 15, 14 y Accesorios. Todos muestra trece productos en dos grillas separadas: siete iPhones y seis accesorios. La sección Accesorios tiene título propio, trece ofertas nuevas, dos promos anteriores y su grilla individual; las promos quedan fuera del conteo, búsqueda y orden de productos. La selección se conserva al navegar entre catálogo y detalle.

Las quince promos se ordenan de menor a mayor por `priceSoles`, copiando los datos para conservar su orden original en infraestructura. PACK UNIVERSITARIO abre la grilla a S/ 52.90 y REVENDEDOR AIRPODS la cierra a S/ 369.99. La primera tarjeta tiene un acento dorado más fuerte y Promo Emprendedora conserva su estilo destacado. Cada mensaje de WhatsApp menciona la promo, su precio vigente y el contenido; los accesorios no heredan el mensaje de reserva de iPhone. No se añadieron carrito, checkout ni dependencias.

El servicio de promos es un mock temporal con 300 ms de latencia artificial. El store de aplicación comparte la solicitud entre montajes y permite reintentar si falla. La presentación contempla carga, error y éxito. Los accesorios utilizan monogramas con la paleta existente; no se inventaron fotografías.

## Changelog por archivo

| Archivo | Estado y cambio |
| --- | --- |
| `src/app/components/StorefrontNavigation.vue` | Modificado. Añade Accesorios junto a iPhones y enlaza a su sección propia con estado activo. Seleccionar cada entrada prepara el filtro correspondiente desde catálogo o detalle. |
| `src/app/storefront.css` | Modificado. Ajusta la cabecera para sus cuatro enlaces en escritorio y móvil. Evita desbordamientos en pantallas de 280 px y usa dos filas en tablet. |
| `src/catalog/domain/product.ts` | Modificado. Agrega categorías, el contenido descriptivo de caja y los campos propios de accesorios al mismo modelo Product. Adapta los filtros y el formato monetario conservando los precios de iPhone. |
| `src/catalog/infrastructure/selc-catalog.ts` | Modificado. Completa los accesorios incluidos de los siete iPhones y agrega seis productos individuales. Mantiene exactamente los precios, nombres y stock suministrados. |
| `src/catalog/domain/model/promo.entity.ts` | Creado. Define PromoEntity con validación, resumen y precio común opcional. Calcula ahorro en céntimos y porcentaje conservador, sin inventar comparaciones para promos anteriores. |
| `src/catalog/infrastructure/promo.mock-data.ts` | Creado. Contiene las trece ofertas nuevas en orden y las dos promos anteriores. Conserva emojis, cantidades, descripciones y ambos precios publicados. |
| `src/catalog/infrastructure/promo.service.ts` | Creado. Devuelve las promos como entidades validadas tras 300 ms de latencia simulada. Documenta su carácter temporal hasta disponer de backend. |
| `src/catalog/application/useCatalog.ts` | Modificado. Deriva las opciones del filtro y separa los resultados en iPhones y accesorios. Expone la selección de categoría para la cabecera y conserva variantes y estado compartido. |
| `src/catalog/application/usePromos.ts` | Creado. Mantiene la carga de promos en un store independiente y expone una copia ordenada por precio ascendente. Comparte solicitudes y expone carga, error y reintento. |
| `src/catalog/application/whatsapp.ts` | Modificado. Añade mensajes específicos para accesorios y promos con los asesores existentes. Las consultas de promo incluyen nombre con emoji, precio de oferta y contenido. |
| `src/catalog/presentation/components/GenerationFilter.vue` | Modificado. Recibe opciones dinámicas y mantiene teclado, foco e indicador animado. Permite varias filas con posición y altura correctas en móvil. |
| `src/catalog/presentation/components/ProductCard.vue` | Modificado. Precisa que la tarjeta de fotografía y capacidad recibe un iPhone. Mantiene su navegación, variantes y consulta existentes. |
| `src/catalog/presentation/components/ProductPhoto.vue` | Modificado. Precisa el tipo de producto que tiene fotografía de iPhone. Conserva encuadre, carga y fallback originales. |
| `src/catalog/presentation/components/AccessoryCard.vue` | Creado. Presenta nombre, descripción, monograma, disponibilidad y precio del accesorio. Incluye su enlace individual de consulta por WhatsApp. |
| `src/catalog/presentation/components/PromoCard.vue` | Creado. Presenta precio común tachado, precio de oferta destacado, ahorro, porcentaje y emojis de cada oferta. Conserva una consulta propia por WhatsApp y se adapta a móvil. |
| `src/catalog/presentation/components/PromoSection.vue` | Creado. Presenta las quince promos en una sola grilla, de menor a mayor precio de venta. Conserva estados de carga/error y reintento, emojis y estilos de oferta. |
| `src/catalog/presentation/views/ProductCatalog.vue` | Modificado. Separa la grilla de iPhones de una sección propia de Accesorios con título, productos y promos. Permite abrir esa sección desde la cabecera o mediante su enlace directo. |
| `src/catalog/presentation/views/ProductDetail.vue` | Modificado. Genera «Incluye en la caja» desde los datos del iPhone con un check por ítem. Mantiene especificaciones, variantes y beneficios documentados en sus secciones. |
| `src/catalog/presentation/catalog.css` | Modificado. Agrega estilos de accesorios, promos y contenido de caja dentro de la paleta existente. Adapta filtros y nuevas tarjetas a escritorio y móvil. |
| `src/catalog/presentation/composables/useCatalogMotion.ts` | Modificado. Espera a que finalice el desplazamiento antes de recalcular las animaciones por cambios de altura. Evita que la carga de promos interrumpa la navegación por anclas. |
| `scripts/check-catalog-browser.mjs` | Modificado. Amplía la regresión a trece productos y quince promos, validaciones, reintento y mensajes. Comprueba precios, tachado, ahorro, porcentajes, emojis, cantidades y orden ascendente desde 280 px. |
| `scripts/check-microinteractions-browser.mjs` | Modificado. Actualiza teclado, animaciones y limpieza de recursos para seis opciones y trece productos. Espera estados finales de animación y normaliza saltos de línea en hashes de fuente. |
| `docs/CATALOG.md` | Modificado. Actualiza la arquitectura, el recorrido y las comprobaciones del catálogo actual. Enlaza este registro de cambios y distingue las fuentes de datos. |
| `docs/ACCESSORIES-AND-PROMOS.md` | Creado. Documenta los tres conceptos, datos comerciales y comportamiento. Incluye el changelog completo por archivo. |

## Verificación

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:catalog
npm run test:microinteractions
```

Las seis comprobaciones anteriores se completaron correctamente. La regresión verifica el catálogo de 280 a 1920 px y las nuevas promos de 280 a 1440 px, sin desbordamientos ni errores de consola.

Las pruebas de navegador requieren Vite en el puerto 5173 y un Chrome aislado con CDP en el 9333. Los informes y capturas se guardan en `.qa/`; ninguna prueba envía mensajes de WhatsApp. El build conserva el aviso de tamaño del chunk WebGL existente.
