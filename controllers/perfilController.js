const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const jimp = require("jimp");

module.exports.formPerfil = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.render("perfil", {
      user: req.user,
      imagen: user.image,
      mensajes: req.flash("mensajes"),
    });
  } catch (error) {
    res.render("perfil", { mensajes: req.flash("mensajes") });
  }
};
module.exports.editarFotoPerfil = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.maxFileSize = 50 * 1024 * 1024;

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        throw new Error("fallo subida de imagen");
      }

      const file = files.fotoPerfil;

      if (file.originalFilename === "") {
        throw new Error("Agregue una imagen");
      }
      const tiposImagenes = ["image/jpeg", "image/png"];
      if (!tiposImagenes.includes(file.mimetype)) {
        throw new Error("por favor agregar imagen en formato .jpg o .png");
      }
      // if (!["image/jpeg", "image/png"].includes(file.mimetype)) {
      //   throw new Error("por favor agregar imagen en formato .jpg o .png");
      // }
      // if (!(file.mimetype === "image/jpeg" || file.mimetype === "image/png")) {
      //   throw new Error("por favor agregar imagen en formato .jpg o .png");
      // }

      if (file.size > 50 * 1024 * 1024) {
        throw new Error("la imagen es muy pesada");
      }

      const extension = file.mimetype.split("/")[1];
      const dirFile = path.join(
        __dirname,
        `../public/img/perfiles/${req.user.id}.${extension}`
      );

      fs.renameSync(file.filepath, dirFile);

      const image = await jimp.read(dirFile);
      image.resize(200, 200).quality(80).writeAsync(dirFile);

      const user = await User.findById(req.user.id);
      user.image = `${req.user.id}.${extension}`;
      await user.save();

      req.flash("mensajes", [{ msg: "se subio la imagen" }]);
    } catch (error) {
      req.flash("mensajes", [{ msg: error.message }]);
    } finally {
      return res.redirect("/perfil");
    }
  });
};
