import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'
import { Order, OrderStatus } from '../../models/order'
import { natsWrapper } from '../../nats-wrapper'
import { stripe } from '../../stripe'
import { Payment } from '../../models/payment'

const token = 'tok_visa'

it('returns 404 if the order does not exist', async () => {
    const orderId = new mongoose.Types.ObjectId()

    await global
        .signin()
        .post('/api/payments')
        .send({ orderId, token })
        .expect(404)
})

it('returns 401 if the order is of another user', async () => {
    const order = await Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.Created
    }).save()

    await global
        .signin()
        .post('/api/payments')
        .send({ orderId: order.id, token })
        .expect(401)
})

it('returns 400 if the order is cancelled', async () => {
    const userId = mongoose.Types.ObjectId().toHexString()

    const order = await Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: 20,
        status: OrderStatus.Cancelled
    }).save()

    await global
        .signin(userId)
        .post('/api/payments')
        .send({ orderId: order.id, token })
        .expect(400)
})

it('returns 201 with valid inputs', async () => {
    const userId = mongoose.Types.ObjectId().toHexString()

    const order = await Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: 20,
        status: OrderStatus.Created
    }).save()

    await global
        .signin(userId)
        .post('/api/payments')
        .send({ orderId: order.id, token })
        .expect(201)

    expect(stripe.charges.create).toHaveBeenCalled()

    const mockFn = stripe.charges.create as jest.Mock

    const chargeOptions = mockFn.mock.calls[0][0]
    const chargeResult = await mockFn.mock.results[0].value

    expect(chargeOptions.source).toEqual(token)
    expect(chargeOptions.amount).toEqual(order.price * 100)
    expect(chargeOptions.currency).toEqual('usd')

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: chargeResult.id
    })
    expect(payment).not.toBeNull()
})
