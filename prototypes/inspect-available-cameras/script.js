(async () => {
  const getDevices = async (availableOnly = undefined) => {
    let stream;
    try {
      // Camera device enumeration requires permission to access media devices. Access camera devices without enforcing camera face.
      stream = await navigator.mediaDevices.getUserMedia({video: {facingMode: {ideal: 'user'}}, audio: false});

      // Get camera devices.
      const devices = (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === 'videoinput');
      if (!availableOnly)
        return devices;
      
      // If only available cameras are specified, only devices with front or rear cameras will be retrieved.
      return devices.filter(device => {
        // Checks if there is a front (user) or rear (environment) camera in the camera face (facingMode).
        const capability = device.getCapabilities();
        return ['user', 'environment'].some(facingMode => capability.facingMode.includes(facingMode));
      });
    } finally {
      // Note that certain browsers will generate a `NotReadableError: could not start video source` when opening the camera if MediaStream is not released.
      stream?.getTracks().forEach(track => track.stop());
    }
  }

  const openCamera = async () => {
    // Get selected devices.
    const deviceId = deviceSelect.value;

    // Open camera.
    video.srcObject = await navigator.mediaDevices.getUserMedia({video: {deviceId: {exact: deviceId}}, audio: false})
    video.play();
  }

  const closeCamera = () => {
    video.srcObject?.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }

  const showDeviceInfo = () => {
    if (!deviceSelect.value)
      // If device not selected.
      return;

    // Get selection device information.
    const device = devices.find(device => device.deviceId === deviceSelect.value);
    if (!device)
      return;

    // Get device capabilities.
    const capability = device.getCapabilities();

    // Display device information.
    document.getElementById('label').textContent = device.label;
    document.getElementById('facingMode').textContent = JSON.stringify(capability.facingMode);
    document.getElementById('width').textContent = JSON.stringify(capability.width);
    document.getElementById('height').textContent = JSON.stringify(capability.height);
    document.getElementById('aspectRatio').textContent = JSON.stringify(capability.aspectRatio);
    document.getElementById('frameRate').textContent = JSON.stringify(capability.frameRate);
    document.getElementById('resizeMode').textContent = JSON.stringify(capability.resizeMode);
  }

  const showAlert = message => {
    alertMessage.closest('.alert').classList.remove('d-none');
    alertMessage.textContent = message;
  }

  const showAllDevices = async () => {
    const tbody = devicesTable.querySelector('tbody');
    for (let device of await getDevices()) {
      const capability = device.getCapabilities();
      const row = tbody.insertRow();
      row.insertCell(0).textContent = device.label;
      row.insertCell(1).textContent = JSON.stringify(capability.facingMode);
      row.insertCell(2).textContent = JSON.stringify(capability.width);
      row.insertCell(3).textContent = JSON.stringify(capability.height);
      row.insertCell(4).textContent = JSON.stringify(capability.aspectRatio);
      row.insertCell(5).textContent = JSON.stringify(capability.frameRate);
      row.insertCell(6).textContent = JSON.stringify(capability.resizeMode);
    }
  }

  const deviceSelect = document.getElementById('deviceSelect');
  const openButton = document.getElementById('openButton');
  const closeButton = document.getElementById('closeButton');
  const video = document.getElementById('video');
  const alertMessage = document.getElementById('alertMessage');
  const devicesTable = document.getElementById('devicesTable');

  // Check camera permissions.
  const permissionStatus = await navigator.permissions.query({name: 'camera'});
  if (permissionStatus.state === 'denied') {
    showAlert('Camera is not available. Please allow the camera to be used.');
    return;
  }

  // Device choice set.
  let devices;
  try {
    devices = await getDevices(true);
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      showAlert('Camera is not available. Please allow the camera to be used.');
      return;
    } else
      throw err;
  }
  for (let device of devices) {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.textContent = device.label;
    deviceSelect.appendChild(option);
  }

  // // Show device information.
  // showDeviceInfo();

  // Show all devices.
  showAllDevices();

  // Device change event.
  deviceSelect.addEventListener('change', async () => {
    if (openButton.disabled) {
      // Close camera.
      closeCamera();

      // Open camera.
      await openCamera();
    }

    // // Show device information.
    // showDeviceInfo();
  });

  // Camera open event.
  openButton.addEventListener('click', async () => {
    try {
      // Open camera.
      await openCamera();

      // Control button activity.
      openButton.disabled = true;
      closeButton.disabled = false;
    } catch (err) {
      alert('Camera open error:' + err);
    }
  });

  // Camera Close Event.
  closeButton.addEventListener('click', async () => {
    // Close camera.
    closeCamera();

    // Control button activity.
    openButton.disabled = false;
    closeButton.disabled = true;
  });
})();