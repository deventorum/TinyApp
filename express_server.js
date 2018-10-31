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
const users = {};

app.get('/', (req, res) => {
	res.send('Hello!');
});

app.get('/urls', (req, res) => {
	let templateVars = { urls: urlDatabase, userEmail: req.cookies['userEmail']};
	res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
	let newShortURL = tools.generateRandomString();
	urlDatabase[newShortURL] = req.body.longURL;
	res.redirect(`/urls/${newShortURL}`);
});

app.post('/logout', (req, res) => {
	res.clearCookie('userEmail');
	res.redirect('/urls');
});

app.get('/register', (req, res) => {
	let templateVars = { userEmail: req.cookies['userEmail']};
	res.render('register', templateVars);
});
app.post('/register', (req, res) => {
	
	res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
	res.json(urlDatabase);
});

app.post('/urls/login', (req, res) => {
	if (tools.validateEmail(req.body.userEmail)) {
		res.cookie('userEmail', req.body.userEmail);
		console.log('Cookies: ', res.cookie);
		res.redirect('/urls');
	} else {
		let templateVars = { urls: urlDatabase, errorMessage: 'The entered email address is not valid!', userEmail: req.cookies['userEmail'] };
		res.render('urls_error', templateVars);
	}
});

app.get('/urls/new', (req, res) => {
	let templateVars = { urls: urlDatabase, userEmail: req.cookies['userEmail']};
	res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
	let templateVars = {
		shortURL: req.params.id,
		longURL: urlDatabase,
		userEmail: req.cookies['userEmail']};
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
