const { Router } = require("express");
const { HootsuiteController } = require("../controllers");

const router = Router();

// The endpoints for routes /hootsuite
router.post("/schedulePost/:text", HootsuiteController.schedulePost);

module.exports = router;
