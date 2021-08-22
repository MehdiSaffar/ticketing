import { ValidationError } from 'express-validator'
import { CustomError } from './custom-error'

export class RequestValidationError extends CustomError {
    statusCode = 400
    constructor(public errors: ValidationError[]) {
        super('Request validation error')

        Object.setPrototypeOf(this, new.target.prototype)
        // Error.captureStackTrace(this, RequestValidationError)
    }

    serializeErrors() {
        return this.errors.map(error => {
            return {
                message: error.msg,
                field: error.param
            }
        })
    }
}
