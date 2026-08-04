import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import urlRoutes from "./routes/url.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "url-service" });
});

app.use("/", urlRoutes);

app.listen(PORT, () => {
  console.log(`URL Service running on port ${PORT}`);
});