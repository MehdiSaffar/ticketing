import express from 'express'
import 'express-async-errors'

import cookieSession from 'cookie-session'
import {
    NotFoundError,
    errorHandler,
    currentUser
} from '@mehdisaffar/ticketing-common'
import { deleteOrderRouter } from './routes/delete'
import { indexOrderRouter } from './routes'
import { newOrderRouter } from './routes/new'
import { showOrderRouter } from './routes/show'

const app = express()
app.set('trust proxy', true)

app.use(express.json())
app.use(
    cookieSession({
        signed: false,
        // secure: process.env.NODE_ENV !== 'test'
        secure: false
    })
)
app.use(currentUser)

app.use(deleteOrderRouter)
app.use(indexOrderRouter)
app.use(newOrderRouter)
app.use(showOrderRouter)

app.use(deleteOrderRouter)

app.all('*', async (req, res) => {
    throw new NotFoundError()
})

app.use(errorHandler)

export { app }
