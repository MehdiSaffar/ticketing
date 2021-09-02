import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'

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
})
