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
