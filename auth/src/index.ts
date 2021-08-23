import mongoose from 'mongoose'
import { app } from './app'

if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY is not set')
}

const start = async () => {
    try {
        await mongoose.connect('mongodb://auth-mongo-srv:27017/auth', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        console.log('Connected to MongoDB')
    } catch (e) {
        console.error(e)
    }

    app.listen(3000, () => {
        console.log('Listening on port 3000')
    })
}

start()
