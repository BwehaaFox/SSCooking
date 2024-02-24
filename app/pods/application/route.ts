import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RecepieService from 'sscooking/services/recepies';

export default class ApplicationRoute extends Route {
  @service recepies!: RecepieService;
  async model() {
    await this.recepies.initialize();
  }
}
