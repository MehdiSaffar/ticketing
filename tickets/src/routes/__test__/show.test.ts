import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'

const title = 'concert'
const price = 20

it('returns 404 if ticket not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app).get(`/api/tickets/${id}`).expect(404)
})

it('returns ticket if found', async () => {
    const {
        body: { id }
    } = await global
        .signin()
        .post('/api/tickets')
        .send({ title, price })
        .expect(201)

    const response = await request(app).get(`/api/tickets/${id}`).expect(200)
    expect(response.body.title).toEqual(title)
    expect(response.body.price).toEqual(price)
})