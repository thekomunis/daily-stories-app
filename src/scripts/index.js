// CSS imports
import "../styles/styles.css"; // Importing global styles
import "../styles/leaflet.css"; // Importing global styles
import "@fortawesome/fontawesome-free/css/all.min.css";
import routes from "./routes/routes.js";
import { getActiveRoute as parseActiveUrlWithCombiner } from "./routes/url-parser.js";
import {
  subscribeToPushNotification,
  checkSubscription,
  unsubscribeFromPushNotification,
} from "./utils/notification-helper.js";

class App {
  constructor({ content, drawerButton, navigationDrawer } = {}) {
    this.content = content || document.querySelector("#main-content");
    this.drawerButton =
      drawerButton || document.querySelector("#drawer-button");
    this.navigationDrawer =
      navigationDrawer || document.querySelector("#navigation-drawer");
    this._registerEvents();
  }

  _registerEvents() {
    window.addEventListener("hashchange", async () => {
      await this.renderPage();
    });

    // Handle push notification button
    const pushButton = document.getElementById("pushNotificationBtn");
    if (pushButton) {
      pushButton.addEventListener("click", async () => {
        await this.handlePushNotification();
      });
    }

    // Handle unsubscribe notification button
    const unsubscribeButton = document.getElementById(
      "unsubscribeNotificationBtn"
    );
    if (unsubscribeButton) {
      unsubscribeButton.addEventListener("click", async () => {
        await this.handleUnsubscribeNotification();
      });
    }

    // Update push notification button state
    this.updatePushButtonState();
  }

  async updatePushButtonState() {
    const pushButton = document.getElementById("pushNotificationBtn");
    const unsubscribeButton = document.getElementById(
      "unsubscribeNotificationBtn"
    );
    if (!pushButton || !unsubscribeButton) return;

    const subscriptionStatus = await checkSubscription();

    if (subscriptionStatus.error) {
      pushButton.textContent = "Notifications Not Supported";
      pushButton.disabled = true;
      unsubscribeButton.style.display = "none";
      return;
    }

    if (subscriptionStatus.isSubscribed) {
      pushButton.style.display = "none";
      unsubscribeButton.style.display = "inline-block";
    } else {
      pushButton.style.display = "inline-block";
      pushButton.textContent = "Enable Notifications";
      pushButton.classList.remove("btn-success");
      pushButton.classList.add("btn-primary");
      unsubscribeButton.style.display = "none";
    }
  }

  async handlePushNotification() {
    try {
      const result = await subscribeToPushNotification();
      const toast = document.getElementById("toast");

      if (result.error) {
        toast.textContent = result.message;
        toast.style.backgroundColor = "#dc3545"; // Red for error
      } else {
        toast.textContent = result.message;
        toast.style.backgroundColor = "#28a745"; // Green for success
        this.updatePushButtonState();
      }

      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
      }, 3000);
    } catch (error) {
      console.error("Error handling push notification:", error);
    }
  }

  async handleUnsubscribeNotification() {
    try {
      const result = await unsubscribeFromPushNotification();
      const toast = document.getElementById("toast");

      if (result.error) {
        toast.textContent = result.message;
        toast.style.backgroundColor = "#dc3545"; // Red for error
      } else {
        toast.textContent = result.message;
        toast.style.backgroundColor = "#28a745"; // Green for success
        this.updatePushButtonState();
      }

      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
      }, 3000);
    } catch (error) {
      console.error("Error handling unsubscribe notification:", error);
    }
  }

  async renderPage() {
    const url = parseActiveUrlWithCombiner();
    const page = routes[url] || routes["/"];
    this.content.innerHTML = await page.render();
    if (page.afterRender) {
      await page.afterRender();
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  try {
    await app.renderPage();
  } catch (error) {
    console.error("Error rendering page:", error);
  }

  // Event listener untuk perubahan rute saat hash berubah
  window.addEventListener("hashchange", async () => {
    if (document.startViewTransition) {
      const transition = document.startViewTransition(async () => {
        await app.renderPage(); // Render halaman baru dengan transisi
      });
    } else {
      await app.renderPage();
    }
  });

  // Event listener untuk navigasi mundur/maju di browser
  window.addEventListener("popstate", async () => {
    if (document.startViewTransition) {
      const transition = document.startViewTransition(async () => {
        await app.renderPage(); // Render halaman baru dengan transisi
      });
    } else {
      await app.renderPage();
    }
  });

  // Update push notification button state
  app.updatePushButtonState();
});
