const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const fileUpload = require('express-fileupload')
const app = express()
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const port = 5000

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mc16x.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('doctors'))
app.use(fileUpload())



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("doctorsPortal").collection("appointment");
  const doctorCollection = client.db("doctorsPortal").collection("doctors");
  // perform actions on the collection object
        app.post("/addAppointment",(req,res) =>{
            const appointment = req.body
            collection.insertOne(appointment)
            .then(result =>{
                res.send(result.insertedCount > 0)
            })

        })
        app.get('/appointments',(req,res) =>{
          collection.find({})
          .toArray((err,documents) =>{
            res.send(documents)
          })
        })
        app.post("/appointmentsByDate",(req,res) =>{
              const date = req.body
              const email= req.body.email
              console.log('date',date.date)
              doctorCollection.find({email:email})
              .toArray((err,doctors) =>{
                const filter={date:date.date}
                if(doctors.length === 0){
                  filter.email=email
                }
                collection.find(filter)
                .toArray((err,documents) =>{
                    res.send(documents)
                })
                  
              })
             

         })
        app.post("/isDoctor",(req,res) =>{ 
          const email= req.body.email
          doctorCollection.find({email:email})
          .toArray((err,doctors) =>{
            res.send(doctors.length > 0)             
           })
         })
      app.post("/addADoctor", (req,res) =>{
        const file = req.files.file
        const name = req.body.name
        const email = req.body.email
        const phone = req.body.phone
          const newImg = req.files.file.data
          const encImg = newImg.toString('base64')
          const image={
            contentType:file.mimetype,
            size:file.size,
            img:Buffer.from(encImg, 'base64')
          }
          doctorCollection.insertOne({name,email,phone, image})
          .then(result => {   
              res.send(result.insertedCount > 0)
            })
        })
      

      app.get('/doctors',(req,res) =>{
        doctorCollection.find({})
        .toArray((err,documents) =>{
          res.send(documents)
        })
      })

      app.get('/', (req, res) => {
        res.send('Hello World!')
      })
    })
app.listen(process.env.PORT || port)