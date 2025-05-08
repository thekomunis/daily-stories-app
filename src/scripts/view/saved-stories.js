import { getAllSavedStories, deleteStory } from "../utils/database.js";

export default class SavedStoriesPage {
  constructor() {
    this.container = null;
  }

  async render() {
    return `
      <section class="container saved-stories">
        <h1>Saved Stories</h1>
        <div id="empty-saved-stories" style="display: none;">
          <p>You don't have any saved stories yet.</p>
        </div>
        <div id="saved-stories-container" class="stories-grid">
          Loading saved stories...
        </div>
      </section>
    `;
  }

  async afterRender() {
    try {
      // Get all saved stories from IndexedDB
      const savedStories = await getAllSavedStories();
      const storiesContainer = document.getElementById(
        "saved-stories-container"
      );
      const emptyContainer = document.getElementById("empty-saved-stories");

      // Check if there are any saved stories
      if (savedStories && savedStories.length > 0) {
        // Sort stories by createdAt (newest first)
        savedStories.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Generate HTML for saved stories
        const storiesHTML = savedStories
          .map((story) => this._generateStoryCard(story))
          .join("");
        storiesContainer.innerHTML = storiesHTML;

        // Add event listeners to delete buttons
        this._addDeleteEventListeners();
      } else {
        // Show empty message if no saved stories
        storiesContainer.innerHTML = "";
        emptyContainer.style.display = "block";
      }
    } catch (error) {
      console.error("Error loading saved stories:", error);
      document.getElementById("saved-stories-container").innerHTML =
        "<p>Error loading saved stories. Please try again.</p>";
    }
  }

  // Generate HTML for a story card
  _generateStoryCard(story) {
    return `
      <div class="story-card" data-id="${story.id}">
        <img class="story-image" src="${story.photoUrl}" alt="Story Image by ${
      story.name
    }" loading="lazy" />
        <div class="story-content">
          <h2>${story.name}</h2>
          <p>${story.description}</p>
          <p>Created at: ${new Date(story.createdAt).toLocaleString()}</p>
          <div class="story-actions">
            <button class="delete-story-btn btn btn-danger" data-id="${
              story.id
            }" aria-label="Delete ${story.name}'s story">
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Add event listeners to delete buttons
  _addDeleteEventListeners() {
    const deleteButtons = document.querySelectorAll(".delete-story-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.preventDefault();

        // Get story ID from button data attribute
        const storyId = button.getAttribute("data-id");

        // Confirm before deleting
        if (confirm("Are you sure you want to delete this saved story?")) {
          try {
            // Delete story from IndexedDB
            await deleteStory(storyId);

            // Remove the story card from the UI
            const storyCard = document.querySelector(
              `.story-card[data-id="${storyId}"]`
            );
            if (storyCard) {
              storyCard.remove();
            }

            // Show success message
            this._showToast("Story deleted successfully");

            // Check if there are any stories left
            const remainingStories = document.querySelectorAll(".story-card");
            if (remainingStories.length === 0) {
              document.getElementById("empty-saved-stories").style.display =
                "block";
            }
          } catch (error) {
            console.error("Error deleting story:", error);
            this._showToast("Error deleting story. Please try again.");
          }
        }
      });
    });
  }

  // Show a toast notification
  _showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
}
