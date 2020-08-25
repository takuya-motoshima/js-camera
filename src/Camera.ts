import './styles/camera.css';
import Stream from '~/Stream';
import { Graphics, Template } from 'js-shared';
import scissor from 'js-scissor';
import { setupGui, GuiState } from '~/setupGui';
import Constraints from '~/Constraints';

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
    if (this.style.position === 'static') this.style.position = 'relative';
    this.classList.add('camera');
    this.video.classList.add('camera-video');
    this.video.setAttribute('playsinline', 'true');
    this.video.setAttribute('muted', 'true');
    this.appendChild(this.video);
    this.addCameraControl();
    // this.addCameraMenu();
    this.addGui();
    if (this.getAttribute('autoplay') !== null)
      this.open(this.getAttribute('facing') as 'front'|'back' || 'back');
  }

  /**
   * Define elements
   *
   * @return {this}
   */
  public static define(): any {
    if (window.customElements.get('js-camera')) return this;
    window.customElements.define('js-camera', this);
    return this;
  }

  /**
   * Generate elements
   *
   * @return {this}
   */
  public static createElement(): any {
    this.define();
    return new (window.customElements.get('js-camera'))()
  }

  /**
   * Add event listener
   * 
   * @param  {string}           type
   * @param  {() => void}       listener
   * @param  {{ once: boolen }} options.once
   * @return {this}
   */
   public on(
     type: string,
     listener: (event?: Event) => void,
     option: { once: boolean } = { once: false }
   ): Camera {
    this.addEventListener(type, listener, option);
    return this;
  }

  /**
   * Remove event listener
   * 
   * @param  {string}     type
   * @param  {() => void} listener
   * @return {this}
   */
   public off(
     type: string,
     listener: (event?: Event) => void
   ): Camera {
    this.removeEventListener(type, listener);
    return this;
  }

  /**
   * Call event listener
   * 
   * @param  {string} type
   * @param  {Object}     detail
   * @return {void}
   */
  private invoke(type: string, detail: {} = {}): void {
    const event = new CustomEvent(type, { detail });
    this.dispatchEvent(event);
  }

  /**
   * Open camera
   * 
   * @param  {'front'|'back'} facing|back
   * @param  {number} width
   * @param  {number} height
   * @return {Promise<void>}
   */
  public async open(
    facing: 'front'|'back' = 'back',
    width?: number,
    height?: number
  ): Promise<void> {
    this.state = 'loading';
    const permission = await this.permission();
    if (permission === 'denied') await this.revokePermission();
    if (facing === 'front') {
      this.video.style.transform = 'scaleX(-1)';
      this.video.style.filter = 'FlipH';
    } else {
      this.video.style.transform = 'scaleX(1)';
      this.video.style.filter = '';
    }
    let constraints: Constraints = { video: { facingMode: facing === 'front' ? 'user' : 'environment' }, audio: false };
    if (width !== undefined || height !== undefined) {
      // @ts-ignore
      if (width) constraints.video.width = { ideal: width };
      // @ts-ignore
      if (height) constraints.video.height = { ideal: height }
    } else if (this.getAttribute('width') || this.getAttribute('height')) {
      // @ts-ignore
      if (this.getAttribute('width')) constraints.video.width = { ideal: this.getAttribute('width') };
      // @ts-ignore
      if (this.getAttribute('height')) constraints.video.height = { ideal: this.getAttribute('height') }
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
      if (this.state !== 'loading') return void resolve();
      this.on('opened', resolve as () => void, { once: true });
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
  //   if (!this.tracks.length) return undefined;
  //   return this.tracks[0].getConstraints();
  // }

  /**
   * Return video size
   *
   * @return {{width:number,height:number}}
   * [getVideoSize description]
   */
  public get resolution(): { width: number, height: number } {
    return Graphics.getMediaDimensions(this.video);
  }

  /**
   * Capture a single frame
   * 
   * @param  {number} width
   * @param  {number} height
   * @param  {{ width?: number, height?: number, fit?: 'cover'|'contain'|'fill', format?: 'image/webp'|'image/png'|'image/jpeg' }} option
   * @return {string}
   */
  public capture(option?: {
    width?: number,
    height?: number,
    fit?: 'cover'|'contain'|'fill',
    format?: 'image/webp'|'image/png'|'image/jpeg'
  }): string {
    // Initialize options
    option = Object.assign({
      fit: 'fill',
      format: 'image/png'
    }, option||{});

    // Video viewable area
    const rect = Graphics.getRenderedRect(this.video);

    // Generate capture
    let canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.setAttribute('width', rect.width.toString());
    canvas.setAttribute('height', rect.height.toString());
    canvas.getContext('2d')!.drawImage(this.video,
      rect.x, rect.y, rect.width, rect.height,
      0, 0, rect.width, rect.height);

    // Front camera flip capture
    if (this.facing === 'front')
      Graphics.flipHorizontal(canvas);

    // Returns a capture of the area you are looking at if there are no width and height options
    if (!option.width && !option.height) return canvas.toDataURL(option.format, 1.);

    // Resize and return if width and height options are available
    return scissor(canvas)
      .resize(option.width, option.height, { fit: option.fit, format: option.format })
      .toBase64();
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
      if (!navigator.permissions || !navigator.permissions.query) return undefined;
      const res = await navigator.permissions.query({ name: 'camera' });
      return res.state;
    } catch {
      return undefined;
    }
  }

  /**
   * Revoke camera access settings
   * 
   * typescript doesn't support "navigator.permissions.revoke", so don't use it now
   * 
   * @return {Promise<void>}
   */
  public async revokePermission(): Promise<void> {
    // @ts-ignore
    if (!navigator.permissions || !navigator.permissions.revoke) return;
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
   * Add camera controller
   *
   * @return {void}
   */
  private addCameraControl(): void {
    if (this.getAttribute('controls') === null) return;
    // Added camera play and pause controls
    this.insertAdjacentHTML('afterbegin', `
      <div action-tap-player class="camera-player">
        <button action-play-pause class="camera-play-pause-button" type="button" played="false"><i></i></button>
      </div>`);
    // Controlling camera play and pause
    const playPauseButton = this.querySelector('[action-play-pause]')!;
    playPauseButton.addEventListener('click', event => {
      // event.stopPropagation();
      if (this.paused) this.play();
      else this.pause();
      // player.classList.remove('fadein');
    });
    // Control display of player menu
    const player = this.querySelector('[action-tap-player]')!;
    let hideTimer: ReturnType<typeof setTimeout>|undefined = undefined;
    player.addEventListener('click', event => {
      if (hideTimer !== undefined) clearTimeout(hideTimer);
      playPauseButton.setAttribute('played', !this.paused ? 'true' : 'false');
      if (player.classList.contains('fadein')) return void player.classList.remove('fadein');
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
      this.invoke('tookphoto', { base64 });
    });

    // Switch camera face when facing button is pressed
    this.querySelector('[action-change-facing]')!.addEventListener('click', async () => {
      await this.open(this.facing === 'front' ? 'back' : 'front');
    });
  }

  /**
   * Add camera menu
   *
   * @return {void}
   */
  private addCameraMenu(): void {
    if (this.getAttribute('menu') === null) return;
    const menu = Array.from(this.querySelectorAll('camera-menu-item')).map(menu => ({
      content: menu.innerHTML,
      url: menu.getAttribute('href')
    }));
    if (this.querySelector('camera-menu') !== null) this.querySelector('camera-menu')!.remove();
    this.insertAdjacentHTML('afterbegin', Template.compile(`
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
          {{#if menu}}
            <ul class="camera-nav-list">
              {{#each menu}}
                <li class="camera-nav-item camera-nav-item-menu">
                  <a class="camera-nav-link" href="{{url}}">{{content}}</a>
                </li>
              {{/each}}
            </ul>
          {{/if}}
        </div>
      </nav>`)({ menu }));
  }

  /**
   * Add GUI
   *
   * @return {void}
   */
  private addGui(): void {
    if (this.getAttribute('dat-gui') === null) return;
    this.guiState = setupGui(this, async (prop: string, value: string|number|boolean): Promise<void> => {
      if (prop === 'resolution') {
        if (!this.opened) return;
        const [ width, height ] = (value as string).split(',');
        await this.open( this.guiState!.facing as 'front'|'back', parseInt(width, 10), parseInt(height, 10));
      } else if (prop === 'facing') {
        if (!this.opened) return;
        const [ width, height ] = this.guiState!.resolution.split(',');
        await this.open(value as 'front'|'back', parseInt(width, 10), parseInt(height, 10));
      }
    });
  }
}

Camera.define();
export default Camera;