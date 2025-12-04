import express, { urlencoded } from "express";
import "dotenv/config.js";

const app = express();

app.use(urlencoded({ extended: true }));
app.use(express.json());
// app.use()

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

export default app;
