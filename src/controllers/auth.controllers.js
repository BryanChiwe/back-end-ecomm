import { validateLogin } from "../validators/auth.js"
import bcrypt from "bcryptjs"
import prisma from "../utils/prisma.js"
import { filter } from "../utils/common.js"
import { signAccessToken } from "../utils/jwt.js"
import express from 'express'

const router = express.Router()

router.post('/', async(req, res) => {
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

  export default router