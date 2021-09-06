import {
    Publisher,
    PaymentCreatedEvent,
    Subjects
} from '@mehdisaffar/ticketing-common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated
}
