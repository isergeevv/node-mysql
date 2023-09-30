import QrySelectBuilder from './QrySelectBuilder';
import QryInsertBuilder from './QryInsertBuilder';
import QryDeleteBuilder from './QryDeleteBuilder';
import QryUpdateBuilder from './QryUpdateBuilder';

export default class QryBuilder {
  static select = (...items: string[]) => {
    return new QrySelectBuilder(...items);
  };

  static insert = (items?: Record<string, string | number>) => {
    return new QryInsertBuilder(items);
  };

  static delete = () => {
    return new QryDeleteBuilder();
  };

  static update = (table: string) => {
    return new QryUpdateBuilder(table);
  };
}
