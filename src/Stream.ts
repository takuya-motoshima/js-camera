export default class {
  private readonly video: HTMLVideoElement;

  /**
   * @param  {HTMLVideoElement} video
   * @return {void}
   */
  constructor(video: HTMLVideoElement) {
    this.video = video;
  }

  /**
   * Open stream
   * 
   * @param  {Object} constraints
   * @return {void}
   */
  public async open(constraints: Object): Promise<void> {
    await new Promise(async (resolve, reject) => {
      try {
        this.close();
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.video.srcObject = stream;
        this.video.addEventListener('loadedmetadata', () => resolve(), {once: true});
        this.video.addEventListener('error', () => reject(this.video.error), {once: true});
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Close stream
   * 
   * @return {void}
   */
  public close(): void {
    if (!this.video.srcObject) return;
    for (let track of (<MediaStream>this.video.srcObject).getTracks())
      track.stop();
    this.video.srcObject = null;
  }

}
