import { RecepieTreeItem } from './../../../services/recepies';
import RecepieService from 'sscooking/services/recepies';
import { Recepie } from '../../../services/recepies';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

interface Args {
  value?: string;
  onInput;
  onChange;
}

export default class SelectFieldComponent extends Component<Args> {
  @tracked open_select = false;
  @tracked search = '';

  @tracked value;

  constructor(owner, args) {
    super(owner, args);
    this.value = this.args.value;
  }

  @action
  registerSelect(e) {
    document.addEventListener('click', (ev) => {
      if (this.open_select) this.toggleSelect(ev.composedPath().includes(e));
      if (!ev.composedPath().includes(e)) this.search = '';
    });
  }

  get filtered_values() {
    const sortFn = (a, b) => {
      if (this.args.nameKey) {
        return a[this.args.nameKey].localeCompare(b[this.args.nameKey]);
      } else {
        return a - b;
      }
    };
    if (!this.search) return this.args.options?.sort(sortFn);
    return this.args.options
      ?.filter((o) => {
        const target = o[this.args.nameKey] || o;
        return target.toLowerCase().includes(this.search.toLowerCase());
      })
      .sort(sortFn);
  }

  @action
  toggleSelect(state) {
    if (!state) this.open_select = !this.open_select;
    else this.open_select = state;
  }

  @action
  selectValue(item) {
    this.value = item;
    this.toggleSelect(false);
    this.onChange({
      target: {
        value: item.locale,
      },
    });
  }

  get options_select_value() {
    return this.args.options.find((o) => {
      return o.id == (this.value[this.args.idKey] || this.value);
    })[this.args.nameKey || 'locale'];
  }

  @action
  onChange(e) {
    this.args.onChange?.(
      this.args.idKey
        ? this.args.options.find((o) => o[this.args.nameKey] == e.target.value)[
            this.args.idKey
          ]
        : e.target.value,
      e
    );
  }
}
