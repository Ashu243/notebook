const express = require('express');
const router = express.Router();
const passport = require('passport');
const userSchema = require('./users')

// Register route
router.get('/', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

router.post('/register', function(req, res, next) {
  // Create a new user using Passport-Local-Mongoose
  userSchema.register(new userSchema({ username: req.body.username, name: req.body.name, email: req.body.email }), req.body.password, function(err, user) {
    if (err) {
      console.error(err);
      return res.render('register', { title: 'Register' });
    }
    passport.authenticate('local')(req, res, function() {
      res.redirect('/feed');
    });
  });
});

// Login route
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});
router.get('/feed',isLoggedIn, async function(req, res, next) {
  const user = await userSchema.findOne({username: req.session.passport.user})
  res.render('feed', { title: 'feed', user });
});
router.post('/login', passport.authenticate('local', {
  successRedirect: '/feed',
  failureRedirect: '/login'
}));

router.post('/note', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userSchema.findOneAndUpdate(
      { username: req.session.passport.user },
      {
        $push: {
          note: {
            title: req.body.title,
            content: req.body.content
          }
        }
      },
      { new: true }
    );

    await user.save();
    res.redirect('/feed');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/delete-note/:id', isLoggedIn, async (req, res) => {
  const noteId = req.params.id;

  try {
    const deletedNote = await userSchema.findOneAndUpdate(
      { 'note._id': noteId },
      { $pull: { note: { _id: noteId } } },
      { new: true }
    );

    console.log('deletedNote:', deletedNote);

    if (deletedNote) {
      res.redirect('/feed'); // Redirect to the home page or any other page
    } else {
      console.log('Note not found or already deleted');
      res.status(404).send('Note not found or already deleted');
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).send('Internal Server Error');
  }
});


  // You need to adapt this code based on your database setup and ORM.


// Logout route
router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Middleware to check if the user is authenticated
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Example of a protected route
router.get('/profile', isLoggedIn, async function(req, res, next) {
  const user = await userSchema.findOne({username: req.session.passport.user})
  // console.log(user)
  res.render('profile',  { title: 'Profile', user });
});

module.exports = router;
