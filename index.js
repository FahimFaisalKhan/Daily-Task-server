import express from "express";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mongobasics-cluster.xxxwrvw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const dataBase = client.db("Daily-Task-DB");

const allTasksCollection = dataBase.collection("all-tasks");

app.get("/", async (req, res) => {
  res.send("Daily Task SERVER Running");
});
app.get("/tasks", async (req, res) => {
  const response = await allTasksCollection
    .find({})
    .sort({ addedon: -1 })
    .toArray();
  res.send(response);
});
app.post("/tasks", async (req, res) => {
  const data = req.body;

  const date = new Date();
  const today = date.toLocaleDateString("en-US", {
    second: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const completed = false;
  const addedon = today;
  const task = { ...data, completed, addedon };

  const response = await allTasksCollection.insertOne(task);

  res.send(response);
});

app.put("/task-update", async (req, res) => {
  const { id, taskName, description, image, deadline, completed } = req.body;
  // const
  let updatedDoc;

  if (!image) {
    updatedDoc = { taskName, description, deadline, completed };
  } else {
    updatedDoc = { taskName, description, deadline, completed, image };
  }

  const response = await allTasksCollection.updateOne(
    { _id: ObjectId(id) },
    {
      $set: updatedDoc,
    },
    { upsert: true }
  );

  res.send(response);
});

app.put("/tasks", async (req, res) => {
  let { id, taskName, description, deadline, image } = req.body;
  let response;
  const date = new Date();
  const today = date.toLocaleDateString("en-US", {
    second: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const addedon = today;
  const completed = false;
  if (deadline === "Invalid Date") {
    deadline = "Not set";
  }
  if (id) {
    response = await allTasksCollection.updateOne(
      { _id: ObjectId(id) },
      {
        $set: {
          taskName,
          description,
          image,
          deadline,
          completed,
          addedon,
        },
      },
      { upsert: true }
    );
  } else {
    response = await allTasksCollection.insertOne({
      taskName,
      description,
      image,
      deadline,
      completed,
      addedon,
    });
  }

  res.send(response);
});

app.get("/tasks-completed", async (req, res) => {
  const response = await allTasksCollection.find({ completed: true }).toArray();
  res.send(response);
});

app.put("/task-completed", async (req, res) => {
  const { id } = req.body;

  const response = await allTasksCollection.updateOne(
    { _id: ObjectId(id) },
    {
      $set: {
        completed: true,
      },
    },
    { upsert: true }
  );

  res.send(response);
});
app.put("/task-not-completed", async (req, res) => {
  const { id } = req.body;

  const response = await allTasksCollection.updateOne(
    { _id: ObjectId(id) },
    {
      $set: {
        completed: false,
      },
    },
    { upsert: true }
  );

  res.send(response);
});

app.get("/task/:id", async (req, res) => {
  const { id } = req.params;

  const response = await allTasksCollection.findOne({ _id: ObjectId(id) });

  res.send(response);
});
app.delete("/task", async (req, res) => {
  const { id } = req.body;

  const response = await allTasksCollection.deleteOne({ _id: ObjectId(id) });
  res.send(response);
});

app.put("/add-comment", async (req, res) => {
  const { comment, id } = req.body;
  const response = await allTasksCollection.updateOne(
    { _id: ObjectId(id) },
    { $push: { comment: { comment } } },
    { upsert: true }
  );

  res.send(response);
});

app.put("/update-comment", async (req, res) => {
  const { id, commentToUpdate, updatedComment } = req.body;

  const response = await allTasksCollection.updateOne(
    {
      _id: ObjectId(id),
      "comment.comment": commentToUpdate,
    },
    {
      $set: {
        "comment.$.comment": updatedComment,
      },
    },
    { upsert: true }
  );
  res.send(response);
});
app.delete("/delete-comment", async (req, res) => {
  const { id, commentToDelete } = req.body;

  const response = await allTasksCollection.updateOne(
    {
      _id: ObjectId(id),
    },
    {
      $pull: {
        comment: { comment: commentToDelete },
      },
    }
  );

  res.send(response);
});

app.get("/task-images", async (req, res) => {
  const response = await allTasksCollection
    .find({})
    .project({ image: 1 })
    .toArray();

  res.send(response);
});
app.listen(port);
