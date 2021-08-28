import {
    Subjects,
    TicketUpdatedEvent,
    Publisher
} from '@mehdisaffar/ticketing-common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated
}
