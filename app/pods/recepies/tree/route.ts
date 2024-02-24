import Route from '@ember/routing/route';
export default class RecepiesTreeRoute extends Route {
  model({ id }) {
    return id;
  }
}
