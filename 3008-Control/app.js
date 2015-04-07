/*
 * Module Dependencies 
 */
var express = require('express'),
http = require('http'),
path = require('path'),
mongoose = require('mongoose'),
fs = require('fs'),
csv = require('csv-write-stream');

app = express();

/*
 * Module for writing CSV data
 */
var writer = csv({ headers: ["time", "site", "user", "scheme", "mode", "event", "data"]});
writer.pipe(fs.createWriteStream('ControlPassword_log.csv'));

/*
 * Database and Model
 */
mongoose.connect("mongodb://localhost/3008DB");
var User = mongoose.model('users', new mongoose.Schema({
	username: String,
	emailPassword: String,
	emailAttempts: Number,
	facebookPassword: String,
	facebookAttempts: Number,
	bankPassword: String,
	bankAttempts: Number
}));

/*
 * Middleware and configurations
 */
app.configure(function () {
	app.use(express.bodyParser());
	app.use(express.cookieParser('Authentication Tutorial '));
	app.use(express.session());
	app.use(express.static(path.join(__dirname, 'public')));
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
});

app.use(function (req, res, next) {
	var err = req.session.error,
	msg = req.session.success;
	delete req.session.error;
	delete req.session.success;
	res.locals.message = '';
	if (err) res.locals.message = err;
	if (msg) res.locals.message = msg;
	next();
});

/*
 * Helper Functions
 */
function authenticate(username, pass, purpose, fn) {
	console.log('authenticating %s:%s', username, pass);

	// Finds the user in the database
	User.findOne({
		username: username
	}, function (err, user) {
		if (user) {
			// User not found
			if (err) {
				return fn(new Error('cannot find user'));
			}
			
			// variable containing the correct password to be compared agaisnt
			var correctPassword;
			
			// depending on the purpose of the password being used (email, facebook or bank) sets correctPassword to the correct password
			switch(purpose) {
				case "Email":
					// increment amount of attempts and save to database
					user.emailAttempts++;
					user.save(function(err) {
						if (err) { 
							return fn(new Error('Im sorry, we were unable to save your user.'));
						}
					});
					
					// user is allowed no more than three attempts
					if(user.emailAttempts > 3) {
						return fn("I'm sorry, you've already attempted to log into your email three times.");
					}
					
					correctPassword = user.emailPassword;
					break;
				case "Facebook":
					// increment amount of attempts and save to database
					user.facebookAttempts++;
					user.save(function(err) {
						if (err) { 
							return fn(new Error('Im sorry, we were unable to save your user.'));
						}
					});
					
					// user is allowed no more than three attempts
					if(user.facebookAttempts > 3) {
						return fn("I'm sorry, you've already attempted to log into facebook three times.");
					}
					
					correctPassword = user.facebookPassword;
					break;
				case "Bank":
					// increment amount of attempts and save to database
					user.bankAttempts++;
					user.save(function(err) {
						if (err) { 
							return fn(new Error('Im sorry, we were unable to save your user.'));
						}
					});
					
					// user is allowed no more than three attempts
					if(user.bankAttempts > 3) {
						return fn("I'm sorry, you've already attempted to log into your bank three times.");
					}
					
					correctPassword = user.bankPassword;
					break;
				default:
					return fn(new Error('Im sorry, please select a valid purpose.'))
			}
			
			// if the password the user submitted matches the correct password
			if(pass.localeCompare(correctPassword) == 0) {
				return fn(null, user);
			} else {
				fn(new Error('Im sorry, the username and password you have entered do not match.'));
			}
		} else {
			return fn(new Error('Im sorry, the user could not be found.'));
		}
	});
}

// used to check to see if the specified user name has already been used
function userExist(req, res, next) {
	User.count({
		username: req.body.username
	}, function (err, count) {
		if (count === 0) {
			next();
		} else {
			req.session.error = "User Exist"
			res.redirect("/signup");
		}
	});
}

// creates a new randomly generated password, each letter represents an emoji
function createPassword() {
	// there are 21 possible emoji characters
	var possible = "abcdefghijklmnopqrstu";
	var password = "";
	
	// create a password of length six with randomly selected emojis
	for( var i=0; i < 6; i++ ) {
		password += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	
	return password;
}

/*
Routes
*/
// '/' is not used, redirect the user to the proper page
app.get("/", function (req, res) {
	if (typeof req.session.user !== 'undefined') {
		res.redirect("/login")
	} else {
		res.redirect("/signup");
	}
});

// retrieves the signup page so that the user can set their username
app.get("/signup", function (req, res) {
	res.render("signup", {title: "Set Username"});
});

// handles the user's request to set their username
app.post("/signup", userExist, function(req, res) {
	var username = req.body.username;
	// log the creation of the user to the csv file
	writer.write([new Date().toString(), 'emoji', username, 'emoji', 'create', 'start', req.body.browserData]);

	// create/add new user to the database
	var user = new User({
		username: username,
		emailPassword: createPassword(),
		emailAttempts: 0,
		facebookPassword: createPassword(),
		facebookAttempts: 0,
		bankPassword: createPassword(),
		bankAttempts: 0
	}).save(function (err, newUser) {
		if (err) throw err;
		User.findOne({
			username: username
		}, function (err, user) {
			if (user) {
				// create a new session with the user
				req.session.regenerate(function(){
					req.session.user = user;
					// log the successful creation of the user to the csv file
					writer.write([new Date().toString(), 'emoji', user.username, 'emoji', 'create', 'passwordSubmitted', req.body.browserData]);
					res.redirect("/dashboard");
				});
			} else {
				return fn(new Error('cannot find user'));
			}
		});
	});
});

// retrieves the dashboard for the user to review their passwords
app.get("/dashboard", function(req, res) {
	// sets the user to the current session's user
	var user = req.session.user;
	
	// check if the session has a user or not, redirect appropriately
	if(typeof user !== 'undefined') {
		res.render("dashboard", {message: "Welcome", username: user.username});
	} else {
		res.render("error", {message: "You are not currently in a session."});
	}
});

// displays the user's password for the user to review
app.get('/password', function(req, res) {
	var user = req.session.user;
	
	if(typeof user !== 'undefined') {
		// find the current user in the database
		User.findOne({
			username: user.username
		}, function (err, user) {
			if (user) {
				if (err) {
					res.render("error", {message: "Error retrieving user from the database."});
				}
				
				var correctPassword;

				// Return the password for purpose that the user is reviewing
				switch(req.query.purpose) {
					case "Email":
						correctPassword = user.emailPassword;
						break;
					case "Facebook":
						correctPassword = user.facebookPassword;
						break;
					case "Bank":
						correctPassword = user.bankPassword;
						break;
					default:
						res.render("error", {message: "The purpose of your password is invalid."});
						break;
				}
				
				// renders the view with the appropriate variables
				res.render("password", {message: "Welcome", username: user.username, purpose: req.query.purpose, password: correctPassword});
			} else {
				res.render("error", {message: "User was not found."});
			}
		});
	} else {
		res.render("error", {message: "You are not currently in a session."});
	}
});

// renders the page for the user to attempt to log in
app.get("/login", function (req, res) {
	var user = req.session.user;
	
	if(typeof user !== 'undefined') {
		// writes to the csv file the time the user entered the login page, in order to determine how long the user took
		writer.write([new Date().toString(), 'emoji', req.session.user.username, 'emoji', 'login', 'start', req.body.browserData]);
		res.render("login", {username: req.session.user.username});
	} else {
		res.render("error", {message: "You are not currently in a session."});
	}
});

// handles the user's attempt to log in
app.post("/login", function (req, res) {
	// call the athenticate function with callback as the last parameter
	authenticate(req.body.username, req.body.password, req.body.purpose, function (err, user) {
		if (user) {
			// user was successful logging in, log it to the csv file	
			writer.write([new Date().toString(), 'emoji', user.username, req.body.purpose, 'login', 'success', req.body.browserData]);
			res.render("landing", { username: user.username });
		} else {
			// user was unsuccessful loggin in, log it to the csv file
			writer.write([new Date().toString(), 'emoji', req.session.user.username, req.body.purpose, 'login', 'failure', req.body.browserData]);
			res.render("login", { username: req.session.user.username, error: err, purpose: req.body.purpose});
		}
	});
});

// logs out the current session's user
app.get('/logout', function (req, res) {
	// record the log out to the csv file
	writer.write([new Date().toString(), 'emoji', req.session.user.username, 'emoji', 'end', 'session', req.body.browserData]);
	req.session.destroy(function () {
		res.redirect('/');
	});
});

http.createServer(app).listen(3000);


