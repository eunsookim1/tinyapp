const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const generateRandomString = () => {
  return Math.random().toString(36).slice(2,8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  // const templateVars = { urls: urlDatabase };
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  console.log("urlDatabase", urlDatabase);
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//"/urls" I can name it anything
// Ejs will come to server file to look for the right route/requests
// the click will look for the routes in the server.
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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