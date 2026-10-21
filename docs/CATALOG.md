# Catálogo integrado

El hero existente sigue siendo la primera sección. `StorefrontView.vue`, en el contexto de composición `app`, conecta `BrandScene` con `ProductCatalog` mediante el slot `continuation` y amplía el header con el slot `navigation`. Sus enlaces a `#continuar`, timeline, ScrollTrigger, observers y fallback permanecen iguales. `ChromeSymbol.vue` y todos los recursos de marca se conservan intactos. El estado actual y su changelog están en [CATALOG-REDESIGN.md](CATALOG-REDESIGN.md).

## Contexto `catalog`

- `domain/product.ts`: modelos, variantes y formato de precios en soles.
- `infrastructure/selc-catalog.ts`: siete modelos, capacidades, especificaciones, precios y créditos del PDF suministrado, edición octubre de 2026.
- `application/useCatalog.ts`: búsqueda, filtro por generación, orden por precio y selección de variante compartidos mediante Pinia entre catálogo y detalle. El orden por precio considera la variante seleccionada.
- `application/whatsapp.ts`: contactos del PDF y mensajes de consulta con modelo, capacidad, variante y precio. Abrir el enlace prepara el mensaje; el usuario lo envía en WhatsApp.
- `presentation`: tarjetas, catálogo, estilos limitados a sus propias clases y animaciones GSAP/ScrollTrigger. Los filtros usan botones con `aria-pressed` y navegación por teclado; las variantes de SIM conservan radios nativos. Los resultados se anuncian a lectores de pantalla. La preferencia de movimiento reducido elimina las animaciones también si cambia durante la sesión. Los contextos GSAP y listeners se limpian al actualizar o desmontar. Véase [MICROINTERACTIONS.md](MICROINTERACTIONS.md) para los componentes compartidos y los detalles de movimiento.

Las siete fotografías locales en `public/assets/catalog/` son los JPEG extraídos del PDF, sin modificar los archivos. Sus créditos y enlaces de origen se conservan en el pie del catálogo. El encuadre se aplica solo con CSS. Las fotos son referenciales; no se inventan colores, disponibilidad ni condiciones adicionales. Los precios y especificaciones reproducen el documento y se actualizan en `selc-catalog.ts`. El iPhone 14 Pro permite elegir eSIM (S/ 2,200) o chip físico (S/ 2,250).

## Validación

Con Vite en `http://localhost:5173/` y el Chrome aislado de pruebas del proyecto en el puerto 9333:

```sh
npm run build
npm test
npm run test:browser
npm run test:catalog
```

`test:browser` conserva la regresión completa del hero. `test:catalog` comprueba la navegación por EXPLORAR y hashes, precios del PDF, combinaciones de filtros y búsqueda, estados vacíos, orden, variantes, mensajes de WhatsApp, fotos, contactos y tamaños de 280 a 1920 píxeles. No envía mensajes. También verifica el movimiento reducido y los hashes de los recursos originales de marca y de `ChromeSymbol.vue`.

Los informes y capturas se guardan en `.qa/`, ignorado por Git. El build conserva el aviso de tamaño del chunk WebGL existente, que sigue cargándose de forma asíncrona.
