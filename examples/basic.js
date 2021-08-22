import '../dist/build.esm.js';

// Camera element
const camera = document.querySelector('#camera');

// Open the camera.
// If necessary, you can also specify the resolution like "await camera.open('back', 1920, 1080)".
document.querySelector('#btnOpen').addEventListener('click', async () => {
  await camera.open('back');
});

// Close the camera.
document.querySelector('#btnClose').addEventListener('click', () => {
  if (!camera.opened)
    return;
  camera.close();
});

// Pause
document.querySelector('#btnPause').addEventListener('click', () => {
  if (!camera.opened)
    return;
  camera.pause();
});

// Play camera
document.querySelector('#btnPlay').addEventListener('click', () => {
  if (!camera.opened)
    return;
  camera.play();
});

// Take a photo
document.querySelector('#btnCapture').addEventListener('click', () => {
  if (!camera.opened)
    return;

  // Get the photo data taken
  let base64 = camera.capture();
  console.log(`Capture: ${base64.slice(0,30)}`);

  // You can specify image/webp, image/png, image/jpeg as the capture format.
  // Default is image/png.
  base64 = camera.capture({format: 'image/webp'});
  console.log(`WebP capture: ${base64.slice(0,30)}`);

  // You can also resize the capture with width, height, and fit options.
  base64 = camera.capture({ fit: 'cover', width: 300, height: 200 });
  console.log(`Resize capture: ${base64.slice(0,30)}`);
});