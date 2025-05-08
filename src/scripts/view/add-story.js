import AddStoryPresenter from '../presenter/AddStoryPresenter.js';
import AddStoryView from './AddStoryView.js';
import StoryModel from '../model/StoryModel.js';

export default class AddStoryPage {
  constructor() {
    this.view = new AddStoryView();
    this.model = new StoryModel();
    this.presenter = new AddStoryPresenter({
      view: this.view,
      model: this.model,
    });
  }

  async render() {
    return this.presenter.render();
  }

  async afterRender() {
    await this.presenter.afterRender();
  }
}
