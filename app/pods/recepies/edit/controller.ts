import RecepieService from 'sscooking/services/recepies';
import { Recepie } from './../../../services/recepies';
import Controller from '@ember/controller';
import { action } from '@ember/object';

import { inject as service } from '@ember/service';

export default class RecepiesEditController extends Controller {
  declare model;

  @service router;
  @service recepies!: RecepieService;

  @action
  back() {
    this.router.transitionTo('recepies');
  }

  @action
  onSaveRecepie(recepie: Recepie) {
    this.recepies.replaceRecepie(this.model.type, recepie, this.model.id);
  }
}
