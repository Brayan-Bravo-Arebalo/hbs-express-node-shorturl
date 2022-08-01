const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const { create } = require("express-handlebars");
const csrt = require("csurf");
const User = require("./models/User");
require("dotenv").config();
const clientDB = require("./database/db");
const ExpressMongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");

const app = express();

const corsOption = {
  Credentials: true,
  origin: process.env.PATHHEROKU || "*",
  methods: ["GET", "POST"],
};

app.use(
  session({
    secret: process.env.SECRETSESSION,
    resave: false,
    saveUninitialized: false,
    name: "sesion-user",
    store: MongoStore.create({
      clientPromise: clientDB,
      dbName: process.env.DBNAME,
    }),
    cookie: {
      secure: process.env.MODO === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    }, //CUANDO SE TRABAJA EN LOCLHOST DEBE SER FALSE
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) =>
  done(null, { id: user._id, userName: user.userName })
);
passport.deserializeUser(async (user, done) => {
  const userDB = await User.findById(user.id);
  return done(null, { id: userDB._id, userName: userDB.userName });
});
app.get("/mensaje-flash", (req, res) => {
  res.json(req.flash("mensaje")); //si se llega a hacer un console se destruye
});
app.get("/crear-mensaje", (req, res) => {
  req.flash("mensaje", "este es un mensaje de error");
  res.redirect("/mensaje-flash");
});

// app.get("/ruta-protegida", (req, res) => {
//   res.json(req.session.usuario || "sin sesion de usuario");
// });

// app.get("/crear-session", (req, res) => {
//   req.session.usuario = "brayan";
//   res.redirect("/ruta-protegida");
// });

// app.get("/destruir-session", (req, res) => {
//   req.session.destroy();
//   res.redirect("/ruta-protegida");
// });

const hbs = create({
  extname: ".hbs",
  partialsDir: ["views/components"],
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

app.use(csrt());
app.use(ExpressMongoSanitize());

//meddleaware para enviar a todas las vistas
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  // res.locals.mesanjes = req.flash("mensajes");
  next();
});
app.use("/", require("./routes/home"));
app.use("/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("servidor funcionando " + PORT));
