import './styles/camera.css';
import Stream from '~/Stream';
import scissor from 'js-scissor';
import {setupGui, GuiState} from '~/setupGui';
import Constraints from '~/interfaces/Constraints';
import CaptureOptions from '~/interfaces/CaptureOptions';
import Handlebars from 'handlebars';

class Camera extends HTMLElement {
  public facing: 'front'|'back'|undefined = undefined;
  public guiState: GuiState|undefined = undefined;
  public state: 'open'|'loading'|'close' = 'close';
  public constraints: Constraints|undefined = undefined;
  private readonly video: HTMLVideoElement;
  private stream: Stream;

  /**
   * constructor
   */
  constructor() {
    super();
    this.video = document.createElement('video');
    this.stream = new Stream(this.video);
  }

  /**
   * Called every time the element is inserted into the DOM.
   * 
   * @return {void}
   */
  protected connectedCallback(): void {
    this.state = 'close';
    if (getComputedStyle(this).position === 'static')
      this.style.position = 'relative';
    this.classList.add('camera');
    this.video.classList.add('camera-video');
    this.video.setAttribute('playsinline', 'true');
    this.video.setAttribute('muted', 'true');
    this.appendChild(this.video);
    this.setControl();
    // this.setMenu();
    this.setGui();
    if (this.getAttribute('autoplay') !== null)
      this.open(this.getAttribute('facing') as 'front'|'back' || 'back');
  }

  /**
   * Define elements
   *
   * @return {Camera}
   */
  public static define(): any {
    if (window.customElements.get('js-camera'))
      return this;
    window.customElements.define('js-camera', this);
    return this;
  }

  /**
   * Generate elements
   *
   * @return {Camera}
   */
  public static createElement(): any {
    this.define();
    return new (window.customElements.get('js-camera'))()
  }

  /**
   * Add event listener
   * 
   * @param  {string}         type
   * @param  {() => void}     listener
   * @param  {{once: boolen}} options.once
   * @return {Camera}
   */
   public on(type: string, listener: (evt?: Event) => void, options: {once: boolean } = {once: false}): Camera {
    this.addEventListener(type, listener, options);
    return this;
  }

  /**
   * Remove event listener
   * 
   * @param  {string}     type
   * @param  {() => void} listener
   * @return {Camera}
   */
   public off(type: string, listener: (evt?: Event) => void): Camera {
    this.removeEventListener(type, listener);
    return this;
  }

  /**
   * Call event listener
   * 
   * @param  {string} type
   * @param  {Object} detail
   * @return {void}
   */
  private invoke(type: string, detail: {} = {}): void {
    const evt = new CustomEvent(type, {detail});
    this.dispatchEvent(evt);
  }

  /**
   * Open camera
   * 
   * @param  {'front'|'back'} facing|back
   * @param  {number} width
   * @param  {number} height
   * @return {Promise<void>}
   */
  public async open(facing: 'front'|'back' = 'back', width?: number, height?: number): Promise<void> {
    this.state = 'loading';
    const permission = await this.permission();
    if (permission === 'denied')
      await this.revokePermission();
    if (facing === 'front') {
      this.video.style.transform = 'scaleX(-1)';
      this.video.style.filter = 'FlipH';
    } else {
      this.video.style.transform = 'scaleX(1)';
      this.video.style.filter = '';
    }
    let constraints: Constraints = {
      video: {
        facingMode: facing === 'front' ? 'user' : 'environment'
      },
      audio: false
    };
    const attrWidth = this.getAttribute('width') as string;
    const attrHeight = this.getAttribute('height') as string;
    if (width !== undefined || height !== undefined) {
      if (width)
        constraints.video.width = {ideal: width};
      if (height) 
        constraints.video.height = {ideal: height}
    } else if (attrWidth || attrHeight) {
      if (attrWidth)
        constraints.video.width = {ideal: parseFloat(attrWidth)};
      if (attrHeight)
        constraints.video.height = {ideal: parseFloat(attrHeight)}
    }
    await this.stream.open(constraints);
    this.facing = facing;
    this.state = 'open';
    this.constraints = constraints;
    this.invoke('opened');
    this.video.play();
  }

  /**
   * Wait for camera to open
   * 
   * @return {Promise<void>}
   */
  public async waitOpen(): Promise<void> {
    return new Promise(resolve => {
      if (this.state !== 'loading')
        return void resolve();
      this.on('opened', resolve as () => void, {once: true});
    });
  }

  /**
   * Close camera
   * 
   * @return {void}
   */
  public close(): void {
    this.stream.close();
    this.facing = undefined;
    this.state = 'close';
    this.constraints = undefined;
  }

  /**
   * Play camera
   * 
   * @return {void}
   */
  public play(): void {
    this.video.play();
    this.invoke('played');
  }

  /**
   * Pause camera
   * 
   * @return {void}
   */
  public pause(): void {
    this.video.pause();
    this.invoke('paused');
  }

  /**
   * Is the camera open?
   * 
   * @return {boolean}
   */
  public get opened(): boolean {
    return this.tracks.length > 0;
  }

  /**
   * Is the camera paused?
   * 
   * @return {boolean}
   */
  public get paused(): boolean {
    return this.video.paused;
  }

  // /**
  //  * Get current camera constraints
  //  * 
  //  * @return {MediaTrackConstraints|undefined}
  //  */
  // public get constraints(): MediaTrackConstraints|undefined {
  //   if (!this.tracks.length)
  //     return undefined;
  //   return this.tracks[0].getConstraints();
  // }

  /**
   * Return video size
   *
   * @return {{width:number,height:number}}
   */
  public get resolution(): {width: number, height: number} {
    return {width: this.video.videoWidth, height: this.video.videoHeight};
  }

  /**
   * Returns the Data URL of the captured image.
   * 
   * @param  {CaptureOptions} options
   * @return {string}         Data URL of the captured image.
   */
  public capture(options?: CaptureOptions): string {
    // Initialize options
    options = Object.assign({fit: 'fill', format: 'image/png'}, options || {});

    // Video viewable area
    const rect = this.getRect();

    // Generate capture
    let captured: HTMLCanvasElement = document.createElement('canvas');
    captured.setAttribute('width', rect.width.toString());
    captured.setAttribute('height', rect.height.toString());
    captured.getContext('2d')!.drawImage(this.video,
      rect.x, rect.y, rect.width, rect.height,
      0, 0, rect.width, rect.height);

    // Front camera flip capture
    if (this.facing === 'front')
      this.flip(captured);

    // If you have an extract option, crop the image according to the extract option.
    if (options.extract) {
      const cropped = document.createElement('canvas');
      const horRatio = rect.width / this.video.clientWidth;
      const vrtRatio = rect.height / this.video.clientHeight;
      cropped.setAttribute('width', (options.extract.width * horRatio).toString());
      cropped.setAttribute('height', (options.extract.height * vrtRatio).toString());
      cropped.getContext('2d')!.drawImage(captured,
        options.extract.x * horRatio, options.extract.y * vrtRatio, options.extract.width * horRatio, options.extract.height * vrtRatio,
        0, 0, options.extract.width * horRatio, options.extract.height * vrtRatio);
      captured = cropped;
    }

    // Resize and return if width and height options are available.
    if (options.width || options.height)
      captured = scissor(captured).resize(options.width, options.height, {fit: options.fit, format: options.format}).canvas;

    // Returns the captured image.
    return captured.toDataURL(options.format, 1.);
  }

  /**
   * Returns the permission status of the requested feature, either granted, denied or - in case the user was not yet asked - prompt.
   * 
   * @return {Promise<string|undefined>} granted|denied|prompt|
   *                  - granted: caller will be able to successfuly access the feature without having the user agent asking the user’s permission.
   *                  - denied: caller will not be able to access the feature.
   *                  - prompt: user agent will be asking the user’s permission if the caller tries to access the feature. The user might grant, deny or dismiss the request.
   */
  public async permission(): Promise<string|undefined> {
    try {
      if (!navigator.permissions || !navigator.permissions.query)
        return undefined;
      const res = await navigator.permissions.query({name: 'camera'});
      return res.state;
    } catch {
      return undefined;
    }
  }

  /**
   * Revoke camera access settings
   * typescript doesn't support "navigator.permissions.revoke", so don't use it now
   * 
   * @return {Promise<void>}
   */
  public async revokePermission(): Promise<void> {
    if (!navigator.permissions || !('revoke' in navigator.permissions))
      return;
    // @ts-ignore
    await navigator.permissions.revoke({name: 'camera'});
  }

  /**
   * Get media tracks
   * 
   * @return {MediaStreamTrack[]}
   */
  private get tracks(): MediaStreamTrack[] {
    return this.video.srcObject ? (<MediaStream>this.video.srcObject).getTracks() : [];
  }

  /**
   * Set controller
   *
   * @return {void}
   */
  private setControl(): void {
    if (this.getAttribute('controls') === null)
      return;
    // Added camera play and pause controls
    this.insertAdjacentHTML('afterbegin', `
      <div action-tap-player class="camera-player">
        <button action-play-pause class="camera-play-pause-button" type="button" played="false"><i></i></button>
      </div>`);
    // Controlling camera play and pause
    const playPauseButton = this.querySelector('[action-play-pause]')!;
    playPauseButton.addEventListener('click', evt => {
      // event.stopPropagation();
      if (this.paused)
        this.play();
      else
        this.pause();
      // player.classList.remove('fadein');
    });
    // Control display of player menu
    const player = this.querySelector('[action-tap-player]')!;
    let hideTimer: ReturnType<typeof setTimeout>|undefined = undefined;
    player.addEventListener('click', evt => {
      if (hideTimer !== undefined)
        clearTimeout(hideTimer);
      playPauseButton.setAttribute('played', !this.paused ? 'true' : 'false');
      if (player.classList.contains('fadein'))
        return void player.classList.remove('fadein');
      player.classList.add('fadein');
      hideTimer = setTimeout(() => {
        hideTimer = undefined;
        player.classList.remove('fadein');
      }, 2000);
    });

    // Add a camera controller to this component
    this.insertAdjacentHTML('beforeend', `
      <div class="camera-controls">
        <div class="camera-controls-content">
          <a class="camera-captured"><img></a>
          <button action-capture class="camera-capture-button" type="button"></button>
          <button action-change-facing class="camera-switch-face-button" type="button"></button>
        </div>
      </div>`);

    // Get a capture of the current frame if the take a picture button is pressed
    this.querySelector('[action-capture]')!.addEventListener('click', () => {
      const base64 = this.capture();
      this.querySelector('.camera-captured img')!.setAttribute('src', base64);
      this.invoke('tookphoto', {base64});
    });

    // Switch camera face when facing button is pressed
    this.querySelector('[action-change-facing]')!.addEventListener('click', async () => {
      await this.open(this.facing === 'front' ? 'back' : 'front');
    });
  }

  /**
   * Set menu
   *
   * @return {void}
   */
  private setMenu(): void {
    if (this.getAttribute('menu') === null)
      return;
    const items = Array
      .from(this.querySelectorAll('camera-menu-item'))
      .map(item => ({content: item.innerHTML, url: item.getAttribute('href')}));
    const menu = this.querySelector('camera-menu');
    if (menu !== null)
      menu!.remove();
    this.insertAdjacentHTML('afterbegin', Handlebars.compile<any>(`
      <input type="checkbox" id="camera-nav-menustate">
      <nav class="camera-nav" class="touch" role="navigation" aria-label="Camera view navigation" dir="ltr">
        <div class="camera-nav-content">
          <ul class="camera-nav-header">
            <li class="camera-nav-item camera-nav-menuicon">
              <label class="camera-nav-menuicon-label" for="camera-nav-menustate" aria-hidden="true">
                <span class="camera-nav-menuicon-bread camera-nav-menuicon-bread-top">
                  <span class="camera-nav-menuicon-bread-crust camera-nav-menuicon-bread-crust-top"></span>
                </span>
                <span class="camera-nav-menuicon-bread camera-nav-menuicon-bread-bottom">
                  <span class="camera-nav-menuicon-bread-crust camera-nav-menuicon-bread-crust-bottom"></span>
                </span>
              </label>
            </li>
          </ul>
          {{#if items}}
            <ul class="camera-nav-list">
              {{#each items}}
                <li class="camera-nav-item camera-nav-item-menu">
                  <a class="camera-nav-link" href="{{url}}">{{content}}</a>
                </li>
              {{/each}}
            </ul>
          {{/if}}
        </div>
      </nav>`)({items}));
  }

  /**
   * Set GUI.
   *
   * @return {void}
   */
  private setGui(): void {
    if (this.getAttribute('dat-gui') === null)
      return;
    this.guiState = setupGui(this, async (prop: string, value: string|number|boolean): Promise<void> => {
      if (prop === 'resolution') {
        if (!this.opened)
          return;
        const [width, height] = (value as string).split(',');
        await this.open( this.guiState!.facing as 'front'|'back', parseInt(width, 10), parseInt(height, 10));
      } else if (prop === 'facing') {
        if (!this.opened)
          return;
        const [width, height] = this.guiState!.resolution.split(',');
        await this.open(value as 'front'|'back', parseInt(width, 10), parseInt(height, 10));
      }
    });
  }

  /**
   * Returns the display dimensions and position of the video element
   * 
   * @return {{x: number, y: number, width: number, height: number}} rect Display size and position of video element
   *                 x     : The horizontal position of the left-top point where the sourceFrame should be cut,
   *                 y     : The vertical position of the left-top point where the sourceFrame should be cut,
   *                 width : How much horizontal space of the sourceFrame should be cut,
   *                 height: How much vertical space of the sourceFrame should be cut,
   */
  private getRect(): {x: number, y: number, width: number, height: number} {
    const style = getComputedStyle(this.video);
    const fit = style.getPropertyValue('object-fit');
    const vidWidth = this.video.videoWidth;
    const vidHeight = this.video.videoHeight;
    const vidRatio = vidWidth / vidHeight;
    const cltWidth = this.video.clientWidth;
    const cltHeight = this.video.clientHeight;
    const cltRatio = cltWidth / cltHeight;
    const pos = style.getPropertyValue('object-position').split(' ');
    const horPos = parseInt(pos[0]) / 100;
    const vrtPos = parseInt(pos[1]) / 100;
    let width = 0;
    let height = 0;
    let x = 0;
    let y = 0;
    if (fit === 'none') {
      width = cltWidth;
      height = cltHeight;
      x = (vidWidth - cltWidth) * horPos;
      y = (vidHeight - cltHeight) * vrtPos;
    } else if (fit === 'contain' || fit === 'scale-down') {
      // TODO: handle the 'scale-down' appropriately, once its meaning will be clear
      width = vidWidth;
      height = vidHeight;
    } else if (fit === 'cover') {
      if (vidRatio > cltRatio) {
        width = vidHeight * cltRatio;
        height = vidHeight;
        x = (vidWidth - width) * horPos;
      } else {
        width = vidWidth;
        height = vidWidth / cltRatio;
        y = (vidHeight - height) * vrtPos;
      }
    } else if (fit === 'fill') {
      width = vidWidth;
      height = vidHeight;
    } else
      console.error(`Unexpected object-fit attribute with value ${fit} relative to`);
    return {x, y, width, height};
  }

  /**
   * Flip horizontally
   * 
   * @param {HTMLCanvasElement} canvas
   * @return {void}
   */
  private flip(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')!;
    const data = ctx.getImageData(0,0, canvas.width, canvas.height);
    // Traverse every row and flip the pixels
    for (let i=0; i<data.height; i++) {
     // We only need to do half of every row since we're flipping the halves
      for (let j=0; j<data.width/2; j++) {
        const index = (i * 4) * data.width + (j * 4);
        const mirrorIndex = ((i + 1) * 4) * data.width - ((j + 1) * 4);
        for (let k=0; k<4; k++) {
          let tmp = data.data[index + k];
          data.data[index + k] = data.data[mirrorIndex + k];
          data.data[mirrorIndex + k] = tmp;
        }
      }
    }
    ctx.putImageData(data, 0, 0, 0, 0, data.width, data.height);
  }
}

Camera.define();
export default Camera;