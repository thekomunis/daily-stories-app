import LoginPresenter from "../presenter/LoginPresenter.js";

export default class LoginPage {
  constructor() {
    this.presenter = new LoginPresenter(this);
  }

  async render() {
    return `
      <div id="alert" class="alert"></div>
      <section class="container">
        <h1>Login Page</h1>
        <br/>
        <form id="login-form">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required />
          <label for="password">Password</label>
          <input type="password" id="password" name="password" required />
          <button type="submit">Login</button>
        </form>
        <div id="loading" class="loading">Loading...</div> <!-- Loading indicator -->
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById("login-form");
    this.loadingIndicator = document.getElementById("loading");
    this.alertBox = document.getElementById("alert");
    this.mainContent = document.getElementById("main-content");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = form.email.value;
      const password = form.password.value;

      await this.presenter.login(email, password);
    });
  }

  showLoading() {
    this.loadingIndicator.style.display = "block";
  }

  hideLoading() {
    this.loadingIndicator.style.display = "none";
  }

  showAlert(message, isError) {
    this.alertBox.style.display = "block";
    this.alertBox.textContent = message;
    this.alertBox.className = isError ? "alert error" : "alert success";
  }

  hideAlert() {
    this.alertBox.style.display = "none";
  }

  fadeOutContent() {
    this.mainContent.classList.add("fade-out");
  }

  navigateToHome() {
    window.location.hash = "#/";
    this.mainContent.classList.remove("fade-out");
    this.mainContent.classList.add("fade-in");
  }
}
