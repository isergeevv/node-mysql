import QryTableCreateBuilder from './builders/QryTableCreateBuilder';
import QryTableExistsBuilder from './builders/QryTableExistsBuilder';

export default class QryTableBuilder {
  static create(table: string) {
    return new QryTableCreateBuilder(table);
  }

  static exists(table: string) {
    return new QryTableExistsBuilder(table);
  }
}
