import {
    Publisher,
    OrderCancelledEvent,
    Subjects
} from '@mehdisaffar/ticketing-common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled
}
