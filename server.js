
import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';

// Import the existing route modules from the professor's skeleton.
import projectsRoutes from './server/routes/projects-routes.js';
import userRoutes from './server/routes/user-routes.js';
import contactsRoutes from './server/routes/contacts-routes.js';
import qualificationsRoutes from './server/routes/qualifications-routes.js';


// Load environment variables from the server directory.
dotenv.config({ path: './server/.env' });

// Create the Express application.
const app = express();

// Middleware to parse incoming JSON request bodies.
app.use(express.json());

// Retrieve the server configuration from environment variables.
// Port 5000 is used if PORT is not defined.
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Define a welcome route to verify that Express is running.
app.get('/', (req, res) => {
  res.send('Welcome to MyPortfolio API');
});

// Register the existing project and user routes.
// We will review their endpoints during the REST API phase.
app.use('/api/projects', projectsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/qualifications', qualificationsRoutes);

// Connect to MongoDB before starting the Express server.
async function startServer() {
  try {
    // Connect to the Portfolio database using Mongoose.
    await mongoose.connect(MONGODB_URI);

    console.log('MongoDB database connection established successfully');

    // Start Express only after MongoDB connects successfully.
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

  } catch (error) {
    // Report a connection failure and stop the application.
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

// Execute the server startup function.
startServer();
