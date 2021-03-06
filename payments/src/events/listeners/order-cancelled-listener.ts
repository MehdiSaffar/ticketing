import {
    Listener,
    Subjects,
    OrderCancelledEvent,
    OrderStatus
} from '@mehdisaffar/ticketing-common'
import { queueGroupName } from './queue-group-name'

import { Message } from 'node-nats-streaming'
import { Order } from '../../models/order'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled
    readonly queueGroupName = queueGroupName

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        console.log('Event data: ', data)

        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1
        })

        if (!order) {
            throw new Error('Order not found')
        }

        order.set({ status: OrderStatus.Cancelled })
        await order.save()

        msg.ack()
    }
}
