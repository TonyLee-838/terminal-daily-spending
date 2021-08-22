const JSONdb = require("simple-json-db");

function startup() {
  const dateDB = new JSONdb("./db/date-db.json", {
    syncOnWrite: true,
  });
  const keyDB = new JSONdb("./db/key-db.json", {
    syncOnWrite: true,
  });

  return { dateDB, keyDB };
}

module.exports = {
  startup,
};
