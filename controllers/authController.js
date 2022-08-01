const User = require("../models/User");
const { validationResult } = require("express-validator");
const { nanoid } = require("nanoid");
const nodemailer = require("nodemailer");
require("dotenv").config;

const registerForm = (req, res) => {
  res.render("register", { mensajes: req.flash("mensajes") });
};

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("mensajes", errors.array());
    return res.redirect("/auth/register");
  }

  const { nombreUsuario, correoUsuario, passUsuario } = req.body;
  try {
    let user = await User.findOne({ email: correoUsuario });
    if (user) throw new Error("ya existe el usuario ");
    // si los name del req.body(formulario) fueran igual al schema de User solo basta con poner el name
    user = new User({
      userName: nombreUsuario,
      email: correoUsuario,
      password: passUsuario,
      tokenConfirm: nanoid(),
    });
    await user.save();
    const transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.userEmail,
        pass: process.env.passEmail,
      },
    });

    await transport.sendMail({
      from: "'simulacion' <simulacion@example.com",
      to: user.email,
      subject: "verifica tu cuenta de correo",
      text: "",
      html: `<a href="${
        process.env.PATHHEROKU || "http://localhost:5000"
      }/auth/confirmarCuenta/${user.tokenConfirm}"> Verificar Cuenta </a>`,
    });

    req.flash("mensajes", [
      { msg: "Revisa tu correo electronico para validar cuenta" },
    ]);
    res.redirect("/auth/login");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/register");
  }
};

const confirmarCuenta = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ tokenConfirm: token });
    if (!user) throw new Error("No existe este usuario ");

    user.CuentaConfirmada = true;
    user.tokenConfirm = null;
    await user.save();
    res.redirect("/auth/login");
  } catch (error) {
    res.json({ error: error.message });
  }
};

const loginForm = (req, res) => {
  res.render("login", { mensajes: req.flash("mensajes") });
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("mensajes", errors.array());
    return res.redirect("/auth/login");
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("No existe un usuario con este correo");
    if (!user.CuentaConfirmada) throw new Error("Falta validar cuenta");
    if (!(await user.comparePassword(password)))
      throw new Error("contraseña incorrecta");
    req.login(user, function (err) {
      if (err) throw new Error("error al crear sesion");
      res.redirect("/");
    });
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/login");
  }
};

const cerrarSesion = (req, res) => {
  req.logout(function (err) {
    if (err) return next(err);
    return res.redirect("/auth/login");
  });
};

module.exports = {
  loginForm,
  registerForm,
  registerUser,
  confirmarCuenta,
  loginUser,
  cerrarSesion,
};
