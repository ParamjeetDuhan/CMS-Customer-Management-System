require("dotenv").config();
const express = require("express");
const cors = require("cors");

const routes = require("./routes/AuthRoutes");
const route = require("./routes/ShopRoutes")

const app = express();

// middleware
app.use(cors({
  origin: function(origin, callback) {
    if (
      !origin ||
      origin.startsWith("http://localhost") ||
      origin === "https://cms-customer-management-system.vercel.app"
    ) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  }
}));

app.use(express.json());

// api routes
app.use("/api", routes);
app.use("/api",route);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});