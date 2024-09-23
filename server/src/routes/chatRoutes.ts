import express, { Express, Request, Response, Router } from 'express'

const router: Router = express.Router()

router.get('/hello', (req: Request, res: Response) => {
  res.status(200).json({ msg: 'world' })
})

export default router
