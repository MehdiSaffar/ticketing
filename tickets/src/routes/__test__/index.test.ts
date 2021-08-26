import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'

const title = 'concert'
const price = 20

const createTicket = async (agent: request.SuperAgentTest) =>
    await agent.post('/api/tickets/').send({ title, price })

it('returns a list of tickets', async () => {
    const agent = global.signin()
    await createTicket(agent)
    await createTicket(agent)
    await createTicket(agent)

    const response = await request(app).get(`/api/tickets`).expect(200)

    expect(response.body).toHaveLength(3)
})
