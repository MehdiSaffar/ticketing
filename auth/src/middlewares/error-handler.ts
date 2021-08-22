import { NextFunction, Request, Response } from 'express'
import { CustomError } from '../errors/custom-error'

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.log('something went wrong', err.message)

    if (err instanceof CustomError) {
        return res
            .status(err.statusCode)
            .send({ errors: err.serializeErrors() })
    }

    return res.status(500).send({
        errors: [{ message: 'Something went wrong' }]
    })
}
