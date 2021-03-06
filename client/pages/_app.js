import 'bootstrap/dist/css/bootstrap.css'
import buildClient from '../api/build-client'

import Header from '../components/header'

export default function AppComp({ Component, pageProps, currentUser }) {
    return (
        <div>
            <Header currentUser={currentUser} />
            <div className="container">
                <Component {...pageProps} currentUser={currentUser} />
            </div>
        </div>
    )
}

AppComp.getInitialProps = async ({ Component, ctx }) => {
    const client = buildClient(ctx)
    const { data } = await client.get('/api/users/currentuser')

    let pageProps = {}
    if (Component.getInitialProps) {
        pageProps = await Component.getInitialProps(
            ctx,
            client,
            data.currentUser
        )
    }

    return { pageProps, ...data }
}
