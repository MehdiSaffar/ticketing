import { Ticket } from '../../models/ticket'

it('returns the order', async () => {
    const agent = global.signin()
    const ticket = Ticket.build({
        title: 'concert',
        price: 20
    })
    await ticket.save()

    const { body: order } = await agent
        .post('/api/orders')
        .send({ ticketId: ticket.id })
        .expect(201)

    const { body: fetchedOrder } = await agent
        .get(`/api/orders/${order.id}`)
        .expect(200)

    expect(fetchedOrder.id).toEqual(order.id)
})

it('return 401 when the user is not the owner', async () => {
    const agent = global.signin()
    const otherAgent = global.signin()

    const ticket = Ticket.build({
        title: 'concert',
        price: 20
    })
    await ticket.save()

    const { body: order } = await agent
        .post('/api/orders')
        .send({ ticketId: ticket.id })
        .expect(201)

    await otherAgent.get(`/api/orders/${order.id}`).expect(401)
})
