import request from 'supertest'
import { app } from '../../app'

it('responds with details about the current user', async () => {
    const agent = await global.signin()

    const response = await agent
        .get('/api/users/currentuser')
        .send()
        .expect(200)

    expect(response.body.currentUser.email).toEqual('test@test.com')
})

it('responds with currentUser=null', async () => {
    const response = await request(app)
        .get('/api/users/currentuser')
        .send()
        .expect(200)

    expect(response.body.currentUser).toBeNull()
})
