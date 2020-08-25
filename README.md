# js-camera

This is a custom element V1-based camera component.

## Installation

```sh
npm install js-camera;
```

## Usage

### Use Camera Controls

You can use play, pause, capture and camera face switch immediately by using "controls" attribute on camera element.

![camera-with-controller.jpg](https://raw.githubusercontent.com/takuya-motoshima/js-camera/master/screencap/camera-with-controller.jpg)

Add "controls" and "autoplay" attributes to the camera element.  
If necessary, specify the camera face with the "facing" attribute and the resolution with the "width" and "height" attributes.  
The default for the "facing" attribute is "back". If omitted, the rear camera opens.

```html
<js-camera id="camera" controls autoplay facing="back" width="1920" height="1080"></js-camera>
```

You can receive the photos taken at the event and send them to the server.  
Also use the play and pause events if needed.  

```js
import 'js-camera';

// Camera element
const camera = document.querySelector('#camera');

// If you use the "autoplay" attribute to automatically open the camera, you can wait for the camera to fully open if necessary.
await camera.waitOpen();

// Camera event listener
camera
  // Called after opening the camera
  .on('opened', () => {})
  // Called after playing the camera from pause/
  .on('played', () => {})
  // Called after pausing the camera
  .on('paused', () => {})
  // Returns the photo taken from the shoot button on the camera controller
  // The captured image can be received from "event.detail.dat" in base64 format.
  .on('tookphoto', event => {
    console.log(event.detail.base64);// data:image/png;base64,iVB...
  });
```

### Try camera options

If you want to experiment with different camera options, you can use "dat-gui" for the camera element and use the options menu.

![camera-with-controller.jpg](https://raw.githubusercontent.com/takuya-motoshima/js-camera/master/screencap/camera-with-gui.jpg)

The current GUI options can be accessed from the camera element "guiState".  
Here is an example using the GUI option.

Add "dat-gui" attribute to the camera element.

```html
<js-camera id="camera" dat-gui></js-camera>
```

Get camera elements with JS and operate GUI options.

```js

import 'js-camera';

// Camera element
const camera = document.querySelector('#camera');

// Open camera
const [ width, height ] = camera.guiState.resolution.split(',');
await camera.open(camera.guiState.facing, width, height);

// Close camera
camera.close();

// Take a photo
const option = { format: camera.guiState.format };// Capture options
if (camera.guiState.resize) {
  option.width = camera.guiState.width;
  option.height = camera.guiState.height;
  option.fit = camera.guiState.fit;
}
const base64 = camera.capture(option);
console.log(base64);// data:image/png;base64,iVB...

// Pause
camera.pause();

// Pause
camera.pause();

// Resume from pause
camera.play();
```

### Basic camera usage.

Place the camera open/close, play, pause, and capture buttons in the HTML.

```html
<style>
.actions {
  position: absolute;
  z-index: 1002;
  left: 0;
  bottom: 0;
  padding: 10px;
  width: 100%;
  text-align: center;
}
</style>

<js-camera id="camera"></js-camera>

<div class="actions">
  <button id="btnOpen" type="button">Open</button>
  <button id="btnClose" type="button">Close</button>
  <button id="btnPause" type="button">Pause</button>
  <button id="btnPlay" type="button">Play</button>
  <button id="btnCapture" type="button">Take photo</button>
</div>
```

Implements camera opening, closing, playing, pausing, and button event capture.  
This is the easiest way to use the camera.

```js
import 'js-camera';

// Camera element
const camera = document.querySelector('#camera');

// Open the camera.
// If necessary, you can also specify the resolution like "await camera.open('back', 1920, 1080)".
document.querySelector('#btnOpen').addEventListener('click', async () => {
  await camera.open('back');
});

// Close the camera.
document.querySelector('#btnClose').addEventListener('click', () => {
  if (!camera.opened) return;
  camera.close();
});

// Pause
document.querySelector('#btnPause').addEventListener('click', () => {
  if (!camera.opened) return;
  camera.pause();
});

// Play camera
document.querySelector('#btnPlay').addEventListener('click', () => {
  if (!camera.opened) return;
  camera.play();
});

// Take a photo
document.querySelector('#btnCapture').addEventListener('click', () => {
  if (!camera.opened) return;
  // Get the photo data taken
  let base64 = camera.capture();
  console.log(`Capture: ${base64}`);// Capture: data:image/png;base64,iVBORw0K

  // You can specify image/webp, image/png, image/jpeg as the capture format.
  // Default is image/png.
  base64 = camera.capture({ format: 'image/webp' });
  console.log(`WebP capture: ${base64}`);// WebP capture: data:image/webp;base64,UklGRrb

  // You can also resize the capture with width, height, and fit options.
  base64 = camera.capture({ fit: 'cover', width: 300, height: 200 });
  console.log(`Resize capture: ${base64}`);// Resize capture: data:image/png;base64,iVBORw0K
});
```

## API
### Camera element
#### Attributes
- controls  
    The control is displayed.
- autoplay  
    Open camera automatically
- facing  
    This is the camera face when opening the camera automatically.  
    Specify "front" for the front camera and "back" for the back camera.  
    The default is "back".
- width  
    The width of the camera resolution.
- height  
    The height of the camera resolution.
- dat-gui  
    The GUI option menu is displayed.

#### Properties
- state: 'open'|'loading'|'close'  
    Returns the camera status.
    <table>
      <tr><td>open</td><td>The camera is open.</td></tr>
      <tr><td>loading</td><td>The camera is preparing to open.</td></tr>
      <tr><td>close</td><td>The camera is closed.</td></tr>
    </table>
- opened: boolean  
    Returns true if the camera is open.
- paused: boolean  
    Returns true if the camera is paused.
- facing: 'front'|'back'|undefined  
    Returns the open camera face.  
    <table>
      <tr><td>back</td><td>The back camera is open.</td></tr>
      <tr><td>front</td><td>The front camera is open.</td></tr>
      <tr><td>undefined</td><td>The camera is closed.</td></tr>
    </table>
- guiState: GuiState|undefined  
    If using dat-gui for the camera element, returns the GUI options that have been applied.  
- constraints: Constraints  
    Returns the constraints applied when the camera was opened.
- resolution: { width: number, height: number }  
    Returns the camera resolution.

#### Methods
- open()  
    Open the camera.
    - Syntax  
        ```js
        camera.open(
          facing: 'front'|'back' = 'back',
          width?: number,
          height?: number
        ): Promise<void>
        ```
    - Parameters  
        - facing: 'front'|'back'  
            Camera face.
            <table>
              <tr><td>back</td><td>Open the back camera.</td></tr>
              <tr><td>front</td><td>Open the front camera.</td></tr>
            </table>
        - width: number|undefined  
            Width of resolution. The default is the initial value of the terminal.
        - height: number|undefined  
            Height of resolution. The default is the initial value of the terminal.
    - Return value  
        Return promise.
- waitOpen()  
    Use the "autoplay" attribute on the Camera element and wait for it to be ready to open automatically.  
    - Syntax  
        ```js
        camera.waitOpen(): Promise<void>
        ```
    - Return value  
        Return promise.
- close()  
    Close the camera.
    - Syntax  
        ```js
        camera.close(): void
        ```
- pause()  
    Pause the camera.
    - Syntax  
        ```js
        camera.pause(): void
        ```
- play()  
    Resume the camera from pause.
    - Syntax  
        ```js
        camera.play(): void
        ```
- capture()  
    Returns the current frame image in base64 format.  
    The resizing of the captured image uses the js-scissor library.  
    See the [js-scissor API](https://www.npmjs.com/package/js-scissor) for how to use the fit option.  

    - Syntax  
        ```js
        camera.capture(option?: {
          width?: number,
          height?: number,
          fit?: 'cover'|'contain'|'fill',
          format?: 'image/webp'|'image/png'|'image/jpeg'
        }): string
        ```
    - Parameters  
        - width: number|undefined  
            Specify the width when resizing the captured image.
        - height: number|undefined  
            Specify the height when resizing the captured image.
        - fit: 'cover'|'contain'|'fill'|undefined  
            How the image should be resized to fit both provided dimensions, one of cover, contain, fill. (optional, default 'fill')
            <table>
              <tr><td>cover</td><td>The replaced content is sized to maintain its aspect ratio while filling the element's entire content box. The object will be clipped to fit.</td></tr>
              <tr><td>contain</td><td>The replaced content is scaled to maintain its aspect ratio while fitting within the element's content box.</td></tr>
              <tr><td>fill</td><td>This is default. The replaced content is sized to fill the element's content box. If necessary, the object will be stretched or squished to fit.</td></tr>
            </table>
        - format: 'image/webp'|'image/png'|'image/jpeg'|undefined  
            Capture image format.The default is "image/png".
            <table>
              <tr><td>image/webp</td><td>Return WebP image.</td></tr>
              <tr><td>image/png</td><td>Returns a PNG image.</td></tr>
              <tr><td>image/jpeg</td><td>Returns a JPEG image.</td></tr>
            </table>
    - Return value  
        Returns the captured image as a string in base64 format.
- permission()  
    Returns the camera permissions.
    - Syntax  
        ```js
        camera.permission(): Promise<string|undefined>
        ```
    - Return value  
        Returns a promise that accepts a string with permission status.
        <table>
          <tr><td>granted</td><td>Caller will be able to successfuly access the feature without having the user agent asking the user’s permission.</td></tr>
          <tr><td>denied</td><td>Caller will not be able to access the feature.</td></tr>
          <tr><td>prompt</td><td>User agent will be asking the user’s permission if the caller tries to access the feature. The user might grant, deny or dismiss the request.</td></tr>
          <tr><td>undefined</td><td>Returns undefined when Permissions.query API is not supported.</td></tr>
        </table>
- revokePermission()  
    Revoke camera access settings.
    - Syntax  
        ```js
        camera.revokePermission(): Promise<void>
        ```
    - Return value  
        Return promise.
- on()  
    Add camera event listener.
    - Syntax  
        ```js
        camera.on(type: string, listener: () => void, option: { once: boolean } = { once: false }): Camera
        ```
    - Parameters  
        - type: string  
            event name.
        - listener: (event?: Event) => void  
            Event listener callback function.
        - option: { once: boolean } = { once: false }
            Event option. The following values ​​can be set.  
            <table>
              <tr><td>once</td><td>If true, the listener would be automatically removed when invoked.The default is false.</td></tr>
            </table>
    - Return value  
        Returns the camera element.
- off()  
    Remove event listener.
    - Syntax  
        ```js
        camera.off(type: string, listener: (event?: Event) => void): Camera
        ```
    - Return value  
        Returns the camera element.

#### Events
- opened  
    Fired when the camera opens.
    ```js
    camera.on('opened', event => {
      console.log('Opened the camera');
    });
    ```
- played   
    Fired when the camera plays from pause.
    ```js
    camera.on('played', event => {
      console.log('Camera resumed from pause');
    })
    ```
- paused
    Fired when the camera pauses.
    ```js
    camera.on('paused', event => {
      console.log('Camera paused');
    });
    ```
- tookphoto
    Fired when you take a picture.  
    This is used to attach a control attribute to the camera element and receive shooting data when the shooting button is pressed.
    ```js
    camera.on('tookphoto', event => {
      // Returns the photo taken from the shoot button on the camera controller
      // The captured image can be received from "event.detail.dat" in base64 format.
      console.log(event.detail.base64);// data:image/png;base64,iVB...
    });
    ```

### Constraints interface
Interface for constraint objects used when opening a camera

#### Properties
- video: Object
    - facingMode: 'user'|'environment'  
        Camera face.  
        <table>
          <tr><td>user</td><td>Use front camera.</td></tr>
          <tr><td>environment</td><td>Use the back camera.</td></tr>
        </table>
    - width: number|undefined  
        Camera resolution width.
    - height: number|undefined  
        Camera resolution height.
- audio: boolean  
    Use audio if true.

### GuiState interface
Interface for GUI option objects of camera elements.

#### Properties
- resolution: string  
    Returns the width and height of the resolution, separated by commas.
- facing: 'back'\|'front'  
    Camera face.
- format: 'image/webp'\|'image/png'\|'image/jpeg'  
    Format of photos to take.
- resize: boolean  
    Returns true to resize the photo taken.
- width: number  
    The height to resize the picture taken.
- height: number  
    The width to resize the picture taken.
- fit: 'cover'\|'contain'\|'fill'  
    It is a fitting method when resizing the taken picture.

## Examples

There are some examples in "./examples" in this package.Here is the first one to get you started.
