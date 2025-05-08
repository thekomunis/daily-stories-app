import HomePage from "../view/home-page.js"; // HomePage ada di view
import AboutPage from "../view/about-page.js";
import LoginPage from "../view/login-page.js"; // Import LoginPage
import RegisterPage from "../view/register-page.js"; // Import RegisterPage
import AddStoryPage from "../view/add-story.js"; // Perbaiki path ke folder view
import SavedStoriesPage from "../view/saved-stories.js"; // Import SavedStoriesPage

const routes = {
  "/": new HomePage(),
  "/about": new AboutPage(),
  "/login": new LoginPage(), // Tambahkan route LoginPage
  "/register": new RegisterPage(), // Tambahkan route RegisterPage
  "/add-story": new AddStoryPage(), // Route untuk halaman Add Story
  "/saved": new SavedStoriesPage(), // Route untuk halaman Saved Stories
};

export default routes;
