import '../dist/build.esm.js';

(async () => {
  // Camera element
  const camera = document.querySelector('#camera');

  // If you use the "autoplay" attribute to automatically open camera, you can wait for the camera to fully open if necessary.
  await camera.waitOpen();

  // Camera event listener
  camera
    .on('opened', () => {
      // Called after opening the camera
      console.log('Opened the camera');
    })
    .on('played', () => {
      // Called after playing the camera from pause
      console.log('Camera resumed from pause');
    })
    .on('paused', () => {
      // Called after pausing the camera
      console.log('Camera paused');
    })
    .on('captured', event => {
      // Returns the photo taken from the shoot button on the camera controller
      // The captured image can be received from "event.detail.dat" in data URL.
      console.log(`Capture: ${event.detail.capture.slice(0, 30)}`);// Capture: data:image/png;base64,iVB...
    });
})();