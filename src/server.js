const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config(); // Load environment variables from .env file

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB Atlas Connection String
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://srijasusarla123:XHH8zEfoWHs1JP0z@capx.njp6o.mongodb.net/stock-portfolio?retryWrites=true&w=majority';

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB Atlas', err);
  });

// Define the stock schema
const stockSchema = new mongoose.Schema({
  symbol: String,
  name: String,
  price: Number,
  quantity: Number,
});

const Stock = mongoose.model('Stock', stockSchema);

// Define User model
const User = mongoose.model('User', {
  fullName: String,
  email: String,
  password: String,
  phone: { type: String, default: null },
  address: { type: String, default: null },
});

const Admin = mongoose.model('Admin', {
  fullName: String,
  email: String,
  password: String,
  phone: { type: String, default: null },
  address: { type: String, default: null },
});

// Function to generate token
const generateToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
  };
  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: '1h',
  });
  return token;
};

// Function to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ message: 'Access denied' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// API routes
app.post('/api/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await Admin.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    const role = user instanceof Admin ? 'admin' : 'user';
    res.json({ message: 'Signed in successfully', token, role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const user = new User({ fullName, email, password: hashedPassword });
    await user.save();
    const token = generateToken(user);
    res.json({ message: 'Signed up successfully', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Hello from protected route!' });
});

app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Finnhub API
const finnhubApiEndpoint = 'https://finnhub.io/api/v1/quote';
const finnhubApiKey = process.env.FINNHUB_API_KEY; // Get the API key from .env file

// Function to fetch real-time price
async function fetchStockPrice(symbol) {
  try {
    const response = await axios.get(finnhubApiEndpoint, {
      params: {
        symbol: symbol,
        token: finnhubApiKey, // Pass API key as a query parameter
      },
    });

    const { c: currentPrice } = response.data; // 'c' represents the current price

    return currentPrice ? parseFloat(currentPrice) : null; // Return the current price
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

// GET request to fetch portfolio and real-time prices
app.get('/api/portfolio', async (req, res) => {
  try {
    const stocks = await Stock.find();

    // Fetch real-time prices for all stocks
    const updatedStocks = await Promise.all(
      stocks.map(async (stock) => {
        const realTimePrice = await fetchStockPrice(stock.symbol);
        return {
          ...stock.toObject(),
          price: realTimePrice || stock.price, // Use real-time price or fallback to stored price
        };
      })
    );

    res.json(updatedStocks);
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    res.status(500).json({ message: 'Error fetching portfolio data' });
  }
});

// POST request to add a new stock to the portfolio
app.post('/api/portfolio', async (req, res) => {
  const { symbol, name, quantity } = req.body;

  if (!symbol || !name || quantity == null) {
    return res.status(400).json({ message: 'Symbol, name, and quantity are required.' });
  }

  try {
    const price = await fetchStockPrice(symbol);
    if (!price) {
      return res.status(400).json({ message: 'Could not fetch stock price from Finnhub.' });
    }

    const newStock = new Stock({
      symbol,
      name,
      price,
      quantity,
    });

    await newStock.save();
    res.status(201).json(newStock);
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(500).json({ message: 'Error adding stock to portfolio' });
  }
});

// PUT request to update an existing stock's quantity and price
app.put('/api/portfolio/:id', async (req, res) => {
  const stockId = req.params.id;
  const { quantity } = req.body;

  if (quantity == null) {
    return res.status(400).json({ message: 'Quantity is required to update stock.' });
  }

  try {
    const stock = await Stock.findById(stockId);
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found.' });
    }

    // Fetch real-time price from Finnhub
    const updatedPrice = await fetchStockPrice(stock.symbol);
    if (!updatedPrice) {
      return res.status(400).json({ message: 'Could not fetch stock price from Finnhub.' });
    }

    // Update stock's price and quantity
    stock.price = updatedPrice;
    stock.quantity = quantity;

    await stock.save();
    res.json(stock);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: 'Error updating stock' });
  }
});

// DELETE request to remove a stock from the portfolio
app.delete('/api/portfolio/:id', async (req, res) => {
  const stockId = req.params.id;

  try {
    const stock = await Stock.findByIdAndDelete(stockId);
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found.' });
    }

    res.json({ message: 'Stock removed successfully', stock });
  } catch (error) {
    console.error('Error deleting stock:', error);
    res.status(500).json({ message: 'Error deleting stock from portfolio' });
  }
});

// Start the server
const port = process.env.PORT || 5500;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
