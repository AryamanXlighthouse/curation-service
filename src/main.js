import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import cidRoutes from './routes/cidRoutes.js';
config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS
app.use(express.json());

app.use('/api', cidRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
