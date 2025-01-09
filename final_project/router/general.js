const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
     // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn; // 從 URL 中提取 ISBN
    const book = books[isbn]; // 根據 ISBN 獲取對應的書籍資訊

    if (book) {
        res.send(JSON.stringify(book,null,4));
    } else {
        res.status(404).json({ message: `Book with ISBN ${isbn} not found.` }); // 如果找不到，返回錯誤信息
    }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author.toLowerCase();
    const book = Object.values(books).filter((book) => book.author.toLowerCase() === author);
    if (book.length > 0) {
        res.send(JSON.stringify(book,null,4));
    } else{
        res.status(404).json({ message: `Book with author ${author} not found.` }); // 如果找不到，返回錯誤信息
    }
});




// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.toLowerCase();
    const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title));
    if (filteredBooks.length > 0) {
        res.send(JSON.stringify(filteredBooks,null,4));
    } else{
        res.status(404).json({ message: `Book with title ${title} not found.` }); // 如果找不到，返回錯誤信息
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn]; 

    // 檢查書籍是否存在
    if (book) {
        const reviews = book.reviews; // 提取書籍的 reviews 對象

        // 檢查 reviews 是否存在或是否有內容
        if (Object.keys(reviews).length > 0) {
            res.send(JSON.stringify(reviews,null,4));
        } else {
            res.status(200).json({ message: `No reviews available for book with ISBN ${isbn}.` });
        }
    } else {
        res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
});


const axios = require('axios'); // 引入 Axios


// Promise-based implementation
public_users.get('/promise', (req, res) => {
    // 模擬通過 Axios 請求獲取書籍數據
    axios.get('http://localhost:5001/')
        .then((response) => {
            res.status(200).json(response.data);
        })
        .catch((error) => {
            res.status(500).json({ message: "Error fetching book list.", error });
        });
});
// Promise-based implementation
public_users.get('/promise/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    axios.get(`http://localhost:5001/isbn/${isbn}`)
        .then((response) => {
            res.status(200).json(response.data); // 返回書籍細節
        })
        .catch((error) => {
            res.status(404).json({ message: `Error fetching book details for ISBN ${isbn}`, error });
        });
});


public_users.get('/promise/title/:title', (req, res) => {
    const title = req.params.title.toLowerCase();
    axios.get('http://localhost:5001/')
        .then((response) => {
            // 确保书籍标题和查询一致性
            const filteredBooks = Object.values(response.data).filter(book =>
                book.title.toLowerCase().includes(title)
            );
            if (filteredBooks.length > 0) {
                res.status(200).json(filteredBooks);
            } else {
                res.status(404).json({ message: `No books found with title containing "${title}".` });
            }
        })
        .catch((error) => {
            console.error("Error fetching books:", error.message);
            res.status(500).json({ message: "Error fetching books.", error: error.message });
        });
});


public_users.get('/title/promise/:title', (req, res) => {
    const title = req.params.title.toLowerCase();
    axios.get('http://localhost:5001/')
        .then((response) => {
            const filteredBooks = Object.values(response.data).filter(book =>
                book.title.toLowerCase().includes(title)
            );
            if (filteredBooks.length > 0) {
                res.status(200).json(filteredBooks);
            } else {
                res.status(404).json({ message: `No books found with title containing "${title}".` });
            }
        })
        .catch((error) => {
            res.status(500).json({ message: "Error fetching books.", error });
        });
});

module.exports.general = public_users;
