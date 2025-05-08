import RegisterPresenter from "../presenter/RegisterPresenter.js";

// Register Page Class
export default class RegisterPage {
  constructor() {
    this.presenter = new RegisterPresenter(this);
  }

  async render() {
    return `
      <section class="container">
        <h1>Register Page</h1>
        <br/>
        <form id="register-form">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" required />

          <label for="email">Email</label>
          <input type="email" id="email" name="email" required />

          <label for="password">Password</label>
          <input type="password" id="password" name="password" required />

          <button type="submit">Register</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById("register-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = form.name.value;
      const email = form.email.value;
      const password = form.password.value;

      await this.presenter.register(name, email, password);
    });
  }

  showErrorMessage(message) {
    alert(message);
  }

  showSuccessMessage(message) {
    alert(message);
  }

  redirectToLogin() {
    // Redirect to login page
    window.location.hash = "#/login";
  }
}
