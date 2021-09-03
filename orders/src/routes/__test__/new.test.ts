import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'
import { Order, OrderStatus } from '../../models/order'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'

it('has a route handler listening to /api/orders for post requests', async () => {
    const response = await request(app).post('/api/orders').send({})
    expect(response.status).not.toEqual(404)
})

it('return status = 401 if the user is not logged in', async () => {
    await request(app).post('/api/orders').send({}).expect(401)
})

it('return status != 401 if the user is logged in', async () => {
    const response = await global.signin().post('/api/orders').send({})
    expect(response.status).not.toEqual(401)
})

it('returns an error if the ticket does not exist', async () => {
    const ticketId = mongoose.Types.ObjectId()

    await global.signin().post('/api/orders').send({ ticketId }).expect(404)
})
it('returns an error if the ticket is reserved', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save()

    const order = Order.build({
        ticket,
        userId: 'userId',
        status: OrderStatus.Created,
        expiresAt: new Date()
    })
    await order.save()

    await global
        .signin()
        .post('/api/orders')
        .send({ ticketId: ticket.id })
        .expect(400)
})

it('reserves a ticket', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save()

    await global
        .signin()
        .post('/api/orders')
        .send({ ticketId: ticket.id })
        .expect(201)
})

it('publishes an event', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save()

    await global
        .signin()
        .post('/api/orders')
        .send({ ticketId: ticket.id })
        .expect(201)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})
