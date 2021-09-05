import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { app } from '../app'
import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../nats-wrapper')

let mongo: MongoMemoryServer

beforeAll(async () => {
    process.env.JWT_KEY = 'jwt-key'

    mongo = new MongoMemoryServer()
    await mongo.start()
    const uri = await mongo.getUri()

    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
})

beforeEach(async () => {
    jest.clearAllMocks()

    const collections = await mongoose.connection.db.collections()

    for (const collection of collections) {
        await collection.deleteMany({})
    }
})

afterAll(async () => {
    await mongo.stop()
    await mongoose.connection.close()
})

declare global {
    var signin: (id?: string) => request.SuperTest<request.Test>
}

global.signin = (id?: string) => {
    // build jwt payload
    const payload = {
        id: id ?? new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }

    // create jwt
    const token = jwt.sign(payload, process.env.JWT_KEY!)

    // build session object
    const session = { jwt: token }

    // turn session into json
    const json = JSON.stringify(session)

    // base64 encode json
    const base64 = Buffer.from(json).toString('base64')

    // create agent
    const agent = request.agent(app)

    // set cookie header
    agent.set('Cookie', `express:sess=${base64}`)

    return agent
}
