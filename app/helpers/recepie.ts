import { setHelperManager } from '@ember/helper';
import {
  SimpleGetterManager,
  SimpleGetterHelper,
} from 'sscooking/tools/simple-getter';
import ModalTriggerHelper from './modal-trigger';
import { inject as service } from '@ember/service';
import RecepieService from 'sscooking/services/recepies';

export default class ConfirmActionHelper extends SimpleGetterHelper {
  @service recepies!: RecepieService;

  get([id]) {
    return this.recepies.getRecepie(id);
  }
}

setHelperManager(
  (owner) => new SimpleGetterManager(owner),
  ConfirmActionHelper
);
