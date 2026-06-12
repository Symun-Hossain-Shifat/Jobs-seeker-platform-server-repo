const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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



app.get("/api/companyinfo", async (req, res) => {
  console.log(req.query.recruiterId)
  try {
    const query = {};

    
    if (req.query.recruiterId) {
      query.recruiterId = req.query.recruiterId;
    }

    const result = await Companyapi.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error("GET error:", error);
    res.status(500).send({ success: false, message: "Server Error" });
  }
});



app.get("/api/appliedjob", async (req, res) => {
  try {
    const { company } = req.query;

    console.log(company)

    const query = {};

    if (company) {
      query.company = company;
    }

    

    const result = await Appliedapi.find(query).toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({ success: false });
  }
});

app.post( '/api/subscription' , async (req , res) => {
  const Data = req.body
  console.log(Data)
  const Maindata = {
    ...Data , Createdat : new Date()
  }
  const result = await Subscriptionapi.insertOne(Maindata);
  res.send(result)
})


app.get("/api/alljobs", async (req, res) => {
  try {
    const { companyId, status } = req.query;

    const query = {};

    if (companyId) {
      query.companyId = companyId;
    }

    if (status) {
      query.status = status;
    }

    const result = await Jobsapi.find(query).toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({ success: false });
  }
});

app.get("/api/alljobs/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await Jobsapi.findOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Server Error",
    });
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
app.post("/api/appliedjob", async (req, res) => {
  try {
    console.log("Incoming Job Data:", req.body);

    const result = await Appliedapi.insertOne(req.body);

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
    Appliedapi = db.collection('appliedjob')
    Subscriptionapi = db.collection('Subscription')

    app.listen(port, () => {
      console.log(`Server running on port ${port} 🚀`);
    });

  } catch (error) {
    console.error("DB Connection Failed ❌", error);
  }
}

startServer();