import {
    Subjects,
    TicketCreatedEvent,
    Publisher
} from '@mehdisaffar/ticketing-common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated
}
