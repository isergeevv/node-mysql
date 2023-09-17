import QryBuilder from '../src/QryBuilder';

describe(`QryBuilder`, () => {
  test(`select all from users`, () => {
    const qry = QryBuilder.select().from(`users`).export();

    expect(qry).toEqual(`SELECT * FROM users;`);
  });

  test(`select with where`, () => {
    const qry = QryBuilder.select().from(`users`).where(`id = ?`).setItems(1).export();

    expect(qry).toEqual(`SELECT * FROM users WHERE id = 1;`);
  });

  test(`select with items`, () => {
    const qry = QryBuilder.select().from(`users`).where(`username = ?`).setItems(`admin`).export();

    expect(qry).toEqual(`SELECT * FROM users WHERE username = 'admin';`);
  });

  test(`select with escaped items`, () => {
    const qry = QryBuilder.select().from(`users`).where(`username = ?`).setItems(`adm'in`).export();

    expect(qry).toEqual(`SELECT * FROM users WHERE username = 'adm\\'in';`);
  });

  test(`select with JOIN`, () => {
    const qry = QryBuilder.select()
      .from(`users`)
      .join({
        type: '',
        join: `avatars as av ON users.avatarId = av.id`,
      })
      .where(`username = ?`)
      .setItems(`adm'in`)
      .export();

    expect(qry).toEqual(
      `SELECT * FROM users JOIN avatars as av ON users.avatarId = av.id WHERE username = 'adm\\'in';`,
    );
  });

  test(`select with selected columns`, () => {
    const qry = QryBuilder.select('id', 'avatarId')
      .from(`users`)
      .join({
        type: '',
        join: `avatars as av ON users.avatarId = av.id`,
      })
      .where(`username = ?`)
      .setItems(`adm'in`)
      .export();

    expect(qry).toEqual(
      `SELECT id, avatarId FROM users JOIN avatars as av ON users.avatarId = av.id WHERE username = 'adm\\'in';`,
    );
  });

  test(`select LEFT JOIN`, () => {
    const qry = QryBuilder.select()
      .from(`users`)
      .join({
        type: 'LEFT',
        join: `avatars as av ON users.avatarId = av.id`,
      })
      .export();

    expect(qry).toEqual(`SELECT * FROM users LEFT JOIN avatars as av ON users.avatarId = av.id;`);
  });

  test(`select with limit`, () => {
    const qry = QryBuilder.select().from(`users`).limit(50).export();

    expect(qry).toEqual(`SELECT * FROM users LIMIT 0, 50;`);
  });

  test(`select with startItem and no limit`, () => {
    try {
      QryBuilder.select().from(`users`).startItem(25);
      expect(true).toBeFalsy();
    } catch (e: any) {
      expect(e.message).toEqual('[QryBuilder] Need to set limit before setting startItem.');
    }
  });

  test(`select with limit and startItem`, () => {
    const qry = QryBuilder.select().from(`users`).limit(50).startItem(25).export();

    expect(qry).toEqual(`SELECT * FROM users LIMIT 25, 50;`);
  });

  test(`select with extra`, () => {
    const qry = QryBuilder.select().from(`users`).extra('LIMIT 5, 100').export();

    expect(qry).toEqual(`SELECT * FROM users LIMIT 5, 100;`);
  });
});
