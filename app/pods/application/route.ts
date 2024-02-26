import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RecepieService from 'sscooking/services/recepies';

export default class ApplicationRoute extends Route {
  @service recepies!: RecepieService;
  @service router;
  async model(param, transition) {
    await this.recepies.initialize();

    if (transition.to.name == 'index') {
      this.router.transitionTo('recepies', 'cook');
    }
  }
}
