import SystemService from 'SSCooking/services/system';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import RecepieService from 'sscooking/services/recepies';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  @service recepies!: RecepieService;
  @service system!: SystemService;
  @service router;

  @action
  create() {
    this.router.transitionTo('recepies.create');
  }

  @action
  import() {
    this.router.transitionTo('recepies.import');
  }

  @action
  getChanges() {
    this.system.downloadActualData();
  }
}
