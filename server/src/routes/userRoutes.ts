import express, { Request, Response, Router, NextFunction } from "express";
import { IChat, IUser } from "../interfaces";
import { HydratedDocument } from "mongoose";
import { User } from "../models";
import { SelectLatestMessages } from "../utils/functions";

const router: Router = Router();

// GET a user by auth0 user_id
router.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user: HydratedDocument<IUser> | null = await User.findOne({
        authId: id,
      });

      if (user) {
        res.status(200).json({ user });
      } else {
        res.status(404).send(`No user with id: ${id}`);
      }
    } catch (err) {
      next(err);
    }
  }
);

// POST a new user. This route will be called by auth0 actions to create a user upon successful auth0 registration
router.post(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { authId, username } = req.body;
      await User.create({ authId: authId, username: username });

      res.status(201).send("New user created");
    } catch (err) {
      next(err);
    }
  }
);

// PUT (update) a user
router.put(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await User.findOneAndUpdate({ authId: id }, req.body);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }
);

// GET all chats for a user along with the last message sent
router.get(
  "/:authId/chats",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { authId } = req.params;
      const user: HydratedDocument<IUser> | null = await User.findOne({
        authId: authId,
      })
        .select("chats")
        .populate({
          path: "chats",
          populate: {
            path: "messages",
            options: { sort: { timestamp: -1 } },
          },
        });
      SelectLatestMessages(user);

      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  }
);
export default router;
