import { TicketCreatedEvent } from '@mehdisaffar/ticketing-common'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { TicketCreatedListener } from '../ticket-created-listener'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'

const setup = async () => {
    // create instance
    const listener = new TicketCreatedListener(natsWrapper.client)

    // create data event
    const data: TicketCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0
    }

    // create fake message
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg }
}

it('creates and saves a ticket', async () => {
    const { listener, data, msg } = await setup()

    // call listener's onMessage
    await listener.onMessage(data, msg)

    // assert ticket is created
    const ticket = await Ticket.findById(data.id)

    expect(ticket).toBeDefined()
    expect(ticket!.title).toEqual(data.title)
    expect(ticket!.price).toEqual(data.price)
})

it('acks the message', async () => {

    const { listener, data, msg } = await setup()

    // call listener's onMessage
    await listener.onMessage(data, msg)

    // assert msg.ack() is called
    expect(msg.ack).toHaveBeenCalled()
})
