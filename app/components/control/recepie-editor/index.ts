import { RecepieTreeItem } from './../../../services/recepies';
import RecepieService from 'sscooking/services/recepies';
import { Recepie } from '../../../services/recepies';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { set } from '@ember/object';

interface Args {
  data?: Recepie;
}

export default class RecepieEditorComponent extends Component<Args> {
  @service router;
  @service recepies!: RecepieService;

  tool_list = [
    'beaker',
    'grinder',
    'rolling_pin',
    'kitchen_knife',
    'microwave',
    'none',
  ];

  @tracked recepie = {
    count: 1,
  } as Recepie;
  @tracked ingridients;
  @tracked effects: string[];

  constructor(owner, args: Args) {
    super(owner, args);
    if (args.data) {
      this.recepie = { ...args.data };
      this.recepie.ingredients = args.data.ingredients
        ? args.data.ingredients
        : [];
      this.recepie.effects = args.data.effects ? args.data.effects : [];
      this.ingridients = this.recepie.ingredients;
      this.effects = this.recepie.effects;
    } else {
      this.ingridients = [];
      this.effects = [];
    }
    if (!this.recepie.tool) {
      set(this.recepie, 'tool', 'none');
    }
    this.setDefaultGroup();
  }

  get has_ingridients() {
    return this.recepies.recepie_data[this.recepies.data_name]?.length;
  }

  get ingridients_list() {
    return this.recepies.recepie_data[this.recepies.data_name] || [];
  }

  @action
  addIngridient() {
    this.ingridients.push({
      id: this.recepies.recepie_data[this.recepies.data_name]?.[0].id,
      count: 1,
    });
    this.ingridients = this.ingridients;
  }

  @action
  addEffect() {
    this.effects.push('');
    this.effects = this.effects;
  }

  @action
  removeIngridient(index) {
    this.ingridients.splice(index, 1);
    this.ingridients = this.ingridients;
  }

  @action
  removeEffect(index) {
    this.effects.splice(index, 1);
    this.effects = [...this.effects];
  }

  @action
  setDefaultGroup() {
    if (!this.recepie.group) {
      set(this.recepie, 'group', this.recepies.recepies_groups[0]);
    }
  }

  @action
  back() {
    this.router.transitionTo('recepies');
  }

  @action
  setRecepieValue(name, val) {
    console.log(...arguments);
    if (val !== undefined) {
      set(this.recepie, name, val);
    } else {
      delete this.recepie[name];
    }

    console.log(this.recepie);
  }

  @action
  setIngridientValue(name, index, val) {
    if (val !== undefined) {
      set(this.ingridients[index], name, val);
    } else {
      delete this.ingridients[index][name];
    }

    console.log(this.ingridients);
  }

  @action
  setEffectValue(index, val) {
    this.effects[index] = val;

    console.log(this.ingridients);
  }

  @action
  onSave() {
    if (!this.recepie.id) {
      if (this.recepie.name) {
        this.recepie.id = this.recepie.name.toLowerCase().replace(/ /gi, '_');
      } else {
        return;
      }
    }
    if (
      this.recepies.recepie_data[this.recepies.data_name]?.find(
        (r) => r.id == this.recepie.id
      ) &&
      !this.args.canSaveDublicate
    )
      return;

    this.recepie.ingredients = this.ingridients;
    this.recepie.effects = this.effects;
    this.args.onSave?.({ ...this.recepie });
    this.back();
  }
}
