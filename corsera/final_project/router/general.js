const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!Object.values(users).find(user => user.username === username)) {
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(409).json({message: "User already exists!"});
    }
  }
  return res.status(400).json({message: "Unable to register user. Please provide username and password."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  let get_books = new Promise((resolve, reject) => {
    resolve(books);
  });
  get_books.then((books) => {
    res.send(JSON.stringify(books, null, 4));
  }).catch((err) => {
    res.status(500).send("Error fetching books");
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  let get_book = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject(new Error("Book not found"));
    }
  });

  get_book.then((book) => {
    res.send(book);
  }).catch((err) => {
    res.status(404).json({message: err.message});
  });
 });

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let get_books = new Promise((resolve, reject) => {
    let filtered_books = Object.values(books).filter(book => book.author === author);
    if (filtered_books.length > 0) {
      resolve(filtered_books);
    } else {
      reject(new Error("No books found by this author"));
    }
  });

  get_books.then((filtered_books) => {
    res.send(filtered_books);
  }).catch((err) => {
    res.status(404).json({message: err.message});
  });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  let get_books = new Promise((resolve, reject) => {
    let filtered_books = Object.values(books).filter(book => book.title === title);
    if (filtered_books.length > 0) {
      resolve(filtered_books);
    } else {
      reject(new Error("No books found with this title"));
    }
  });

  get_books.then((filtered_books) => {
    res.send(filtered_books);
  }).catch((err) => {
    res.status(404).json({message: err.message});
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(books[isbn].reviews);
  } else {
    res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
