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

export default class RecepieComponent extends Component<Args> {
  @service recepies!: RecepieService;
  @service router;

  get tree() {
    return this.recepies.getRecepieTree(this.args.recepie_id);
  }

  @action
  back() {
    this.router.transitionTo('recepies');
  }
}
