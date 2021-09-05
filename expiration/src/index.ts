import { OrderCreatedListener } from './events/listeners/order-created-listener'
import { natsWrapper } from './nats-wrapper'

const envKeys = ['NATS_URL', 'NATS_CLUSTER_ID', 'NATS_CLIENT_ID']

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

        // ---

        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed')
        })

        const shutdown = async () => {
            natsWrapper.client.close()
            process.exit(0)
        }

        process.on('SIGINT', shutdown)
        process.on('SIGTERM', shutdown)

        new OrderCreatedListener(natsWrapper.client).listen()
    } catch (e) {
        console.error(e)
    }
}

start()
