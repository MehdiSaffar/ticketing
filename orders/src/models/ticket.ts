import mongoose from 'mongoose'
import { Order, OrderStatus } from './order'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

// An interface that describes Ticket properties
interface TicketAttrs {
    id: string
    title: string
    price: number
}

// An interface that describes the properties that a Ticket document has
export interface TicketDoc extends mongoose.Document {
    title: string
    price: number
    version: number

    isReserved(): Promise<boolean>
}

// An interface that describes the properties that Ticket model has
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc
    findByEvent(event: {
        id: string
        version: number
    }): Promise<TicketDoc | null>
}

const ticketSchema = new mongoose.Schema<TicketDoc>(
    {
        title: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id
                delete ret._id
                delete ret.__v
            }
        }
    }
)
ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin as any)

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    const { id, ...rest } = attrs
    return new Ticket({
        _id: id,
        ...rest
    })
}

ticketSchema.statics.findByEvent = async (event: { id: string; version: number }) => {
    return await Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    })
}

ticketSchema.methods.isReserved = async function () {
    // this === the ticket document that we just called 'isReserved' on
    const order = await Order.findOne({
        ticket: this.id,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    })

    return !!order
}

export const Ticket = mongoose.model<TicketDoc, TicketModel>(
    'Ticket',
    ticketSchema
)
