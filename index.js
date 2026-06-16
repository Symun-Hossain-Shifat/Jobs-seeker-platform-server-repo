const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
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



const Validatedapi = async (req, res, next) => {
  const authorization = req.headers.authorization;
 
  if (!authorization) {
    return res.status(401).send({
      message: "Unauthorized Access",
    });
  }

  const Token = authorization.split(" ")[1];

  if (!Token) {
    return res.status(401).send({
      message: "Unauthorized Access",
    });
  }
  const query = { token: Token };
  const result = await sessionscollection.findOne(query);

  if (!result) {
    return res.status(401).send({
      message: "Invalid Token",
    });
  }

  const userId = result.userId

  const userquery = {
    _id : userId
  }
  const user = await Usercollection.findOne(userquery)
//  console.log(user)
  if (!user) {
  return res.status(401).send({
    message: "User not found",
  });
}
// console.log( user)
req.user = user;
next();
};

const ValidateSeeker = async(req , res , next ) => {
  console.log(req.user?.role)
  if(req.user?.role !== 'Job Seeker'){
    return res.status(403).send({
    message: "User not found",
  })
  }
  next()
}


app.patch("/api/companyinfo/:id", Validatedapi ,  async (req, res) => {
  // console.log(req.query.recruiterId)
 
   console.log(req.body)
     const filter = { _id : new ObjectId(req.params.id) }
     const newdata = {
      $set: {
        status : req.body?.status
      }
     }

    const result = await Companyapi.updateOne(filter , newdata )
    
    res.send(result)
});



app.get("/api/companyinfo",  async (req, res) => {
  // console.log(req.query.recruiterId)
  try {
    const query = {};

    
    if (req.query.recruiterId) {
      query.recruiterId = req.query.recruiterId;
    }
    
    if (req.query.email) {
      query.email = req.query.email;
    }
    

    const result = await Companyapi.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error("GET error:", error);
    res.status(500).send({ success: false, message: "Server Error" });
  }
});




app.get("/api/appliedjob" ,   async (req, res) => {
  try {
    const { company , email } = req.query;

    // console.log(company)

    const query = {};

    if (company) {
      query.company = company;
    }

    if (email) {
      query.email = email ;
    }
    
    

    const result = await Appliedapi.find(query).toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({ success: false });
  }
});

app.post('/api/subscription', Validatedapi , async (req, res) => {
  try {
    const Data = req.body;

    const Maindata = {
      ...Data,
      Createdat: new Date(),
    };

    // সাবস্ক্রিপশন insert
    const result = await Subscriptionapi.insertOne(Maindata);

    const email = req.body.email;
    const planid = req.body.PlanID;

    const filter = { email: email };

    const updateddocument = {
      $set: {
        Plans: planid,
      },
    };

    // user update
    const updatedresult = await Usercollection.updateOne(
      filter,
      updateddocument
    );

    return res.json({
      subscription: result,
      userUpdate: updatedresult,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

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

app.get("/api/alljobs/:id",async (req, res) => {
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
app.post("/api/alljobs", Validatedapi , async (req, res) => {
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
app.post("/api/appliedjob",Validatedapi ,   async (req, res) => {
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



app.post("/api/companyinfo", Validatedapi , async (req, res) => {
  try {
    
   const Data = req.body
   const NewData = {
    ...Data , Createdat : new Date()
   }
    const result = await Companyapi.insertOne(NewData);

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
    Usercollection = db.collection('user')
    sessionscollection = db.collection('session')

    app.listen(port, () => {
      console.log(`Server running on port ${port} 🚀`);
    });

  } catch (error) {
    console.error("DB Connection Failed ❌", error);
  }
}

startServer();