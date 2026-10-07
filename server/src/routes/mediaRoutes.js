const express = require("express");

const { getMedia } = require("../controllers/mediaController");

const router = express.Router();

// Publicly reachable media stream (file ids are unguessable ObjectIds).
router.get("/:fileId", getMedia);

module.exports = router;
