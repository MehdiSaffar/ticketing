import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'

const title = 'different concert'
const price = 40

const createTicket = async (agent: request.SuperAgentTest) => {
    const response = await agent
        .post('/api/tickets/')
        .send({ title: 'concert', price: 20 })
    return response.body
}

it('returns 404 if no ticket found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await global
        .signin()
        .put(`/api/tickets/${id}`)
        .send({ title, price })
        .expect(404)
})

it('returns 401 if user not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({ title, price })
        .expect(401)
})

it('returns 401 if user does not own the ticket', async () => {
    const u1 = global.signin()

    const ticket = await createTicket(u1)

    const u2 = global.signin()

    await u2.put(`/api/tickets/${ticket.id}`).send({ title, price }).expect(401)
})

it('returns 400 if user provides invalid title or price', async () => {
    const agent = global.signin()

    const ticket = await createTicket(agent)

    await agent
        .put(`/api/tickets/${ticket.id}`)
        .send({ title: '', price: 'abc' })
        .expect(400)

    await agent
        .put(`/api/tickets/${ticket.id}`)
        .send({ title: '', price: -1 })
        .expect(400)
})

it('updates the ticket with valid inputs', async () => {
    const agent = global.signin()

    const ticket = await createTicket(agent)

    await agent
        .put(`/api/tickets/${ticket.id}`)
        .send({ title, price })
        .expect(200)

    const response = await agent
        .get(`/api/tickets/${ticket.id}`)
        .expect(200)

    expect(response.body.title).toEqual(title)
    expect(response.body.price).toEqual(price)
})
