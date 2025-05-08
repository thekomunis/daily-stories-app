class AddStoryPresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
  }

  async init() {
    // Initialize map and set up event listener for map clicks
    const map = this.view.initMap();
    
    map.on('click', async (event) => {
      const lat = event.latlng.lat;
      const lon = event.latlng.lng;
      
      this.view.updateLocationDisplay(lat, lon);
      
      try {
        const locationName = await this.reverseGeocode(lat, lon);
        this.view.addMarker(lat, lon, locationName);
      } catch (error) {
        this.view.addMarker(lat, lon, 'Unknown location');
      }
    });
  }

  async reverseGeocode(lat, lon) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract a more user-friendly location name
      let locationName = 'Location';
      
      if (data && data.address) {
        // Try to construct a readable location name from address components
        const address = data.address;
        const components = [];
        
        // Add important address components if available
        if (address.city) components.push(address.city);
        else if (address.town) components.push(address.town);
        else if (address.village) components.push(address.village);
        else if (address.hamlet) components.push(address.hamlet);
        
        if (address.county) components.push(address.county);
        if (address.state) components.push(address.state);
        if (address.country) components.push(address.country);
        
        if (components.length > 0) {
          locationName = components.join(', ');
        } else if (data.display_name) {
          // Fallback to display_name if we couldn't construct a better name
          locationName = data.display_name;
        }
      } else if (data.display_name) {
        locationName = data.display_name;
      }
      
      return locationName;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return 'Location marked';
    }
  }

  setupEventListeners() {
    // Back button
    this.view.bindBackButton(() => {
      this.navigateToHome();
    });

    // Form submission
    this.view.bindFormSubmit(() => {
      this.submitStory();
    });

    // Photo modal
    this.view.bindUploadPhotoButton(() => {
      this.view.showPhotoModal();
    });

    this.view.bindCloseModalButton(() => {
      this.view.hidePhotoModal();
      this.view.stopCamera();
    });

    // Camera functionality
    this.view.bindOpenCameraButton(() => {
      this.openCamera();
    });

    this.view.bindChooseFileButton(() => {
      document.getElementById('photo').click();
    });

    this.view.bindFileInputChange((e) => {
      const file = e.target.files[0];
      if (file) {
        this.view.previewPhoto(file);
        this.view.hidePhotoModal();
      }
    });

    this.view.bindTakePhotoButton(() => {
      if (this.view.isPhotoTaken) {
        this.view.showError('You have already taken a photo!');
        return;
      }

      const videoElement = document.getElementById('cameraPreview');
      const imageUrl = this.view.capturePhoto(videoElement);
      const file = this.dataURLtoFile(imageUrl, 'captured-photo.png');
      
      this.view.setPhotoInputFile(file);
      this.view.previewPhoto(file);
      this.view.stopCamera();
      this.view.hidePhotoModal();
      this.view.isPhotoTaken = true;
    });

    // Clean up when leaving the page
    window.addEventListener('beforeunload', () => {
      this.view.stopCamera();
    });

    window.addEventListener('hashchange', () => {
      this.view.stopCamera();
    });
  }

  dataURLtoFile(dataURL, filename) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  async openCamera() {
    try {
      const videoElement = this.view.startCamera();
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.view.setCameraStream(stream);
      
      videoElement.srcObject = stream;
      videoElement.play();
    } catch (error) {
      console.error('Error accessing the camera:', error);
      this.view.showError('Cannot access camera. Please try again.');
    }
  }

  async submitStory() {
    const formData = this.view.getFormData();
    
    if (!formData.description || !formData.photo) {
      this.view.showError('Please fill in all required fields and upload a photo.');
      return;
    }

    this.view.showLoading();

    try {
      const result = await this.model.addStory(
        formData.description,
        formData.photo,
        formData.lat,
        formData.lon
      );

      this.view.hideLoading();

      if (result.error) {
        this.view.showError(result.message);
      } else {
        this.view.showSuccess('Story added successfully!');
        this.navigateToHome();
      }
    } catch (error) {
      this.view.hideLoading();
      this.view.showError('Failed to add story. Please try again.');
      console.error('Error submitting story:', error);
    }
  }

  navigateToHome() {
    window.location.hash = '#/';
  }

  async render() {
    return this.view.render();
  }

  async afterRender() {
    await this.init();
    this.setupEventListeners();
  }
}

export default AddStoryPresenter; 