// -------------------------DEPENDENCIES-------------------------
const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers.js');

const app = express();

// -----------------------------PORT-----------------------------

const PORT = 8080;

// --------------------------MIDDLEWARE--------------------------

// Configuration
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000
}));

// --------------------------------DATA--------------------------------

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID1"
  },
  ifB11r: {
    longURL: "https://www.naver.com",
    userID: "userRandomID"
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123",
  },
};

// -------------------------GET ROUTE HANDLERS-------------------------

// Test request
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Route for rendering the main dashboard:
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    return res.render("urls_error",{ errorMessage: "You are not logged in" });
  }

  const urls = urlsForUser(userId, urlDatabase);
  res.render("urls_index", { user, urls });
}
);

// Route for rendering the page for creating new short URL
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    const templateVars = {
      user: users[userId]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Route for rendering editing URL page
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    return res.render("urls_error", { errorMessage: "You are not logged in" });
  }
  const id = req.params.id;
  const url = urlDatabase[id];
  if (!url) {
    return res.render("urls_error", { errorMessage: "The url does not exist" });
  }

  if (url.userID !== userID) {
    // return res.send("You don't own the URL");
    return res.render("urls_error", { errorMessage: "You don't own the URL" });
  }

  const longURL = urlDatabase[id].longURL;
  res.render("urls_show", { user, id, longURL });
});

// Route for redirecting to the actual long URL site
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;

  if (!urlDatabase[shortURL]) {
    return res.status(404).render('urls_error', { errorMessage: "The id does not exist"});
  } else {
    return res.redirect(longURL);
  }
});

// Route for rendering the registration page
app.get("/register", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: null
    };
    res.render('urls_register', templateVars);
  }
});

// Route for rendering the login page.
app.get("/login", (req, res) => {
  const user = req.session.user_id;
  const templateVars = { user };
  if (!user) {
    return res.render('urls_login', templateVars);
  } else {
    return res.redirect('/urls');
  }
});

// -------------------------POST ROUTE HANDLERS-------------------------

// Route for posting requests on the main dashboard
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (!user) {
    return res.status(404).send("Please login before using Tinyapp");
  }

  const shortUrl = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortUrl] = { longURL, userID };
  return res.redirect(`/urls/${shortUrl}`);
  
});

// Deleting a url from main dashboard
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  
  if (!user) {
    return res.render("urls_error", { errorMessage: "You are not logged in" });
  }
  
  const id = req.params.id;
  const url = urlDatabase[id];
  if (!url) {
    return res.send("The url does not exist");
  }

  if (url.userID !== userID) {
    return res.send("You don't own the URL");
  }

  if (!urlDatabase[id]) {
    return res.send("The url does not exist");
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls/");
});

// Post requests for editing the existing urls
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  
  if (!user) {
    return res.render("urls_error", { errorMessage: "You are not logged in" });
  }
  
  const id = req.params.id;
  const url = urlDatabase[id];
  if (!url) {
    return res.send("The url does not exist");
  }

  if (url.userID !== userID) {
    return res.send("You don't own the URL");
  }

  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect(`/urls/`);
});

// Inputing login on the header:
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const user = getUserByEmail(userEmail, users);
  
  if (userEmail === "" || req.body.password === "") {
    return res.status(400).render('urls_error', { errorMessage: "Invalid Credentials"});
  }

  if (!user) {
    return res.status(404).render('urls_error', { errorMessage: "User not found. Please register."});
  }
  
  const password = req.body.password;
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).render('urls_error', { errorMessage: "Invalid Password"});
  }
    
  // eslint-disable-next-line camelcase
  req.session.user_id = user.id;
  res.redirect('/urls');
});

// Logout & clear user_id cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Posting requests on registration page
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  if (email === "" || password === "") {
    return res.status(400).render('urls_error', { errorMessage: "Invalid Credentials"});
  }
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).render('urls_error', { errorMessage: "Email is already taken"});
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  users[id] = { id: id, email: email, password: hashedPassword};

  // eslint-disable-next-line camelcase
  req.session.user_id = id;
  res.redirect('/urls');
});

// -------------------------EXTRAS-------------------------

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

// -------------------------LISTENER-------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});