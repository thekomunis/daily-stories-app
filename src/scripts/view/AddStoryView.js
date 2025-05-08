import L from 'leaflet';

class AddStoryView {
  constructor() {
    this.isPhotoTaken = false;
    this.marker = null;
    this.currentStream = null;
    this.map = null;
  }

  render() {
    return `
      <button id="backBtn" class="btn btn-secondary" aria-label="Back to Home">Back to Home</button>
      <section class="container">
        <h1>Add New Story</h1>
        <br>
        <form id="addStoryForm" aria-labelledby="formTitle">
          <h2 id="formTitle" class="sr-only">New Story Form</h2>
          
          <div class="form-group">
            <label for="description" id="descriptionLabel">Description:</label>
            <textarea id="description" required rows="10" style="width: 100%; resize: none;" aria-labelledby="descriptionLabel" aria-required="true"></textarea>
          </div>

          <div class="form-group">
            <label for="uploadPhotoBtn" id="photoLabel">Photo:</label>
            <button type="button" id="uploadPhotoBtn" class="btn btn-primary" aria-labelledby="photoLabel">Upload Photo</button>
          </div>

          <!-- Modal untuk memilih foto -->
          <div id="photoModal" class="modal" aria-hidden="true" role="dialog" aria-labelledby="photoModalTitle">
            <div class="modal-content">
              <button id="closeModal" class="close-btn" aria-label="Close photo modal">&times;</button>
              <h2 id="photoModalTitle">Select Photo</h2>
              <div class="button-group">
                <button id="chooseFile" class="btn btn-secondary" aria-label="Choose file to upload">Choose File</button>
                <button id="openCamera" class="btn btn-primary" type="button" aria-label="Open camera for photo">Open Camera</button>
              </div>
              <video id="cameraPreview" width="100%" height="auto" style="border: 1px solid #ddd; display: none; margin-top: 10px; margin-bottom:10px;" aria-live="polite"></video>
              <canvas id="canvas" style="display: none;"></canvas>
              <button id="takePhoto" class="btn btn-secondary" style="display: none;" type="button" aria-label="Take a photo">Take Photo</button>
              <input type="file" id="photo" accept="image/*" style="display: none;" aria-label="Select image file" />
            </div>
          </div>

          <!-- Preview foto di luar modal -->
          <div id="photoPreviewContainer" style="margin-top: 20px; display: none;">
            <h3>Preview:</h3>
            <img id="photoPreview" style="border-radius: 8px; max-width: 50%; max-height: 300px;" alt="Preview of the selected photo" />
          </div>

          <div class="form-group">
            <label for="mapContainer" id="locationLabel">Location:</label>
            <p class="map-instructions">Click on the map to select your story's location</p>
            <div id="mapContainer" style="height: 300px; width: 100%;" aria-labelledby="locationLabel" role="application"></div> <!-- Container untuk peta -->
            <input type="hidden" id="lat" />
            <input type="hidden" id="lon" />
          </div>

          <div class="location-info">
            <p id="latitudeDisplay">Latitude: </p>
            <p id="longitudeDisplay">Longitude: </p>
          </div>

          <button type="submit" class="btn btn-primary" aria-label="Submit your story">Submit</button>
        </form>
        <div id="loading" class="loading" style="display: none;" aria-live="polite">Loading...</div> <!-- Indikator loading -->
      </section>
    `;
  }

  initMap() {
    // Ensure Leaflet popup styles are added
    this.ensureLeafletStyles();

    const mapContainer = document.getElementById("mapContainer");
    this.map = new L.Map(mapContainer, {
      center: [0, 0],
      zoom: 2,
      scrollWheelZoom: true
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Make sure map renders correctly
    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);

    return this.map;
  }

  ensureLeafletStyles() {
    // Check if we've already added the leaflet popup styles
    if (!document.getElementById('leaflet-popup-styles')) {
      const style = document.createElement('style');
      style.id = 'leaflet-popup-styles';
      style.textContent = `
        .leaflet-popup-content-wrapper {
          padding: 1px;
          text-align: left;
          border-radius: 12px;
          background: white;
          color: #333;
          box-shadow: 0 3px 14px rgba(0,0,0,0.4);
        }
        .leaflet-popup-content {
          margin: 13px 19px;
          line-height: 1.4;
        }
        .leaflet-popup-tip {
          width: 17px;
          height: 17px;
          padding: 1px;
          margin: -10px auto 0;
          background: white;
          transform: rotate(45deg);
          box-shadow: 0 3px 14px rgba(0,0,0,0.4);
        }
        .leaflet-popup-close-button {
          position: absolute;
          top: 0;
          right: 0;
          padding: 4px 4px 0 0;
          border: none;
          text-align: center;
          width: 18px;
          height: 14px;
          font: 16px/14px Tahoma, Verdana, sans-serif;
          color: #c3c3c3;
          text-decoration: none;
          font-weight: bold;
          background: transparent;
        }
        .map-instructions {
          margin-bottom: 10px;
          color: #555;
          font-style: italic;
        }
      `;
      document.head.appendChild(style);
    }
  }

  bindBackButton(handler) {
    document.getElementById("backBtn").addEventListener("click", handler);
  }

  bindFormSubmit(handler) {
    document.getElementById("addStoryForm").addEventListener("submit", (e) => {
      e.preventDefault();
      handler();
    });
  }

  bindUploadPhotoButton(handler) {
    document.getElementById("uploadPhotoBtn").addEventListener("click", handler);
  }

  bindCloseModalButton(handler) {
    document.getElementById("closeModal").addEventListener("click", handler);
  }

  bindOpenCameraButton(handler) {
    document.getElementById("openCamera").addEventListener("click", handler);
  }

  bindChooseFileButton(handler) {
    document.getElementById("chooseFile").addEventListener("click", handler);
  }

  bindFileInputChange(handler) {
    document.getElementById("photo").addEventListener("change", handler);
  }

  bindTakePhotoButton(handler) {
    document.getElementById("takePhoto").addEventListener("click", handler);
  }

  showPhotoModal() {
    const modal = document.getElementById("photoModal");
    modal.style.display = "block";
    modal.setAttribute("aria-hidden", "false");
    this.isPhotoTaken = false;
  }

  hidePhotoModal() {
    const modal = document.getElementById("photoModal");
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }

  getFormData() {
    return {
      description: document.getElementById("description").value,
      photo: document.getElementById("photo").files[0],
      lat: document.getElementById("lat").value || null,
      lon: document.getElementById("lon").value || null
    };
  }

  startCamera() {
    const videoElement = document.getElementById("cameraPreview");
    videoElement.style.display = "block";
    document.getElementById("takePhoto").style.display = "block";
    return videoElement;
  }

  stopCamera() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
    }
  }

  setCameraStream(stream) {
    this.currentStream = stream;
  }

  capturePhoto(videoElement) {
    const canvasElement = document.getElementById("canvas");
    const context = canvasElement.getContext("2d");
    
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    
    const imageUrl = canvasElement.toDataURL("image/png");
    return imageUrl;
  }

  previewPhoto(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoPreview = document.getElementById("photoPreview");
        const photoPreviewContainer = document.getElementById("photoPreviewContainer");
        photoPreviewContainer.style.display = "block";
        photoPreview.src = e.target.result;
        resolve(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  setPhotoInputFile(file) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    document.getElementById("photo").files = dataTransfer.files;
  }

  updateLocationDisplay(lat, lon) {
    document.getElementById("latitudeDisplay").textContent = `Latitude: ${lat.toFixed(6)}`;
    document.getElementById("longitudeDisplay").textContent = `Longitude: ${lon.toFixed(6)}`;
    document.getElementById("lat").value = lat;
    document.getElementById("lon").value = lon;
  }

  addMarker(lat, lon, locationName) {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    
    this.marker = L.marker([lat, lon]).addTo(this.map);
    
    if (locationName) {
      // Create a popup with proper content
      const popupContent = `
        <div class="custom-popup">
          <strong>${locationName}</strong><br>
          Latitude: ${lat.toFixed(6)}<br>
          Longitude: ${lon.toFixed(6)}
        </div>
      `;
      
      this.marker.bindPopup(popupContent).openPopup();
    }
  }

  showLoading() {
    const loading = document.getElementById("loading");
    loading.style.display = "block";
    loading.setAttribute("aria-live", "assertive");
  }

  hideLoading() {
    const loading = document.getElementById("loading");
    loading.style.display = "none";
    loading.setAttribute("aria-live", "off");
  }

  showError(message) {
    alert(message);
  }

  showSuccess(message) {
    alert(message);
  }
}

export default AddStoryView; 