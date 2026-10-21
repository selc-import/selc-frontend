/** Hand-traced approximation of the supplied SELC silhouette, without the Apple mark.
 * Shared by the real 3D extrusion and the network-independent fallback.
 * Coordinates describe the artwork, not a font glyph.
 */
export const symbolViewBox = '0 0 404 424'

type OutlineCommand = ['M' | 'L', number, number] | ['C', number, number, number, number, number, number] | ['Z']

export const symbolOutline: readonly OutlineCommand[] = [
  ['M', 174, 20], ['L', 266, 20],
  ['C', 331, 20, 370, 55, 362, 112],
  ['L', 310, 77], ['C', 299, 69, 286, 66, 268, 66],
  ['L', 170, 66], ['C', 113, 66, 81, 91, 79, 130],
  ['C', 75, 175, 121, 208, 190, 230], ['L', 284, 257],
  ['C', 350, 276, 385, 305, 380, 347],
  ['C', 376, 384, 345, 403, 299, 403], ['L', 121, 403],
  ['C', 54, 403, 22, 360, 25, 300], ['L', 73, 337],
  ['C', 88, 350, 106, 354, 137, 354], ['L', 288, 354],
  ['C', 319, 354, 324, 338, 307, 326],
  ['C', 290, 314, 255, 307, 218, 297], ['L', 143, 276],
  ['C', 56, 250, 24, 212, 25, 154],
  ['C', 27, 78, 88, 20, 174, 20], ['Z'],
]

export const symbolPath = symbolOutline.map(command => command.join(' ')).join(' ')
