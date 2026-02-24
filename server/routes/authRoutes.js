const router = require('express').Router();
const passport = require('passport');
const { register, login, googleCallback, forgotPassword, resetPassword } = require('../controllers/authController');
const { validate, schemas } = require('../middleware/validate');

router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), googleCallback);

module.exports = router;
