// -------------------------DEPENDENCIES-------------------------
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

// --------------------------MIDDLEWARE--------------------------

app.use(morgan('dev'));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('mySecret'));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



// -------------------------HELPER FUNCTIONS-------------------------

const generateRandomString = () => {
  return Math.random().toString(36).slice(2,8);
};

const getUserByEmail = function(email) {
  const keys = Object.keys(users);
  // console.log(keys);
  for (const key of keys) {
    // console.log(users[key].email, req.body.email);
    if (users[key].email === email) {
      return users[key];
    }
  }
  return null;
};


// --------------------------------DATA--------------------------------

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


// -------------------------GET ROUTE HANDLERS-------------------------

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  
  const userId = req.cookies["user_id"];
  if (userId) {
    const templateVars = {
      user: users[userId], // a single key-value for the particular user
      urls: urlDatabase };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});


app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  console.log("urlDatabase", urlDatabase);
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]

  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


app.get("/register", (req, res) => {
  // new insert, please check:
  const user = req.cookies["user_id"];
  if (user) {
    res.redirect('/urls'); // only slash when redirecting
  } else {
    const templateVars = {
      user: null
    };
    res.render('urls_register', templateVars);
  }
});

app.get("/login", (req, res) => {
  const user = req.cookies["user_id"];
  const templateVars = { user };
  res.render('urls_login', templateVars);
});

// -------------------------POST ROUTE HANDLERS-------------------------

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortUrl = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortUrl] = longURL;
  res.redirect(`/urls/${shortUrl}`); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls/");
});

app.post("/urls/:id", (req, res) => { // issue with the oldURL not showing.
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect(`/urls/`);
});

// inputing login on the header:
app.post("/login", (req, res) => {
  console.log('starting post request');
  const userEmail = req.body.email;
  console.log('req.body', req.body);
  const user = getUserByEmail(userEmail);
  
  if (user) {
    res.cookie('user_id', user.id);
    if (user.password === req.body.password) {
      res.redirect('/urls');
    } else {
      return res.status(403).send('Invalid Password');
    }
  }
  return res.status(403).send('User not found. Please register.');
});

// logout & clear user_id cookie
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
  // const userId = req.body.userId;
  // const templateVars = {
  //   userId: users[userId]
  // };
  // res.clearCookie('user_id', userId);
  // res.redirect('/urls', templateVars);
  
});


app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const { email, password } = req.body; // { email: req.body.email, password: req.body.password }
  if (email === "" || password === "") {
    return res.status(400).send('Invalid Credentials');
  }
  if (getUserByEmail(req.body.email)) {
    return res.status(400).send('Email is already taken.');
  }
  users[userId] = { id: userId, email: email, password: password };
  res.cookie('user_id', userId);
  res.redirect('/urls');
});



// -------------------------EXTRAS-------------------------

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
  // res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
 

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });


// // extra code of my own to help myself understand the concept:
// app.get("/myown", (req, res) => {
//   const templateVars = { urls: urlDatabase, name:'Eunsoo' };
//   res.render("urls_myown", templateVars);
// });