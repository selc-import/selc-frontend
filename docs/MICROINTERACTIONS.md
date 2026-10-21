# Iconografía y microinteracciones

Refinamiento sobre la landing existente. El hero 3D, sus recursos, ChromeSymbol.vue, el CSS original de marca, los precios, las especificaciones y los mensajes comerciales se conservan. El rediseño posterior añade un slot de navegación a BrandScene.vue y traslada el estado de catálogo a Pinia; véase [CATALOG-REDESIGN.md](CATALOG-REDESIGN.md).

## Auditoría y cambios

| Área | Estado previo | Implementación |
| --- | --- | --- |
| Iconografía | Checks, flechas y batería como caracteres; SVG con distintos trazos | Ocho iconos Lucide con trazo 1.75, tamaños 16/18/20 px y `currentColor`; los iconos decorativos no se anuncian a lectores de pantalla. |
| Botones | Estilos y estados repartidos entre enlaces y botones | `AppButton` con variantes primary, secondary, ghost e icon; HTML nativo para cada acción, hover, focus-visible, active y disabled. Los enlaces deshabilitados no tienen destino ni activación. |
| Filtros | Radios con cambio inmediato de fondo | Botones con `aria-pressed`, grupo etiquetado e indicador GSAP absoluto. Tab, Enter y Espacio son nativos; flechas, Inicio y Fin permiten recorrer y seleccionar. |
| Tarjetas | Cada cambio de filtro reiniciaba todos los ScrollTriggers y la cabecera | Entrada individual en viewport, desplazamiento de 8 px, duración de 360 ms y stagger de 55 ms. Las tarjetas conservadas y la cabecera mantienen sus animaciones. Vue TransitionGroup mueve las tarjetas y desvanece las salientes. |
| Hover de tarjetas | Borde y zoom de imagen | Elevación de 3 px, cambio de superficie y zoom máximo 1.025, solo con ratón. Capas separadas para el movimiento de lista, la entrada GSAP y el hover CSS evitan conflictos de transformaciones. |
| Batería | Símbolo de texto pequeño | SVG BatteryFull verde en los beneficios globales. El rediseño retira los badges repetidos de cada tarjeta; conserva la afirmación documentada de batería superior al 95%. |
| Búsqueda | Sin acción explícita de limpieza | SVG consistente, anillo de foco en el grupo y botón de limpieza de 44 × 44 px cuando hay texto. Limpiar devuelve el foco al campo y conserva la generación seleccionada. |
| Ordenamiento | Chevron del sistema | Select nativo con chevron SVG alineado; rotación con `:open` únicamente cuando el navegador admite detectar ese estado. |
| Navegación y scroll | Header de marca y línea EXPLORAR originales | Marca y EXPLORAR conservados; header ampliado con navegación a secciones y WhatsApp auténtico. La línea original respeta movimiento reducido. |

## Organización y motion

`src/shared/presentation` contiene `AppIcon`, `AppButton`, el registro explícito de iconos y su CSS. `src/shared/motion/tokens.ts` centraliza tiempos, easing, distancias y escalas, y deriva las variables CSS del mismo objeto que utiliza GSAP.

`GenerationFilter` permanece en la presentación del contexto `catalog`. La capa de aplicación sigue controlando búsqueda, selección y orden sin cambios. Cada tarjeta posee su contexto GSAP y lo revierte al desmontar o cambiar la preferencia de movimiento. Los listeners de foco y ResizeObserver se limpian. Las actualizaciones de ScrollTrigger se agrupan por frame.

La interfaz mantiene estados de foco visibles, objetivos táctiles de al menos 44 px para las acciones y filtros, y selección anunciada. Las tarjetas salientes se vuelven inertes durante su breve transición; si vuelven a entrar se restaura su accesibilidad. La búsqueda y el orden se separan en dos filas en pantallas de hasta 360 px para que el campo siga siendo utilizable al mostrar el botón de limpieza.

`prefers-reduced-motion` desactiva entradas, stagger, movimiento del indicador, desplazamientos, zoom y transiciones de lista, tanto inicialmente como al cambiar la preferencia durante la sesión. Los estados de color y selección siguen dando feedback inmediato.

## Dependencias y referencias técnicas

Se añadió únicamente `@lucide/vue@1.61.0`, con licencia ISC, sin dependencias de ejecución adicionales y compatible con Vue >=3.0.1. Se comprobó la metadata del registro antes de instalar. `lucide-vue-next@1.0.0` está deprecado y remite al paquete utilizado. Los ocho imports explícitos permiten eliminar los iconos no utilizados del build. Véase la [documentación oficial de Lucide Vue](https://lucide.dev/guide/vue) y su [licencia](https://lucide.dev/license).

Se revisaron las tres referencias solicitadas:

- [lucide-motion-vue](https://github.com/respeak-io/lucide-motion-vue): consistencia de SVG y activación contextual. Su paquete requiere Motion y combina licencias; no se instalaron ni copiaron sus componentes.
- [motion-vue](https://github.com/motiondivision/motion-vue) y su [documentación de gestos](https://motion.dev/docs/vue-gestures): estados de hover, pulsación y foco, con atención a los dispositivos táctiles. Estos estados se resuelven aquí con CSS y elementos nativos.
- [gsap-skills para Vue](https://github.com/greensock/gsap-skills/blob/main/skills/gsap-frameworks/SKILL.md): creación después del montaje, selectores limitados al componente y limpieza con `gsap.context().revert()`.

## Validación y límites

```sh
npm run typecheck
npm run lint
npm run build
npm test
npm run test:browser
npm run test:catalog
npm run test:microinteractions
```

Las pruebas de navegador utilizan la infraestructura CDP del proyecto: Vite en 5173 y un Chrome aislado en 9333. No envían mensajes ni realizan compras. Los informes y capturas se guardan en `.qa/`.

`test:microinteractions` verifica teclado, alineación del indicador, conservación de tarjetas y cabecera, limpieza de búsqueda y foco, hover, escala active, enlaces deshabilitados, filtrado rápido, límites de ScrollTriggers y movimiento reducido. Compara hashes de los archivos originales de marca y de la lógica comercial. `test:catalog` conserva la regresión funcional y responsive; `test:browser` conserva la regresión completa del hero y su fallback WebGL.

No hay una operación asíncrona de compra dentro de la página: WhatsApp abre una conversación. Por ello no se añade un estado loading ficticio. En navegadores sin `select:open`, el chevron permanece estático y el select mantiene su comportamiento nativo. El build conserva el aviso de tamaño del chunk WebGL existente.
