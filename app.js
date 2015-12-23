var express = require('express');
var passport = require('passport');
var util = require('util');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var GitHubStrategy = require('passport-github2').Strategy;
var api = require('./api/api.js');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/auth/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
        return done(null, profile);
    });
  }
));

var app = express();


app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

app.use( "/private", [ ensureAuthenticated, express.static( "private" ) ] );
app.use( "/", express.static( "public" ) );
app.use('/api', [ensureAuthenticated, api.router]);

app.get('/', function(req, res){
  res.send("Welcome!");
});

app.get('/auth',
  passport.authenticate('github', { scope: [ 'user:email' ] }),
  function(req, res){
  });

app.get('/auth/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth');
};

app.listen(process.env.PORT || 3000)