import StripeCheckout from 'react-stripe-checkout'

import { useState, useEffect } from 'react'

import useRequest from '../../hooks/use-request'
import Router from 'next/router'

export default function OrderShow({ order, currentUser }) {
    const [timeLeft, setTimeLeft] = useState(0)
    const { doRequest, errors } = useRequest({
        url: `/api/payments`,
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: () => Router.push('/orders')
    })

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

    return (
        <div>
            {timeLeft} seconds until order expires
            {errors}
            <StripeCheckout
                token={async token => {
                    const { id } = token
                    await doRequest({ token: id })
                }}
                stripeKey="pk_test_51JWQPrBxjoXIME6A2GapiMTrv5b8OviYnop4Hemq1y1VjyEMS82gGKv38sQFhgl69KNYG3PRVyxajUkThKKanXrI00lygPXHgY"
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />
        </div>
    )
}

OrderShow.getInitialProps = async (ctx, client) => {
    const { orderId } = ctx.query
    const { data: order } = await client.get(`/api/orders/${orderId}`)
    return { order }
}
