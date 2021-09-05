import {
    ExpirationCompleteEvent,
    OrderStatus
} from '@mehdisaffar/ticketing-common'
import { Ticket } from '../../../models/ticket'
import { Order } from '../../../models/order'
import { natsWrapper } from '../../../nats-wrapper'
import { ExpirationCompleteListener } from '../expiration-complete-listener'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'

const setup = async () => {
    // create instance
    const listener = new ExpirationCompleteListener(natsWrapper.client)

    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save()

    const order = Order.build({
        status: OrderStatus.Created,
        userId: mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date(),
        ticket
    })
    await order.save()

    // create data event
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    }

    // create fake message
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, order, ticket, data, msg }
}

it('updates the order status to cancelled', async () => {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, msg)

    const order = await Order.findById(data.orderId)
    expect(order!.status).toEqual(OrderStatus.Cancelled)
})

it('emits an OrderCancelled event', async () => {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, msg)

    const publish = natsWrapper.client.publish as jest.Mock

    expect(publish).toHaveBeenCalled()
    const eventData = JSON.parse(publish.mock.calls[0][1])
    expect(eventData.id).toEqual(data.orderId)
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})
