import SystemService from 'sscooking/services/system';
import { setHelperManager } from '@ember/helper';
import {
  SimpleGetterManager,
  SimpleGetterHelper,
} from 'sscooking/tools/simple-getter';
import { inject as service } from '@ember/service';

import { htmlSafe } from '@ember/template';

export default class ParseBBHelper extends SimpleGetterHelper {
  @service system!: SystemService;

  get([text]) {
    return htmlSafe(this.system.parseBB(text));
  }
}

setHelperManager((owner) => new SimpleGetterManager(owner), ParseBBHelper);
