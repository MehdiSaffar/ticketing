import * as dfns from 'date-fns'

import { useState, useEffect } from 'react'

export default function OrderShow({ order }) {
    const [timeLeft, setTimeLeft] = useState(0)
    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date()
            setTimeLeft(Math.round(msLeft / 1000))
        }

        findTimeLeft()
        const interval = setInterval(findTimeLeft, 1000)

        return () => clearInterval(interval)
    }, [order])

    if (timeLeft < 0) {
        return <div>Order Expired</div>
    }

    return <div>{timeLeft} seconds until order expires</div>
}

OrderShow.getInitialProps = async (ctx, client) => {
    const { orderId } = ctx.query
    const { data: order } = await client.get(`/api/orders/${orderId}`)
    return { order }
}
