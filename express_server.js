const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const tools = require('./functions');
const bcrypt = require('bcrypt');

app.use(cookieSession({
	name: 'session',
	keys: ['asdfg'],
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use('/styles', express.static(__dirname + '/styles'));

const urlDatabase = {
	'b2xVn2': {id: 'userRandomID',
		url: 'http://www.lighthouselabs.ca'},
	'9sm5xK': {id: 'user2RandomID',
		url: 'http://www.google.com'}
};
const users = { 
	'userRandomID': {
		id: 'userRandomID',
		userName: 'Bob', 
		userEmail: 'user@example.com', 
		password: bcrypt.hashSync('purple-monkey-dinosaur', 10)
	},
	'user2RandomID': {
		id: 'user2RandomID',
		userName: 'John', 
		userEmail: 'user2@example.com', 
		password: bcrypt.hashSync('dishwasher-funk', 10)
	}
};

app.get('/', (req, res) => {
	res.redirect('/urls');
});

app.get('/urls', (req, res) => {
	let templateVars = { urls: urlDatabase, user: users[req.session['userID']]};
	res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
	let newShortURL = tools.generateRandomString();
	urlDatabase[newShortURL] = {id: users[req.session['userID']].id, url: req.body.longURL};
	res.redirect(`/urls/${newShortURL}`);
});

app.post('/logout', (req, res) => {
	req.session = null;
	res.redirect('/urls');
});

app.get('/register', (req, res) => {
	let templateVars = { user: users[req.session['userID']], error: ''};
	res.render('register', templateVars);
});

app.post('/register', (req, res) => {
	// Newly generated user ID;
	const newID = tools.generateId();
	const enteredUser = req.body.userName;
	const enteredEmail = req.body.userEmail;
	let templateVars = {user: users[req.session['userID']], error: ''};

	// password check
	if (req.body.password !== req.body.confPassword) {
		templateVars.error = 'passwords don\'t match';
		res.status(400);
		res.render('register', templateVars);
	// existing user check
	} else if (tools.validateUser(users, enteredUser, enteredEmail)) {
		templateVars.error = 'User already exists';
		res.status(400);
		res.render('register', templateVars);
	// incomplete form check (partially done on the front end)
	} else if (enteredEmail === '' || enteredUser === '' || req.body.password === '') {
		templateVars.error = 'Registration information is incomplete';
		res.status(400);
		res.render('register', templateVars);
	} else if (!tools.validateEmail(enteredEmail)) {
		templateVars.error = 'Entered email address is not valid';
		res.status(400);
		res.render('register', templateVars);
	} else {
		users[newID] = {
			id: newID,
			userName: enteredUser,
			userEmail: enteredEmail,
			password: bcrypt.hashSync(req.body.password, 10)
		};
		req.session['userID'] = newID;
		res.redirect('/urls');
	}
});

// Login page
app.get('/login', (req, res) => {
	let templateVars = {
		user: users[req.session['userID']],
		error: ''};
	res.render('urls_login', templateVars);
});

// 
app.post('/login', (req, res) => {
	const loginEmail = req.body.userEmail;
	const loginPassword = req.body.password;
	let loggedUser = '';
	let templateVars = { urls: urlDatabase, user: users[req.session['userID']], error: ''};
	
	// Server checks if there is a match (by email and hashed password) in the existing database
	Object.keys(users).forEach(user => {
		if (users[user].userEmail === loginEmail && bcrypt.compareSync(loginPassword, users[user].password)) {
			loggedUser = users[user].id;
		}
	});
	if (loggedUser != '') {
		req.session['userID'] = loggedUser;
		templateVars.user = users[loggedUser];
		res.render('urls_index', templateVars);
	} else {
		templateVars.error = 'The email address and password you entered did not match our records';
		res.status(403);
		res.render('urls_login', templateVars);
	}

});


// adds a new short link
app.get('/urls/new', (req, res) => {
	if (req.session['userID']) {
		let templateVars = { urls: urlDatabase, user: users[req.session['userID']]};
		if (users[req.session['userID']] !== undefined) {
			res.render('urls_new', templateVars);
		}
	}
	res.redirect('/urls');
});

// User can change the existing short URL (only if there is a proper cookie)
app.get('/urls/:id', (req, res) => {
	if (req.session['userID']) {
		if (users[req.session['userID']].id === urlDatabase[req.params.id].id) {
			let templateVars = {
				shortURL: req.params.id,
				longURL: urlDatabase,
				user: users[req.session['userID']]
			};
			res.render('urls_show', templateVars);
		} 
	} else {
		res.redirect('/urls');
	}
});

// Updates an existing short URL if user has a cookie 
app.post('/urls/:id', (req, res) => {
	if (req.session['userID']) {
		if (users[req.session['userID']].id === urlDatabase[req.params.id].id) {
			urlDatabase[req.params.id] = {
				id: users[req.session['userID']].id,
				url: req.body.updatedURL
			};
		}
	}
	res.redirect('/urls');
});

// Redirects user to the other website that store in URL database (no cookie needed)
app.get('/u/:shortURL', (req, res) => {
	let longURL = urlDatabase[req.params.shortURL].url;
	res.redirect(longURL);
});

// Deletes a short URL if user has a cookie
app.post('/urls/:id/delete', (req, res) => {
	if (req.session['userID']) {
		if (users[req.session['userID']].id === urlDatabase[req.params.id].id) {
			delete urlDatabase[req.params.id];
		}
	}
	res.redirect('/urls');
});

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
