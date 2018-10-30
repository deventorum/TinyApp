const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

function generateRandomString() {
	const set = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
	const output = [];
	for (let i = 0; i < 6; i++) {
		output.push(set[Math.floor(Math.random() * 36 + 1)]);
	}
	return output.join('');
}
const urlDatabase = {
	'b2xVn2': 'http://www.lighthouselabs.ca',
	'9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => {
	res.send('Hello!');
});

app.get('/urls', (req, res) => {
	let templateVars = { urls: urlDatabase };
	res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
	let newShortURL = generateRandomString();
	urlDatabase[newShortURL] = req.body.longURL;
	res.redirect(`/urls/${newShortURL}`);
});

app.get('/urls.json', (req, res) => {
	res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
	res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
	let templateVars = {
		shortURL: req.params.id,
		longURL: urlDatabase};
	res.render('urls_show', templateVars);
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
