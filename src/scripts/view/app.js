import routes from "../routes/routes"; // Assuming this contains your routes configuration
import { getActiveRoute } from "../routes/url-parser"; // Assuming this helps to get the current route
import { updateNav } from "../navigation.js"; // Import the updateNav function

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #currentRoute = ""; // Track the current route

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  // Fungsi untuk merender halaman dengan transisi menggunakan Animation API
  async renderPage() {
    // Update the navigation on page load
    updateNav();
    const url = getActiveRoute(); // Mendapatkan route yang aktif
    const page = routes[url]; // Mengambil halaman untuk route tersebut

    if (!page) {
      console.error("Page not found!");
      return;
    }

    // Prevent transition if the current route is the same as the previous route
    if (this.#currentRoute === url) {
      return; // Skip animation if already on the same route
    }

    // Update the current route to the new route
    this.#currentRoute = url;

    // Menambahkan efek fade-out dan sliding keluar untuk halaman lama
    const fadeOutAnimation = this.#content.animate(
      [
        { opacity: 1, transform: "translateX(0)" },
        { opacity: 0, transform: "translateX(-100%)" },
      ],
      {
        duration: 500, // Durasi animasi
        easing: "ease-in-out", // Fungsi easing
        fill: "forwards", // Menjaga state akhir
      }
    );

    // Menunggu animasi fade-out selesai
    await fadeOutAnimation.finished;

    // Render halaman baru setelah fade-out
    this.#content.innerHTML = await page.render();
    await page.afterRender();

    // Menambahkan efek fade-in dan sliding untuk halaman baru
    const fadeInAnimation = this.#content.animate(
      [
        { opacity: 0, transform: "translateX(100%)" },
        { opacity: 1, transform: "translateX(0)" },
      ],
      {
        duration: 500, // Durasi animasi
        easing: "ease-in-out", // Fungsi easing
        fill: "forwards", // Menjaga state akhir
      }
    );

    // Menunggu animasi fade-in selesai
    await fadeInAnimation.finished;
  }
}

export default App; 