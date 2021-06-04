const { Router } = require("express");
const questionControler = require("../controllers/QuestionController");
const { requireAuth } = require("../middleware/authenticate");
const { authorizeHR, authorizeAdminOrHR } = require("../middleware/authorize");

const router = Router();

router.get('/', requireAuth, authorizeAdminOrHR, questionControler.verifyIndex(), questionControler.index);
router.get('/search', requireAuth, authorizeAdminOrHR, questionControler.verifySearch(), questionControler.search);
router.get('/:id', requireAuth, authorizeAdminOrHR, questionControler.view);

router.post('/', requireAuth, authorizeHR, questionControler.verifyStore(), questionControler.store);

router.delete('/:id',requireAuth, authorizeAdminOrHR, questionControler.destory);

module.exports = router;