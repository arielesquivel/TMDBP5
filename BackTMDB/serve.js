const express = require("express");
const cors = require("cors");
const routes = require("./routes/index");
const db = require("./db/db");
const app = express();
const cookieParser = require("cookie-parser");
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use("/api", routes);

db.sync({ force: false })
  .then(() => {
    console.log("sincronizada  bases");
  })
  .then(() => {
    app.listen(5000, () => {
      console.log("Servidorr en puerto 5000");
    });
  });
