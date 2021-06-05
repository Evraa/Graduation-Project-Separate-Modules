const { Router } = require("express");
const jobController = require("../controllers/JobController");
const { requireAuth } = require("../middleware/authenticate");
const { authorizeHR, authorizeAdminOrHR } = require("../middleware/authorize");

const router = Router();

router.get('/', jobController.verifyIndex(), jobController.index);
router.get('/search', jobController.verifySearch(), jobController.search);

router.get('/:id', jobController.view);

router.post('/', requireAuth, authorizeHR, jobController.verifyStore(), jobController.store);

router.patch('/:id/enable',requireAuth, authorizeAdminOrHR, jobController.enable);
router.patch('/:id/disable',requireAuth, authorizeAdminOrHR, jobController.disable);

router.put('/:id',requireAuth, authorizeHR, jobController.verifyUpdate(), jobController.update);

module.exports = router;