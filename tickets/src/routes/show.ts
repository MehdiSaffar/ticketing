import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import {
    validateRequest,
    BadRequestError,
    currentUser,
    requireAuth,
    NotFoundError
} from '@mehdisaffar/ticketing-common'
import { Ticket } from '../models/ticket'

const router = express.Router()

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id)

    if (!ticket) {
        throw new NotFoundError()
    }

    res.send(ticket)
})

export { router as showTicketRouter }
