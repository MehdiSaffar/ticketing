import useRequest from '../../hooks/use-request'
import Router from 'next/router'

export default function TicketShow({ ticket }) {
    const { doRequest, errors } = useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            ticketId: ticket.id
        },
        onSuccess: order => Router.push(`/orders/${order.id}`)
    })

    return (
        <div>
            <h1>{ticket.title}</h1>
            <h4>Price: {ticket.price}</h4>
            {errors}
            <button className="btn btn-primary" onClick={() => doRequest()}>
                Purchase
            </button>
        </div>
    )
}

TicketShow.getInitialProps = async (ctx, client) => {
    const { ticketId } = ctx.query
    const { data: ticket } = await client.get(`/api/tickets/${ticketId}`)
    return { ticket }
}
