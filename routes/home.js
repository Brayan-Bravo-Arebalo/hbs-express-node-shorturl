const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const urls = [
    {
      origin: "www.google.com",
      shortUrl: "khdslf",
    },
    {
      origin: "www.google.es",
      shortUrl: "khdslf",
    },
    {
      origin: "www.google.cl",
      shortUrl: "khdslf",
    },
  ];
  res.render("home", { urls: urls });
});





module.exports = router;
