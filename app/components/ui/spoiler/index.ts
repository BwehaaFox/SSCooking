import { RecepieTreeItem } from './../../../services/recepies';
import RecepieService from 'sscooking/services/recepies';
import { Recepie } from '../../../services/recepies';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

interface Args {
  data: Recepie;
}

export default class SpoilerComponent extends Component<Args> {
  @tracked is_open;

  constructor(owner, args) {
    super(owner, args);
    this.is_open = args.is_open_init !== undefined ? args.is_open_init : false;
  }

  @action
  toggle() {
    this.is_open = !this.is_open;
  }
}
