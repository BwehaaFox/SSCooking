import { Recepie } from './recepies';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import SystemService from './system';

export interface Recepie {
  id: string;
  name: string;
  locale: string;
  count: number;
  group: string;
  tool: string;
  ingredients: Ingridient[];
}

export interface RecepieTreeItem {
  recepie: Recepie;
  count: number;
  childs: RecepieTreeItem[];
}

export interface Ingridient {
  id: string;
  count: number;
}

const { ipcRenderer } = window.require('electron');

export default class RecepieService extends Service {
  @service recepies!: RecepieService;
  @service system!: SystemService;
  // @service electron;
  @tracked recepies_list: Recepie[] = [];

  @tracked has_changes = false;

  @tracked edit_state = false;

  @tracked isApp = window.ELECTRON as boolean;

  async initialize() {
    if (this.isApp) {
      ipcRenderer.on('get-recepie', (event, settings) => {
        try {
          this.import(
            typeof settings == 'string'
              ? JSON.parse(settings).cook
              : settings.cook || [],
            0
          );
        } catch (e) {
          console.log('get-recepie', e);
          alert('Ошибка загрузки данных');
        }
      });
      ipcRenderer.send('request-recepie');
    } else {
      const res = await fetch('/recepies.json');
      await res.text().then((data) => {
        try {
          this.recepies_list = JSON.parse(data).cook;
        } catch (e) {
          this.recepies_list = [];
        }
        console.log(this.recepies_list);
      });
    }
  }

  @action
  saveRecepies() {
    if (this.isApp) {
      try {
        ipcRenderer.invoke(
          'save-recepies',
          JSON.stringify({
            cook: this.recepies_list,
          })
        );

        this.has_changes = false;
      } catch (e) {
        alert('Не удалось сохранить');
      }
    } else {
      this.system.downloadActualData();
    }
  }

  get recepies_groups() {
    const out = [] as string[];
    this.recepies_list.forEach((element) => {
      if (!out.includes(element.group)) out.push(element.group);
    });
    return out;
  }

  @action
  getRecepie(id: string) {
    return this.recepies_list.find((r) => r.id == id);
  }

  @action
  createRecepie(recepie: Recepie) {
    this.recepies_list.push(recepie);
    this.recepies_list = [...this.recepies_list];
    this.has_changes = true;
  }

  @action
  deleteRecepie(id) {
    this.recepies.recepies_list.forEach((val) => {
      if (val.ingredients)
        val.ingredients = val.ingredients.filter((r) => r.id !== id);
    });
    this.recepies.recepies_list = this.recepies.recepies_list.filter(
      (r) => r.id !== id
    );
    this.recepies_list = [...this.recepies_list];
    this.has_changes = true;
  }

  @action
  replaceRecepie(recepie: Recepie, old_id) {
    this.recepies_list.splice(
      this.recepies_list.findIndex((r) => r.id == old_id),
      1,
      recepie
    );
    this.recepies_list = [...this.recepies_list];
    this.has_changes = true;
  }

  @action
  getRecepieTree(id) {
    let recepie = this.getRecepie(id);
    if (!recepie) return;

    let buildTree = (parent: Recepie) => {
      if (parent.ingredients) {
        return parent.ingredients.map((i) => {
          const r = this.getRecepie(i.id);
          if (!r) return;
          return {
            recepie: r,
            count: (i.count || 1) / (r.count || 1),
            childs: buildTree(r),
          };
        }) as RecepieTreeItem[];
      } else {
        return;
      }
    };

    return {
      recepie,
      count: 1,
      childs: buildTree(recepie),
    } as RecepieTreeItem;
  }

  @action
  import(data: Recepie[], mode) {
    if (!mode) {
      this.recepies_list = data;
    } else {
      const data_keys = data.map((d) => d.id);
      const list_keys = this.recepies_list.map((d) => d.id);
      for (let i = 0; i < data_keys.length; i++) {
        if (list_keys.includes(data_keys[i])) {
          this.replaceRecepie(
            data.find((r) => r.id == data_keys[i])!,
            data_keys[i]
          );
        } else {
          this.createRecepie(data.find((r) => r.id == data_keys[i])!);
        }
      }
    }
  }
}
