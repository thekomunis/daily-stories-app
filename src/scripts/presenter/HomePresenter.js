import { saveStory, isStorySaved } from "../utils/database.js";

class HomePresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
    this.stories = [];

    // Bind methods to ensure correct 'this' context
    this.getLocationName = this.getLocationName.bind(this);
    this.closeStoryDetail = this.closeStoryDetail.bind(this);
    this.handleSaveStory = this.handleSaveStory.bind(this);
  }

  async init() {
    await this.loadStories();

    // Set the location name handler in the view
    this.view.setGetLocationNameHandler(this.getLocationName);
  }

  async loadStories() {
    const result = await this.model.getStories();

    if (result.error) {
      this.view.showError(result.message);
      return;
    }

    this.stories = result.data;
  }

  async render() {
    const html = await this.view.renderStories(this.stories);
    return html;
  }

  async afterRender() {
    // Add event bindings
    this.view.bindAddStoryButton(() => {
      window.location.hash = "#/add-story";
    });

    this.view.bindViewDetailButtons(async (storyId) => {
      await this.showStoryDetail(storyId);
    });

    this.view.bindSaveStoryButtons(this.handleSaveStory);
  }

  // Handle saving a story
  async handleSaveStory(storyId) {
    try {
      // Find the story in the array
      const story = this.stories.find((s) => s.id === storyId);
      if (!story) {
        this.view.showError("Story not found");
        return;
      }

      // Check if the story is already saved
      const isSaved = await isStorySaved(storyId);
      if (isSaved) {
        this.view.showToast("Story already saved");
        return;
      }

      // Save the story to IndexedDB
      await saveStory(story);

      // Update the button appearance
      const button = document.querySelector(
        `.save-story-btn[data-id="${storyId}"]`
      );
      if (button) {
        button.textContent = "Saved";
        button.classList.remove("btn-secondary");
        button.classList.add("btn-success");
      }

      // Show success message
      this.view.showToast("Story saved successfully");
    } catch (error) {
      console.error("Error saving story:", error);
      this.view.showError("Failed to save story. Please try again.");
    }
  }

  // Handle getting location name - moved from View to Presenter
  async getLocationName(lat, lon) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      // Pass the location name back to the view
      const locationName = data.display_name || "Unknown location";
      this.view.initializeMapWithLocation(lat, lon, locationName);
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      this.view.initializeMapWithLocation(lat, lon, "Location not found");
    }
  }

  // Handle closing story detail
  closeStoryDetail() {
    this.view.closeStoryDetail();
  }

  async showStoryDetail(storyId) {
    const result = await this.model.getStoryById(storyId);

    if (result.error) {
      this.view.showError(result.message);
      return;
    }

    const closeButton = this.view.showStoryDetail(result.data);

    // Add close button handler
    if (closeButton) {
      closeButton.addEventListener("click", this.closeStoryDetail);
      this.view.bindCloseDetailButton(this.closeStoryDetail);
    }
  }
}

export default HomePresenter;
