const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Base URL for internal Axios requests
const BASE_URL = 'http://localhost:5000';

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!Object.values(users).find(user => user.username === username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(409).json({ message: "User already exists!" });
    }
  }
  return res.status(400).json({ message: "Unable to register user. Please provide username and password." });
});

// Get the book list available in the shop using Async-Await with Axios
public_users.get('/', async function (req, res) {
  try {
    // Using async/await with Axios
    const response = await axios.get(`${BASE_URL}/books-direct`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Direct endpoint for books data (used internally by Axios)
public_users.get('/books-direct', function (req, res) {
  res.status(200).json(books);
});

// Get book details based on ISBN using Promise callbacks with Axios
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Validate ISBN parameter
  if (!isbn || isbn.trim() === '') {
    return res.status(400).json({ message: "ISBN parameter is required" });
  }

  // Using Promise callbacks with Axios
  axios.get(`${BASE_URL}/isbn-direct/${isbn}`)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      if (error.response && error.response.status === 404) {
        res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
      } else {
        res.status(500).json({ message: "Error fetching book", error: error.message });
      }
    });
});

// Direct endpoint for ISBN lookup (used internally by Axios)
public_users.get('/isbn-direct/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.status(200).json(books[isbn]);
  } else {
    res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});

// Get book details based on author using Promise callbacks with Axios
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  // Validate author parameter
  if (!author || author.trim() === '') {
    return res.status(400).json({ message: "Author parameter is required" });
  }

  // Using Promise callbacks with Axios
  axios.get(`${BASE_URL}/author-direct/${encodeURIComponent(author)}`)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      if (error.response && error.response.status === 404) {
        res.status(404).json({ message: `No books found by author '${author}'` });
      } else {
        res.status(500).json({ message: "Error fetching books", error: error.message });
      }
    });
});

// Direct endpoint for author lookup (used internally by Axios)
public_users.get('/author-direct/:author', function (req, res) {
  const author = decodeURIComponent(req.params.author);
  try {
    let filtered_books = Object.values(books).filter(book => book.author === author);

    if (filtered_books.length > 0) {
      res.status(200).json(filtered_books);
    } else {
      res.status(404).json({ message: `No books found by author '${author}'` });
    }
  } catch (error) {
    res.status(500).json({ message: `Error processing request: ${error.message}` });
  }
});

// Get all books based on title using Async-Await with Axios
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  // Validate title parameter
  if (!title || title.trim() === '') {
    return res.status(400).json({ message: "Title parameter is required" });
  }

  try {
    // Using async/await with Axios
    const response = await axios.get(`${BASE_URL}/title-direct/${encodeURIComponent(title)}`);
    res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ message: `No books found with title '${title}'` });
    } else {
      res.status(500).json({ message: "Error fetching books", error: error.message });
    }
  }
});

// Direct endpoint for title lookup (used internally by Axios)
public_users.get('/title-direct/:title', function (req, res) {
  const title = decodeURIComponent(req.params.title);
  try {
    let filtered_books = Object.values(books).filter(book => book.title === title);

    if (filtered_books.length > 0) {
      res.status(200).json(filtered_books);
    } else {
      res.status(404).json({ message: `No books found with title '${title}'` });
    }
  } catch (error) {
    res.status(500).json({ message: `Error processing request: ${error.message}` });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(books[isbn].reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
