import express, { Request, Response } from 'express'

import {
    BadRequestError,
    NotFoundError,
    OrderStatus,
    requireAuth,
    UnauthorizedError,
    validateRequest
} from '@mehdisaffar/ticketing-common'
import { body } from 'express-validator'
import { Order } from '../models/order'

const router = express.Router()

router.post(
    '/api/payments',
    requireAuth,
    [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
    validateRequest,
    async (req: Request, res: Response) => {
        const {token, orderId} = req.body

        const order = await Order.findById(orderId)

        if (!order) {
            throw new NotFoundError()
        }

        if (order.userId !== req.currentUser!.id) {
            throw new UnauthorizedError()
        }

        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('Cannot pay for an cancelled order')
        }


        res.status(201).send(order)
    }
)

export { router as createChargeRouter }
