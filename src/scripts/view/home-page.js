import HomePresenter from '../presenter/HomePresenter.js';
import HomeView from './HomeView.js';
import StoryModel from '../model/StoryModel.js';

export default class HomePage {
  constructor() {
    this.view = new HomeView();
    this.model = new StoryModel();
    this.presenter = new HomePresenter({
      view: this.view,
      model: this.model,
    });
  }

  async render() {
    await this.presenter.init();
    return this.presenter.render();
  }

  async afterRender() {
    await this.presenter.afterRender();
  }
}
