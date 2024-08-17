"use strict";
const express = require("express");
const router = express.Router();

const authRouter = require("./auth.route");
const contentRouter = require("./content.route");


router.use("/auth", authRouter);
router.use("/content", contentRouter);


module.exports = router;
