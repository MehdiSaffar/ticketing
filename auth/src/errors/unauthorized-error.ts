import { CustomError } from './custom-error'

export class UnauthorizedError extends CustomError {
    statusCode = 401
    constructor() {
        super('Unauthorized')

        Object.setPrototypeOf(this, new.target.prototype)
    }

    serializeErrors() {
        return [{ message: 'Unauthorized' }]
    }
}
