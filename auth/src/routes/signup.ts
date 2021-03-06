import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { User } from '../models/user'
import jwt from 'jsonwebtoken'
import { validateRequest, BadRequestError } from '@mehdisaffar/ticketing-common'

const router = express.Router()

router.post(
    '/api/users/signup',
    [
        body('email').trim().isEmail().withMessage('Email is invalid'),
        body('password')
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage('Password must be between 4 and 20 characters')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            throw new BadRequestError('Email in use')
        }

        const user = User.build({ email, password })
        await user.save()

        // generate JWT
        const userJwt = jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            process.env.JWT_KEY!
        )

        req.session = {
            jwt: userJwt
        }

        res.status(201).send(user)
    }
)

export { router as signupRouter }
