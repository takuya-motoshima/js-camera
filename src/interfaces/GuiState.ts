/**
 * dat.GUI state interface.
 */
export default interface GuiState {
  /**
   * Camera Resolution.
   * @type {string}
   */
  resolution: string,

  /**
   * Camera face.
   * @type {'back'|'front'}
   */
  facingMode: 'back'|'front',

  /**
   * MIME type of capture.
   * @type {string}
   */
  format: string,
  // format: 'image/webp'|'image/png'|'image/jpeg',

  /**
   * Capture resized or not.
   * @type {boolean}
   */
  resize: boolean,

  /**
   * Capture resize width.
   * @type {number}
   */
  width?: number,

  /**
   * Capture resize height.
   * @type {number}
   */
  height?: number,

  /**
   * Capture fit mode.
   * @type {'cover'|'contain'|'fill'}
   */
  fit?: 'cover'|'contain'|'fill',
}