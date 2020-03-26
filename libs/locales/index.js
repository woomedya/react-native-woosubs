
import tr from './tr';
import en from './en';
import opts from '../../config';

export default () => {
  var lang = opts.lang;

  if (opts.locales[lang])
    return opts.locales[lang];
  else if (lang == 'tr')
    return tr;
  else if (lang == 'en')
    return en;
  else
    return en;
}
