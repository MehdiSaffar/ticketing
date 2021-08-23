import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { app } from '../app'
import request from 'supertest'

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
    var signin: () => Promise<request.SuperAgentTest>
}

global.signin = async () => {
    const credentials = {
        email: 'test@test.com',
        password: 'password'
    }

    const agent = request.agent(app)

    await agent.post('/api/users/signup').send(credentials).expect(201)

    return agent
}
