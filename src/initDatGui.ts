import * as dat from 'dat.gui';
import GuiState from '~/interfaces/GuiState';

const RESOLUTION_LIST = Object.freeze({
  'FHD 1920x1080': '1920,1080',
  'HD 1280x720': '1280,720',
  'VGA 640x480': '640,480',
  'HVGA 480x320': '480,320',
  'QVGA 320x240': '320,240'
});

const FACING_MODE_LIST = Object.freeze({
  'Back camera': 'back',
  'Front camera': 'front'
});

const FORMAT_LIST = [
  'image/webp',
  'image/png',
  'image/jpeg'
];

const FIT_MODE_LIST = Object.freeze({
  'Cover': 'cover',
  'Contain': 'contain',
  'Fill': 'fill'
});

/**
 * Initialize dat.GUI.
 * @param {HTMLElement} container
 */
export default (container: HTMLElement, callback: (prop: string, value: string|number|boolean) => void): GuiState => {
  // Applied dat.GUI status.
  const state = {
    resolution: '1920,1080',
    facingMode: 'back',
    format: 'image/png',
    resize: false,
    width: 400,
    height: 300,
    fit: 'cover'
  };

  // Create dat.GUI instance.
  const gui = new dat.GUI({autoPlace: false});

  // Set camera resolution options.
  const cameraFolder = gui.addFolder('Camera');
  cameraFolder
    .add(state, 'resolution', RESOLUTION_LIST)
    .name('Resolution')
    .onChange((value: any) => callback('resolution', value));

  // Set camera face options.
  cameraFolder.
    add(state, 'facingMode', FACING_MODE_LIST)
    .name('Facing')
    .onChange((value: any) => callback('facingMode', value));
  cameraFolder.open();

  // Set capture MIME type option.
  const captureFolder = gui.addFolder('Capture');
  captureFolder
    .add(state, 'format', FORMAT_LIST)
    .name('Format');

  // Set capture resize options.
  captureFolder
    .add(state, 'resize', false)
    .name('Resize')
    .onChange(async (value: any) => {
      const display = value ? 'list-item' : 'none';
      width.domElement.closest('li')!.style.display = display;
      height.domElement.closest('li')!.style.display = display;
      fit.domElement.closest('li')!.style.display = display;
    });
  const width = captureFolder.add(state, 'width', 0, 1920, 10).name('Width');
  const height = captureFolder.add(state, 'height', 0, 1080, 10).name('Height');
  const fit = captureFolder.add(state, 'fit', FIT_MODE_LIST).name('Fit Mode');

  // Capture resize option is closed at first.
  width.domElement.closest('li')!.style.display = 'none';
  height.domElement.closest('li')!.style.display = 'none';
  fit.domElement.closest('li')!.style.display = 'none';
  captureFolder.open();

  // Append dat.GUI to the screen.
  container.appendChild(gui.domElement);
  return state as GuiState;
}