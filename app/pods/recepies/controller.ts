import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import RecepieService from 'sscooking/services/recepies';
import SystemService from 'sscooking/services/system';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  @service recepies!: RecepieService;
  @service system!: SystemService;
  @service router;

  @tracked search = '';
  @tracked search_type;
  @tracked search_group;

  constructor(owner) {
    super(owner);
    this.recepies.initialize();
    this.setSearchType(0);
    this.setSearchGroups(false);
  }
  get optionSearchType() {
    return [
      {
        id: 0,
        name: 'По названию',
      },
      {
        id: 1,
        name: 'По ингридиенту',
      },
      {
        id: 2,
        name: 'По рецепту',
      },
    ];
  }

  get optionSearchGroup() {
    return [
      {
        id: true,
        name: 'Группировать',
      },
      {
        id: false,
        name: 'Не группировать',
      },
    ];
  }

  @action
  setSearchType(option) {
    this.search_type = this.optionSearchType.find((r) => r.id == option)!;
  }

  @action
  setSearchGroups(option) {
    console.log(option);
    this.search_group = this.optionSearchGroup.find((r) => r.id == option);
  }

  get grouped_items() {
    let out = {};
    this.searched_items?.forEach((value) => {
      if (!out[value.group]) out[value.group] = [];
      out[value.group].push(value);
    });
    return out;
  }

  get searched_items() {
    return this.recepies.getSearch(this.search, this.search_type.id);
  }

  @action
  openRecepieTree(id) {
    this.router.transitionTo('recepies.tree', id);
  }

  @action
  create() {
    this.router.transitionTo('recepies.create');
  }

  @action
  import() {
    this.router.transitionTo('recepies.import');
  }

  @action
  getChanges() {
    this.recepies.saveRecepies();
  }
}
