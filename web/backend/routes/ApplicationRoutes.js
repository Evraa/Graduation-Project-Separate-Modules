const { Router, application } = require("express");
const applicationController = require("../controllers/ApplicationController");
const { requireAuth } = require("../middleware/authenticate");
const { authorizeApplicant } = require("../middleware/authorize");

const router = Router();

router.get('/api/application/:id', requireAuth, applicationController.view);

router.post('/api/application/:jobID', requireAuth, authorizeApplicant,
    applicationController.verifyJobID(), applicationController.verifyAnswers(),
    applicationController.store);

router.post('/api/application/:jobID/resume', requireAuth, authorizeApplicant,
    applicationController.verifyJobID(),
    applicationController.uploadResume.single('resume'), applicationController.storeResume);

router.get('/uploads/resumes/:fileName', requireAuth, applicationController.viewResume);

module.exports = router;