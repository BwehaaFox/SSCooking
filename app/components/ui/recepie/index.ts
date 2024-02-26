import RecepieService from 'sscooking/services/recepies';
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

  @tracked openIngridient = false;
  @tracked openEffect = false;
  @tracked openDescription = false;

  @action
  toggleSpoiler(name, state) {
    this[name] = state == undefined ? !this[name] : state;
  }

  get is_empty_content() {
    const { ingredients, description, effects } = this.args.data;
    return !ingredients?.length && !description && !effects?.length;
  }

  constructor(owner, args) {
    super(owner, args);

    if (this.args.init_open_ingridient !== undefined) {
      this.openIngridient = this.args.init_open_ingridient;
    }

    if (this.args.init_open_effect !== undefined) {
      this.openEffect = this.args.init_open_effect;
    }

    if (this.args.init_open_description !== undefined) {
      this.openDescription = this.args.init_open_description;
    }

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
  updateToggle(
    e,
    [init_open_ingridient, init_open_effect, init_open_description]
  ) {
    if (this.openIngridient !== init_open_ingridient)
      this.openIngridient = init_open_ingridient;
    if (this.openEffect !== init_open_effect)
      this.openEffect = init_open_effect;
    if (this.openDescription !== init_open_description)
      this.openDescription = init_open_description;
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
    this.recepies.deleteRecepie(this.args.data.id, this.recepies.data_name);
  }
}
