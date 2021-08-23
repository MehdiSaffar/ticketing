import request from 'supertest'
import { app } from '../../app'

it('fails when an email that does not exist is given', async () => {
    return request(app)
        .post('/api/users/signin')
        .send({
            email: 'non-existing@test.com',
            password: 'password'
        })
        .expect(400)
})

it('fails when an incorrect password is given', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201)

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'bad-password'
        })
        .expect(400)
})

it('responds with a cookie when given valid credentials', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201)

    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(200)

    expect(response.get('Set-Cookie')).toBeDefined()
})
