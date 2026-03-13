require("dotenv").config();
const express = require("express");
const cors = require("cors");

const routes = require("./routes/AuthRoutes");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// api routes
app.use("/api", routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
});