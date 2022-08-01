const Url = require("../models/Url");
const { nanoid } = require("nanoid");
const { findById } = require("../models/User");

const leerUrls = async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user.id }).lean();
    return res.render("home", { urls: urls, mensajes: req.flash("mensajes") });
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
  }
};

const agregarUrl = async (req, res) => {
  const { origin } = req.body;

  try {
    const url = new Url({
      origin: origin,
      shortURL: nanoid(8),
      user: req.user.id,
    });
    await url.save();
    req.flash("mensajes", [{ msg: "url agregada" }]);
    return res.redirect("/");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
  }
};

const eliminarUrl = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    // await Url.findByIdAndDelete(id);
    const url = await Url.findById(id);
    console.log(url);
    if (!url.user.equals(req.user.id)) {
      throw new Error("no es tu url");
    }
    await url.remove();
    req.flash("mensajes", [{ msg: "url eliminada" }]);
    return res.redirect("/");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
  }
};
const editarUrlForm = async (req, res) => {
  const { id } = req.params;
  try {
    const url = await Url.findById(id).lean();
    if (!url.user.equals(req.user.id)) {
      throw new Error("no es tu url");
    }
    return res.render("home", { url, mensajes: req.flash("mensajes") });
    // res.redirect("/");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
  }
};

const editarUrl = async (req, res) => {
  const { id } = req.params;
  const { origin } = req.body;
  try {
    const url = await Url.findById(id);
    console.log(url);
    if (!url.user.equals(req.user.id)) {
      throw new Error("no es tu url");
    }
    await url.updateOne({ origin });
    req.flash("mensajes", [{ msg: "url editada" }]);
    // await Url.findByIdAndUpdate(id, { origin: origin });
    return res.redirect("/");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
  }
};
const redirecionamiento = async (req, res) => {
  const { shortURL } = req.params;
  try {
    const urlDB = await Url.findOne({ shortURL: shortURL });
    return res.redirect(urlDB.origin);
  } catch (error) {
    req.flash("mensajes", [{ msg: "no existe url" }]);
    return res.redirect("/");
  }
};

module.exports = {
  leerUrls,
  agregarUrl,
  eliminarUrl,
  editarUrlForm,
  editarUrl,
  redirecionamiento,
};
