import QryTableCreateBuilder from './builders/QryTableCreateBuilder';

export default class QryTableBuilder {
  static exists(table: string) {
    return `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = '${table}';`;
  }

  static create(table: string) {
    return new QryTableCreateBuilder(table);
  }
}
