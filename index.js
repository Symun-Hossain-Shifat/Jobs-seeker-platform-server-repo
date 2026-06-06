const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());

// MongoDB URI
const uri = process.env.MONGO_URL;

// Mongo Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let Jobsapi;

// Root route
app.get("/", (req, res) => {
  res.send("Job API Server is Running 🚀");
});

// GET all jobs (with filters)
app.get("/api/alljobs", async (req, res) => {
  // console.log(req.query)
  try {
    const query = {};

    if (req.query.companyId) {
      query.companyId = req.query.companyId;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const result = await Jobsapi.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error("GET error:", error);
    res.status(500).send({ success: false, message: "Server Error" });
  }
});

// POST new job
app.post("/api/alljobs", async (req, res) => {
  try {
    // console.log("Incoming Job Data:", req.body);

    const result = await Jobsapi.insertOne(req.body);

    res.send({
      success: true,
      message: "Job created successfully",
      result,
    });
  } catch (error) {
    console.error("POST error:", error);
    res.status(500).send({ success: false, message: "Insert failed" });
  }
});

// POST new job
app.post("/api/companyinfo", async (req, res) => {
  try {
    console.log("Incoming Job Data:", req.body);

    const result = await Companyapi.insertOne(req.body);

    res.send({
      success: true,
      message: "Job created successfully",
      result,
    });
  } catch (error) {
    console.error("POST error:", error);
    res.status(500).send({ success: false, message: "Insert failed" });
  }
});

// Start server AFTER DB connection
async function startServer() {
  try {
    await client.connect();
    console.log("MongoDB Connected Successfully ✅");

    const db = client.db("Jobseekingplatform");
    Jobsapi = db.collection("alljobs");
    Companyapi = db.collection('companyinfo')

    app.listen(port, () => {
      console.log(`Server running on port ${port} 🚀`);
    });

  } catch (error) {
    console.error("DB Connection Failed ❌", error);
  }
}

startServer();