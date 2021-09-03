import { Ticket } from '../../../models/ticket'
import { OrderCreatedListener } from '../order-created-listener'
import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'

import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedEvent, OrderStatus } from '@mehdisaffar/ticketing-common'

const setup = async () => {
    // create instance
    const listener = new OrderCreatedListener(natsWrapper.client)

    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save()

    // create data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: ticket.userId,
        status: OrderStatus.Created,
        expiresAt: new Date().toISOString(),
        version: 0,

        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    // create fake message
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, data, msg }
}

it('sets the orderId of the ticket', async () => {
    const { listener,  data, msg } = await setup()

    // call listener's onMessage
    await listener.onMessage(data, msg)

    // assert ticket is created
    const ticket = await Ticket.findById(data.ticket.id)

    expect(ticket).toBeDefined()
    expect(ticket!.orderId).toEqual(data.id)
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup()

    // call listener's onMessage
    await listener.onMessage(data, msg)

    // assert msg.ack() is called
    expect(msg.ack).toHaveBeenCalled()
})
