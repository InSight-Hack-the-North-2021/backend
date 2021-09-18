const { Router } = require("express");
const { ScoreController } = require("../controllers");
const {upload} = require("../middleware/uploadMiddleware")

const router = Router();

// The endpoints for routes /image
router.post("/score", upload.single('image'), ScoreController.score);

module.exports = router;
