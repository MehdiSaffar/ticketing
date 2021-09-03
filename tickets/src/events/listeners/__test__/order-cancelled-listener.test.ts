import { Ticket } from '../../../models/ticket'
import { OrderCancelledListener } from '../order-cancelled-listener'
import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'

import { natsWrapper } from '../../../nats-wrapper'
import { OrderCancelledEvent, OrderStatus } from '@mehdisaffar/ticketing-common'

const setup = async () => {
    // create instance
    const listener = new OrderCancelledListener(natsWrapper.client)

    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save()

    // create data event
    const data: OrderCancelledEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        ticket: { id: ticket.id }
    }

    // create fake message
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, data, msg }
}

it('unsets the orderId of the ticket', async () => {
    const { listener, data, msg } = await setup()

    // call listener's onMessage
    await listener.onMessage(data, msg)

    // assert ticket is cancelled
    const ticket = await Ticket.findById(data.ticket.id)

    expect(ticket).toBeDefined()
    expect(ticket!.orderId).not.toBeDefined()
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup()

    // call listener's onMessage
    await listener.onMessage(data, msg)

    // assert msg.ack() is called
    expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated event', async () => {
    const { listener, ticket, data, msg } = await setup()

    // call listener's onMessage
    await listener.onMessage(data, msg)

    // assert a ticket updated event is published
    expect(natsWrapper.client.publish).toHaveBeenCalled()
})
