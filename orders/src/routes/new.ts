import express, { Request, Response } from 'express'

import { addSeconds } from 'date-fns'

import {
    BadRequestError,
    NotFoundError,
    OrderStatus,
    requireAuth,
    validateRequest
} from '@mehdisaffar/ticketing-common'
import { body } from 'express-validator'
import { Ticket } from '../models/ticket'
import { Order } from '../models/order'

const EXPIRATION_WINDOW_SECONDS = 15 * 60

const router = express.Router()

router.post(
    '/api/orders',
    requireAuth,
    [body('ticketId').not().isEmpty().withMessage('ticketId must be provided')],
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body

        // find the ticket the user is trying to order
        const ticket = await Ticket.findById(ticketId)

        if (!ticket) {
            throw new NotFoundError()
        }

        // make sure that the ticket is not already reserved
        if (await ticket.isReserved()) {
            throw new BadRequestError('Ticket is already reserved')
        }

        // calculate an expiration date for this order
        const expiresAt = addSeconds(new Date(), EXPIRATION_WINDOW_SECONDS)

        // build the order and save it to the database
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt,
            ticket
        })
        await order.save()

        // publish an event saying that an order was created

        res.status(201).send(order)
    }
)

export { router as newOrderRouter }
