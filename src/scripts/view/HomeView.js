import L from "leaflet";
import { saveStory, isStorySaved } from "../utils/database.js";

class HomeView {
  constructor() {
    this.container = null;
  }

  setContainer(container) {
    this.container = container;
  }

  async renderStories(stories) {
    // Map over stories and check if each story is saved
    const storiesMarkup = await Promise.all(
      stories.map(async (story) => {
        const isSaved = await isStorySaved(story.id);
        const saveButtonText = isSaved ? "Saved" : "Save";
        const saveButtonClass = isSaved ? "btn-success" : "btn-secondary";

        return `
        <div class="story-card">
          <img class="story-image" src="${
            story.photoUrl
          }" alt="Story Image by ${story.name}" loading="lazy" />
          <div class="story-content">
            <h2>${story.name}</h2>
            <p>${story.description}</p>
            <p>Created at: ${new Date(story.createdAt).toLocaleString()}</p>
            <div class="story-actions">
              <button class="view-detail-btn btn btn-primary" data-id="${
                story.id
              }" aria-label="View details for ${
          story.name
        }'s story">View Detail</button>
              <button class="save-story-btn btn ${saveButtonClass}" data-id="${
          story.id
        }" aria-label="Save ${story.name}'s story">${saveButtonText}</button>
            </div>
          </div>
        </div>
      `;
      })
    );

    return `
      <section class="container">
        <div class="row">
          <h1 class="home-page">Home Page</h1>
          <button id="addStoryBtn" class="btn btn-primary" aria-label="Add a new story">Add New Story</button>
        </div>
        <div class="stories-grid">
          ${storiesMarkup.join("")}
        </div>
      </section>
    `;
  }

  showStoryDetail(story) {
    // Remove any existing modals first
    const existingModal = document.getElementById("storyDetailModal");
    if (existingModal) existingModal.remove();

    // Create and append the modal
    const modalMarkup = `
      <div id="storyDetailModal" class="modal" role="dialog" aria-labelledby="modalTitle" aria-modal="true">
        <div class="modal-content">
          <button id="closeModal" class="close-btn" aria-label="Close story details">&times;</button>
          <h2 id="modalTitle">${story.name}</h2>
          <img class="modal-image" src="${
            story.photoUrl
          }" alt="Story Image by ${story.name}" loading="lazy" />
          <p><strong>Description:</strong> ${story.description}</p>
          <p><strong>Created at:</strong> ${new Date(
            story.createdAt
          ).toLocaleString()}</p>
          ${
            story.lat && story.lon
              ? `<p><strong>Location:</strong> ${story.lat}, ${story.lon}</p>
             <div id="mapContainer" style="height: 300px; width: 100%;" aria-label="Map showing story location"></div>`
              : "<p>No location data available</p>"
          }
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalMarkup);
    document.getElementById("storyDetailModal").style.display = "flex";

    // Add event listener to close the modal when clicking outside
    const modal = document.getElementById("storyDetailModal");
    document.addEventListener("click", (event) => {
      if (event.target === modal) {
        this.closeStoryDetail();
      }
    });

    // Add Leaflet CSS to ensure popup displays correctly
    this.ensureLeafletStyles();

    // Initialize map if coordinates are available
    if (story.lat && story.lon) {
      // Get presenter to handle this via a callback instead of directly calling
      this.onGetLocationName(story.lat, story.lon);
    }

    return document.getElementById("closeModal");
  }

  // Method for presenter to call after getting location name
  initializeMapWithLocation(lat, lon, locationName) {
    this.initializeMap(lat, lon, locationName);
  }

  ensureLeafletStyles() {
    // Check if we've already added the leaflet popup styles
    if (!document.getElementById("leaflet-popup-styles")) {
      const style = document.createElement("style");
      style.id = "leaflet-popup-styles";
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
      `;
      document.head.appendChild(style);
    }
  }

  initializeMap(lat, lon, locationName = "Location") {
    const mapContainer = document.getElementById("mapContainer");

    // Show a loading message until the map is ready
    mapContainer.innerHTML = "Loading map...";

    // Check if map is already initialized
    if (mapContainer._map) {
      mapContainer._map.remove();
    }

    // Initialize the map
    const map = new L.Map(mapContainer, {
      center: [lat, lon],
      zoom: 13, // Increased zoom level for better street view
      scrollWheelZoom: false, // Disable scroll wheel zoom for better UX within modal
    });

    // Add the tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Add a marker with a popup
    const marker = L.marker([lat, lon]).addTo(map);

    // Explicitly create and bind a popup with custom HTML content
    const popupContent = `
      <div class="custom-popup">
        <strong>${locationName}</strong><br>
        <small>Coordinates: ${lat.toFixed(6)}, ${lon.toFixed(6)}</small>
      </div>
    `;

    marker
      .bindPopup(popupContent, {
        minWidth: 200,
        autoPan: true,
        closeButton: true,
      })
      .openPopup();

    // Ensure map resizes properly
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Remove loading message once the map is ready
    map.once("load", () => {
      mapContainer.innerHTML = "";
    });

    // Handle modal visibility for map rendering
    const modal = document.getElementById("storyDetailModal");
    if (modal) {
      modal.addEventListener("transitionend", () => {
        map.invalidateSize();
      });
    }

    // Store map reference
    mapContainer._map = map;
  }

  bindAddStoryButton(handler) {
    const button = document.getElementById("addStoryBtn");
    button.addEventListener("click", handler);
  }

  bindViewDetailButtons(handler) {
    const viewDetailButtons = document.querySelectorAll(".view-detail-btn");
    viewDetailButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const storyId = e.target.getAttribute("data-id");
        handler(storyId);
      });
    });
  }

  bindSaveStoryButtons(handler) {
    const saveButtons = document.querySelectorAll(".save-story-btn");
    saveButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const storyId = e.target.getAttribute("data-id");
        handler(storyId);
      });
    });
  }

  bindCloseDetailButton(handler) {
    const closeButton = document.getElementById("closeModal");
    if (closeButton) {
      closeButton.addEventListener("click", handler);
    }
  }

  // New method to set location name handler
  setGetLocationNameHandler(handler) {
    this.onGetLocationName = handler;
  }

  closeStoryDetail() {
    const modal = document.getElementById("storyDetailModal");
    if (modal) {
      modal.style.display = "none";
      modal.remove();
    }
  }

  // Show a toast notification
  showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  showError(message) {
    alert(message);
  }
}

export default HomeView;
