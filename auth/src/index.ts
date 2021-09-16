import mongoose from 'mongoose'
import { app } from './app'

if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY is not set')
}

if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set')
}

const start = async () => {
    console.log('startup...');
    try {
        await mongoose.connect(process.env.MONGO_URI!, {
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
