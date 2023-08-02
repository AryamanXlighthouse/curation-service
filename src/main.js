import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import cidRoutes from './routes/cidRoutes.js';
config();

const app = express();
const PORT = process.env.PORT || 3000;

const verboseMode = process.argv.includes('--verbose');

if (verboseMode) {
  console.log('Running API in verbose mode...');
}

app.use(cors()); // Enable CORS
app.use(express.json());

// Middleware to set verbose mode in request object
app.use((req, res, next) => {
  req.verboseMode = verboseMode;
  next();
});

app.use('/api', cidRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (verboseMode) {
    console.log(`API started at: ${new Date().toISOString()}`);
  }
});
