const express = require("express");
const controller = require("../controllers/usuarios");

const router = express.Router();

router.get("/", controller.list);
router.get("/:id", controller.get);
router.post("/login", controller.login);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;