import {
    Listener,
    OrderStatus,
    PaymentCreatedEvent,
    Subjects
} from '@mehdisaffar/ticketing-common'
import { Order } from '../../models/order'
import { queueGroupName } from './queue-group-name'
import { Message } from 'node-nats-streaming'

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated
    queueGroupName = queueGroupName

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        console.log('Event data:', data)

        const order = await Order.findById(data.orderId)

        if (!order) {
            throw new Error('Order not found')
        }

        order.set({ status: OrderStatus.Complete })
        await order.save()

        msg.ack()
    }
}
