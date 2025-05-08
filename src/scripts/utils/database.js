const DATABASE_NAME = "daily-stories-db";
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = "stories";

// Open the IndexedDB database
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onerror = (event) => {
      reject("Database error: " + event.target.errorCode);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object store with auto-increment id
      if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
        const objectStore = db.createObjectStore(OBJECT_STORE_NAME, {
          keyPath: "id",
        });

        // Create indexes
        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
};

// Save a story to IndexedDB
const saveStory = async (story) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = transaction.objectStore(OBJECT_STORE_NAME);
      const request = store.put(story);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = (error) => {
        reject(`Error saving story: ${error.target.errorCode}`);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Error in saveStory:", error);
    return false;
  }
};

// Get all saved stories from IndexedDB
const getAllSavedStories = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(OBJECT_STORE_NAME, "readonly");
      const store = transaction.objectStore(OBJECT_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (error) => {
        reject(`Error getting stories: ${error.target.errorCode}`);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Error in getAllSavedStories:", error);
    return [];
  }
};

// Delete a story from IndexedDB
const deleteStory = async (storyId) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = transaction.objectStore(OBJECT_STORE_NAME);
      const request = store.delete(storyId);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = (error) => {
        reject(`Error deleting story: ${error.target.errorCode}`);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Error in deleteStory:", error);
    return false;
  }
};

// Check if a story is saved
const isStorySaved = async (storyId) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(OBJECT_STORE_NAME, "readonly");
      const store = transaction.objectStore(OBJECT_STORE_NAME);
      const request = store.get(storyId);

      request.onsuccess = (event) => {
        resolve(!!event.target.result);
      };

      request.onerror = (error) => {
        reject(`Error checking saved story: ${error.target.errorCode}`);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Error in isStorySaved:", error);
    return false;
  }
};

export { saveStory, getAllSavedStories, deleteStory, isStorySaved };
