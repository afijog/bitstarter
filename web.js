var express = require('express');
var fs = require('fs');
var index = fs.readFileSync('index.html');
var passport = require('passport');
var GoogleStrategy = require('passport-google').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var port = process.env.PORT || 5000; 
var host = process.env.HOST || 'localhost';
var adminMail = process.env.ADMIN_MAIL;
var url = 'http://'+host;

if (host === 'localhost') {
	url = url +':'+port
}

// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(new GoogleStrategy({
    returnURL: url+'/auth/google/return',
    realm: url+'/'
  },
  function(identifier, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

var app = express.createServer();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  
  app.use(app.router);
  app.use(express.static(__dirname + '/static'));
});

app.get('/', function(req, res){
  var nBackers = 2
  var nTotalBackers = 50
  var percBackers = (nBackers * 100 / nTotalBackers)
  
  res.render('index', { user: req.user, adminMail: adminMail , nBackers : nBackers, nTotalBackers: nTotalBackers, percBackers : percBackers});
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user, });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/admin', ensureAuthenticated, function(req, res){
  var user = req.user;
  var users = [];
  users.push(user);
  res.render('admin', { user: user, adminMail: adminMail, users : users });
});


// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve redirecting
//   the user to google.com.  After authenticating, Google will redirect the
//   user back to this application at /auth/google/return
app.get('/auth/google', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

// GET /auth/google/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/return', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(port, function() {
  console.log("Listening on " + port);
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}