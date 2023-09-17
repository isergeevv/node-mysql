import QryBuilder from '../src/QryBuilder';

describe(`QryBuilder`, () => {
  describe('select', () => {
    test(`all from users`, () => {
      const qry = QryBuilder.select().from(`users`).export();

      expect(qry).toEqual(`SELECT * FROM users;`);
    });

    test(`no table`, () => {
      try {
        QryBuilder.select().export();
        expect(true).toBeFalsy();
      } catch (e: any) {
        expect(e.message).toEqual('[QryBuilder] Missing table.');
      }
    });

    test(`with where`, () => {
      const qry = QryBuilder.select().from(`users`).where(`id = ?`).setItemValues(1).export();

      expect(qry).toEqual(`SELECT * FROM users WHERE id = 1;`);
    });

    test(`with items`, () => {
      const qry = QryBuilder.select().from(`users`).where(`username = ?`).setItemValues(`admin`).export();

      expect(qry).toEqual(`SELECT * FROM users WHERE username = 'admin';`);
    });

    test(`with escaped items`, () => {
      const qry = QryBuilder.select().from(`users`).where(`username = ?`).setItemValues(`adm'in`).export();

      expect(qry).toEqual(`SELECT * FROM users WHERE username = 'adm\\'in';`);
    });

    test(`with JOIN`, () => {
      const qry = QryBuilder.select()
        .from(`users`)
        .join({
          type: '',
          join: `avatars as av ON users.avatarId = av.id`,
        })
        .where(`username = ?`)
        .setItemValues(`adm'in`)
        .export();

      expect(qry).toEqual(
        `SELECT * FROM users JOIN avatars as av ON users.avatarId = av.id WHERE username = 'adm\\'in';`,
      );
    });

    test(`with selected columns`, () => {
      const qry = QryBuilder.select('id', 'avatarId')
        .from(`users`)
        .join({
          type: '',
          join: `avatars as av ON users.avatarId = av.id`,
        })
        .where(`username = ?`)
        .setItemValues(`adm'in`)
        .export();

      expect(qry).toEqual(
        `SELECT id, avatarId FROM users JOIN avatars as av ON users.avatarId = av.id WHERE username = 'adm\\'in';`,
      );
    });

    test(`LEFT JOIN`, () => {
      const qry = QryBuilder.select()
        .from(`users`)
        .join({
          type: 'LEFT',
          join: `avatars as av ON users.avatarId = av.id`,
        })
        .export();

      expect(qry).toEqual(`SELECT * FROM users LEFT JOIN avatars as av ON users.avatarId = av.id;`);
    });

    test(`with limit`, () => {
      const qry = QryBuilder.select().from(`users`).limit(50).export();

      expect(qry).toEqual(`SELECT * FROM users LIMIT 0, 50;`);
    });

    test(`with startItem and no limit`, () => {
      try {
        QryBuilder.select().from(`users`).startItem(25);
        expect(true).toBeFalsy();
      } catch (e: any) {
        expect(e.message).toEqual('[QryBuilder] Need to set limit before setting startItem.');
      }
    });

    test(`with limit and startItem`, () => {
      const qry = QryBuilder.select().from(`users`).limit(50).startItem(25).export();

      expect(qry).toEqual(`SELECT * FROM users LIMIT 25, 50;`);
    });

    test(`with extra`, () => {
      const qry = QryBuilder.select().from(`users`).extra('LIMIT 5, 100').export();

      expect(qry).toEqual(`SELECT * FROM users LIMIT 5, 100;`);
    });
  });

  describe('insert', () => {
    test(`no table`, () => {
      try {
        QryBuilder.insert().export();
        expect(true).toBeFalsy();
      } catch (e: any) {
        expect(e.message).toEqual('[QryBuilder] Missing table.');
      }
    });

    test(`into table`, () => {
      const qry = QryBuilder.insert().into('users').export();

      expect(qry).toEqual(`INSERT INTO users;`);
    });

    test(`into table items`, () => {
      const qry = QryBuilder.insert({
        name: 'asd',
        age: 25,
      })
        .into('users')
        .export();

      expect(qry).toEqual(`INSERT INTO users SET name = 'asd', age = 25;`);
    });
  });
});
