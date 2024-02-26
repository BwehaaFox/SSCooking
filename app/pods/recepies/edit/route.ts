import RecepieService from 'sscooking/services/recepies';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class RecepiesEditRoute extends Route {
  @service recepies!: RecepieService;
  @service router;

  model({ id }, transition) {
    let type = this.paramsFor('recepies').type;
    if (!this.recepies.getRecepie(id, type)) {
      transition.abort();
      this.router.transitionTo('recepies');
      return;
    }
    return { id, type };
  }
}
