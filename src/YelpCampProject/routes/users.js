const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');

router
  .route('/register')
  .get(users.renderRegister)
  .post(catchAsync(users.register));

router.route('/login')
  .get(users.renderLogin)
  .post(storeReturnTo, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash('error', 'Invalid username or password');
        return res.redirect('/login');
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        req.flash('success', 'Welcome back!');
        const redirectUrl = req.session.returnTo || '/campgrounds';
        delete req.session.returnTo;
        res.redirect(redirectUrl);
      });
    })(req, res, next);
  });

// router.get('/logout', (req, res) => {
//     req.logout();
//     req.flash('success', 'Goodbye!');
//     res.redirect('/campgrounds');
// })
router.get('/logout', users.logout);

module.exports = router;
