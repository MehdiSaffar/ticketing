import axios from 'axios'
import { useState } from 'react'

export default function useRequest({ url, method, body, onSuccess }) {
    const [errors, setErrors] = useState(null)

    async function doRequest(props = {}) {
        try {
            setErrors(null)
            const response = await axios[method](url, { ...body, ...props })

            if (onSuccess) {
                onSuccess(response.data)
            }

            return response.data
        } catch (error) {
            setErrors(
                <div className="alert alert-danger">
                    <h4>Oops</h4>
                    <ul className="my-0">
                        {error.response.data.errors.map(error => {
                            return <li key={error.message}>{error.message}</li>
                        })}
                    </ul>
                </div>
            )
        }
    }

    return { doRequest, errors }
}
