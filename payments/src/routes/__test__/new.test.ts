import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'
import { Order, OrderStatus } from '../../models/order'
import { natsWrapper } from '../../nats-wrapper'

const fakeToken = 'stripe-token'

it('returns 404 if the order does not exist', async () => {
    const orderId = new mongoose.Types.ObjectId()

    await global
        .signin()
        .post('/api/payments')
        .send({ orderId, token: fakeToken })
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
        .send({ orderId: order.id, token: fakeToken })
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
        .send({ orderId: order.id, token: fakeToken })
        .expect(400)
})
