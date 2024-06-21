const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
  //write code to check if username and password match the one we have in records.
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60*60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }

});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Extract the book ISBN and review from the request
  const { isbn } = req.params;
  const { review } = req.query;

  // Check if the book with the given ISBN exists
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  // Get the user information from the request object
  const username = req.session.authorization.username;

  // Check if the user has already posted a review for this book
  if (book.reviews[username]) {
    // If the user has an existing review, update it
    book.reviews[username] = review;
  } else {
    // If the user hasn't reviewed the book yet, add a new review
    book.reviews[username] = review;
  }

  // Save the updated book data
  books[isbn] = book;

  res.status(200).json({ message: 'Review saved successfully' });
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Extract the book ISBN and user information from the request
  const { isbn } = req.params;
  const username = req.session.authorization.username;

  // Check if the book with the given ISBN exists
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  // Check if the user has posted a review for this book
  if (!book.reviews[username]) {
    return res.status(404).json({ error: 'Review not found' });
  }
  
  // Delete the user's review from the book's reviews
  delete book.reviews[username];

  // Save the updated book data
  books[isbn] = book;

  res.status(200).json({ message: 'Review deleted successfully' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
