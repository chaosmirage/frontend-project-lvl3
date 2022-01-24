import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import './style.css';
import i18n from 'i18next';
import * as resources from './locales';

import makeApp from './app';

export default (() => {
  const defaultLanguage = 'ru';
  const i18nInstance = i18n.createInstance();

  i18nInstance
    .init({
      lng: defaultLanguage,
      debug: false,
      resources,
    })
    .then(() => {
      const run = makeApp(i18nInstance);
      run();
    });
})();
