import { registerUser } from "../model/api.js";

export default class RegisterPresenter {
  constructor(view) {
    this.view = view;
  }

  async register(name, email, password) {
    try {
      const response = await registerUser(name, email, password);
      
      if (response.error) {
        this.view.showErrorMessage(response.message);
      } else {
        this.view.showSuccessMessage("Registration successful!");
        this.view.redirectToLogin();
      }
      
      return response;
    } catch (error) {
      console.error("Error during registration:", error);
      this.view.showErrorMessage("Something went wrong. Please try again.");
      return { error: true, message: "Something went wrong. Please try again." };
    }
  }
} 