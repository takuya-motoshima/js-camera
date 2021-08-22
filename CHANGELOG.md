# Changelog

All notable changes to this project will be documented in this file.

## [1.0.4] - 2021-08-23
### Fixed
- You can now crop captured images from the camera.

![crop-capture.png](https://raw.githubusercontent.com/takuya-motoshima/js-camera/master/screencap/crop-capture.png)

```js
// Crop an image with a width of 200px and a height of 200px from the coordinates (100px, 100px) with the upper left as the base point.
const base64 = camera.capture({
  extract: {
    x: 100,
    y: 100,
    width: 200,
    height: 200
  }
});

// Resize the cropped image to width 100px and height 100px
const base64 = camera.capture({
  width: 100,
  height: 100,
  extract: {
    x: 100,
    y: 100,
    width: 200,
    height: 200
  }
});
```

## [1.0.3] - 2020-09-23
### Fixed
- Fixed a bug where the camera component would not change to a relative position if it was in a static position.

## [1.0.2] - 2020-08-26
### Fixed
- Added API.md to NPM package.

## [1.0.1] - 2020-08-26
### Fixed
- Added API.md and CHANGELOG.md.

## [1.0.0] - 2020-08-25
### Fixed
- Released.

[1.0.1]: https://github.com/takuya-motoshima/js-camera/compare/v1.0.0...v1.0.1
[1.0.2]: https://github.com/takuya-motoshima/js-camera/compare/v1.0.1...v1.0.2
[1.0.3]: https://github.com/takuya-motoshima/js-camera/compare/v1.0.2...v1.0.3
[1.0.4]: https://github.com/takuya-motoshima/js-camera/compare/v1.0.3...v1.0.4