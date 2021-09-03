import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'

const title = 'concert'
const price = 20

const createTicket = async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
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

it('returns a list of order of a user', async () => {
    const tickets = [
        await createTicket(),
        await createTicket(),
        await createTicket()
    ]

    const user1 = global.signin()
    const user2 = global.signin()

    const orders = [
        await createOrder(user1, tickets[0].id),
        await createOrder(user2, tickets[1].id),
        await createOrder(user2, tickets[2].id)
    ]

    const response = await user2.get(`/api/orders`).expect(200)

    expect(response.body).toHaveLength(2)

    expect(response.body[0].id).toEqual(orders[1].id)
    expect(response.body[0].ticket.id).toEqual(tickets[1].id)

    expect(response.body[1].id).toEqual(orders[2].id)
    expect(response.body[1].ticket.id).toEqual(tickets[2].id)
})
