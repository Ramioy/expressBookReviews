const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        if (!isValid(username)) { // verificamos que el usuario no exista
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Averiguamos si hay libros disponibles
  if (Object.keys(books).length !== 0) {
    return res.send(JSON.stringify(books)) // regresa los books
  }
  // Si no hay books, entonces envía un mensaje acorde con código 404 NOT FOUND
  return res.status(404).send('<p>We have no books in this shop</p>')
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = parseInt(req.params.isbn) // ISBN es un número (las keys del objeto books)
  if(isNaN(isbn)) { // verificamos si el param isbn no se puede parsear como number
    return res.status(400).send('<p>isbn must to be a number</p>') // return 400 BAD REQUEST
  }
  // verificamos si el objeto books tiene un book con la key igual al isbn 
  const isbn_book = Object.entries(books).find(book => book[0] == isbn)
  if(!isbn_book) { // Si la key (aka ISBN) no existe, entonces enviamos un 404 NOT FOUND
    return res.status(404).send('<p>We do not have the book you are looking for. Sorry</p>')
  }
  // Finalmente, retornamos el book
  return res.send(JSON.stringify(isbn_book))
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = "" + req.params.author
  if (author === ':author' || !author.trim()) { // verificamos que author no sea una cadena vacía
    return res.status(400).send('<p>Please, provide a valid author name</p>') // return 400 BAD REQUEST
  }
  // Verificamos si existe un libro cuyo autor sea el param recibido
  const author_book = Object.entries(books).find(book => book[1]["author"] === author)
  if(!author_book) {
    return res.status(404).send('<p>We do not have the book you are looking for. Sorry</p>')
  }
  // Retornamos el book
  return res.send(JSON.stringify(author_book))
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = "" + req.params.title
  if (title === ':title' || !title.trim()) { // verificamos que title no sea una cadena vacía
    return res.status(400).send('<p>Please, provide a valid book title</p>') // return 400 BAD REQUEST
  }
  // Verificamos si existe un libro cuyo title sea el param recibido
  const title_book = Object.entries(books).find(book => book[1]["title"] === title)
  if(!title_book) {
    return res.status(404).send('<p>We do not have the book you are looking for. Sorry</p>')
  }
  // Retornamos el book
  return res.send(JSON.stringify(title_book))
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = parseInt(req.params.isbn)
  if(isNaN(isbn)) { 
    return res.status(400).send('<p>isbn must to be a number</p>')
  }
  // verificamos si el objeto books tiene un book con la key igual al isbn 
  const isbn_book = Object.entries(books).find(book => book[0] == isbn)
  if(!isbn_book) {
    return res.status(404).send('<p>We do not have the book you are looking for. Sorry</p>')
  }
  // Finalmente, retornamos el book con el formato siguiente:
  return res.send(`<h2>Reviwes for the book: ${isbn_book[1]["title"]}</h2> ${
    !Object.keys(isbn_book[1]["reviews"]).length ? "<p>This book has no reviews yet...</p>"
    : Object.entries(isbn_book[1]["reviews"])}`)
});

module.exports.general = public_users;
