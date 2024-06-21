const express = require('express');
let books = require("./booksdb.js");
const { JsonWebTokenError } = require('jsonwebtoken');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');



const doesExist = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register, username and/or password are not provided."});

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Create a new Promise to handle the asynchronous operation
  const methCall = new Promise((resolve,reject)=>{
    try {
      // Load the book data from the booksdb.js module
      let books = require("./booksdb.js");
      resolve(books);
    } catch(err) {
      reject(err)
    }
  })
  // Handle the resolved Promise
  methCall.then(
    // If the Promise is resolved successfully, send the book data as the response
    (data) =>   res.status(200).send(JSON.stringify(data, null, 2)),
    // If the Promise is rejected, send an error message as the response
    (err) => res.status(500).send({ error: "Error reading file: " + err.message })
  );
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = Number(req.params.isbn);
  // Check if the ISBN is a valid number
  if (isNaN(isbn)) {
    return res.status(400).send('invalid ISBN');
  }
  // Create a new Promise to handle the asynchronous operation of loading the book data
  const methCall = new Promise((resolve, reject) => {
    try {
      let books = require("./booksdb.js");
      const book = books[isbn];
      resolve(book);
    } catch (err) {
      reject(err)
    }
  });
  // Handle the resolved Promise
  methCall.then(
    // If the Promise is resolved successfully, send the book data as the response
    (data) => {
      if (data) {
        // If the book is found, send the book data with a 200 OK status
        res.status(200).send(data);
      } else {
        // If the book is not found, send a 400 Bad Request response with an error message
        res.status(400).send('book not found');
      }
    },
    // If the Promise is rejected, send a 500 Internal Server Error response with the error message
    (err) => res.status(500).send({ error: "Error reading file: " + err.message })
  );
});




// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const reqAuthor = req.params.author;
  // Create a new Promise to handle the asynchronous operation of loading the book data
  const methCall = new Promise((resolve, reject) => {
    try {
      // Get all the keys for the 'books' object
      const bookKeys = Object.keys(books);
      //an array to store the matching books
      const  matchingBooks =[];
      // Iterate through the 'books' object and find the books with the matching author
      for (const key of bookKeys) {
        const book = books[key];
        if (book.author.toLowerCase() === reqAuthor.toLowerCase()) {
          matchingBooks.push(book);
        }
      }
      resolve(matchingBooks);
    } catch (err) {
      reject(err)
    }
  });
  // Handle the resolved Promise
  methCall.then(
    // If the Promise is resolved successfully, send the books data as the response
    (matchingBooks) => {
      // If there are matching books, send them in the response
      if (matchingBooks.length > 0) {
        res.status(200).send(matchingBooks);
      } else {
        res.status(404).send('No books found with the given author');
      }
    },
    // If the Promise is rejected, send a 500 Internal Server Error response with the error message
    (err) => res.status(500).send({ error: "Error reading file: " + err.message })
  );
});



// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const requestedTitle = req.params.title;
  // Create a new Promise to handle the asynchronous operation of loading the book data
  const methCall = new Promise((resolve, reject) => {
    try {
      // Get all the keys for the 'books' object
      const bookKeys = Object.keys(books);
      // Find the book with the matching title
      const  matchingBooks =[];
      for (const key of bookKeys) {
        const book = books[key];
        if (book.title.toLowerCase() === requestedTitle.toLowerCase()) {
          matchingBooks.push(book);
        }
      }
      resolve(matchingBooks);
    } catch (err) {
      reject(err)
    }
  });
  // Handle the resolved Promise
  methCall.then(
    // If the Promise is resolved successfully, send the books data as the response
    (matchingBooks) => {
      // If a matching book is found, send it in the response
      if (matchingBooks.length > 0) {
        res.status(200).send(matchingBooks);
      } else {
        res.status(404).send('Book not found');
      }
    },
    // If the Promise is rejected, send a 500 Internal Server Error response with the error message
    (err) => res.status(500).send({ error: "Error reading file: " + err.message })
  );
});








//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = Number(req.params.isbn);
  if(isNaN(isbn)){
    return res.status(400).send('invalid ISBN');
  }
  const bookReview = books[isbn].reviews;
  if (bookReview){
    res.status(200).send(bookReview);
  }else{
    res.status(400).send('bookReview not found');
  }
});

module.exports.general = public_users;
