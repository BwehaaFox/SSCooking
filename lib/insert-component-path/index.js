'use strict';

const path = require('path');
const BroccoliFilter = require('broccoli-persistent-filter');

function getPath(path, modulePrefix, podModulePrefix) {
  let file_type = '.js',
    pod_component_file_name = 'component' + file_type,
    component_prefix = modulePrefix + '/components/';
  // index_file = '/index' + file_type;
  if (
    path.indexOf(podModulePrefix) === 0 &&
    path.indexOf(pod_component_file_name) ===
      path.length - pod_component_file_name.length
  ) {
    return path
      .replace(podModulePrefix + '/', '')
      .replace('/' + pod_component_file_name, '');
  }

  if (path.indexOf(component_prefix) === 0) {
    path = path.replace(component_prefix, '');
    //return path.replace(path.indexOf(index_file) > 0 ? index_file : file_type, '');
    return path.replace(/\/[a-z-]+\.js$/, '');
  } else {
    path = path.replace(component_prefix, '');
    return path.replace(/\/[a-z-]+\.js$/, '');
  }
}

class TemplateImportProcessor extends BroccoliFilter {
  constructor(inputNode, options = {}) {
    super(inputNode, {
      annotation: options.annotation,
      persist: options.persist,
    });

    this.options = options;
    this._console = this.options.console || console;

    this.extensions = ['js', 'javascript'];
    this.targetExtension = 'js';
    this.modulePrefix = options.modulePrefix;
    this.podModulePrefix = options.podModulePrefix;
  }

  getDestFilePath(relativePath) {
    let file_type = '.js';

    if (
      relativePath.indexOf(file_type) ===
      relativePath.length - file_type.length
    ) {
      if (
        (relativePath.indexOf(this.modulePrefix + '/components') === 0 ||
          relativePath.indexOf(this.modulePrefix + '/pods') === 0) &&
        relativePath.indexOf(file_type) ==
          relativePath.length - file_type.length
      ) {
        return relativePath;
      }
    }

    return null;
  }

  baseDir() {
    return __dirname;
  }

  processString(contents, relativePath) {
    let reg = /(['"])&component_path/gi;
    if (contents.search(reg) >= 0) {
      contents = contents.replace(
        reg,
        '$1' + getPath(relativePath, this.modulePrefix, this.podModulePrefix)
      );
    }

    return contents;
  }
}

module.exports = {
  name: require('./package').name,

  setupPreprocessorRegistry(type, registry) {
    let config = require(this.project.root + '/config/environment.js')();
    let paths = path.join(this.project.root, 'app', 'components');

    registry.add('js', {
      name: require('./package').name,
      ext: 'js',
      toTree: (tree) => {
        tree = new TemplateImportProcessor(tree, {
          root: paths,
          modulePrefix: config.modulePrefix,
          podModulePrefix: config.podModulePrefix,
        });
        return tree;
      },
    });
  },
};
