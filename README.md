# SSCooking

Приложение для хранения и систематизации рецептов для Space Station

Построение дерева рецептов и подсчета необходимых ингридиентов

Отдельные вкладки для кулинарии и химии. 

Поиск:
- По названию рецепта
- По ингридиенту в рецепте
- Среди рецептов какотрые состоят из указанных ингридиентов
- По Эффекту
- По описанию

Возможность разбиения по группам
Возможность указывать инструмент и время готовки

Возможна сборка WEB версии и приложения Electron

[!main](https://e.radikal.host/2024/02/26/image1abb65af44190adb.png)
[!tree](https://e.radikal.host/2024/02/26/image0e883a145972029e.png)


## Дополнительно

Расчитано что данные хранятся локально, код взаимодействия с сервером не реализован, но возможен

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with npm)
* [Ember CLI](https://cli.emberjs.com/release/)
* [Google Chrome](https://google.com/chrome/)

## Установка

* `git clone <repository-url>` this repository
* `cd sscooking`
* `npm install`

## Запуск / Разработка

### WEB

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Electron

* `ember electron`

### Running Tests

* `ember test`
* `ember test --server`

### Linting

* `npm run lint`
* `npm run lint:fix`

### Building

#### WEB

* `ember build` (development)
* `ember build --environment production` (production)

#### WEB

* `ember electron:package`


## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://cli.emberjs.com/release/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

# License

[License CC BY-NC-SA](https://ru.wikipedia.org/wiki/%D0%9B%D0%B8%D1%86%D0%B5%D0%BD%D0%B7%D0%B8%D0%B8_%D0%B8_%D0%B8%D0%BD%D1%81%D1%82%D1%80%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D1%8B_Creative_Commons#%D0%91%D0%B0%D0%B7%D0%BE%D0%B2%D1%8B%D0%B5_%D0%BF%D1%80%D0%B0%D0%B2%D0%B0)
