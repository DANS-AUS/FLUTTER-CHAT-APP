import express, { Request, Response, Router, NextFunction} from 'express';
import { IUser } from '../interfaces';
import { HydratedDocument } from 'mongoose';
import { User } from '../models';

const router : Router = Router();

// GET a user by auth0 user_id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try{
        const { id } = req.params;
        const user: HydratedDocument<IUser> | null = await User.findOne({authId: id})

        if(user){
            res.status(200).send({ user });
        } else {
           res.status(404).send(`No user with id: ${id}`); 
        }
        
    }catch(err){
        next(err)
    }
})
export default router;