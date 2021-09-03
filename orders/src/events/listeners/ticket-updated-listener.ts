import { Message } from 'node-nats-streaming'
import {
    Listener,
    Subjects,
    TicketUpdatedEvent
} from '@mehdisaffar/ticketing-common'
import { queueGroupName } from './queue-group-name'
import { Ticket } from '../../models/ticket'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated
    readonly queueGroupName = queueGroupName

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        console.log('Event data: ', data)

        const { id, title, price, version } = data

        const ticket = await Ticket.findByEvent(data)

        if (!ticket) {
            throw new Error('Ticket not found')
        }

        ticket.set({ title, price })

        await ticket.save()

        msg.ack()
    }
}
