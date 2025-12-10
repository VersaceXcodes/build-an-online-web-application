import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});

export default app;
