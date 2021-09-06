import Link from 'next/link'

export default function Header({ currentUser }) {
    const links = [
        !currentUser && { label: 'Sign up', href: '/auth/signup' },
        !currentUser && { label: 'Sign in', href: '/auth/signin' },
        currentUser && { label: 'Sell Tickets', href: '/tickets/new' },
        currentUser && { label: 'My Orders', href: '/orders' },
        currentUser && { label: 'Sign out', href: '/auth/signout' }
    ]
        .filter(Boolean)
        .map(link => {
            return (
                <li key={link.href} className="nav-item">
                    <Link href={link.href}>
                        <a className="nav-link">{link.label}</a>
                    </Link>
                </li>
            )
        })

    return (
        <nav className="navbar navbar-light bg-light">
            <Link href="/">
                <a className="navbar-brand">GitTix</a>
            </Link>
            <div className="d-flex justify-content-end">
                <ul className="nav d-flex align-items">{links}</ul>
            </div>
        </nav>
    )
}
