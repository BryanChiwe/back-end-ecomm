import express from "express"
import prisma from "./src/utils/prisma.js"
// import { Prisma } from '@prisma/client'

const app = express()
const port = process.env.PORT || 8080

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

app.get('/users/:id', async (req, res) => {
  const allUsers = await prisma.user.findMany()
  res.json(allUsers)
})


app.use(express.json());

app.post('/users', async (req, res) => {
  const data = req.body


  prisma.user.create({
    data
  }).then(user => {
    return res.json(user)

  }).catch(err => {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const formattedError = {}
      formattedError[`${err.meta.target[0]}`] = 'already taken'

      return res.status(500).send({
        error: formattedError
      });  // friendly error handling
    }
    throw err  // if this happens, our backend application will crash and not respond to the client. because we don't recognize this error yet, we don't know how to handle it in a friendly manner. we intentionally throw an error so that the error monitoring service we'll use in production will notice this error and notify us and we can then add error handling to take care of previously unforeseen errors.
  })
})


app.listen(port, () => {
  console.log(`App started; listening on port ${port}`)
})

