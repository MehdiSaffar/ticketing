import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Order, OrderStatus } from '../../models/order'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'

const title = 'concert'
const price = 20

const createTicket = async () => {
    const ticket = Ticket.build({
        title,
        price
    })
    await ticket.save()
    return ticket
}

const createOrder = async (agent: request.SuperAgentTest, ticketId: string) => {
    const response = await agent
        .post('/api/orders/')
        .send({ ticketId })
        .expect(201)
    return response.body
}

it('marks an order as cancelled', async () => {
    const agent = global.signin()

    const ticket = await createTicket()
    const order = await createOrder(agent, ticket.id)

    await agent.delete(`/api/orders/${order.id}`).expect(204)

    const cancelledOrder = await Order.findById(order.id)
    expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('publishes an event', async () => {
    const agent = global.signin()

    const ticket = Ticket.build({
        title: 'concert',
        price: 20
    })
    await ticket.save()

    const { body: order } = await agent
        .post('/api/orders')
        .send({ ticketId: ticket.id })
        .expect(201)

    await agent.delete(`/api/orders/${order.id}`).expect(204)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})
