const { URL } = require("url");
const validarUrl = (req, res, next) => {
  try {
    const { origin } = req.body;
    const urlFrontend = new URL(origin);
    if (urlFrontend.origin !== "null") {
      if (
        urlFrontend.protocol === "http:" ||
        urlFrontend.protocol === "https:"
      ) {
        return next();
      }
      throw new Error("tiene que tener https://");
    }
    throw new Error("no valida");
  } catch (error) {
    if (error.message === "Invalid URL") {
      req.flash("mensajes", [{ msg: "url no valida" }]);
    } else {
      req.flash("mensajes", [{ msg: error.message }]);
    }
    return res.redirect("/");
  }
};
module.exports = validarUrl;
