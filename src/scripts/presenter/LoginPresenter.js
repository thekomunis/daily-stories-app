import { loginUser } from "../model/api.js";

export default class LoginPresenter {
  constructor(view) {
    this.view = view;
  }

  async login(email, password) {
    this.view.showLoading();
    this.view.hideAlert();
    this.view.fadeOutContent();

    try {
      const loginData = await loginUser(email, password);
      this.view.hideLoading();

      if (loginData.error) {
        this.view.showAlert(loginData.message, true);
      } else {
        this.view.showAlert(loginData.message, false);
        this.view.navigateToHome();
      }
      
      return loginData;
    } catch (error) {
      this.view.hideLoading();
      this.view.showAlert("Invalid email or password. Please try again.", true);
      return { error: true, message: "Invalid email or password. Please try again." };
    }
  }
} 