const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http =require("http")
const { connectDb } = require("./lib/connectDb");
const app = express()
const dataRouter =require("./routes/dataRouter")
dotenv.config({ path: "./config.env" });

const PORT = process.env.PORT || 3000; // Default to port 3000 if not defined
const server = http.createServer(app);


// Middleware to parse JSON

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);


app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.get("/", (req, res) => {
  res.status(200).json({ message: "HELLO WORLD" });
});
app.use("/data",dataRouter)

// app.use("/friends",friendRouter);





async function startServer() {
  try {
    await  connectDb()
  } catch (error) {
    console.error("DB Connection Error:", error);
    process.exit(1); // Exit the process if the database connection fails
  }
}

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

startServer();

module.exports=app