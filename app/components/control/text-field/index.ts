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

export default class TextFieldComponent extends Component<Args> {
  @action
  onInput(e) {
    this.args.onInput?.(
      e.target.value == ''
        ? undefined
        : this.args.type == 'number'
        ? parseInt(e.target.value)
        : e.target.value
    );
  }
  @action
  onChange(e) {
    this.args.onChange?.(
      e.target.value == ''
        ? undefined
        : this.args.type == 'number'
        ? parseInt(e.target.value.trim())
        : e.target.value.trim()
    );
  }
}
