const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const PROMISE_DELAY = 2000;

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.includes((user) => user["username"] == username)
}

const authenticatedUser = (username, password) => { //returns boolean
  return !users.includes(user => user["username"] === username && user["password"] === password)
}

//only registered users can login
regd_users.post("/login", async (req,res) => {
  const myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const username = req.body.username;
      const password = req.body.password;
      if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken, username
        }
        resolve(res.status(200).send("User successfully logged in"))
      } else {
        reject(res.status(208).json({ message: "Invalid Login. Check username and password" }))
      }
    })
  })
  return await myPromise.then(result => result).catch(error => error)
});

// Add a book review
regd_users.put("/auth/review/:isbn", async (req, res) => {

  const myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const isbn = req.params.isbn;
      const user = req.session.authorization.username;
      const review = req.body.review;
      const newReview = true; // Controla si el usuario ha hecho una review sobre ese book
    
      //Validaciones
      if(isNaN(isbn)) reject(res.status(400).send('<p>isbn must to be a number</p>'))
      if(!review) reject(res.status(400).send('<p>Please provide a valid review.</p>'))
    
    
      // Existe el book con ese isbn
      const isbn_book = Object.entries(books).find(book => book[0] == isbn)
      if(!isbn_book) { 
        reject(res.status(404).send('<p>We do not have the book you are looking for. Sorry</p>'))
      }
      if(Object.keys(isbn_book[1]["reviews"]).includes(user)) newReview = false;
    
      books[isbn]["reviews"][user] = review
    
      resolve(res.send(`${
        newReview ? `<p>You have made a new review for the book ${isbn_book[1]["title"]}</p>`
        : `'<p>Your previous review for the book ${isbn_book[1]["title"]} has been updated succsesfully</p>}'`}`))
    
    }, PROMISE_DELAY)
  })
  return await myPromise.then(result => result).catch(error => error)
})

//Delete a book review
regd_users.delete("/auth/review/:isbn", async (req, res) => {
  const myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = req.session.authorization.username;
      const isbn = req.params.isbn;
      if(isNaN(isbn)) reject(res.status(400).send('<p>isbn must to be a number</p>'))
    
      const isbn_book = Object.entries(books).find(book => book[0] == isbn)
      if(!isbn_book) { 
        reject(res.status(404).send('<p>We do not have the book you are looking for. Sorry</p>'))
      }
    
      // El usuario tiene una review en este libro?
      if(!Object.keys(isbn_book[1]["reviews"]).includes(user)) {
        reject(res.status(404).send("<p>You haven't made any review for this book yet.</p>"))
      }
    
      delete books[isbn]["reviews"][user]
      resolve(res.status(200).send("Your review has been deleted from this book"))
    }, PROMISE_DELAY)
  })
  return await myPromise.then(result => result).catch(error => error)
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
