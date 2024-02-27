const express = require('express');
const cors = require('cors');

const {
  MongoClient,
  ServerApiVersion,
  ObjectId
} = require('mongodb');
require('dotenv').config()
const app = express()

const port = process.env.PORT || 5000;
//middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS);
app.get('/', (req, res) => {
  res.send('good assignment')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aes3buy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const assignmentCollection = client.db('assignmentsDB').collection('assignments')
    const submittedCollection = client.db('assignmentsDB').collection('submitted')


    app.get('/submitted', async (req, res) => {
      const cursor = submittedCollection.find();
      const result = await cursor.toArray()
      res.send(result)

    })
    app.get('/assignmentDetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id)

      }
      const options = {
        projection: {
          title: 1,
          img: 1,
          name: 1,
          marks: 1,
          date: 1,
          email: 1,
          description: 1,
        },

      }
      const result = await assignmentCollection.findOne(query, options);
      res.send(result)

    })

    app.get('/myassignment', async (req, res) => {

      let query = {}
      if (req.query ?.email) {
        query = {
          email: req.query.email
        }
      }
      const result = await assignmentCollection.find(query).toArray()
      res.send(result)
    })

    //sort items based on difficulty//
    app.get('/assignments', async (req, res) => {

      let query = {}
      if (req.query ?.difficulty) {
        query = {
          difficulty: req.query.difficulty
        }
      }
      const result = await assignmentCollection.find(query).toArray()
      res.send(result)
    })
    app.get('/submit', async (req, res) => {
      console.log(req.query.email);
      let query = {}
      if (req.query ?.email) {
        query = {
          authorEmail: req.query.email
        }
      }
      console.log(query);
      const result = await submittedCollection.find(query).toArray()
      res.send(result)
    })

    //create assignment//
    app.post('/assignments', async (req, res) => {
      const assignment = req.body;
      const result = await assignmentCollection.insertOne(assignment)
      res.send(result)

    })
    app.post('/submitted', async (req, res) => {
      const submit = req.body;
      const result = await submittedCollection.insertOne(submit)
      res.send(result)

    })
    //to get updated assignment
    app.get('/assignments/:id', async (req, res) => {
      const id = req.params.id
      const query = {
        _id: new ObjectId(id)
      }
      const result = await assignmentCollection.findOne(query);
      res.send(result)
    })

    //update assignment//
    app.put('/assignments/:id', async (req, res) => {
      const id = req.params.id
      const filter = {
        _id: new ObjectId(id)
      }

      const updatedAssignment = req.body
      const assignment = {
        $set: {
          name: updatedAssignment.name,
          email: updatedAssignment.email,
          title: updatedAssignment.title,
          marks: updatedAssignment.marks,
          img: updatedAssignment.img,
          date: updatedAssignment.date,
          description: updatedAssignment.description

        }
      }
      const result = await assignmentCollection.updateOne(filter, assignment)
      res.send(result)
    })
    //to delete a assignment
    app.delete('/assignments/:id', async (req, res) => {
      const id = req.params.id
      const query = {
        _id: new ObjectId(id)
      }
      const result = await assignmentCollection.deleteOne(query)
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({
      ping: 1
    });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`assignment running on ${port}`)
})