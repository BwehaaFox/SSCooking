/* eslint-env node */
'use strict';

const Plugin = require('broccoli-plugin');
const MergeTrees = require('broccoli-merge-trees');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const frontmatter = require('front-matter');
const BroccoliFilter = require('broccoli-persistent-filter');

const MD5 = function (string) {
  function RotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }

  function AddUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = lX & 0x80000000;
    lY8 = lY & 0x80000000;
    lX4 = lX & 0x40000000;
    lY4 = lY & 0x40000000;
    lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) {
      return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      } else {
        return lResult ^ 0x40000000 ^ lX8 ^ lY8;
      }
    } else {
      return lResult ^ lX8 ^ lY8;
    }
  }

  function F(x, y, z) {
    return (x & y) | (~x & z);
  }
  function G(x, y, z) {
    return (x & z) | (y & ~z);
  }
  function H(x, y, z) {
    return x ^ y ^ z;
  }
  function I(x, y, z) {
    return y ^ (x | ~z);
  }

  function FF(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function GG(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function HH(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function II(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function ConvertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWords_temp1 = lMessageLength + 8;
    var lNumberOfWords_temp2 =
      (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    var lWordArray = Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] =
        lWordArray[lWordCount] |
        (string.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function WordToHex(lValue) {
    var WordToHexValue = '',
      WordToHexValue_temp = '',
      lByte,
      lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = '0' + lByte.toString(16);
      WordToHexValue =
        WordToHexValue +
        WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }

  function Utf8Encode(string) {
    string = string.replace(/\r\n/g, '\n');
    var utftext = '';

    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  }

  var x = Array();
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22;
  var S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20;
  var S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23;
  var S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21;

  string = Utf8Encode(string);

  x = ConvertToWordArray(string);

  a = 0x67452301;
  b = 0xefcdab89;
  c = 0x98badcfe;
  d = 0x10325476;

  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }

  var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

  return temp.toLowerCase();
};

function getHash(s) {
  for (var i = 0, h = 9; i < s.length; )
    h = Math.imul(h ^ s.charCodeAt(i++), 9 ** 9);
  return h ^ (h >>> 9);
}

function getHashedName(name, mod) {
  let hashMod = getHash(mod).toString().replace('-', '_');
  let prefix = hashMod.substring(0, hashMod.length / 2);
  let postfix = hashMod.substring(hashMod.length / 2);
  return `_${prefix}_${name}_${postfix}`;
}

let hash_keys = {};

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

    // return null;
  }

  baseDir() {
    return __dirname;
  }

  processString(contents, relativePath) {
    let reg = /&css_module/gi;
    let path = relativePath
      .replace('SSCooking/', '')
      .replace(/\/(index|component|template)/, '')
      .replace('.js', '');

    if (hash_keys[path] && contents.search(reg) >= 0) {
      contents = contents.replace(reg, hash_keys[path]);
    }

    return contents;
  }
}

class ModifyStyleModuleResolver extends Plugin {
  constructor(inputNodes, options, prefix) {
    super(...arguments);
    options = options || {};
    // Plugin.call(this, inputNodes, options);
    this.options = options;
    this.modulePrefix = prefix;
  }

  readDirectory(srcPath, allFiles) {
    let files = fs.readdirSync(srcPath);

    return Array.prototype.reduce.call(
      files,
      (tree, file) => {
        let entry,
          fileExt = path.extname(file),
          fileName = file.replace(/\.[^/.]+$/, ''),
          relativePath = this.relativePath(path.join(srcPath, fileName)),
          isDirectory = fs.lstatSync(path.join(srcPath, file)).isDirectory();

        if (!isDirectory && fileExt !== '.scss') {
          return [...tree];
        }

        let index;

        let existingTreeNode = Array.prototype.find.call(tree, (file, i) => {
          index = i;
          return file.path === relativePath;
        });

        if (existingTreeNode) {
          entry = existingTreeNode;
        } else {
          entry = { path: relativePath };
        }

        if (isDirectory) {
          entry.children = this.readDirectory(
            path.join(srcPath, file),
            allFiles
          );
        } else {
          let content = fs.readFileSync(path.join(srcPath, file), {
            encoding: 'utf8',
          });
          content = frontmatter(content);
          entry.content = content.body;
          entry.attributes = content.attributes;
          allFiles.push(entry);
        }

        if (existingTreeNode) {
          tree[index] = entry;
        }

        return existingTreeNode ? [...tree] : [...tree, entry];
      },
      []
    );
  }

  relativePath = function (srcDir) {
    let relPath = srcDir.replace(this.options.basePath, '');
    return relPath.replace(/^\/|\/$/g, '');
  };

  endsWith(value, searchString, position) {
    var subjectString = value.toString();
    if (position === undefined || position > subjectString.length) {
      position = subjectString.length;
    }
    position -= searchString.length;
    var lastIndex = subjectString.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
  }

  build() {
    let output_path = path.join(this.options.basePath, this.options.outputFile),
      mdFileExist = fs.existsSync(output_path),
      existing_hash,
      existing_file_content,
      output = { files: [] };

    if (mdFileExist) {
      existing_file_content = fs.readFileSync(output_path, 'utf8');
      existing_hash = existing_file_content.match(
        new RegExp(/\/\/ hash ([a-zA-Z0-9]*)/)
      )[1];
    }

    output.trees = Array.prototype.reduce.call(
      this._inputNodes,
      (trees, srcDir) => {
        trees[this.relativePath(srcDir)] = this.readDirectory(
          srcDir,
          output.files
        );
        return trees;
      },
      {}
    );

    // Проходим по всем путям файла и фиксим непраивльные слеши
    for (let i = 0; i < output.files.length; i++) {
      let file = output.files[i];
      file.path = file.path.replace(/^\\/, '').replace(/\\/gi, '/');
    }

    let outputBuffer = '';
    hash_keys = {};
    for (let i = 0; i < output.files.length; i++) {
      if (
        this.endsWith(output.files[i].path, 'index') ||
        this.endsWith(output.files[i].path, 'style') ||
        output.files[i].path.indexOf('components/') == 0
      ) {
        let path = output.files[i].path.replace(/\/(index|style)$/, '');

        let short_name = output.files[i].path.split('/'),
          reg_custom = new RegExp(/:module\(([^)]*)\)/);
        if (output.files[i].path.indexOf('components/') == 0) {
          short_name = short_name[short_name.length - 1];
        } else {
          short_name = short_name[short_name.length - 2];
        }

        if (reg_custom.test(output.files[i].content)) {
          let custom_name = output.files[i].content.match(reg_custom)[1];
          if (custom_name) {
            short_name = custom_name;
          }
          output.files[i].content = output.files[i].content.replace(
            reg_custom,
            '&'
          );
        }

        hash_keys[path] = getHashedName(short_name, path);

        outputBuffer += `
        .${hash_keys[path]} {
          $module: ".${hash_keys[path]}";
          ${output.files[i].content}
        }`;
      }
    }

    let buffer = MD5(outputBuffer);

    if (existing_hash == buffer) {
      return;
    }

    outputBuffer = `// hash ${buffer}
    ${outputBuffer}`;

    mkdirp.sync(
      path.join(this.options.basePath, path.dirname(this.options.outputFile))
    );
    fs.writeFileSync(
      path.join(this.options.basePath, this.options.outputFile),
      outputBuffer
    );
  }
}

module.exports = {
  name: 'simple-scss-modules',

  included(app) {
    this.addonConfig = this.getAddonConfig(app);
    this.testAppPath = this.getTestAppPath();
    this.is_created = false;
    return this._super.included.apply(this, arguments);
  },

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

  preprocessTree(type, tree) {
    let config = require(this.project.root + '/config/environment.js')();
    if (!this.is_created) {
      let folders = Object.keys(this.addonConfig.folders || {}).reduce(
        (folders, key) => {
          return [...folders, this.addonConfig.folders[key]];
        },
        []
      );

      let mdPaths = folders.reduce((paths, folder) => {
        let folderPathSegments = folder.split('/'),
          folderPath = path.join(
            this.app.project.root,
            this.testAppPath,
            ...folderPathSegments
          ),
          folderExists = fs.existsSync(folderPath);

        return folderExists ? [...paths, folderPath] : [...paths];
      }, []);

      if (mdPaths.length > 0) {
        let mdFiles = new ModifyStyleModuleResolver(
          mdPaths,
          {
            basePath: path.join(this.app.project.root, '/app'),
            outputFile: 'styles/_simple-modules.scss',
            trimExtensions: true,
          },
          config.modulePrefix
        );
        tree = new MergeTrees([tree, mdFiles]);
      }
      this.is_created = true;
    }
    return tree;
  },

  getAddonConfig(app) {
    return this.app.project.config(app.env)[this.name] || {};
  },

  getTestAppPath() {
    let configPath = this.app.options.configPath;
    return typeof configPath === 'string' || configPath instanceof String
      ? './tests/dummy'
      : '';
  },
};
