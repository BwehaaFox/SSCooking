import Controller from '@ember/controller';
import { action } from '@ember/object';

import { inject as service } from '@ember/service';

export default class RecepiesTreeController extends Controller {
  @service router;

  @action
  back() {
    this.router.transitionTo('recepies');
  }
}
