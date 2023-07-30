require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db("pcbuilder");
    const componentsCollection = db.collection("components");
    // * Get All Books

    app.get("/components", async (req, res) => {
      const cursor = await componentsCollection.find({});
      const components = await cursor.toArray();

      res.send({ status: true, data: components });
    });

    app.get("/components/:id", async (req, res) => {
      const { id } = req.params;
      const result = await componentsCollection.findOne({ _id: ObjectId(id) });

      res.send(result);
    });

    app.get("/components/featured/:category", async (req, res) => {
      const { category } = req.params;
      const cursor = await componentsCollection.find({ category: category });
      const result = await cursor.toArray();

      res.send({ status: true, data: result });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello Worldsssssssssssss!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
