import { TicketUpdatedEvent } from '@mehdisaffar/ticketing-common'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { TicketUpdatedListener } from '../ticket-updated-listener'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'

const setup = async () => {
    // create instance
    const listener = new TicketUpdatedListener(natsWrapper.client)

    // create and save ticket
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save()

    // create data event
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        title: 'updated concert',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: ticket.version + 1
    }

    // create fake message
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, data, msg }
}

it('finds, updates, and saves a ticket', async () => {
    const { listener, data, msg } = await setup()

    // call listener's onMessage
    await listener.onMessage(data, msg)

    // assert ticket is updated
    const ticket = await Ticket.findById(data.id)

    expect(ticket).toBeDefined()
    expect(ticket!.title).toEqual(data.title)
    expect(ticket!.price).toEqual(data.price)
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup()

    // call listener's onMessage
    await listener.onMessage(data, msg)

    // assert ack is called
    expect(msg.ack).toHaveBeenCalled()
})

it('does not ack if event skips version number', async () => {
    const { listener, data, msg } = await setup()

    // change data version
    data.version += 10

    // call listener's onMessage
    await expect(listener.onMessage(data, msg)).rejects.toThrow()

    // assert ack is not called
    expect(msg.ack).not.toHaveBeenCalled()
})
