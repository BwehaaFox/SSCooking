import RecepieService from 'worols-client/services/recepies';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class RecepiesEditRoute extends Route {
  @service recepies!: RecepieService;
  @service router;

  model({ id }, transition) {
    if (!this.recepies.getRecepie(id)) {
      transition.abort();
      this.router.transitionTo('recepies');
      return;
    }
    return id;
  }
}
