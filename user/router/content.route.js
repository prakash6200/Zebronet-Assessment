const express = require("express");
const router = express.Router();
const contentValidator = require("../validator/content.validator");
const contentController = require("../controller/content.controller");
const { verifyJWTToken } = require("../../middleware/jwt.middleware");
const limiteRewuest = require("../../middleware/limited.request.middleware");

router.post("/create", contentValidator.addContent, verifyJWTToken, limiteRewuest, contentController.addContent);
router.put("/update", contentValidator.updateContent, verifyJWTToken, contentController.updateContent);
router.delete("/delete", contentValidator.deleteContent, verifyJWTToken, contentController.deleteContent);
router.get("/list", contentValidator.contentList, verifyJWTToken, contentController.listContent);
router.get("/caching/search", contentValidator.contentList, verifyJWTToken, contentController.cachingSearch);

module.exports = router;
