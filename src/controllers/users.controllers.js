import express from 'express'
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import prisma from "../utils/prisma.js"
import { validateUser } from "../validators/users.js"
import { filter } from "../utils/common.js"
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const router = express.Router()

router.post('/', async (req, res) => {
  const data = req.body
//const msg body here to show the email & text to be sent across.
//   const msg = {
//     to: data.email,
//     from: 'srxmax161@gmail.com'
//     subject: 'Sending with SendGrid is Fun',
//     text: 'and easy to do anywhere, event with Node.js',
//     html: '<strong>and easy to do anywhere, event with Node.js</strong>'
//   }

  const validationErrors = validateUser(data)

  if (Object.keys(validationErrors).length != 0) return res.status(400).send({
    error: validationErrors
  })

  data.password = bcrypt.hashSync(data.password, 8);

  prisma.user.create({
    data
  }).then(user => {
//implement sgMail.Send here to send email.
    // .send(msg)
    // .then((response) => {
    //   console.log(response[0].statusCode)
    //   console.log(response[0].headers)
    // })
    // .catch((error) => {
    //   console.error(error)
    // })
    return res.json(filter(user, 'id', 'name', 'email'))
  }).catch(err => {
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

export default router