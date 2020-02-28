/**
 * TODO : store npm olarak eklenecek
 * store eklenmedi. 
 * import { getLanguage } from '../store/Language';
 */
import tr from './tr';
import en from './en';
import opts from '../config';

export default () => {
  /**
   * TODO :  Store ekelndiğinde aktif hale getirilecek
   * Şimdilik env den çekildi.
   * var lang = getLanguage();
   */
  var lang = opts.lang;
  if (lang == 'tr')
    return tr;
  else if (lang == 'en')
    return en;
  else
    return en;
}
