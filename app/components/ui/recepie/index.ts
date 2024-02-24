import RecepieService from 'worols-client/services/recepies';
import { Recepie } from '../../../services/recepies';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

interface Args {
  data: Recepie;
}

const cache_img = {};

export default class RecepieComponent extends Component<Args> {
  @service recepies!: RecepieService;
  @service router;

  @tracked src = `/img/tools/${this.args.data.tool}.gif`;
  @tracked disabledTools = false;
  constructor(owner, args) {
    super(owner, args);

    if (cache_img[this.args.data.tool])
      this.src = cache_img[this.args.data.tool];

    let d = document.createElement('img');
    d.src = this.src;
    d.onload = () => {
      cache_img[this.args.data.tool] = d.src;
    };

    d.onerror = () => {
      this.src = `/img/tools/${this.args.data.tool}.png`;
      let b = document.createElement('img');
      b.src = this.src;
      b.onload = () => {
        cache_img[this.args.data.tool] = b.src;
      };
      b.onerror = () => {
        this.disabledTools = true;
      };
    };
  }

  @action
  mult(a, b) {
    return a * b;
  }

  @action
  edit() {
    this.router.transitionTo('recepies.edit', this.args.data.id);
  }

  @action
  delete() {
    this.recepies.deleteRecepie(this.args.data.id);
  }
}
