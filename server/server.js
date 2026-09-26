require("dotenv").config({
  path: require("path").resolve(__dirname, ".env"),
});
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { closeEventConnections } = require("./config/dbManager");
const { migrateLegacyUsers } = require("./utils/eventDatabase");

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnv.join(", ")}`,
  );
  process.exit(1);
}

const app = express();

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : [];

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) return callback(null, true);
      const error = new Error("Origin is not allowed by CORS");
      error.status = 403;
      return callback(error);
    },
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      message: "Too many authentication requests, please try again later",
    },
  }),
);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/contributors", require("./routes/contributorRoutes"));
app.use("/api/contributions", require("./routes/contributionRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api", require("./routes/dashboardRoutes"));

app.get("/", (req, res) => res.send("Fund Manager API running"));
app.get("/health", (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  return res.status(databaseReady ? 200 : 503).json({
    ok: databaseReady,
    database: databaseReady ? "connected" : "disconnected",
  });
});

const PORT = process.env.PORT || 5000;

app.use((err, req, res, next) => {
  console.error("Unhandled request error:", err);
  if (res.headersSent) return next(err);
  return res
    .status(err.status || 500)
    .json({ message: "Internal server error" });
});

const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`),
  );
  migrateLegacyUsers().catch((err) => {
    console.error("Legacy user migration failed:", err.message);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await mongoose.connection.close();
      await closeEventConnections();
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer().catch((err) => {
  console.error("Server startup failed:", err.message);
  process.exit(1);
});
