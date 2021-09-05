import { OrderStatus } from '@mehdisaffar/ticketing-common'
import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

export { OrderStatus }

// An interface that describes Order properties
interface OrderAttrs {
    id: string
    userId: string
    status: OrderStatus
    price: number
    version: number
}

// An interface that describes the properties that a Order document has
interface OrderDoc extends mongoose.Document {
    userId: string
    status: OrderStatus
    price: number
    version: number
}

// An interface that describes the properties that Order model has
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc
}

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(OrderStatus),
            default: OrderStatus.Created
        }
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id
                delete ret._id
            }
        }
    }
)
orderSchema.set('versionKey', 'version')
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = (attrs: OrderAttrs) => {
    const { id, ...rest } = attrs
    return new Order({
        _id: id,
        ...rest
    })
}

export const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)
