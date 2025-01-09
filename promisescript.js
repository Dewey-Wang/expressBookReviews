const axios = require('axios');

// Get the book list available in the shop using Promises
public_users.get('/', function (req, res) {
    // Simulate fetching books data with Axios (e.g., from a JSON server)
    axios.get('http://localhost:500/books') // Update URL as needed
        .then((response) => {
            res.status(200).json(response.data);
        })
        .catch((error) => {
            res.status(500).json({ message: "Error fetching book list.", error: error.message });
        });
});
