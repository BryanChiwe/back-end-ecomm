//table data should store Price of images, title of image & description
import prisma from "../utils/prisma.js"
import express from 'express'
import { Prisma } from "@prisma/client"

const router = express.Router()

router.post('/', async (req, res) => {
    const data = req.body

    prisma.images.create({
        data
    }).then(images => {
        return res.json(images)
    }).catch(err => {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'){
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