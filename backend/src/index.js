import app from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./db/index.js";
dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 5000;

connectDB()
  .then(
    app.listen(PORT, () => {
      console.log(`Server is running at localhost:${PORT}`);
    })
  )
  .catch((err) => console.log(err));
