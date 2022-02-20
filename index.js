const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

//middleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x13qi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("thumbStack");
    const ordersCollection = database.collection("orders");

    app.post("/addOrder", async (req, res) => {
      const order = req.body;
      if (order.foodOrder.length === 0) {
        return;
      } else {
        const result = await ordersCollection.insertOne(order);
        res.send(result);
      }
    });

    app.get("/orders", async (req, res) => {
      const orders = ordersCollection.find({});
      const result = await orders.toArray();
      res.send(result);
    });

    app.put("/addItem/:id", async (req, res) => {
      const id = req.params.id;
      const item = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $push: {
          foodOrder: item,
        },
      };
      const result = await ordersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      console.log(query);
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // await client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Thumbstack");
});
app.listen(port, () => {
  console.log("Listening ", port);
});
