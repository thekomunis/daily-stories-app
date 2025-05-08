import { getAllStories, getStoryDetails, postStory } from './api.js';

class StoryModel {
  async getStories() {
    try {
      const response = await getAllStories();
      if (!response || response.error) {
        return { error: true, message: 'Failed to fetch stories', data: [] };
      }
      return { error: false, data: response.listStory };
    } catch (error) {
      console.error('Error fetching stories:', error);
      return { error: true, message: 'Error fetching stories', data: [] };
    }
  }

  async getStoryById(id) {
    try {
      const response = await getStoryDetails(id);
      if (response.error) {
        return { error: true, message: 'Failed to fetch story details', data: null };
      }
      return { error: false, data: response.story };
    } catch (error) {
      console.error('Error fetching story details:', error);
      return { error: true, message: 'Error fetching story details', data: null };
    }
  }

  async addStory(description, photo, lat, lon) {
    try {
      const response = await postStory(description, photo, lat, lon);
      if (response.error) {
        return { error: true, message: response.message };
      }
      return { error: false, message: 'Story added successfully' };
    } catch (error) {
      console.error('Error adding story:', error);
      return { error: true, message: 'Error adding story' };
    }
  }
}

export default StoryModel; 