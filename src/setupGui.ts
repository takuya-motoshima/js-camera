import * as dat from 'dat.gui';

// Camera resolution options
const RESOLUTION_LIST = Object.freeze({
  'FHD 1920x1080': '1920,1080',
  'HD 1280x720': '1280,720',
  'VGA 640x480': '640,480',
  'HVGA 480x320': '480,320',
  'QVGA 320x240': '320,240'
});

// Facing mode option
const FACING_MODE_LIST = Object.freeze({
  'Back camera': 'back',
  'Front camera': 'front'
});

// Capture format options
const FORMAT_LIST = [
  'image/webp',
  'image/png',
  'image/jpeg'
];

// Capture fit mode options
const FIT_MODE_LIST = Object.freeze({
  'Cover': 'cover',
  'Contain': 'contain',
  'Fill': 'fill'
});

/**
 * GUI state interface
 */
export interface GuiState {
  resolution: string,
  facing: 'back'|'front',
  format: 'image/webp'|'image/png'|'image/jpeg',
  resize: boolean,
  width?: number,
  height?: number,
  fit?: 'cover'|'contain'|'fill'
}

/**
 * Setup GUI state
 * 
 * @param {HTMLElement} container
 */
export function setupGui(container: HTMLElement, callback: (prop: string, value: string|number|boolean) => void): GuiState {
  // GUI state
  const state = {
    resolution: '1920,1080',
    facing: 'back',
    format: 'image/png',
    resize: false,
    width: 400,
    height: 300,
    fit: 'cover'
  };

  // GUI object
  const gui = new dat.GUI({ autoPlace: false });

  // Camera resolution
  const fldCamera = gui.addFolder('Camera');
  fldCamera.add(state, 'resolution', RESOLUTION_LIST).name('Resolution').onChange(value => callback('resolution', value));

  // Camera facing mode
  fldCamera.add(state, 'facing', FACING_MODE_LIST).name('Facing').onChange(value => callback('facing', value));
  fldCamera.open();

  // Capture format
  const fldCapture = gui.addFolder('Capture');
  fldCapture.add(state, 'format', FORMAT_LIST).name('Format');

  // Resize capture
  fldCapture.add(state, 'resize', false).name('Resize').onChange(async value => {
    const display = value ? 'list-item' : 'none';
    ctlWidth.domElement.closest('li')!.style.display = display;
    ctlHeight.domElement.closest('li')!.style.display = display;
    ctlFit.domElement.closest('li')!.style.display = display;
  });
  const ctlWidth = fldCapture.add(state, 'width', 0, 1920, 10).name('Width');
  const ctlHeight = fldCapture.add(state, 'height', 0, 1080, 10).name('Height');
  const ctlFit = fldCapture.add(state, 'fit', FIT_MODE_LIST).name('Fit Mode');

  // Resize is hidden by default
  ctlWidth.domElement.closest('li')!.style.display = 'none';
  ctlHeight.domElement.closest('li')!.style.display = 'none';
  ctlFit.domElement.closest('li')!.style.display = 'none';
  fldCapture.open();

  // Add GUI
  container.appendChild(gui.domElement);
  return state as GuiState;
}