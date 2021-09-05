import {
    Publisher,
    ExpirationCompleteEvent,
    Subjects
} from '@mehdisaffar/ticketing-common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete
}
