'use strict'

const express = require('express'), app = express(),
    path = require('path'),
    session = require('express-session'),
    passport = require('passport'),
    Local = require('passport-local').Strategy,
    GitHubStrategy = require('passport-github2').Strategy,
    LinkedInStrategy = require('passport-linkedin-oauth2').Strategy,
    bodyParser = require('body-parser'),
    low = require('lowdb'),
    FileSync = require('lowdb/adapters/FileSync'),
    flash = require('connect-flash'),
    _ = require('lodash/core'),
    fp = require('lodash/fp'),
    array = require('lodash/array'),
    shortid = require('shortid'),
    object = require('lodash/fp/object');


let GITHUB_CLIENT_ID = "f4d40f731dad92a917f1";
let GITHUB_CLIENT_SECRET = "90ec29bbc5afed43192af06646c5a510ff88948b";
let LINKEDIN_KEY = "789ky2lqbu00yq";
let LINKEDIN_SECRET = "bwO2zuV3mAbgBdCk";
let curUser = "";

app.use(bodyParser.json());
app.use(express.static('public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(flash());
app.use(session({secret: '{secret}', name: 'session_id', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});


app.get('/', function (req, res) {
    res.sendFile(__dirname+'/index.html');
});


//GET Post-authentication
app.get('/authenticated', (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/')
    },
    function (req, res) {
        res.sendFile(path.join(__dirname, '/public/userPage.html'));
    });


const adapter = new FileSync('db.json');
const db = low(adapter);
// all authentication requests in passwords assume that your client
// is submitting a field named "username" and field named "password".
// these are both passed as arguments to the authentication strategy.
const myLocalStrategy = function (req, username, password, done) {

    if (req.body.firstname !== undefined) {
        return done(null, false, {message: 'sign up request'})
    }

    //find the user that matches the username
    const user = db.get('users').find({'username': username}).value();

    // if user is undefined, then there was no match for the submitted username
    if (user === undefined) {
        return done(null, false, {message: 'user not found'})
    } else if (user.pass === password) { //user found with matching pass
        console.log("found!");
        curUser = username;
        // curData = db.get('travels')
        //     .filter({'username': username})
        //     .value()

        return done(null, {username, password})
        // we found the user but the password didn't match...
    } else {
        console.log("noooo");
        return done(null, false, {message: 'incorrect password'})
    }
};

passport.use('local', new Local({
    usernameField: 'username',
    passwordField: 'pass',
    passReqToCallback: true
}, myLocalStrategy));

passport.use(new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/github/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        let c = db.get("users")
            .push({
                'username': profile.username + "/github",
                'firstName': profile.username,
                'lastName': profile.username,
                'pass': ''
            })
            .write();
        console.log("added to db user from github with following info ", c);
        return done(null, profile);
    }
));

passport.use(new LinkedInStrategy({
    clientID: LINKEDIN_KEY,
    clientSecret: LINKEDIN_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/linkedin/callback",
    profileFields: ['id', 'first-name', 'last-name', 'public-profile-url'],
    scope: ['r_emailaddress', 'r_liteprofile'],
}, function (accessToken, refreshToken, profile, done) {

    // In a typical application, you would want
    // to associate the LinkedIn account with a user record in your database,
    // and return that user instead.
    let v = db.get('users')
        .push({
            'username': profile.emails[0].value + "/linkedin",
            'firstname': profile.name.givenName,
            'lastname': profile.name.familyName,
            'pass': ""
        })
        .write();
    console.log("v is ", JSON.stringify(v));
    return done(null, profile);
}));

passport.initialize();


app.get('/auth/github',
    passport.authenticate('github', {scope: ['user:email']}));

app.get('/auth/github/callback',
    passport.authenticate('github', {failureRedirect: '/'}),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/authenticated');
    });

app.get('/auth/linkedin',
    passport.authenticate('linkedin', {state: '200'}));

app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', {
        successRedirect: '/authenticated',
        failureRedirect: '/'
    }), function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/authenticated');
    });

// POST
app.post('/login', passport.authenticate('local', {
        failureRedirect: 'back',
        failureFlash: true
    }),
    function (req, res) {
        res.status(200).json({status: 'ok'})
    });


//GET
app.get('/login', (req, res, next) => {
    db.get('users')
        .find({username: req.body.username})
        .value();
});


app.get('/logout', function (req, res) {
    console.log('logging out');
    req.logout();
    res.redirect('/');
});

//GET for user data
app.get('/getData', function (req, res) {

    let theData = db.get('travels')
        .filter({username: curUser})
        .value();
    res.status(200).json(theData)
});

app.post('/submit', function (req, res) {
    let jsonData = req.body;
    db.get('travels')
        .push({
            username: curUser,
            id: shortid.generate(),
            placeFrom: jsonData.placeFrom,
            placeTo: jsonData.placeTo,
            mode: jsonData.mode,
            returnval: jsonData.returnval
        })
        .write();
    res.status(200).json({status: 'ok'})
});

//GET for modifying user data
app.post('/modifyData', function (req, res) {
    let jsonData = req.body; //add field to json data with id
    for (let i = 0; i < jsonData.length; i++) {
        db.get('travels')
            .find({id: jsonData[i]['id']})
            .assign({
                distance: jsonData[i]['distance'],
                duration: jsonData[i]['duration']
            })
            .write()
    }
    res.status(200).json({status: 'ok'})

    //     let index = findLocalIndexList(jsonData[i])
    //     for(let j = 0; j < index.length; j++){
    //             console.log("heree")
    // curData[index[j]]['distance'] = jsonData[i]['distance'];
    // curData[index[j]]['duration'] = jsonData[i]['duration'];
    // db.get('travels')
    //     .find({id: jsonData[i]['id']})
    //     .assign({
    //         'distance': jsonData[i]['distance'],
    //         'duration': jsonData[i]['duration']
    //     })
    //     .write();
    // }
    // }
    // res.send("ok")

});


app.post("/deleteData", function (req, res) {
    let index = req.body.a;

    let v = db.get('travels')
        .remove({id: index})
        .write();
    // curData[index-1].username && log.placeFrom === curData[index-1].placeFrom && log.placeTo === curData[index-1].placeTo && log.mode === curData[index-1].mode && log.return === curData[index-1].return)


    // delete curData[index-1]
    res.status(200).json({status: 'ok'})
});

app.post("/userModify", function (req, res) {
    let index = req.body[0];
    let data = req.body[1];

    db.get('travels')
        .find(index)
        .assign(data)
        .write();

    res.status(200).json({status: 'ok'});
});


//custom middleware to find given json element in locally stored json file
function findLocalIndexList(jsonLine) {
    let result = [];
    for (let j = 0; j < curData.length; j++) {
        let cond1 = jsonLine['placeFrom'].toUpperCase() === curData[j]['placeFrom'].toUpperCase();
        let cond2 = jsonLine['placeTo'].toUpperCase() === curData[j]['placeTo'].toUpperCase();
        let cond3 = jsonLine['mode'].toUpperCase() === curData[j]['mode'].toUpperCase();
        if (cond1 && cond2 && cond3) {
            result.push(j);
        }
    }
    // console.log("result is : ", result)
    return result
}

app.listen(process.env.port || 3000, () => console.log('listening on port 3000'))

