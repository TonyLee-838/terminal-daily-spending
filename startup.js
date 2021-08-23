const JSONdb = require("simple-json-db");

function startup() {
  const dateDB = new JSONdb("./db/date-db.json", {
    syncOnWrite: true,
  });
  const keyDB = new JSONdb("./db/key-db.json", {
    syncOnWrite: true,
  });
  const memoDB = new JSONdb("./db/memo-db.json", {
    syncOnWrite: true,
  });

  return { dateDB, keyDB, memoDB };
}

module.exports = {
  startup,
};
