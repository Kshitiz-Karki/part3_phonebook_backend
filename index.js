require('dotenv').config()
const Person = require('./models/person')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
// app.use(morgan('tiny'))
morgan.token('post_req', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post_req')) //using tiny format & token - minimal output 

// let persons = [
//     { 
//       "id": 1,
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": 2,
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": 3,
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": 4,
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     }
// ] 

// app.get('/', (req, res) => {
//   res.send('<h1>Phonebook App</h1>')
// })

// app.get('/api/persons', (req, res) => {
//   res.json(persons)
// })

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => res.json(persons))
})

// app.get('/api/persons/:id', (req, res) => {
//   const id = Number(req.params.id)
//   const person = persons.find(person => person.id === id)
  
//   if (person) {
//     res.json(person)
//   } else {
//     res.status(404).end()
//   }
// })

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if(person){
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
   .catch(error => next(error))
})

// app.delete('/api/persons/:id', (req, res) => {
//   const id = Number(req.params.id)
//   persons = persons.filter(person => person.id !== id)
//   res.status(204).end()
// })

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => res.status(204).end())
    .catch(error => next(error))
  })

app.get('/info', (req, res) => {
  Person.find({}).then(persons => res.send(
    `<p>Phonebook has info for ${persons.length} people</p>
    ${new Date().toString()}`
  ))
  // res.send(
  //   `<p>Phonebook has info for ${persons.length} people</p>
  //   ${new Date().toString()}`
  //   )
})

// app.post('/api/persons', (req, res) => {
//   const body = req.body

//   if (!body.name || !body.number) {
//     return res.status(400).json({ 
//       error: 'name or number is missing' 
//     })
//   }

//   if(persons.find(person => person.name === body.name))
//   {
//     return res.status(400).json({ 
//       error: 'name must be unique' 
//     })
//   }

//   const person = {
//     id: Math.floor(Math.random() * 1000),
//     name: body.name,
//     number: body.number,
//   }

//   persons = persons.concat(person)
//   res.json(person)
// })

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'name or number is missing' })
  }
  // if(persons.find(person => person.name === body.name))
  // {
  //   return res.status(400).json({ error: 'name must be unique' })
  // }
  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save().then(savedPerson => {
    res.json(savedPerson)
    })
    .catch(error => next(error))
  // persons = persons.concat(person)
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  Person.findByIdAndUpdate(req.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => res.json(updatedPerson))
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))