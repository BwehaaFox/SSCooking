import RecepieService from 'worols-client/services/recepies';
import { Recepie } from './../../../services/recepies';
import Controller from '@ember/controller';
import { action } from '@ember/object';

import { inject as service } from '@ember/service';

export default class RecepiesEditController extends Controller {
  @service router;
  @service recepies!: RecepieService;

  @action
  back() {
    this.router.transitionTo('recepies');
  }

  @action
  onSaveRecepie(recepie: Recepie) {
    this.recepies.replaceRecepie(recepie, this.model);
  }
}
