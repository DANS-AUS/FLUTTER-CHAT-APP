import {serverConnect, serverDisconnect} from '../../db/testConfig'
import { NextFunction, Response} from 'express';
import request  from 'supertest';
import app from '../../src/app';
import { User } from '../../src/models';
import { HydratedDocument } from 'mongoose'
import { IUser } from '../../src/interfaces'

jest.mock('express-oauth2-jwt-bearer', () => ({
        auth: jest.fn(() => {
           return (req: Request, res: Response, next: NextFunction) => {
                next();
            }
        })
    }))
// Set up in-memory database before each test
beforeAll(async () => {
    await serverConnect();
    
})

// Tear down the database connection after each test
afterAll(async () => {
    await serverDisconnect(); 
})

describe('User Routes', () => {
    test('GET /:id should return a user based on the auth0 id',async () => {
        const user1 = {authId: "1234", username: "user1"}

        const user : HydratedDocument<IUser> = await User.create(user1);
       
        const res = await request(app).get('/api/v1/users/1234').send();

        expect(res.status).toBe(200);
        expect(res.body.user.username).toEqual(user1.username);
    })
})