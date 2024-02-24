import RecepieService from 'worols-client/services/recepies';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RecepiesImportController from './controller';
export default class RecepiesImportRoute extends Route {
  setupController(controller: RecepiesImportController) {
    controller.import_data = {};
    controller.setMode(1);
  }
}
