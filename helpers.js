// -------------------------HELPER FUNCTIONS-------------------------

const generateRandomString = () => {
  return Math.random().toString(36).slice(2,8);
};

// const getUserByEmail = function(email) {
//   const keys = Object.keys(users);
//   // console.log(keys);
//   for (const key of keys) {
//     // console.log(users[key].email, req.body.email);
//     if (users[key].email === email) {
//       return users[key];
//     }
//   }
//   return null;
// };

const getUserByEmail = function(email, database) {
  const keys = Object.keys(database);
  // console.log(keys);
  for (const key of keys) {
    // console.log(users[key].email, req.body.email);
    const user = database[key];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = function(id, database) {
  const urls = {};
  const keys = Object.keys(database);
  for (const key of keys) {
    const url = database[key]; //urlObj
    if (url.userID === id) {
      urls[key] = url; // will add to the new url object
    }
  }
  return urls;
};

module.exports = {generateRandomString, getUserByEmail, urlsForUser };