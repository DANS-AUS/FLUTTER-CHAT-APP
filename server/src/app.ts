require('dotenv').config()
import express, { Express } from 'express'
import cors from 'cors'
import { auth } from 'express-oauth2-jwt-bearer'
import { chatRoutes, userRoutes } from './routes'

const { AUTH0_AUDIENCE, AUTH0_BASE_URL, AUTH0_SIGNING_ALG } = process.env

const jwtCheck: express.Handler = auth({
  audience: AUTH0_AUDIENCE,
  issuerBaseURL: AUTH0_BASE_URL,
  tokenSigningAlg: AUTH0_SIGNING_ALG
})
const app: Express = express()

app.use(cors())

app.use(jwtCheck)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1/users', userRoutes)
app.use('/api/v1/chats', chatRoutes)

export default app
