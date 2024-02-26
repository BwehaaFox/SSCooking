import { Recepie } from './recepies';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import SystemService from './system';

export interface Ingridient {
  id: string;
  count: number;
}

export interface Recepie {
  id: string;
  name: string;
  locale: string;
  count: number;
  group: string;
  tool: string;
  ingredients: Ingridient[];
  effects: string[];
  description: string;
}

export interface RecepieTreeItem {
  recepie: Recepie;
  count: number;
  childs: RecepieTreeItem[];
}
type DataTypes = 'cook' | 'chem';
type RecepieData = { [key in DataTypes]?: Recepie[] };

const { ipcRenderer } = window.ELECTRON
  ? window.require('electron')
  : { ipcRenderer: () => {} };

export default class RecepieService extends Service {
  @service recepies!: RecepieService;
  @service system!: SystemService;

  @tracked recepie_data: RecepieData = {};

  // @service electron;
  // @tracked recepies_list: Recepie[] = [];

  get recepies_list() {
    return this.recepie_data[this.data_name] as Recepie[];
  }

  set recepies_list(value) {
    this.recepie_data[this.data_name] = value;
    this.recepie_data = this.recepie_data;
  }

  @tracked has_changes = false;

  @tracked edit_state = false;

  @tracked isApp = window.ELECTRON as boolean;

  @tracked data_name: DataTypes = 'cook';

  async initialize() {
    this.loadRecepies();
  }

  @action
  async loadRecepies() {
    const importProcess = (data) => {
      try {
        this.import(
          typeof data == 'string' ? JSON.parse(data) : data || [],
          0,
          false
        );
      } catch (e) {
        console.log('get-recepie', e);
        alert('Ошибка загрузки данных');
      }
    };
    if (this.isApp) {
      ipcRenderer.on('get-recepie', (event, settings) => {
        importProcess(settings);
      });
      ipcRenderer.send('request-recepie');
    } else {
      const res = await fetch('/recepies.json');
      await res.text().then((data) => {
        importProcess(data);
      });
    }
  }

  @action
  saveRecepies() {
    if (this.isApp) {
      try {
        ipcRenderer.invoke('save-recepies', JSON.stringify(this.recepie_data));

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
    this.recepie_data[this.data_name]?.forEach((element) => {
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
   * @param mode - 3 - поиск по эффектам
   * @param mode - 4 - поиск по описанию
   * @returns
   */
  @action
  getSearch(search: string, mode = 0, type: DataTypes) {
    const recepies_list = this.recepie_data[type];
    if (!recepies_list?.length) return [];
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
          return includeInField(
            this.getRecepie(i.id, type),
            'id',
            'name',
            'locale'
          );
        });
      });
    } else if (mode == 2) {
      return recepies_list.filter((r) => {
        if (!r.ingredients?.length) return false;
        let included = 0;
        for (let i = 0; i < r.ingredients.length; i++) {
          if (
            includeInField(
              this.getRecepie(r.ingredients[i].id, type),
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
    } else if (mode == 3) {
      const search_parts = search.trim().split(/ +/gi);
      return recepies_list.filter((r) => {
        for (let e = 0; e < r.effects?.length; e++) {
          for (let p = 0; p < search_parts.length; p++) {
            if (r.effects[e]?.includes(search_parts[p])) return true;
          }
        }
        return false;
      });
    } else if (mode == 4) {
      const search_parts = search.trim().split(/ +/gi);
      return recepies_list.filter((r) => {
        for (let p = 0; p < search_parts.length; p++) {
          if (r.description?.includes(search_parts[p])) return true;
        }
        return false;
      });
    } else {
      return recepies_list;
    }
  }

  @action
  getRecepie(id: string, type: DataTypes) {
    return this.recepie_data[type]?.find((r) => r.id == id);
  }

  @action
  createRecepie(recepie: Recepie, type: DataTypes) {
    if (!this.recepie_data[type]) this.recepie_data[type] = [];
    this.recepie_data[type]!.push(recepie);
    this.recepie_data = { ...this.recepie_data };
    this.has_changes = true;
  }

  @action
  deleteRecepie(id, type: DataTypes) {
    this.recepie_data[type]?.forEach((val) => {
      if (val.ingredients)
        val.ingredients = val.ingredients.filter((r) => r.id !== id);
    });
    this.recepie_data[type] =
      this.recepie_data[type]?.filter((r) => r.id !== id) || [];
    this.recepie_data = { ...this.recepie_data };
    this.has_changes = true;
  }

  @action
  replaceRecepie(type: DataTypes, recepie: Recepie, old_id) {
    if (!this.recepie_data[type]) this.recepie_data[type] = [] as Recepie[];
    this.recepie_data[type]!.splice(
      this.recepie_data[type]!.findIndex((r) => r.id == old_id),
      1,
      recepie
    );
    this.recepie_data[type]!.forEach((r) => {
      r.ingredients?.forEach((i) => {
        if (i.id == old_id) i.id == recepie.id;
      });
    });
    this.recepie_data = { ...this.recepie_data };
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
  getRecepieTree(id, type: DataTypes) {
    let recepie = this.getRecepie(id, type);
    if (!recepie) return;

    let buildTree = (parent: Recepie, mult = 1) => {
      if (parent.ingredients) {
        return parent.ingredients.map((i) => {
          const r = { ...this.getRecepie(i.id, type) } as Recepie;
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
  import(data: RecepieData, mode, save_trigger) {
    if (!mode) {
      this.recepie_data = data;
    } else {
      Object.keys(data).forEach((listKey: DataTypes) => {
        const data_keys = data[listKey]!.map((d) => d.id);
        const list_keys = this.recepie_data[listKey]?.map((d) => d.id) || [];
        for (let i = 0; i < data_keys.length; i++) {
          if (list_keys.includes(data_keys[i])) {
            this.replaceRecepie(
              listKey,
              data[listKey]!.find((r) => r.id == data_keys[i])!,
              data_keys[i]
            );
          } else {
            this.createRecepie(
              data[listKey]!.find((r) => r.id == data_keys[i])!,
              listKey
            );
          }
        }
      });
    }
    if (save_trigger) this.has_changes = true;
  }
}
