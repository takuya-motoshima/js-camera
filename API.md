# Camera element

## Attributes
- __controls__  
The control is displayed.

- __autoplay__  
Open camera automatically

- __facing__  
This is the camera face when opening the camera automatically.  
Specify "front" for the front camera and "back" for the back camera.  
The default is "back".

- __width__  
The width of the camera resolution.

- __height__  
The height of the camera resolution.

- __dat-gui__  
The GUI option menu is displayed.

## Properties
- __state__: string  
    Returns the camera status.
    <table>
        <tr>
            <td>open</td>
            <td>The camera is open.</td>
        </tr>
        <tr>
            <td>loading</td>
            <td>The camera is preparing to open.</td>
        </tr>
        <tr>
            <td>close</td>
            <td>The camera is closed.</td>
        </tr>
    </table>

- __opened__: boolean  
Returns true if the camera is open.

- __paused__: boolean  
Returns true if the camera is paused.

- __facing__: string  
Returns the open camera face.  
<table>
    <tr>
        <td>back</td>
        <td>The back camera is open.</td>
    </tr>
    <tr>
        <td>front</td>
        <td>The front camera is open.</td>
    </tr>
    <tr>
        <td>undefined</td>
        <td>The camera is closed.</td>
    </tr>
</table>

- __guiState__: GuiState  
If using dat-gui for the camera element, returns the GUI options that have been applied.  
This object inherits the GuiState interface.

- __constraints__: Constraints  
Returns the constraints applied when the camera was opened.  
It inherits the Constraints interface.

- __resolution__: { width: number, height: number }  
Returns the camera resolution.

## Methods

### open()
Open the camera.

###### Syntax
```js
camera.open(facing: 'front'|'back' = 'back', width?: number, height?: number): Promise<void>
```

###### Parameters
- __facing__: string  
    Camera face.
    <table>
        <tr>
            <td>back</td>
            <td>Back camera.</td>
        </tr>
        <tr>
            <td>front</td>
            <td>Front camera.</td>
        </tr>
    </table>

- __width__: number|undefined  
    Width of resolution. The default is the initial value of the terminal.

- __height__: number|undefined  
    Height of resolution. The default is the initial value of the terminal.

###### Return
Return promise.

### waitOpen()  
Use the "autoplay" attribute on the Camera element and wait for it to be ready to open automatically.  

###### Syntax
```js
camera.waitOpen(): Promise<void>
```

###### Return
Return promise.

### close()  
Close the camera.

###### Syntax
```js
camera.close(): void
```

### pause()
Pause the camera.

###### Syntax
```js
camera.pause(): void
```

### play()
Resume the camera from pause.

###### Syntax
```js
camera.play(): void
```

### capture()
Returns the current frame image in base64 format.  
The resizing of the captured image uses the js-scissor library.  
See the [js-scissor API](https://www.npmjs.com/package/js-scissor) for how to use the fit option.  

###### Syntax
```js
camera.capture(option?: {
  /**
   * Resize width (px). The default is no resizing (undefined).
   * @type {number}
   */
  width?: number,

  /**
   * Resize height (px). The default is no resizing (undefined).
   * @type {number}
   */
  height?: number,

  /**
   * This is the position to crop. The default is no crop (undefined).
   * @type {{x: number, y: number, width: number, height: number}}
   */
  extract?: {x: number, y: number, width: number, height: number},

  /**
   * Fit mode.
   * @type {number}
   */
  fit?: 'cover'|'contain'|'fill',

  /**
   * MIME type of the captured image.
   * @type {number}
   */
  format?: 'image/webp'|'image/png'|'image/jpeg'
}): string
```

###### Parameters
- __width__: number|undefined  
    Resize width (px). The default is no resizing (undefined).

- __height__: number|undefined  
    Specify the height when resizing the captured image.

- __extract__: {x: number, y: number, width: number, height: number}  
    This is the position to crop. The default is no crop (undefined).

- __fit__: 'cover'|'contain'|'fill'|undefined  
    How the image should be resized to fit both provided dimensions, one of cover, contain, fill. (optional, default 'fill')
    <table>
        <tr>
            <td>cover</td>
            <td>The replaced content is sized to maintain its aspect ratio while filling the element's entire content box. The object will be clipped to fit.</td>
        </tr>
        <tr>
            <td>contain</td>
            <td>The replaced content is scaled to maintain its aspect ratio while fitting within the element's content box.</td>
        </tr>
        <tr>
            <td>fill</td>
            <td>This is default. The replaced content is sized to fill the element's content box. If necessary, the object will be stretched or squished to fit.</td>
        </tr>
    </table>

- __format__: 'image/webp'|'image/png'|'image/jpeg'|undefined  
    Capture image format.The default is "image/png".
    <table>
        <tr>
            <td>image/webp</td>
            <td>WebP image.</td>
        </tr>
        <tr>
            <td>image/png</td>
            <td>PNG image.</td>
        </tr>
        <tr>
            <td>image/jpeg</td>
            <td>JPEG image.</td>
        </tr>
    </table>

###### Return
Returns the captured image as a string in base64 format.

### permission()
Returns the camera permissions.

###### Syntax
```js
camera.permission(): Promise<string|undefined>
```
###### Return
Returns a promise that accepts a string with permission status.
<table>
    <tr>
        <td>granted</td>
        <td>Caller will be able to successfuly access the feature without having the user agent asking the user’s permission.</td>
    </tr>
    <tr>
        <td>denied</td>
        <td>Caller will not be able to access the feature.</td>
    </tr>
    <tr>
        <td>prompt</td>
        <td>User agent will be asking the user’s permission if the caller tries to access the feature. The user might grant, deny or dismiss the request.</td>
    </tr>
    <tr>
        <td>undefined</td>
        <td>Returns undefined when Permissions.query API is not supported.</td>
    </tr>
</table>

### revokePermission()
Revoke camera access settings.

###### Syntax
```js
camera.revokePermission(): Promise<void>
```

###### Return
Return promise.

### on()
Add camera event listener.

###### Syntax
```js
camera.on(
  type: string,
  listener: () => void,
  option: { once: boolean } = { once: false }
): Camera
```

###### Parameters
- __type__: string  
    event name.

- __listener__: (event?: Event) => void  
    Event listener callback function.

- __option__: { once: boolean } = { once: false }
    Event option. The following values ​​can be set.  
    <table>
        <tr>
            <td>once</td>
            <td>If true, the listener would be automatically removed when invoked.The default is false.</td>
        </tr>
    </table>

###### Return
Returns the camera element.

### off()
Remove event listener.

###### Syntax
```js
camera.off(
  type: string,
  listener: (event?: Event) => void
): Camera
```

###### Return
Returns the camera element.

## Events

### opened
Fired when the camera opens.

```js
camera.on('opened', event => {});
```

### played
Fired when the camera plays from pause.

```js
camera.on('played', event => {})
```

### paused
Fired when the camera pauses.

```js
camera.on('paused', event => {});
```

### tookphoto
Fired when you take a picture.  
This is used to attach a control attribute to the camera element and receive shooting data when the shooting button is pressed.

```js
// Returns the photo taken from the shoot button on the camera controller
// The captured image can be received from "event.detail.dat" in base64 format.
camera.on('tookphoto', event => {
  console.log(event.detail.base64);// data:image/png;base64,iVB...
});
```

# Constraints interface

Interface for constraint objects used when opening a camera

## Properties
- __video__: Object

    - __facingMode__: string  
        Camera face.  
        <table>
            <tr>
                <td>user</td>
                <td>Use front camera.</td>
            </tr>
            <tr>
                <td>environment</td>
                <td>Use the back camera.</td>
            </tr>
        </table>

    - __width__: number|undefined  
        Camera resolution width.

    - __height__: number|undefined  
        Camera resolution height.

- __audio__: boolean  
    Use audio if true.

# GuiState interface

Interface for GUI option objects of camera elements.

## Properties
- __resolution__: string  
    Returns the width and height of the resolution, separated by commas.

- __facing__: string
    Camera face.
    <table>
        <tr>
            <td>back</td>
            <td>Back camera.</td>
        </tr>
        <tr>
            <td>front</td>
            <td>Front camera.</td>
        </tr>
    </table>

- __format__: string  
    Format of photos to take.
    <table>
        <tr>
            <td>image/webp</td>
            <td>WebP image.</td>
        </tr>
        <tr>
            <td>image/png</td>
            <td>PNG image.</td>
        </tr>
        <tr>
            <td>image/jpeg</td>
            <td>JPEG image.</td>
        </tr>
    </table>

- __resize__: boolean  
    Returns true to resize the photo taken.

- __width__: number  
    The height to resize the picture taken.

- __height__: number  
    The width to resize the picture taken.

- __fit__: string  
    It is a fitting method when resizing the taken picture.
    <table>
        <tr>
            <td>cover</td>
            <td>The replaced content is sized to maintain its aspect ratio while filling the element's entire content box. The object will be clipped to fit.</td>
        </tr>
        <tr>
            <td>contain</td>
            <td>The replaced content is scaled to maintain its aspect ratio while fitting within the element's content box.</td>
        </tr>
        <tr>
            <td>fill</td>
            <td>This is default. The replaced content is sized to fill the element's content box. If necessary, the object will be stretched or squished to fit.</td>
        </tr>
    </table>
