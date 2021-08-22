import '../dist/build.esm.js';

/**
 * Setup controls
 */
function setupControls() {
  const btnOpen = document.querySelector('#btnOpen');
  const btnClose = document.querySelector('#btnClose');
  const btnPause = document.querySelector('#btnPause');
  const btnPlay = document.querySelector('#btnPlay');
  const btnCapture = document.querySelector('#btnCapture');
  const captureContainer = document.querySelector('#captureContainer');
  const captureImg = document.querySelector('#captureImg');
  const btnCaptureClose = document.querySelector('#btnCaptureClose');
  const captureResolution = document.querySelector('#captureResolution');
  const cameraResolution = document.querySelector('#cameraResolution');
  const captureBytes = document.querySelector('#captureBytes');

  // Open camera
  btnOpen.addEventListener('click', async () => {
    const [ width, height ] = camera.guiState.resolution.split(',');
    await camera.open(camera.guiState.facing, width, height);
    btnOpen.classList.add('disabled');
    btnClose.classList.remove('disabled');
    btnPause.classList.remove('disabled');
    btnCapture.classList.remove('disabled');
  });

  // Close camera
  btnClose.addEventListener('click', () => {
    camera.close();
    btnOpen.classList.remove('disabled');
    btnClose.classList.add('disabled');
    btnPause.classList.add('disabled');
    btnCapture.classList.add('disabled');
  });

  // Pause camera
  btnPause.addEventListener('click', () => {
    camera.pause();
    btnPause.classList.add('disabled');
    btnPlay.classList.remove('disabled');
  });

  // Play camera
  btnPlay.addEventListener('click', () => {
    camera.play();
    btnPause.classList.remove('disabled');
    btnPlay.classList.add('disabled');
  });

  // Take a photo
  btnCapture.addEventListener('click', () => {
    // Get the photo data taken
    const option = {format: camera.guiState.format};// Capture options
    if (camera.guiState.resize) {
      option.width = camera.guiState.width;
      option.height = camera.guiState.height;
      option.fit = camera.guiState.fit;
    }
    const base64 = camera.capture(option);

    // Byte size of capture
    const bytes = window.atob(base64.split(',')[1]).length;

    // Show results
    captureImg.setAttribute('src', base64);
    captureContainer.classList.remove('hide');
    captureImg.addEventListener('load', () => {
      cameraResolution.textContent = `${camera.resolution.width}x${camera.resolution.height}`;
      captureResolution.textContent = `${captureImg.naturalWidth}×${captureImg.naturalHeight}`;
      captureBytes.textContent = `${Math.floor((bytes / 1024) * 100) / 100} kB`;
    }, {once: true});
  });

  // Close captured image
  btnCaptureClose.addEventListener('click', evt => {
    captureContainer.classList.add('hide');
  });
}

// Camera controller
setupControls();

// Camera element
const camera = document.querySelector('#camera');

// Camera event listener
camera
  .on('opened', evt => {
    console.log('Opened the camera');
  })
  .on('played', evt => {
    console.log('Camera resumed from pause');
  })
  .on('paused', evt => {
    console.log('Camera paused');
  });
