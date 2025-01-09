const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    let validationuser = users.filter(user => {
        return user.username === username && user.password === password;
    });
    if (validationuser.length >0){
        return true;
    } else{
        return false;
    }    
}


//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username; // 從請求體獲取用戶名
    const password = req.body.password; // 從請求體獲取密碼
  
    // 檢查是否提供了用戶名和密碼
    if (!username || !password) {
      return res.status(400).json({ message: "Please provide the username and password." });
    }
  
    // 驗證用戶是否存在且密碼正確
    if (isValid(username)) {
      if (authenticatedUser(username, password)) {
        // 生成 JWT 訪問令牌
        const accessToken = jwt.sign({ data: username }, "access", { expiresIn: 60 * 60*60 });
  
        // 在 session 中存儲訪問令牌
        req.session.authorization = { accessToken, username };
  
        return res.status(200).json({ message: `Welcome ${username}. You have successfully logged in!` });
      } else {
        return res.status(401).json({ message: "Invalid password. Please try again." });
      }
    } else {
      return res.status(404).json({ message: "User not found. Please register first." });
    }
  });
  

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // 獲取路由參數中的 ISBN
    const review = req.body.review; // 獲取請求正文中的評論內容
    const username = req.session.authorization?.username; // 從 session 中獲取當前用戶名
  
    // 檢查書籍是否存在
    if (!books[isbn]) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
  
    // 確保評論和用戶名存在
    if (!review || !username) {
      return res.status(400).json({ message: "Review and valid session username are required." });
    }
  
    // 添加或更新用戶的評論
    books[isbn].reviews[username] = review;
  
    return res.status(200).json({
      message: `Review for book with ISBN ${isbn} added/updated successfully.`,
      reviews: books[isbn].reviews, // 返回更新後的評論
    });
  });

  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // 獲取路由參數中的 ISBN
    const username = req.session.authorization?.username; // 從 session 中獲取當前用戶名
  
    // 檢查書籍是否存在
    if (!books[isbn]) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
  
    // 確保評論和用戶名存在
    if (!books[isbn].reviews || !username) {
      return res.status(400).json({ message: "Review and valid session username are required." });
    }
  
    // 刪除當前用戶的評論
    if (books[isbn].reviews[username]) {
      delete books[isbn].reviews[username]; // 刪除評論
      return res.status(200).json({
        message: `Review for book with ISBN ${isbn} from ${username} is deleted successfully.`,
        reviews: books[isbn].reviews, // 返回更新後的評論
      });
    } else {
      return res.status(404).json({ message: `No review found for book with ISBN ${isbn} by user ${username}.` });
    }
  });
  
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
