import axios from 'axios'
import buildClient from '../api/build-client'

export default function Index({ currentUser }) {
    console.log('component currentUser', currentUser)
    return <h1>Landing Page</h1>
}

Index.getInitialProps = async ctx => {
    const client = buildClient(ctx)
    const { data } = await client.get('/api/users/currentuser')

    return data
}
