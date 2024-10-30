/**
 * Camera stream class.
 */
export default class {
  /**
   * Video element.
   * @type {HTMLVideoElement}
   */
  #video: HTMLVideoElement;

  /**
   * Initialize the camera stream.
   * @param  {HTMLVideoElement} video Video element.
   * @return {void}
   */
  constructor(video: HTMLVideoElement) {
    this.#video = video;
  }

  /**
   * Open camera stream.
   * @param {MediaStreamConstraints} constraints Camera constraints.
   * @return {Promise<MediaTrackSettings>} Camera device information.
   */
  async open(constraints: MediaStreamConstraints): Promise<MediaTrackSettings> {
    return new Promise<MediaTrackSettings>(async (resolve, reject) => {
      try {
        this.close();
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.#video.srcObject = stream;

        // Get camera device information.
        const track = stream.getVideoTracks()[0];
        this.#video.addEventListener('loadedmetadata', () => {
          resolve(track.getSettings());
        }, {once: true});
        this.#video.addEventListener('error', () => {
          reject(this.#video.error);
        }, {once: true});
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Closing the camera stream.
   * @return {void}
   */
  close(): void {
    (<MediaStream>this.#video.srcObject)?.getTracks().forEach(track => track.stop());
    this.#video.srcObject = null;
  }
}