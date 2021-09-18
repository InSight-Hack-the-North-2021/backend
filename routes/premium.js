const { Router } = require("express");
const { PremiumController } = require("../controllers");

const router = Router();

// The endpoints for routes /hootsuite
router.get("/", PremiumController.score);

module.exports = router;
