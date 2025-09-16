import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./db";
import invoicesRouter from "./routes/invoices";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/invoices", invoicesRouter);

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// connect to DB
connectDB();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
