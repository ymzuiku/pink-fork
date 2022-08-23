import sqlite from "better-sqlite3";

let wal = false;
function getDb() {
  const db = new sqlite("pinkFork.db");
  if (!wal) {
    db.pragma("journal_mode = WAL");
    wal = true;
  }
  return db;
}

// 只存100w条数据
function getId() {
  return Date.now() % (100 * 10000);
}

function getCreateAt() {
  return new Date().toISOString();
}

function createTables() {
  const db = getDb();
  db.exec(
    `create table if not exists life(
    id int primary key not null,
    create_at text not null,
    err text not null,
    kind text not null
  )`
  );
  db.exec(
    `create table if not exists log(
    id int primary key not null,
    create_at text not null,
    msg text not null
  )`
  );
  db.exec(
    `create table if not exists err(
    id int primary key not null,
    create_at text not null,
    msg text not null
  )`
  );
  db.exec(
    `create table if not exists info(
    id int primary key not null,
    create_at text not null,
    msg text not null
  )`
  );
}

const log = (table: string, args: any[]) => {
  try {
    getDb()
      .prepare(
        `insert or replace into ${table} (id, create_at, msg) values (?, ?, ?)`
      )
      .run(getId(), getCreateAt(), JSON.stringify(args));
  } catch (err) {
    //
  }
};

// pinkFork.log = (...args: any[]) => {
//   log("log", args);
// };

// pinkFork.info = (...args: any[]) => {
//   log("info", args);
// };

// pinkFork.err = (...args: any[]) => {
//   log("err", args);
// };
