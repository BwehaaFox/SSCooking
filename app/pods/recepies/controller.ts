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

  constructor(owner) {
    super(owner);
    this.recepies.initialize();
  }

  get grouped_items() {
    let out = {};
    this.recepies.recepies_list.forEach((value) => {
      if (!out[value.group]) out[value.group] = [];
      out[value.group].push(value);
    });
    return out;
  }

  get searched_items() {
    if (!this.search) return this.recepies.recepies_list;
    return this.recepies.recepies_list.filter(
      (r) =>
        r.id?.toLocaleLowerCase().includes(this.search.toLocaleLowerCase()) ||
        r.name?.toLocaleLowerCase().includes(this.search.toLocaleLowerCase()) ||
        r.locale?.toLocaleLowerCase().includes(this.search.toLocaleLowerCase())
    );
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
