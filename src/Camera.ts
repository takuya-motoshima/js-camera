// import Handlebars from 'handlebars';
import './styles/camera.css';
import Stream from '~/Stream';
import initDatGui from '~/initDatGui';
import Constraints from '~/interfaces/Constraints';
import CaptureOptions from '~/interfaces/CaptureOptions';
import GuiState from '~/interfaces/GuiState';

/**
 * Camera custom element.
 * @class Camera
 * @extends {HTMLElement}
 */
class Camera extends HTMLElement {
  /**
   * Camera state.
   * @type {'open'|'loading'|'close'}
   */
  #state: 'open'|'loading'|'close' = 'close';

  /**
   * Active camera face.
   * @type {'front'|'back'|undefined}
   */
  #facingMode: 'front'|'back'|undefined = undefined;

  /**
   * Video element.
   * @type {HTMLVideoElement}
   */
  #video: HTMLVideoElement;

  /**
   * Camera stream instance.
   * @type {Stream}
   */
  #stream: Stream;

  /**
   * Active camera device ID.
   * @type {string|undefined}
   */
  #deviceId: string|undefined;

  /**
   * dat.GUI state.
   * @type {GuiState|undefined}
   */
  #guiState: GuiState|undefined = undefined;

  /**
   * Flash effect element.
   * @type {HTMLDivElement}
   */
  #flash: HTMLDivElement;

  /**
   * Get Camera Status.
   * @return {'open'|'loading'|'close'} Camera Status.
   */
  get state(): 'open'|'loading'|'close' {
    return this.#state
  }

  /**
   * Get active camera face.
   * @return {'front'|'back'|undefined} Active Camera Face.
   */
  get facingMode(): 'front'|'back'|undefined {
    return this.#facingMode;
  }

  /**
   * Get active camera device ID.
   * @return {string|undefined} Active camera device ID.
   */
  get deviceId(): string|undefined {
    return this.#deviceId;
  }

  /**
   * Get camera open status.
   * @return {boolean} Camera open state.
   */
  get opened(): boolean {
    return !!this.getTrack();
  }

  /**
   * Get camera paused status.
   * @return {boolean} Camera paused state.
   */
  get paused(): boolean {
    return this.#video.paused;
  }

  /**
   * Get the actual dimensions of the video.
   * @return {{width:number,height:number}} Actual dimensions of the video.
   */
  get resolution(): {width: number, height: number} {
    return {
      width: this.#video.videoWidth,
      height: this.#video.videoHeight,
    };
  }

  /**
   * Get dat.GUI status.
   * @type {GuiState|undefined} dat.GUI status
   */
  get guiState(): GuiState|undefined {
    return this.#guiState;
  }

  /**
   * Initialize camera custom element.
   */
  constructor() {
    super();

    // Create a video element.
    this.#video = document.createElement('video');

    // Create stream instances.
    this.#stream = new Stream(this.#video);

    // Create flash effect element.
    this.#flash = document.createElement('div');
  }

  /**
   * Called each time an element is inserted into the DOM.
   * @return {void}
   */
  protected connectedCallback(): void {
    // Initialize camera status.
    this.#state = 'close';

    // Initialize this camera element.
    if (getComputedStyle(this).position === 'static')
      this.style.position = 'relative';
    this.classList.add('camera');

    // Initialize video element.
    this.#video.classList.add('camera-video');
    this.#video.setAttribute('playsinline', 'true');
    this.#video.setAttribute('muted', 'true');
    this.appendChild(this.#video);

    // Initialize camera controller.
    this.#initController();
    
    // // Initialize camera menu.
    // this.#initMenu();

    // Initialize dat.GUI.
    this.#initDatGui();

    // Initialize flash effect element.
    this.#flash.classList.add('camera-flash');
    this.appendChild(this.#flash);

    // For automatic playback, open camera immediately.
    if (this.getAttribute('autoplay') !== null)
      this.open({facingMode: this.getAttribute('facing') as 'front'|'back' || 'back'});
  }

  /**
   * Define camera custom element.
   * @return {Camera}
   */
  static define(): any {
    if (window.customElements.get('js-camera'))
      return this;
    window.customElements.define('js-camera', this);
    return this;
  }

  /**
   * Generate camera custom element.
   * @return {Camera}
   */
  static createElement(): any {
    this.define();
    return new (window.customElements.get('js-camera')!)()
  }

  /**
   * Open camera.
   * @param {'front'|'back'} options.facingMode Camera face. Default opens the front camera (front).
   * @param {number|undefined} options.width Camera resolution width. Default is none (undefined).
   * @param {number|undefined} options.height Camera resolution height. Default is none (undefined).
   * @param {string|undefined} options.deviceId Camera device ID to open; default is none (undefined); if a device ID is specified, the camera face option (facingMode) is ignored.
   * @return {Promise<MediaTrackSettings>} Camera device information.
   */
  async open(options: {facingMode: 'front'|'back', width?: number, height?: number, deviceId?: string}): Promise<MediaTrackSettings> {  
    // Initialize options.
    options = Object.assign({
      facingMode: 'front',
      width: undefined,
      height: undefined,
    }, options || {});

    // Update camera status.
    this.#state = 'loading';

    // Check camera permissions.
    const permission = await this.getPermission();
    if (permission === 'denied')
      await this.revokePermission();

    // For front-facing camera, flip display horizontally.
    if (options.facingMode === 'front') {
      this.#video.style.transform = 'scaleX(-1)';
      this.#video.style.filter = 'FlipH';
    } else {
      this.#video.style.transform = 'scaleX(1)';
      this.#video.style.filter = '';
    }

    // Determine the camera resolution.
    if (!options.width && this.getAttribute('width'))
      options.width = parseFloat(this.getAttribute('width') as string);
    if (!options.height && this.getAttribute('height'))
      options.height = parseFloat(this.getAttribute('height') as string);

    // Camera constraints.
    const constraints: Constraints = {
      video: {
        ...!options.deviceId
          ? {facingMode: options.facingMode === 'front' ? 'user' : 'environment'}
          : {deviceId: {exact: options.deviceId}},
        ...options.width ? {width: {ideal: options.width}} : null,
        ...options.height ? {height: {ideal: options.height}} : null,
      },
      audio: false
    };
    console.log('constraints=', constraints);

    // Open camera.
    const settings = await this.#stream.open(constraints);

    // Save camera device ID.
    this.#deviceId = settings.deviceId;

    // Save camera face.
    this.#facingMode = options.facingMode;

    // Update camera state.
    this.#state = 'open';

    // Invoke the opened event.
    this.#invoke('opened');
    this.#video.play();
    return settings;
  }

  /**
   * Wait for the camera to open.
   * @return {Promise<void>}
   */
  async waitOpen(): Promise<void> {
    return new Promise<void>(resolve => {
      if (this.#state !== 'loading')
        return void resolve();
      this.on('opened', resolve as () => void, {once: true});
    });
  }

  /**
   * Close camera.
   * @return {void}
   */
  close(): void {
    this.#stream.close();
    this.#facingMode = undefined;
    this.#state = 'close';
  }

  /**
   * Play camera.
   * @return {void}
   */
  play(): void {
    this.#video.play();
    this.#invoke('played');
  }

  /**
   * Pause camera.
   * @return {void}
   */
  pause(): void {
    this.#video.pause();
    this.#invoke('paused');
  }

  /**
   * Take a capture.
   * @param {CaptureOptions} options Capture Options.
   * @return {string} Data URL for the capture.
   */
  capture(options?: CaptureOptions): string {
    // Initialize options.
    options = Object.assign({
      width: undefined,
      height: undefined,
      extract: undefined,
      fit: 'fill',
      format: 'image/png'
    }, options || {});

    // Camera flash effect.
    this.#flashEffect();

    // Get camera viewport boundary.
    const boundary = this.#getCameraViewportBoundary();

    // Generates a canvas the same size as the camera's viewport.
    let canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.setAttribute('width', boundary.width.toString());
    canvas.setAttribute('height', boundary.height.toString());
    canvas.getContext('2d')!.drawImage(this.#video,
      boundary.x,
      boundary.y,
      boundary.width,
      boundary.height,
      0,
      0,
      boundary.width,
      boundary.height
    );
    if (this.#facingMode === 'front')
      // For the front camera, it is inverted.
      this.#flip(canvas);
    if (options.extract) {
      // If extraction options are available, crop the image according to the extraction options.
      const destinationCanvas = document.createElement('canvas');
      const horizontalRatio = canvas.width / this.#video.clientWidth;
      const verticalRatio = canvas.height / this.#video.clientHeight;
      destinationCanvas.setAttribute('width', (options.extract.width * horizontalRatio).toString());
      destinationCanvas.setAttribute('height', (options.extract.height * verticalRatio).toString());
      destinationCanvas.getContext('2d')!.drawImage(canvas,
        options.extract.x * horizontalRatio,
        options.extract.y * verticalRatio,
        options.extract.width * horizontalRatio,
        options.extract.height * verticalRatio,
        0,
        0,
        options.extract.width * horizontalRatio,
        options.extract.height * verticalRatio
      );
      canvas = destinationCanvas;
    }
    if (!options.width && !options.height)
      // If not resized.
      return canvas.toDataURL(options.format, 1.);

    // Resize with specified width and height.
    let width = options.width;
    let height = options.height;
    if (!width)
      width = canvas.width * height! / canvas.height;
    if (!height)
      height = canvas.height * width / canvas.width;
    const sourceRatio = canvas.height / canvas.width;
    const destinationRatio = height / width;
    let destinationX = 0;
    let destinationY = 0;
    let destinationWidth = width;
    let destinationHeight = height;
    if (options.fit === 'contain') {
      if (sourceRatio < destinationRatio) {
        destinationHeight = width * sourceRatio;
        destinationY = (height - destinationHeight) / 2;
      } else if (sourceRatio > destinationRatio) {
        destinationWidth = width * destinationRatio / sourceRatio;
        destinationX = (width - destinationWidth) / 2;
      }
    } else if (options.fit === 'cover') {
      if (sourceRatio > destinationRatio) {
        destinationHeight = width * sourceRatio;
        destinationY = (height - destinationHeight) / 2;
      } else if (sourceRatio < destinationRatio) {
        destinationWidth = width * destinationRatio / sourceRatio;
        destinationX = (width - destinationWidth) / 2;
      }
    }
    const destinationCanvas = document.createElement('canvas');
    destinationCanvas.setAttribute('width', width.toString());
    destinationCanvas.setAttribute('height', height.toString());
    const context = destinationCanvas.getContext('2d')!;
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);
    context.drawImage(canvas, destinationX, destinationY, destinationWidth, destinationHeight);
    return destinationCanvas.toDataURL(options.format, 1.);
  }

  /**
   * Get camera permissions.
   * @return {Promise<'granted'|'denied'|'prompt'|undefined>} Camera permission status.
   */
  async getPermission(): Promise<string|undefined> {
    try {
      if (!navigator.permissions || !navigator.permissions.query)
        return undefined;
      const permissionName = 'camera' as PermissionName;
      const permissionStatus = await navigator.permissions.query({name: permissionName});
      return permissionStatus.state;
    } catch {
      return undefined;
    }
  }

  /**
   * Revoke camera permissions.
   * @return {Promise<void>}
   */
  async revokePermission(): Promise<void> {
    if (!navigator.permissions || !('revoke' in navigator.permissions)) {
      console.warn('Permissions Revoke API is not supported.');
      return;
    }
    // NOTE: typescript doesn't support “navigator.permissions.revoke”, so don't use it now.
    // @ts-ignore
    await navigator.permissions.revoke({name: 'camera'});
  }

  /**
   * Get the camera's Media Stream Track.
   * @return {MediaStreamTrack|undefined} Media Stream Track.
   */
  getTrack(): MediaStreamTrack|undefined {
    if (!this.#video.srcObject)
      return undefined;
    return (<MediaStream>this.#video.srcObject).getVideoTracks()[0];
  }

  /**
   * Get available camera devices. 
   * Device information is obtained using MediaDevices.enumerateDevices API.
   * @return {Promise<Pick<MediaDeviceInfo, 'deviceId'|'label'>[]>} Available camera device information.
   */
  async getAvailableDevices(): Promise<Pick<MediaDeviceInfo, 'deviceId'|'label'>[]> {
    if (!navigator.mediaDevices?.enumerateDevices) {
      // MediaDevices.enumerateDevices is not supported.
      console.warn('MediaDevices.enumerateDevices is not supported by this browser.');
      return [];
    }

    // Camera device enumeration requires permission to access media devices. Access camera devices without enforcing camera face.
    await navigator.mediaDevices.getUserMedia({video: {facingMode: {ideal: 'user'}}, audio: false});

    // First enumerate all devices and then filter by camera devices only.
    return (await navigator.mediaDevices.enumerateDevices())
      .filter(device => {
        return device.kind === 'videoinput';
      })
      .map(({deviceId, label}) => ({deviceId, label}));
  }

  /**
   * Set event listeners.
   * @param {string} type Event type.
   * @param {(event?: Event) => void} listener Listener function.
   * @param {{once: boolen}} options.once A boolean value indicating that the listener should be invoked at most once after being added. If true, the listener would be automatically removed when invoked. If not specified, defaults to false.
   * @return {Camera} This camera element.
   */
  on(type: string, listener: (event?: Event) => void, options: {once: boolean } = {once: false}): Camera {
    this.addEventListener(type, listener, options);
    return this;
  }

  /**
   * Removed event listeners.
   * @param {string} type Event type.
   * @param {(event?: Event) => void} listener Listener function.
   * @return {Camera} This camera element.
   */
  off(type: string, listener: (event?: Event) => void): Camera {
    this.removeEventListener(type, listener);
    return this;
  }

  /**
   * Invoke an event.
   * @param {string} type Event type.
   * @param {Object} detail Event detail parameters.
   * @return {void}
   */
  #invoke(type: string, detail: {} = {}): void {
    const event = new CustomEvent(type, {detail});
    this.dispatchEvent(event);
  }

  /**
   * Initialize camera controller.
   * @return {void}
   */
  #initController(): void {
    if (this.getAttribute('controls') === null)
      return;

    // Add camera playback and pause controls.
    this.insertAdjacentHTML('afterbegin',
      `<div data-on-tap-player class="camera-player">
        <button data-on-play-pause class="camera-play-pause-button" type="button" played="false"><i></i></button>
      </div>`);

    // Camera playback and pause control.
    const playPauseButton = this.querySelector('[data-on-play-pause]')!;
    playPauseButton.addEventListener('click', event => {
      // event.stopPropagation();
      if (this.paused)
        this.play();
      else
        this.pause();
      // player.classList.remove('fadein');
    });

    // Controls the display of the player menu.
    const player = this.querySelector('[data-on-tap-player]')!;
    let hideTimer: ReturnType<typeof setTimeout>|undefined = undefined;
    player.addEventListener('click', event => {
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

    // Add a camera controller to this component.
    this.insertAdjacentHTML('beforeend',
      `<div class="camera-controls">
        <div class="camera-controls-content">
          <a class="camera-captured"><img></a>
          <button data-on-capture class="camera-capture-button" type="button"></button>
          <button data-on-change-facing class="camera-switch-face-button" type="button"></button>
        </div>
      </div>`);

    // When the capture button is pressed, a capture of the current frame is obtained.
    this.querySelector('[data-on-capture]')!.addEventListener('click', () => {
      const capture = this.capture();
      this.querySelector('.camera-captured img')!.setAttribute('src', capture);
      this.#invoke('captured', {capture});
    });

    // Switching Camera Faces.
    this.querySelector('[data-on-change-facing]')!.addEventListener('click', async () => {
      await this.open({facingMode: this.#facingMode === 'front' ? 'back' : 'front'});
    });
  }

  /**
   * Initialize dat.GUI.
   * @return {void}
   */
  #initDatGui(): void {
    if (this.getAttribute('dat-gui') === null)
      return;
    this.#guiState = initDatGui(this, async (prop: string, value: string|number|boolean): Promise<void> => {
      if (prop === 'resolution') {
        if (!this.opened)
          return;
        const [width, height] = (value as string).split(',');
        await this.open({
          facingMode: this.#guiState!.facingMode as 'front'|'back',
          width: parseInt(width, 10),
          height: parseInt(height, 10),
        });
      } else if (prop === 'facingMode') {
        if (!this.opened)
          return;
        const [width, height] = this.#guiState!.resolution.split(',');
        await this.open({
          facingMode: value as 'front'|'back',
          width: parseInt(width, 10),
          height: parseInt(height, 10),
        });
      }
    });
  }

  /**
   * Get camera viewport boundary.
   * @return {{x: number, y: number, width: number, height: number}} Camera viewport boundary.
   */
  #getCameraViewportBoundary(): {x: number, y: number, width: number, height: number} {
    const style = getComputedStyle(this.#video);
    const fitMode = style.getPropertyValue('object-fit');
    const videoRatio = this.#video.videoWidth / this.#video.videoHeight;
    const clientRatio = this.#video.clientWidth / this.#video.clientHeight;
    const position = style.getPropertyValue('object-position').split(' ');
    const positionX = parseInt(position[0]) / 100;
    const positionY = parseInt(position[1]) / 100;
    let width = 0;
    let height = 0;
    let x = 0;
    let y = 0;
    if (fitMode === 'none') {
      width = this.#video.clientWidth;
      height = this.#video.clientHeight;
      x = (this.#video.videoWidth - this.#video.clientWidth) * positionX;
      y = (this.#video.videoHeight - this.#video.clientHeight) * positionY;
    } else if (fitMode === 'contain' || fitMode === 'scale-down') {
      // TODO: handle the 'scale-down' appropriately, once its meaning will be clear.
      width = this.#video.videoWidth;
      height = this.#video.videoHeight;
    } else if (fitMode === 'cover') {
      if (videoRatio > clientRatio) {
        width = this.#video.videoHeight * clientRatio;
        height = this.#video.videoHeight;
        x = (this.#video.videoWidth - width) * positionX;
      } else {
        width = this.#video.videoWidth;
        height = this.#video.videoWidth / clientRatio;
        y = (this.#video.videoHeight - height) * positionY;
      }
    } else if (fitMode === 'fill') {
      width = this.#video.videoWidth;
      height = this.#video.videoHeight;
    } else
      console.error(`Unexpected object-fit attribute with value ${fitMode} relative to`);
    return {x, y, width, height};
  }

  /**
   * Flip the canvas horizontally.
   * @param {HTMLCanvasElement} canvas Canvas Element.
   * @return {void}
   */
  #flip(canvas: HTMLCanvasElement): void {
    const context = canvas.getContext('2d')!;
    const data = context.getImageData(0,0, canvas.width, canvas.height);
    // Traverse every row and flip the pixels.
    for (let i=0; i<data.height; i++) {
     // We only need to do half of every row since we're flipping the halves.
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
    context.putImageData(data, 0, 0, 0, 0, data.width, data.height);
  }

  /**
   * Camera flash effect.
   */
  #flashEffect() {
    this.#flash.style.display = 'block';
    this.#animateOpacity(this.#flash, 0.5)
      .then(() => this.#animateOpacity(this.#flash, 0))
      .then(() => {
        this.#flash.style.opacity = '1.0';
        this.#flash.style.display = "none"
      });
  }

  /**
   * Opacity animation.
   * @param {HTMLElement} element HTML Element.
   * @param {number} opacity The value of opacity to apply, which can be 0 to 1.
   * @param {number} duration The interval in milliseconds before the opacity is applied.
   * @return {Promise<void>}
   */
  async #animateOpacity(element: HTMLElement, opacity: number, duration: number = 150): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        element.style.opacity = opacity.toString();
        resolve();
      }, duration);
    });
  }

  // /**
  //  * Initialize camera menu.
  //  * @return {void}
  //  */
  // #initMenu(): void {
  //   if (this.getAttribute('menu') === null)
  //     return;
  //   const items = Array
  //     .from(this.querySelectorAll('camera-menu-item'))
  //     .map(item => ({content: item.innerHTML, url: item.getAttribute('href')}));
  //   const menu = this.querySelector('camera-menu');
  //   if (menu !== null)
  //     menu!.remove();
  //   this.insertAdjacentHTML('afterbegin', Handlebars.compile<any>(`
  //     <input type="checkbox" id="camera-nav-menustate">
  //     <nav class="camera-nav" class="touch" role="navigation" aria-label="Camera view navigation" dir="ltr">
  //       <div class="camera-nav-content">
  //         <ul class="camera-nav-header">
  //           <li class="camera-nav-item camera-nav-menuicon">
  //             <label class="camera-nav-menuicon-label" for="camera-nav-menustate" aria-hidden="true">
  //               <span class="camera-nav-menuicon-bread camera-nav-menuicon-bread-top">
  //                 <span class="camera-nav-menuicon-bread-crust camera-nav-menuicon-bread-crust-top"></span>
  //               </span>
  //               <span class="camera-nav-menuicon-bread camera-nav-menuicon-bread-bottom">
  //                 <span class="camera-nav-menuicon-bread-crust camera-nav-menuicon-bread-crust-bottom"></span>
  //               </span>
  //             </label>
  //           </li>
  //         </ul>
  //         {{#if items}}
  //           <ul class="camera-nav-list">
  //             {{#each items}}
  //               <li class="camera-nav-item camera-nav-item-menu">
  //                 <a class="camera-nav-link" href="{{url}}">{{content}}</a>
  //               </li>
  //             {{/each}}
  //           </ul>
  //         {{/if}}
  //       </div>
  //     </nav>`)({items}));
  // }
}

// Define camera custom element.
Camera.define();

// Export camera element.
export default Camera;