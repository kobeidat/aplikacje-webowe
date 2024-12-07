var express = require("express");
var router = express.Router();
const { sequelize, Book } = require("../db");

router.get("/", async function (req, res, next) {
  try {
    await sequelize.authenticate();

    let books = await Book.findAll({
      attributes: ["id", "name", "author", "year"],
    });

    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).send("Unable to connect to the database: " + error);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    await sequelize.authenticate();

    let book = await Book.findByPk(req.params.id);

    if (!book) {
      return res
        .status(404)
        .send("Book with id " + req.params.id + " was not found");
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).send("Unable to connect to the database: " + error);
  }
});

router.post("/", async function (req, res, next) {
  try {
    await sequelize.authenticate();

    if (!req.body.name || !req.body.author || !req.body.year) {
      return res.status(400).send("Body must contain: name, author, year.");
    }

    console.log(req.body);

    let book = await Book.create({
      name: req.body.name,
      author: req.body.author,
      year: Number.parseInt(req.body.year),
    });

    return res.status(201).json(book);
  } catch (error) {
    res.status(500).send("Unable to connect to the database: " + error);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    await sequelize.authenticate();

    let book = await Book.findByPk(req.params.id);

    if (!book) {
      return res
        .status(404)
        .send("Book with id " + req.params.id + " was not found");
    }

    book.destroy();

    return res.status(204).send("");
  } catch (error) {
    return res.status(500).send("Unable to connect to the database: " + error);
  }
});

module.exports = router;
