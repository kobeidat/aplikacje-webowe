var express = require("express");
var router = express.Router();
const { sequelize, Order } = require("../db");
const { BOOKS_API_ENDPOINT } = process.env;

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

    try {
      let book_response = await fetch(
        BOOKS_API_ENDPOINT + "/" + req.body.book_id,
        {
          headers: {
            authorization: req.headers.authorization,
          },
        }
      );

      if (book_response.status == 404) {
        return res.status(404).send("Book with that id does not exist.");
      } else if (book_response.status != 200) {
        return res.status(500).send("Error retrieving book");
      }
    } catch (ex) {
      return res.status(500).send("Could not connect to book API");
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

    try {
      let book_response = await fetch(
        BOOKS_API_ENDPOINT + "/" + req.body.book_id,
        {
          headers: {
            authorization: req.headers.authorization,
          },
        }
      );

      if (book_response.status == 404) {
        return res.status(404).send("Book with that id does not exist.");
      } else if (book_response.status != 200) {
        return res.status(500).send("Error retrieving book");
      }
    } catch (ex) {
      return res.status(500).send("Could not connect to book API");
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
