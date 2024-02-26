import RecepieService from 'sscooking/services/recepies';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service recepies!: RecepieService;

  model({ type }) {
    this.recepies.data_name = type;
  }
}
