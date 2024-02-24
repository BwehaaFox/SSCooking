'use strict';

let enabled_helpers = ['array/toggle', 'set'];

/**
 * Предобразует первый аргумент хэлпера из вида {{helper this.field}} в {{helper this 'field'}}
 *
 * Аналогичное поведение хэлпера ember-set-helper (https://github.com/pzuraq/ember-set-helper)
 */
function convertForSet({ syntax }) {
  let b = syntax.builders;
  function transformNode(node) {
    if (enabled_helpers.indexOf(node.path.original) >= 0) {
      if (!node.params[0] || node.params[0].type !== 'PathExpression') {
        throw new Error(
          'Хэлпер (' +
            node.path.original +
            ') требует, чтобы путь был передан в качестве первого параметра, полученного: ' +
            path.original
        );
      }

      let path = node.params.shift(),
        key = '';

      if (path.parts.length > 1 || path.this === true) {
        path.original = path.original.substr(0, path.original.lastIndexOf('.'));
        key = path.parts.pop();
      }

      node.params.unshift(path, b.string(key));
    }
  }

  return {
    visitor: {
      SubExpression: transformNode,
      MustacheStatement: transformNode
    }
  };
}

module.exports = {
  name: require('./package').name,

  setupPreprocessorRegistry(type, registry) {
    const plugin = this._buildPlugin();

    plugin.parallelBabel = {
      requireFile: __filename,
      buildUsing: '_buildPlugin',
      params: {}
    };

    registry.add('htmlbars-ast-plugin', plugin);
  },

  _buildPlugin() {
    return {
      name: 'array-toggle-transform',
      plugin: convertForSet,

      baseDir() {
        return __dirname;
      }
    };
  }
};
