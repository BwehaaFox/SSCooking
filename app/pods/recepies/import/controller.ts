import RecepieService from 'worols-client/services/recepies';
import { Recepie } from './../../../services/recepies';
import Controller from '@ember/controller';
import { action } from '@ember/object';

import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class RecepiesImportController extends Controller {
  @service router;
  @service recepies!: RecepieService;

  @tracked import_mode;

  @tracked import_data;

  get options() {
    return [
      {
        id: 0,
        name: 'Заменить',
      },
      {
        id: 1,
        name: 'Совместить',
      },
    ];
  }

  @action
  back() {
    this.router.transitionTo('recepies');
  }

  @action
  startImport() {
    try {
      let data = JSON.parse(this.import_data);
      this.recepies.import(data.cook);
    } catch (e) {
      console.log(this.import_data, this.import_mode);
    }
  }

  @action
  setMode(option) {
    this.import_mode = this.options.find((r) => r.id == option);
  }
}
