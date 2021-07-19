const { Router } = require("express");
const jobController = require("../controllers/JobController");
const { requireAuth } = require("../middleware/authenticate");
const { authorizeHR, authorizeAdminOrHR, authorizeApplicant } = require("../middleware/authorize");

const router = Router();

router.get('/', jobController.verifyIndex(), jobController.index);
router.get('/search', jobController.verifySearch(), jobController.search);

router.get('/:id', jobController.view);
router.get('/:id/application', requireAuth, authorizeApplicant, jobController.verifyJobID(), jobController.viewApplication);
router.get('/:id/resumes', requireAuth, authorizeHR, jobController.verifyJobID(), jobController.getResumes);

router.get('/:id/analyzeResumes', requireAuth, authorizeHR, jobController.analyzeResumes);
router.post('/:id/rankedApplicants', requireAuth, authorizeHR, 
    jobController.verifyRankedApplicants(), jobController.storeRankedApplicants);
router.get('/:id/rankedApplicants', requireAuth, authorizeHR, 
    jobController.verifyIndex(), jobController.getRankedApplicants);

router.post('/', requireAuth, authorizeHR, jobController.verifyStore(), jobController.store);

router.patch('/:id/enable',requireAuth, authorizeAdminOrHR, jobController.enable);
router.patch('/:id/disable',requireAuth, authorizeAdminOrHR, jobController.disable);

router.put('/:id',requireAuth, authorizeHR, jobController.verifyUpdate(), jobController.update);

module.exports = router;