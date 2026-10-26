# Catálogo integrado

El hero existente sigue siendo la primera sección. `StorefrontView.vue`, en el contexto de composición `app`, conecta `BrandScene` con `ProductCatalog` mediante el slot `continuation` y amplía el header con el slot `navigation`. Sus enlaces a `#continuar`, timeline, ScrollTrigger, observers y fallback permanecen iguales. `ChromeSymbol.vue` y todos los recursos de marca se conservan intactos. El rediseño original está en [CATALOG-REDESIGN.md](CATALOG-REDESIGN.md); la ampliación actual y su changelog están en [ACCESSORIES-AND-PROMOS.md](ACCESSORIES-AND-PROMOS.md).

## Contexto `catalog`

- `domain/product.ts`: `Product` distingue iPhones y accesorios mediante `category`. Los iPhones conservan sus variantes y tienen contenido de caja opcional y descriptivo; los accesorios tienen precio y stock propios. El formato de soles conserva dos decimales cuando el importe tiene fracción.
- `domain/model/promo.entity.ts`: entidad independiente para combos, con validación de precio/cantidades, precio común opcional y resumen legible. Calcula ahorro en céntimos y porcentaje de descuento sin redondear al alza.
- `infrastructure/selc-catalog.ts`: siete iPhones con los datos del PDF suministrado, edición octubre de 2026, y seis accesorios con los precios y stock indicados por SELC IMPORT. Todos los iPhones incluyen cubo, cable, case y mica como información de su caja.
- `infrastructure/promo.mock-data.ts` y `promo.service.ts`: trece ofertas con emojis, orden y precios comunes/de oferta suministrados, seguidas de las dos promos anteriores. Servicio mock temporal con 300 ms de latencia simulada hasta disponer de backend.
- `application/useCatalog.ts`: búsqueda, categorías derivadas de los productos, orden por precio y selección de variante compartidos mediante Pinia entre catálogo y detalle. El orden por precio considera la variante seleccionada o el precio del accesorio.
- `application/usePromos.ts`: carga de promos independiente, compartida entre montajes, con estados de carga/error y reintento.
- `application/whatsapp.ts`: contactos del PDF y mensajes de consulta específicos para iPhones, accesorios y promos. La reserva de S/ 20 sigue siendo exclusiva del mensaje de iPhone. Abrir el enlace prepara el mensaje; el usuario lo envía en WhatsApp.
- `presentation`: tarjetas, catálogo, estilos limitados a sus propias clases y animaciones GSAP/ScrollTrigger. Los filtros usan botones con `aria-pressed` y navegación por teclado; las variantes de SIM conservan radios nativos. Los resultados se anuncian a lectores de pantalla. La preferencia de movimiento reducido elimina las animaciones también si cambia durante la sesión. Los contextos GSAP y listeners se limpian al actualizar o desmontar. Véase [MICROINTERACTIONS.md](MICROINTERACTIONS.md) para los componentes compartidos y los detalles de movimiento.

Las siete fotografías locales en `public/assets/catalog/` son los JPEG extraídos del PDF, sin modificar los archivos. Sus créditos y enlaces de origen se conservan en el pie del catálogo. El encuadre se aplica solo con CSS. Los accesorios usan monogramas porque no se suministraron fotografías. Los precios y especificaciones de iPhone reproducen el documento y se actualizan en `selc-catalog.ts`. El iPhone 14 Pro permite elegir eSIM (S/ 2,200) o chip físico (S/ 2,250).

La cabecera ofrece iPhones, Accesorios, Cómo comprar y Contacto. Accesorios abre `/#accesorios`, limpia búsquedas previas y selecciona su categoría, también desde un detalle de iPhone. El enlace directo funciona al abrir o recargar la página; el menú conserva sus cuatro entradas en móvil.

«Todos» muestra los trece productos en grillas separadas para iPhones y accesorios; cada generación muestra solo sus iPhones. Accesorios tiene una sección propia con título, seis productos individuales y un bloque independiente de promos. Las quince promos se presentan en una sola grilla de menor a mayor precio de venta. Las trece ofertas conservan sus emojis y muestran precio común tachado, precio de oferta dorado, ahorro en soles, porcentaje y 🔥; las dos promos anteriores se intercalan por precio, sin inventarles precios comunes. Las promos no forman parte del conteo, búsqueda ni orden de productos individuales. En cada detalle de iPhone, «Incluye en la caja» se genera a partir de `includedAccessories`, con checks y sin botones de compra para esos ítems.

## Validación

Con Vite en `http://localhost:5173/` y el Chrome aislado de pruebas del proyecto en el puerto 9333:

```sh
npm run build
npm test
npm run test:browser
npm run test:catalog
npm run test:microinteractions
```

`test:browser` conserva la regresión completa del hero. `test:catalog` comprueba los siete iPhones y su caja, los seis accesorios, las quince promos, validación de dominio, latencia, carga/error/reintento, filtros, búsqueda, orden, variantes, mensajes de WhatsApp, fotos, contactos y tamaños de 280 a 1920 píxeles. Verifica los trece pares de precios, tachado, ahorro, porcentaje, cantidades, emojis y orden ascendente de venta. No envía mensajes. También verifica movimiento reducido y hashes de los recursos originales de marca; normaliza solo los saltos de línea de archivos fuente en Windows. `test:microinteractions` comprueba teclado e indicador para las seis opciones, animaciones, filtros rápidos y limpieza de recursos con trece tarjetas.

Los informes y capturas se guardan en `.qa/`, ignorado por Git. El build conserva el aviso de tamaño del chunk WebGL existente, que sigue cargándose de forma asíncrona.
