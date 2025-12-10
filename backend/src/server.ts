import express, { urlencoded } from "express";
import "dotenv/config.js";
import dbConnection from "./config/db.config";
import mainRoute from "./routes/mainRoute";

const app = express();

app.use(urlencoded({ extended: true }));
app.use(express.json());
app.use(mainRoute);

const PORT = process.env.PORT || 3000;

// Wrap server start in an async function
const startServer = async () => {
  try {
    // Wait for database connection
    await dbConnection;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit if DB connection fails
  }
};

startServer();
