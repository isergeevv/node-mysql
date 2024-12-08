import QrySelectBuilder from './builders/QrySelectBuilder';
import QryInsertBuilder from './builders/QryInsertBuilder';
import QryDeleteBuilder from './builders/QryDeleteBuilder';
import QryUpdateBuilder from './builders/QryUpdateBuilder';

export default class QryBuilder {
  static select(...items: string[]) {
    return new QrySelectBuilder(...items);
  }

  static insert(items?: Record<string, string | number>) {
    return new QryInsertBuilder(items);
  }

  static delete() {
    return new QryDeleteBuilder();
  }

  static update(table: string) {
    return new QryUpdateBuilder(table);
  }
}
