require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://assignment-5-admin:5NWy0YcAVh4Dgmm4@cluster0.5nmcj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db("library");
    const bookCollection = db.collection("books");
    const userCollection = db.collection("users");
    // * Get All Books

    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      const book = await bookCollection.findOne({ _id: ObjectId(id) });
      res.send({ status: true, data: book });
    });

    app.post("/book/:id", async (req, res) => {
      const bookId = req.params.id;
      const updatedbook = req.body;

      try {
        const result = await bookCollection.updateOne(
          { _id: ObjectId(bookId) },
          { $set: updatedbook }
        );

        if (result.modifiedCount === 1) {
          res.sendStatus(200);
        } else {
          res.sendStatus(404);
        }
      } catch (error) {
        console.error(error);
        res.sendStatus(500);
      }
    });

    app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });

    app.get("/books", async (req, res) => {
      const bookFilterableFields = [
        "searchTerm",
        "title",
        "genre",
        "author",
        "publicationDate",
      ];
      const bookSearchFields = ["title", "author", "genre", "publicationDate"];
      const pick = (obj, keys) => {
        const finalObj = {};
        for (const key of keys) {
          if (obj && Object.hasOwnProperty.call(obj, key)) {
            finalObj[key] = obj[key]; // Accessint thi value (page) => Ans: 1 value
          }
        }
        return finalObj;
      };
      const filters = pick(req.query, bookFilterableFields);
      const { searchTerm, ...filtersData } = filters;
      const addConditions = [];
      if (searchTerm) {
        addConditions.push({
          $or: bookSearchFields.map((field) => ({
            [field]: {
              $regex: searchTerm,
              $options: "i",
            },
          })),
        });
      }

      if (Object.keys(filtersData).length) {
        addConditions.push({
          $and: Object.entries(filtersData).map(([field, value]) => ({
            [field]: value,
          })),
        });
      }
      const whereConditions =
        addConditions.length > 0 ? { $and: addConditions } : {};

      const cursor = await bookCollection.find(whereConditions).sort("dsc");
      const book = await cursor.toArray();

      res.send({ status: true, data: book });
    });
    app.post("/book", async (req, res) => {
      const book = req.body;

      const result = await bookCollection.insertOne(book);

      res.send(result);
    });

    // * Comment Book
    app.post("/reviews/:id", async (req, res) => {
      const productId = req.params.id;
      const reviews = req.body.reviews;

      console.log(productId);
      console.log(reviews);

      const result = await bookCollection.updateOne(
        { _id: ObjectId(productId) },
        { $push: { reviews: reviews } }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error("Product not found or reviews not added");
        res.json({ error: "Product not found or reviews not added" });
        return;
      }

      console.log("Comment added successfully");
      res.json({ message: "Comment added successfully" });
    });

    app.get("/reviews/:id", async (req, res) => {
      const bookId = req.params.id;

      const result = await bookCollection.findOne(
        { _id: ObjectId(bookId) },
        { projection: { _id: 0, reviews: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    });
    // * Wish List
    app.post("/wishlist/:email", async (req, res) => {
      const email = req.params.email;
      const wishList = req.body.wishlist;

      console.log(email);
      // console.log(reviews);

      const result = await userCollection.updateOne(
        { email: email },
        { $push: { wishList: wishList } }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error("Product not found or reviews not added");
        res.json({ error: "Product not found or reviews not added" });
        return;
      }

      console.log("Comment added successfully");
      res.json({ message: "Comment added successfully" });
    });
    app.post("/readinglist/:email", async (req, res) => {
      const email = req.params.email;
      const readingList = req.body.wishlist;

      console.log(email);
      // console.log(reviews);

      const result = await userCollection.updateOne(
        { email: email },
        { $push: { readingList: readingList } }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error("Product not found or reviews not added");
        res.json({ error: "Product not found or reviews not added" });
        return;
      }

      console.log("Comment added successfully");
      res.json({ message: "Comment added successfully" });
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = await userCollection.find({ email: email });
      const user = await cursor.toArray();

      res.send({ status: true, data: user });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const { email } = user;
      const result = await userCollection.insertOne(user);

      res.send(result);
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
