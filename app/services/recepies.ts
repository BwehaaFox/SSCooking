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

  /**
   * Поиск по фильтру
   * @param search
   * @param mode - 0 - поиск по названию
   * @param mode - 1 - поиск по наличию хотя бы одного ингридиента в рецепте
   * @param mode - 2 - поиск по совпадению всех ингридиентов в рецепте из переданного списка
   * @returns
   */
  @action
  getSearch(search: string, mode = 0) {
    const { recepies_list } = this;
    if (!search) return recepies_list;

    const search_list = search
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s);

    const includeInField = (recepie?: Recepie, ...fieldNames) => {
      if (!recepie) return false;
      for (let i = 0; i < fieldNames.length; i++) {
        for (let s = 0; s < search_list.length; s++) {
          if (
            recepie[fieldNames[i]]
              ?.toLocaleLowerCase()
              .includes(search_list[s].toLocaleLowerCase())
          )
            return true;
        }
      }
      return false;
    };

    if (!mode) {
      return recepies_list.filter((r) =>
        includeInField(r, 'id', 'name', 'locale')
      );
    } else if (mode == 1) {
      return recepies_list.filter((r) => {
        return r.ingredients?.find((i) => {
          return includeInField(this.getRecepie(i.id), 'id', 'name', 'locale');
        });
      });
    } else if (mode == 2) {
      return recepies_list.filter((r) => {
        if (!r.ingredients?.length) return false;
        let included = 0;
        for (let i = 0; i < r.ingredients.length; i++) {
          if (
            includeInField(
              this.getRecepie(r.ingredients[i].id),
              'id',
              'name',
              'locale'
            )
          ) {
            included++;
          }
        }

        return included == r.ingredients.length;
      });
    } else {
      return recepies_list;
    }
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
    this.recepies_list.forEach((r) => {
      r.ingredients?.forEach((i) => {
        if (i.id == old_id) i.id == recepie.id;
      });
    });
    this.recepies_list = [...this.recepies_list];
    this.has_changes = true;
  }

  @action
  getIngridiensList(ingridient: RecepieTreeItem) {
    const ingridient_list: RecepieTreeItem[] = [];

    if (ingridient.childs?.length) {
      const extractIngridient = (parent: RecepieTreeItem) => {
        if (!parent.childs?.length) {
          ingridient_list.push(parent);
        } else {
          parent.childs.forEach((ing) => {
            extractIngridient(ing);
          });
        }
      };
      ingridient.childs.forEach((ing) => {
        extractIngridient(ing);
      });
    }

    const ingridient_map = ingridient_list
      .map((r) => {
        return { ...r.recepie, count: r.count * r.recepie.count };
      })
      .reduce((reducer, item) => {
        const recepie_hash = reducer[item.id] as Recepie;
        if (!recepie_hash) {
          reducer[item.id] = item;
        } else {
          reducer[item.id] = {
            ...recepie_hash,
            count: recepie_hash.count + item.count,
          };
        }

        return reducer;
      }, {});

    return Object.keys(ingridient_map).map((r) => ingridient_map[r]);
  }

  @action
  getRecepieTree(id) {
    let recepie = this.getRecepie(id);
    if (!recepie) return;

    let buildTree = (parent: Recepie, mult = 1) => {
      if (parent.ingredients) {
        return parent.ingredients.map((i) => {
          const r = { ...this.getRecepie(i.id) } as Recepie;
          if (!r) return;
          let need_cnt = (i.count || 1) / (r.count || 1);
          return {
            recepie: r,
            count: need_cnt * mult,
            childs: buildTree(r, need_cnt),
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
  import(data: Recepie[], mode, save_trigger) {
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
    if (save_trigger) this.has_changes = true;
  }
}
