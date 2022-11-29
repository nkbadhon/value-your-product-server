const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const jwt = require('jsonwebtoken');
require('dotenv').config();
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ovb7cdl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const allCategoryCollection = client.db('valueYourProduct').collection('allCategory');
        const allProductsCollection = client.db('valueYourProduct').collection('allProducts');
        const usersCollection = client.db('valueYourProduct').collection('users');
        const ordersCollection = client.db('valueYourProduct').collection('myOrders');


        app.get('/allCategory', async (req, res) => {
            const query = {};
            const options = await allCategoryCollection.find(query).toArray();
            res.send(options);
        });



        app.get('/brands', async (req, res) => {
            const query = {};
            const result = await allCategoryCollection.find(query).project({ Category_id: 1 }).toArray();
            res.send(result);
        })

        app.get('/allProducts', async (req, res) => {
            const query = {};
            const options = await allProductsCollection.find(query).toArray();
            res.send(options);

        });

        app.get('/allProducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { Category_id: id };
            const query1 = { email: id };
            console.log("id", id);
            const options = await allProductsCollection.find(query).toArray();
            const options1 = await allProductsCollection.find(query1).toArray();
            console.log("options", options);
            console.log("options1", options1);
            if (options?.length === 0) {
                res.send(options1)
            } else {
                res.send(options)
            }
        });

        app.post('/allProducts', async (req, res) => {
            const product = req.body;
            const result = await allProductsCollection.insertOne(product);
            res.send(result);
        })

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '10h' })
                return res.send({ accessToken: token });

            }
            res.status(403).send({ accessToken: '' })
        })

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })


        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.type === 'admin' });
        })

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.type === 'Seller' });
        })

        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isBuyer: user?.type === 'Buyer' });
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);

        })

        app.get('/myOrders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const orders = await ordersCollection.find(query).toArray();
            res.send(orders);
        });
        app.post('/myOrders', async (req, res) => {
            const orders = req.body;
            const result = await ordersCollection.insertOne(orders);
            res.send(result);
        });

    }
    finally {

    }
}
run().catch(console.log);




app.get('/', async (req, res) => {
    res.send('Server is running');
})

app.listen(port, () => console.log(`Server running on ${port}`));