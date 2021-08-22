/**
 * Camera capture options.
 */
export default interface {
  /**
   * Resize width (px). The default is no resizing (undefined).
   * @type {number}
   */
  width?: number,

  /**
   * Resize height (px). The default is no resizing (undefined).
   * @type {number}
   */
  height?: number,

  /**
   * This is the position to crop. The default is no crop (undefined).
   * @type {{x: number, y: number, width: number, height: number}}
   */
  extract?: {x: number, y: number, width: number, height: number},

  /**
   * Fit mode.
   * @type {number}
   */
  fit?: 'cover'|'contain'|'fill',

  /**
   * MIME type of the captured image.
   * @type {number}
   */
  format?: 'image/webp'|'image/png'|'image/jpeg'
}