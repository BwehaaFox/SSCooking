import RecepieService from 'sscooking/services/recepies';
import { Recepie } from './../../../services/recepies';
import Controller from '@ember/controller';
import { action } from '@ember/object';

import { inject as service } from '@ember/service';

export default class RecepiesCreateController extends Controller {
  @service router;
  @service recepies!: RecepieService;

  @action
  back() {
    this.router.transitionTo('recepies');
  }

  @action
  onSaveRecepie(recepie: Recepie) {
    this.recepies.createRecepie(recepie, this.recepies.data_name);
  }
}
