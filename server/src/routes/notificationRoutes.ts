import { Request, Response, Router, NextFunction } from "express";
import { HydratedDocument, Types } from "mongoose";
import { Notification_Type } from "../enums/Notification_Type";
import { INotification, IUser } from "../interfaces";
import { Notification, User } from "../models";
import { CustomError } from "../utils/classes";
import { ValidateSingleUser } from "../utils/functions";

const router: Router = Router();

// addNewFriend
// TODO: double check intended functionality
router.post(
  "/addFriend",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { to, from } = req.body;

      const toUser: HydratedDocument<IUser> = await ValidateSingleUser(to);
      const fromUser: HydratedDocument<IUser> = await ValidateSingleUser(from);
      // create notification
      const notification: HydratedDocument<INotification> | null =
        await Notification.create({
          notificationType: 1,
          to: toUser._id,
          from: fromUser._id,
          resolved: false,
        });
      // add notification to the "to" users notification list
      toUser.notifications!.push(notification._id);
      await toUser.save();

      // add "to" user to the "from" users pending_friends list
      fromUser.pendingFriends!.push(toUser._id);
      await fromUser.save();

      res.status(200);
    } catch (err) {
      if (err instanceof CustomError) {
        res.status(err.statusCode).json({ error: err.message });
      }
      next(err);
    }
  }
);

// acceptFriend
// TODO: TESTING
router.put(
    '/:notificationId', 
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
       try{     
        const {notificationId} = req.params;
        const { to, from } = req.body;

        const toUser: HydratedDocument<IUser> = await ValidateSingleUser(to);
        const fromUser: HydratedDocument<IUser> = await ValidateSingleUser(from);
        const notification: HydratedDocument<INotification> | null= await Notification.findById(notificationId);
        
        if(notification){
            // set notification to resolved
            notification.resolved = true;
            await notification.save();

            //update each user's friends list to include the other
            toUser!.friends!.push(fromUser._id);
            fromUser!.friends?.push(toUser._id);

            // remove the 'to' user from the 'from' users pending_friends list
            fromUser!.pendingFriends!.filter(id => id.toString() !== fromUser._id.toString());
            await toUser.save();
            await fromUser.save();

            // remove any pending chats in the 'to' user's model from the 'from' user and move them to 'to' users chats
            await User.findByIdAndUpdate(toUser._id, 
                {
                    $pull: {pendingChats: {owner: fromUser._id}}, 
                    $push: {chats: "$pendingChats"}
                })
        } else {
            throw new CustomError(`No notification with id: ${notificationId}`, 404)
        }
        res.sendStatus(200)
      } catch(err){
        if (err instanceof CustomError) {
            res.status(err.statusCode).json({ error: err.message });
          }
          next(err);
      } 
    }
    )

// TODO: TESTING
router.put('/:notificationId/deny', 
async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try{
        const {notificationId} = req.params;
        const { to } = req.body;

        const toUser: HydratedDocument<IUser> = await ValidateSingleUser(to);

        toUser.notifications!.filter(notification => notification.toString() !== notificationId)
        await toUser.save();

        res.sendStatus(200)
    }catch(err) {
        if (err instanceof CustomError) {
            res.status(err.statusCode).json({ error: err.message });
          }
          next(err);
    }
})

export default router;
