import mongoose from 'mongoose'
import { app } from './app'
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener'
import { OrderCreatedListener } from './events/listeners/order-created-listener'
import { natsWrapper } from './nats-wrapper'

const envKeys = [
    'JWT_KEY',
    'MONGO_URI',
    'NATS_URL',
    'NATS_CLUSTER_ID',
    'NATS_CLIENT_ID',
    'MONGO_URI',
    'STRIPE_KEY'
]

for (const envKey of envKeys) {
    if (!process.env[envKey]) {
        throw new Error(`Missing environment variable ${envKey}`)
    }
}

const start = async () => {
    console.log('startup...')
    try {
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID!,
            process.env.NATS_CLIENT_ID!,
            process.env.NATS_URL!
        )
        console.log('Connected to NATS')

        await mongoose.connect(process.env.MONGO_URI!, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        console.log('Connected to MongoDB')

        // ---

        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed')
        })

        mongoose.connection.on('close', console.log)

        const shutdown = async () => {
            natsWrapper.client.close()
            await mongoose.disconnect()
            console.log('Mongoose connection closed')
            process.exit(0)
        }

        process.on('SIGINT', shutdown)
        process.on('SIGTERM', shutdown)

        new OrderCreatedListener(natsWrapper.client).listen()
        new OrderCancelledListener(natsWrapper.client).listen()
    } catch (e) {
        console.error(e)
    }

    app.listen(3000, () => {
        console.log('Listening on port 3000')
    })
}

start()
