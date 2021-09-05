import { OrderCancelledListener } from '../order-cancelled-listener'
import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'

import { natsWrapper } from '../../../nats-wrapper'
import { OrderCancelledEvent, OrderStatus } from '@mehdisaffar/ticketing-common'
import { Order } from '../../../models/order'

const setup = async () => {
    // create instance
    const listener = new OrderCancelledListener(natsWrapper.client)

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0
    })
    await order.save()

    // create data event
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString()
        },
        version: order.version + 1
    }

    // create fake message
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg }
}

it('updates order status', async () => {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, msg)

    const order = await Order.findById(data.id)
    expect(order!.status).toEqual(OrderStatus.Cancelled)
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})
