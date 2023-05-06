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

const urlsForUser = function(id) {
  const urls = {};
  const keys = Object.keys(urlDatabase);
  for (const key of keys) {
    const url = urlDatabase[key]; //urlObj
    if (url.userID === id) {
      urls[key] = url; // will add to the new url object
    }
  }
  return urls;
};

const checkPermissions = function(req, res) {
  const userID = req.cookies.user_id;
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
};

// --------------------------------DATA--------------------------------

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  if (!user) {
    // return res.redirect("/login");
    return res.render("urls_error",{ errorMessage: "You are not logged in" });
  }

  const urls = urlsForUser(userId);
  res.render("urls_index", { user, urls });
}
);


app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    const templateVars = {
      user: users[userId]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies.user_id;
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

  const longURL = urlDatabase[id].longURL;
  res.render("urls_show", { user, id, longURL });
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;

  if (!urlDatabase[shortURL]) {
    return res.status(404).render('urls_error', { errorMessage: "The id does not exist"});
  } else {
    // console.log(urlDatabase[shortURL]);
    return res.redirect(longURL);
  }
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
  if (user) {
    return res.redirect('/urls');
  } else {
    return res.render('urls_login', templateVars);
  }
});

// -------------------------POST ROUTE HANDLERS-------------------------

app.post("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];

  if (!user) {
    return res.status(404).send("Please login before using Tinyapp");
  }

  const shortUrl = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortUrl] = { longURL, userID };
  return res.redirect(`/urls/${shortUrl}`); // Respond with 'Ok' (we will replace this)
  
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.cookies.user_id;
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

app.post("/urls/:id", (req, res) => { // issue with the oldURL not showing.
  const userID = req.cookies.user_id;
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

// inputing login on the header:
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  // console.log('req.body', req.body);
  const user = getUserByEmail(userEmail);
  
  if (!user) {
    return res.status(404).render('urls_error', { errorMessage: "User not found. Please register."});
  }

  if (user.password !== req.body.password) {
    return res.status(403).render('urls_error', { errorMessage: "Invalid Password"});
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls');
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
    return res.status(400).render('urls_error', { errorMessage: "Invalid Credentials"});
  }
  if (getUserByEmail(req.body.email)) {
    return res.status(400).render('urls_error', { errorMessage: "Email is already taken"});
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