import '../dist/build.esm.js';

/**
 * Setup controls
 */
function setupControls() {
  const openButton = document.querySelector('#openButton');
  const closeButton = document.querySelector('#closeButton');
  const pauseButton = document.querySelector('#pauseButton');
  const playButton = document.querySelector('#playButton');
  const captureButton = document.querySelector('#captureButton');
  const captureContainer = document.querySelector('#captureContainer');
  const captureImg = document.querySelector('#captureImg');
  const closeCaptureButton = document.querySelector('#closeCaptureButton');
  const captureResolution = document.querySelector('#captureResolution');
  const cameraResolution = document.querySelector('#cameraResolution');
  const captureBytes = document.querySelector('#captureBytes');

  // Open camera
  openButton.addEventListener('click', async () => {
    const [ width, height ] = camera.guiState.resolution.split(',');
    await camera.open(camera.guiState.facing, width, height);
    openButton.classList.add('disabled');
    closeButton.classList.remove('disabled');
    pauseButton.classList.remove('disabled');
    captureButton.classList.remove('disabled');
  });

  // Close camera
  closeButton.addEventListener('click', () => {
    camera.close();
    openButton.classList.remove('disabled');
    closeButton.classList.add('disabled');
    pauseButton.classList.add('disabled');
    captureButton.classList.add('disabled');
  });

  // Pause camera
  pauseButton.addEventListener('click', () => {
    camera.pause();
    pauseButton.classList.add('disabled');
    playButton.classList.remove('disabled');
  });

  // Play camera
  playButton.addEventListener('click', () => {
    camera.play();
    pauseButton.classList.remove('disabled');
    playButton.classList.add('disabled');
  });

  // Take a photo
  captureButton.addEventListener('click', () => {
    // Get capture data URL.
    const option = {format: camera.guiState.format};// Capture options
    if (camera.guiState.resize) {
      option.width = camera.guiState.width;
      option.height = camera.guiState.height;
      option.fit = camera.guiState.fit;
    }
    const capture = camera.capture(option);

    // Byte size of capture
    const bytes = window.atob(capture.split(',')[1]).length;

    // Show results
    captureImg.setAttribute('src', capture);
    captureContainer.classList.remove('hide');
    captureImg.addEventListener('load', () => {
      cameraResolution.textContent = `${camera.resolution.width}x${camera.resolution.height}`;
      captureResolution.textContent = `${captureImg.naturalWidth}×${captureImg.naturalHeight}`;
      captureBytes.textContent = `${Math.floor((bytes / 1024) * 100) / 100} kB`;
    }, {once: true});
  });

  // Close captured image
  closeCaptureButton.addEventListener('click', event => {
    captureContainer.classList.add('hide');
  });
}

// Camera controller
setupControls();

// Camera element
const camera = document.querySelector('#camera');

// Camera event listener
camera
  .on('opened', event => {
    console.log('Opened the camera');
  })
  .on('played', event => {
    console.log('Camera resumed from pause');
  })
  .on('paused', event => {
    console.log('Camera paused');
  });
