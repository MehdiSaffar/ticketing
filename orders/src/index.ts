import mongoose from 'mongoose'
import { app } from './app'
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener'
import { TicketCreatedListener } from './events/listeners/ticket-created-listener'
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener'
import { natsWrapper } from './nats-wrapper'

const envKeys = [
    'JWT_KEY',
    'MONGO_URI',
    'NATS_URL',
    'NATS_CLUSTER_ID',
    'NATS_CLIENT_ID',
    'MONGO_URI'
]

for (const envKey of envKeys) {
    if (!process.env[envKey]) {
        throw new Error(`Missing environment variable ${envKey}`)
    }
}

const start = async () => {
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
    } catch (e) {
        console.error(e)
    }

    new TicketCreatedListener(natsWrapper.client).listen()
    new TicketUpdatedListener(natsWrapper.client).listen()
    new ExpirationCompleteListener(natsWrapper.client).listen()

    app.listen(3000, () => {
        console.log('Listening on port 3000')
    })
}

start()
