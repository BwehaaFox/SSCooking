import { setOwner } from '@ember/application';
import { capabilities } from '@ember/helper';

export class SimpleGetterManager {
  capabilities = capabilities('3.23', {
    hasValue: true,
  });

  constructor(owner) {
    this.owner = owner;
  }

  createHelper(SimpleGetterHelper, args) {
    return new SimpleGetterHelper(this.owner, args);
  }

  getValue(instance) {
    let { positional, named } = instance.args;
    return instance.get(positional, named);
  }
}

export class SimpleGetterHelper {
  constructor(owner, args) {
    setOwner(this, owner);
    this.args = args;
  }
}
