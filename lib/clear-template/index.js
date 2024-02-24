'use strict';

const path = require('path');
const BroccoliFilter = require('broccoli-persistent-filter');

class TemplateImportProcessor extends BroccoliFilter {
  getDestFilePath(relativePath) {
    let file_type = '.hbs';

    if (
      relativePath.indexOf(file_type) ===
      relativePath.length - file_type.length
    ) {
      return relativePath;
    }

    return null;
  }

  baseDir() {
    return __dirname;
  }

  processString(contents, relativePath) {
    return contents
      .replace(/\n/gi, ' ')
      .replace(/\s{2}/gi, ' ')
      .replace(/ {2}/gi, ' ')
      .replace(/>[\s]*</gi, '><')
      .replace(/>[\s]*{{/gi, '>{{')
      .replace(/}}[\s]*</gi, '}}<')
      .replace(/\s{2}/gi, ' ');
  }
}

module.exports = {
  name: require('./package').name,

  preprocessTree(type, tree) {
    let config = require(this.project.root + '/config/environment.js')();
    let paths = path.join(this.project.root, 'app', 'components');

    tree = new TemplateImportProcessor(tree, {
      root: paths,
      modulePrefix: config.modulePrefix,
      podModulePrefix: config.podModulePrefix,
    });
    return tree;
  },
};
