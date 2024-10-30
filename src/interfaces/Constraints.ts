/**
 * Interface of constraints when opening the camera.
 */
export default interface Constraints {
 /**
  * Camera face, actual size.
  * @type {{facingMode: 'user'|'environment', width?: number|{ideal: number}, height?: number|{ideal: number}}}
  */
  video: {
    facingMode?: 'user'|'environment',
    width?: number|{ideal: number},
    height?: number|{ideal: number},
    deviceId?: string|{exact: string},
  },

 /**
  * Sound. Default is disabled (false).
  * @type {{facingMode: 'user'|'environment', width?: number|{ideal: number}, height?: number|{ideal: number}}}
  */
  audio: boolean,
}