import RecepieService from 'sscooking/services/recepies';
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

function download(strData, strFileName, strMimeType) {
  var D = document,
    A = arguments,
    a = D.createElement('a'),
    d = A[0],
    n = A[1],
    t = A[2] || 'text/plain';

  //build download link:
  a.href = 'data:' + strMimeType + 'charset=utf-8,' + encodeURI(strData);

  if (window.MSBlobBuilder) {
    // IE10
    var bb = new MSBlobBuilder();
    bb.append(strData);
    return navigator.msSaveBlob(bb, strFileName);
  } /* end if(window.MSBlobBuilder) */

  if ('download' in a) {
    //FF20, CH19
    a.setAttribute('download', n);
    a.innerHTML = 'downloading...';
    D.body.appendChild(a);
    setTimeout(function () {
      var e = D.createEvent('MouseEvents');
      e.initMouseEvent(
        'click',
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      );
      a.dispatchEvent(e);
      D.body.removeChild(a);
    }, 66);
    return true;
  } /* end if('download' in a) */

  //do iframe dataURL download: (older W3)
  var f = D.createElement('iframe');
  D.body.appendChild(f);
  f.src =
    'data:' +
    (A[2] ? A[2] : 'application/octet-stream') +
    (window.btoa ? ';base64' : '') +
    ',' +
    (window.btoa ? window.btoa : escape)(strData);
  setTimeout(function () {
    D.body.removeChild(f);
  }, 333);
  return true;
}

export default class SystemService extends Service {
  @service recepies!: RecepieService;

  @action
  downloadActualData() {
    download(
      JSON.stringify(this.recepies.recepie_data),
      'recepies.json',
      'text/plain'
    );
  }

  @action
  parseBB(text) {
    const code_map = {
      b: ['b'],
      i: ['i'],
      positive: ['span', 'class="bb-code_positive"'],
      negative: ['span', 'class="bb-code_negative"'],
      neutral: ['span', 'class="bb-code_neutral"'],
      center: ['div', 'class="bb-code_center"'],
      right: ['div', 'class="bb-code_right"'],
    };

    const parseCode = (name: keyof typeof code_map, text: string) => {
      return text
        .replace(`[${name}]`, `<${code_map[name][0]} ${code_map[name][1]}>`)
        .replace(`[\/${name}]`, `<\/${code_map[name][0]}>`);
    };
    return Object.keys(code_map).reduce(
      (reducer: string, key: keyof typeof code_map) => {
        return (reducer = parseCode(key, reducer));
      },
      text
    );
  }
}
