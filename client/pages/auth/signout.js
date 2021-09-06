import { useEffect, useState } from 'react'
import Router from 'next/router'
import useRequest from '../../hooks/use-request'

export default function Signin() {
    const { doRequest } = useRequest({
        url: '/api/users/signout',
        method: 'post',
        onSuccess: () => Router.push('/')
    })

    useEffect(() => {
        doRequest()
    }, [])

    return <div>Signing you out...</div>
}
