const express = require("express");
const { body } = require("express-validator");
const {
  loginForm,
  registerForm,
  registerUser,
  confirmarCuenta,
  loginUser,
  cerrarSesion,
} = require("../controllers/authController");
const router = express.Router();

router.get("/register", registerForm);
router.post(
  "/register",
  [
    body("nombreUsuario", "ingrese un nombre valido")
      .trim()
      .notEmpty()
      .escape(),
    body("correoUsuario", "ingrese un correo valido")
      .trim()
      .isEmail()
      .normalizeEmail(),
    body("passUsuario", "la contraseña debe tener como minimo 6 caracteres")
      .trim()
      .isLength({ min: 6 })
      .escape()
      .custom((value, { req }) => {
        if (value !== req.body.passRepetidaUsuario) {
          throw new Error("no coinciden las contraseñas");
        } else {
          return value;
        }
      }),
  ],
  registerUser
);
router.get("/confirmarCuenta/:token", confirmarCuenta);
router.get("/login", loginForm);
router.post(
  "/login",
  [
    body("email", "ingrese un correo valido").trim().isEmail().normalizeEmail(),
    body("password", "la contraseña debe tener como minimo 6 caracteres")
      .trim()
      .isLength({ min: 6 })
      .escape(),
  ],
  loginUser
);

router.get("/logout", cerrarSesion);

module.exports = router;
