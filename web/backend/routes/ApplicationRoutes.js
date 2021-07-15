const { Router, application } = require("express");
const applicationController = require("../controllers/ApplicationController");
const { requireAuth } = require("../middleware/authenticate");
const { authorizeApplicant, authorizeHR } = require("../middleware/authorize");

const router = Router();

router.post('/api/application/storeAnalyzedVideo', requireAuth, authorizeHR, 
    applicationController.verifyAnalyzedVideo(), applicationController.storeAnalyzedVideo);

router.get('/api/application/:id', requireAuth, applicationController.view);

router.post('/api/application/:jobID', requireAuth, authorizeApplicant,
    applicationController.verifyJobID(), applicationController.verifyAnswers(),
    applicationController.store);

router.post('/api/application/:jobID/resume', requireAuth, authorizeApplicant,
    applicationController.verifyJobID(),
    applicationController.uploadResume.single('resume'), applicationController.storeResume);

router.get('/uploads/resumes/:fileName', requireAuth, applicationController.viewResume);

router.delete('/uploads/resumes/:fileName', requireAuth, applicationController.destroyResume);

router.post('/api/application/:jobID/video', requireAuth, authorizeApplicant,
    applicationController.verifyJobID(),
    applicationController.uploadVideo.single('video'), applicationController.storeVideo);

router.get('/uploads/videos/:fileName', requireAuth, applicationController.viewVideo);

router.delete('/uploads/videos/:fileName', requireAuth, applicationController.destroyVideo);

module.exports = router;