const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://mern-ecommerce-project-4e3ff.web.app'],
  credentials: true,
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4xueldm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const mernCollection = client.db('mernEcommerce').collection('products');

    app.get('/products', async (req, res) => {
      const { page = 1, limit = 10, search = '', category = '', priceRange = '', sort = 'priceAsc' } = req.query;

      // Build query filters
      let query = {};
      
      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }

      if (category) {
        query.category = category;
      }

      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        if (!isNaN(min) && !isNaN(max)) { 
          query.price = { $gte: min, $lte: max };
        } else {
          return res.status(400).json({ message: 'Invalid price range format' });
        }
      }

      // Determine sorting
      let sortQuery = {};
      switch (sort) {
        case 'priceAsc':
          sortQuery.price = 1;
          break;
        case 'priceDesc':
          sortQuery.price = -1;
          break;
        case 'dateAdded':
          sortQuery.dateAdded = -1;
          break;
        default:
          sortQuery.price = 1; // Default to price ascending
      }

      try {
        // Fetch products with pagination and sorting
        const products = await mernCollection.find(query)
          .sort(sortQuery)
          .limit(parseInt(limit))
          .skip((parseInt(page) - 1) * parseInt(limit))
          .toArray();

        // Count the total number of products that match the query
        const count = await mernCollection.countDocuments(query);

        res.json({
          products,
          totalPages: Math.ceil(count / parseInt(limit)),
          currentPage: parseInt(page),
        });
      } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ message: err.message });
      }
    });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('mernEcommerce server is running');
});

app.listen(port, () => {
  console.log(`mernEcommerce server is running on: ${port}`);
});
