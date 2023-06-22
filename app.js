import express from "express";
import prisma from "./src/utils/prisma.js";
import bcrypt from "bcryptjs";
import cors from "cors";
import { Prisma } from '@prisma/client'
import { signAccessToken } from "./utils/jwt.js"
// import { filter } from '../utils/common.js'


const app = express()
// const port = process.env.PORT || 8080

//this utilizes the express framework, app is from express application, express.json is a middleware specifically parses incoming requests with JSON payloads
app.use(express.json());
app.use(cors())

//to get the user details of all the users
app.get('/', async (req, res) => {
  const allUsers = await prisma.user.findMany()
  res.json(allUsers)
})


//to get a specific user of a specific id
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const findSingleUser = await prisma.user.findUnique({
      where: {
        id: JSON.stringify(id)
      }
    });

    if (findSingleUser) {
      res.json(findSingleUser);
    } else {
      res.status(404).json({ error: 'User not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving user data.' });
  }
});

//to find many users from the database
app.get('/users/:id', async (req, res) => {
  const allUsers = await prisma.user.findMany()
  res.json(allUsers)
})

//function iterates to filter out only useful information to be extracted and shown
function filter(obj, ...keys) {
  return keys.reduce((a, c) => ({ ...a, [c]: obj[c]}), {})
}

function validateUser(input) {
  const validationErrors = {}

  if (!('name' in input) || input['name'].length == 0) {
    validationErrors['name'] = 'cannot be blank'
  }

  if (!('email' in input) || input['email'].length == 0) {
    validationErrors['email'] = 'cannot be blank'
  }

  if (!('password' in input) || input['password'].length == 0) {
    validationErrors['password'] = 'cannot be blank'
  }

  if ('password' in input && input['password'].length < 8) {
    validationErrors['password'] = 'should be at least 8 characters'
  }

  if ('email' in input && !input['email'].match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    validationErrors['email'] = 'is invalid'
  }

  return validationErrors
}

function validateLogin(input) {
  const validationErrors = {}

  if (!('email' in input) || input['email'].length == 0) {
    validationErrors['email'] = 'cannot be blank'
  }

  if (!('password' in input) || input['password'].length == 0) {
    validationErrors['password'] = 'cannot be blank'
  }

  if ('email' in input && !input['email'].match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    validationErrors['email'] = 'is invalid'
  }

  return validationErrors
}

//to create user we use the below post method
app.post('/users', async (req, res) => {
  const data = req.body

  const validationErrors = validateUser(data)

  if (Object.keys(validationErrors).length != 0) return res.status(400).send({
    error: validationErrors
  })

  data.password = bcrypt.hashSync(data.password, 8);
  prisma.user.create({
    data
  }).then(user => {
    return res.json(filter(user, 'id', 'name', 'email'))

  }).catch(err => {
    // we have unique index on user's email field in our schema, Postgres throws an error when we try to create 2 users with the same email. here's how we catch the error and gracefully return a friendly message to the user.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const formattedError = {}
      formattedError[`${err.meta.target[0]}`] = 'already taken'

      return res.status(500).send({
        error: formattedError
      })
    }
    throw err
  })
})

//to handle signin end point
app.post('/sign-in', async (req, res) => {
  const data = req.body

  const validationErrors = validateLogin(data)

  if (Object.keys(validationErrors).length != 0) return res.status(400).send({
    error: validationErrors
  })

  const user = await prisma.user.findUnique({
    where: {
      email: data.email
    }
  })

  if (!user) return res.status(401).send({
    error: 'Email address or password not valid'
  })

  const checkPassword = bcrypt.compareSync(data.password, user.password)
  if (!checkPassword) return res.status(401).send({
    error: 'Email address or password not valid'
  })

  const userFiltered = filter(user, 'id', 'name', 'email')
  const accessToken = await signAccessToken(userFiltered)
  return res.json({ accessToken })
})

app.delete('/', async (req, res) => {
  const deleteUsers = await prisma.user.deleteMany()
  res.json(deleteUsers)
})

// app.get('/', async (req, res) => {
//   const allUsers = await prisma.user.findMany()
//   res.json(allUsers)
// })

// app.listen(port, () => {
//   console.log(`App started; listening on port ${port}`)
// })

export default app // added this