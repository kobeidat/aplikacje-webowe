var express = require("express");
var router = express.Router();
const { sequelize, Order } = require("../db");

router.get("/:user_id", async function (req, res, next) {
  try {
    await sequelize.authenticate();

    if (req.user.id != req.params.user_id) {
      return res.status(401).send("Unauthorized");
    }

    let books = await Order.findAll({
      attributes: ["id", "book_id", "quantity"],
      where: { user_id: req.params.user_id },
    });

    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).send("Unable to connect to the database: " + error);
  }
});

router.post("/", async function (req, res, next) {
  try {
    await sequelize.authenticate();

    if (!req.body.book_id || !req.body.quantity) {
      return res.status(400).send("Body must contain: book_id, quantity.");
    }

    let order = await Order.create({
      user_id: req.user.id,
      book_id: req.body.book_id,
      quantity: req.body.quantity,
    });

    return res.status(201).json({
      id: order.id,
    });
  } catch (error) {
    res.status(500).send("Unable to connect to the database: " + error);
  }
});

router.patch("/:id", async function (req, res, next) {
  try {
    await sequelize.authenticate();

    if (!req.body.book_id || !req.body.quantity) {
      return res.status(400).send("Body must contain: book_id, quantity.");
    }

    let order = await Order.findByPk(req.params.id);

    if (!order) {
      return res
        .status(404)
        .send("Order with id " + req.params.id + " was not found");
    }

    if (req.user.id != order.user_id) {
      return res.status(401).send("Unauthorized");
    }

    order.book_id = req.body.book_id;
    order.quantity = req.body.quantity;
    await order.save();

    return res.status(200).json(order);
  } catch (error) {
    res.status(500).send("Unable to connect to the database: " + error);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    await sequelize.authenticate();

    let order = await Order.findByPk(req.params.id);

    if (!order) {
      return res
        .status(404)
        .send("Order with id " + req.params.id + " was not found");
    }

    if (req.user.id != order.user_id) {
      return res.status(401).send("Unauthorized");
    }

    await order.destroy();

    return res.status(204).send("");
  } catch (error) {
    return res.status(500).send("Unable to connect to the database: " + error);
  }
});

module.exports = router;
