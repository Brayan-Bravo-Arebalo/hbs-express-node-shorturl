const mongoose = require("mongoose");
require("dotenv").config();

const clientDB = mongoose
  .connect(process.env.URI)
  .then((m) => {
    console.log("db conectada");
    return m.connection.getClient();
  })
  .catch((e) => console.log("fallo la conexion a db " + e));

module.exports = clientDB;
