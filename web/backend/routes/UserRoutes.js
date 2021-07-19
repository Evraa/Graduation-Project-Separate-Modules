const { Router } = require("express");
const userController = require("../controllers/UserController");
const { requireAuth } = require('../middleware/authenticate');
const { authorizeAdmin } = require("../middleware/authorize");

const router = Router();

router.post('/signup', userController.verifySignup(), userController.signup);
router.post('/login', userController.verifyLogin(), userController.login);
router.get('/me', requireAuth, userController.me);
router.put('/update_profile', requireAuth, userController.verifyUpdate(), userController.update);

router.patch('/:id/promote', requireAuth, authorizeAdmin, userController.verifyUserID(), userController.promote);
router.patch('/:id/demote', requireAuth, authorizeAdmin, userController.verifyUserID(), userController.demote);

router.get('/', requireAuth, authorizeAdmin, userController.verifyIndex(), userController.index);
router.get('/search', requireAuth, authorizeAdmin, userController.verifySearch(), userController.search);

router.get('/:id', requireAuth, authorizeAdmin, userController.verifyUserID(), userController.view);

router.post('/picture', requireAuth,
    userController.uploadPicture.single('picture'), userController.storePicture);

router.delete('/picture', requireAuth, userController.destroyPicture);


module.exports = router;