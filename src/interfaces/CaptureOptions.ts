/**
 * Capture Option Interface.
 */
export default interface CaptureOptions {
  /**
   * Resize width (px). No default (undefined).
   * @type {number}
   */
  width?: number,

  /**
   * Resize height (px). No default (undefined).
   * @type {number}
   */
  height?: number,

  /**
   * Position to crop. No default (undefined).
   * @type {{x: number, y: number, width: number, height: number}}
   */
  extract?: {x: number, y: number, width: number, height: number},

  /**
   * Resize Fit Mode. Default is 'fill'.
   * @type {'cover'|'contain'|'fill'}
   */
  fit?: 'cover'|'contain'|'fill',

  /**
   * MIME Type. Default is 'image/png'.
   * @type {string}
   */
  format?: string,
  // format?: 'image/webp'|'image/png'|'image/jpeg'
}