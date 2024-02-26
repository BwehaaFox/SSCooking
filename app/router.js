import EmberRouter from '@ember/routing/router';
import config from 'sscooking/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('index', { path: '/' });
  this.route('recepies', { path: '/recepies/:type' }, function () {
    this.route('tree', { path: '/:id' });
    this.route('edit', { path: '/edit/:id' });
    this.route('create');
    this.route('import');
  });
});
