import Link from 'next/link'

export default function Index({ tickets, currentUser }) {
    const ticketList = tickets.map(ticket => {
        return (
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td>
                    <Link href={`/tickets/${ticket.id}`}>
                        <a>View</a>
                    </Link>
                </td>
            </tr>
        )
    })

    return (
        <div>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>{ticketList}</tbody>
            </table>
        </div>
    )
    return currentUser ? (
        <h1>You are signed in</h1>
    ) : (
        <h1>You are not signed in</h1>
    )
}

Index.getInitialProps = async (context, client, currentUser) => {
    const { data: tickets } = await client.get('/api/tickets')

    return { tickets }
}
