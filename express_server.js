const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const tools = require('./functions');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use('/styles', express.static(__dirname + '/styles'));

const urlDatabase = {
	'b2xVn2': 'http://www.lighthouselabs.ca',
	'9sm5xK': 'http://www.google.com'
};
const users = { 
	'userRandomID': {
		id: 'userRandomID',
		userName: 'Bob', 
		userEmail: 'user@example.com', 
		password: 'purple-monkey-dinosaur'
	},
	'user2RandomID': {
		id: 'user2RandomID',
		userName: 'John', 
		userEmail: 'user2@example.com', 
		password: 'dishwasher-funk'
	}
};

app.get('/', (req, res) => {
	res.redirect('/urls');
});

app.get('/urls', (req, res) => {
	let templateVars = { urls: urlDatabase, user: users[req.cookies['userID']]};
	res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
	let newShortURL = tools.generateRandomString();
	urlDatabase[newShortURL] = req.body.longURL;
	res.redirect(`/urls/${newShortURL}`);
});

app.post('/logout', (req, res) => {
	res.clearCookie('userID');
	res.redirect('/urls');
});

app.get('/register', (req, res) => {
	let templateVars = { user: users[req.cookies['userID']], error: ''};
	res.render('register', templateVars);
});

app.post('/register', (req, res) => {
	// Newly generated user ID;
	const newID = tools.generateId();
	console.log(newID);
	const enteredUser = req.body.userName;
	const enteredEmail = req.body.userEmail;
	let templateVars = {user: users[req.cookies['userID']], error: ''};

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
			password: req.body.password
		};
		res.cookie('userID', newID);
		console.log(users);
		res.redirect('/urls');
	}
});

app.get('/login', (req, res) => {
	let templateVars = { user: users[req.cookies['userID']], error: ''};
	res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
	const loginEmail = req.body.userEmail;
	const loginPassword = req.body.password;
	let loggedUser = '';
	let templateVars = { urls: urlDatabase, user: users[req.cookies['userID']], error: ''};
	Object.keys(users).forEach(user => {
		if (users[user].userEmail === loginEmail && users[user].password === loginPassword) {
			loggedUser = users[user].id;
		}
	});
	if (loggedUser != '') {
		res.cookie('userID', loggedUser);
		templateVars.user = users[loggedUser];
		res.render('urls_index', templateVars);
	} else {
		templateVars.error = 'The email address and password you entered did not match our records';
		res.status(400);
		res.render('urls_login', templateVars);
	}

});




app.get('/urls.json', (req, res) => {
	res.json(urlDatabase);
});


app.get('/urls/new', (req, res) => {
	let templateVars = { urls: urlDatabase, user: users[req.cookies['userID']]};
	res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
	let templateVars = {
		shortURL: req.params.id,
		longURL: urlDatabase,
		user: users[req.cookies['userID']]};
	res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
	urlDatabase[req.params.id] = req.body.updatedURL;
	res.redirect('/urls');
});
app.get('/u/:shortURL', (req, res) => {
	let longURL = urlDatabase[req.params.shortURL];
	res.redirect(longURL);
});
app.post('/urls/:id/delete', (req, res) => {
	delete urlDatabase[req.params.id];
	res.redirect('/urls');
});


// You can only send variable to EJS inside an object
app.get('/hello', (req, res) => {
	let templateVars = { greeting: 'Hello World!' };
	res.render('hello_world', templateVars);
});

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
