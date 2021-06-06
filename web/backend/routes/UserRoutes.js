const { Router } = require("express");
const userController = require("../controllers/UserController");
const { requireAuth } = require('../middleware/authenticate');
const { authorizeApplicant } = require("../middleware/authorize");

const router = Router();

router.post('/signup', userController.verifySignup(), userController.signup);
router.post('/login', userController.verifyLogin(), userController.login);
router.get('/me', requireAuth, userController.me);
router.put('/update_profile', requireAuth, userController.verifyUpdate(), userController.update);

router.get('/answers/:jobID', requireAuth, authorizeApplicant, userController.viewAnswers);

module.exports = router;