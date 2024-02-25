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

  @tracked src;
  @tracked disabledTools = false;
  constructor(owner, args) {
    super(owner, args);

    if (this.args.data.tool == 'none' || !this.args.data.tool) return;

    if (cache_img[this.args.data.tool])
      this.src = cache_img[this.args.data.tool];
    else this.src = `/img/tools/${this.args.data.tool}.gif`;

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

  get final_count() {
    const { data, multy } = this.args;
    const mult_count = this.mult(data.count, multy || 1);
    const orig_count = data.count;
    if (mult_count == orig_count) {
      return orig_count;
    } else {
      return `${mult_count}/${orig_count}`;
    }
  }

  @action
  mult(a, b) {
    const result = a * b;
    return result.toString().split('.').length == 1
      ? result
      : result.toFixed(2);
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
