import express, { urlencoded } from "express";
import "dotenv/config.js";
import dbConnection from "./config/db.config.js";

const app = express();

// initilization the database connection after the server is started
dbConnection;

app.use(urlencoded({ extended: true }));
app.use(express.json());
// app.use()

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

export default app;
