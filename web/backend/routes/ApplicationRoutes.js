const { Router, application } = require("express");
const applicationController = require("../controllers/ApplicationController");
const { requireAuth } = require("../middleware/authenticate");
const { authorizeApplicant } = require("../middleware/authorize");

const router = Router();

router.get('/:id', requireAuth, applicationController.view);

router.post('/:jobID', requireAuth, authorizeApplicant, applicationController.verifyStore(), applicationController.store);

module.exports = router;