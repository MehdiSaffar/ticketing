import {
    Listener,
    OrderCreatedEvent,
    Subjects
} from '@mehdisaffar/ticketing-common'
import { Message } from 'node-nats-streaming'
import { expirationQueue } from '../../queues/expiration-queue'
import { queueGroupName } from './queue-group-name'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated
    readonly queueGroupName = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        console.log('Event data: ', data)

        const expiresAtTime = new Date(data.expiresAt).getTime()
        const nowTime = new Date().getTime()

        const delay = expiresAtTime - nowTime

        await expirationQueue.add({ orderId: data.id }, { delay })

        msg.ack()
    }
}
