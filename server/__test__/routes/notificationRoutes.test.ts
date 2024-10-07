import { serverConnect, serverDisconnect } from "../../db/testConfig";
import { NextFunction, Response } from "express";
import { createTestData, testIDs } from "./utils/testData";
import request from "supertest";
import app from "../../src/app";
import { INotification, IUser } from "../../src/interfaces";
import { User } from "../../src/models";
import { HydratedDocument } from "mongoose";

jest.mock("express-oauth2-jwt-bearer", () => ({
  auth: jest.fn(() => {
    return (req: Request, res: Response, next: NextFunction) => {
      next();
    };
  }),
}));

// Set up in-memory database before each test
beforeAll(async () => {
  await serverConnect();
  await createTestData();
});

// Tear down the database connection after each test
afterAll(async () => {
  await serverDisconnect();
});

describe("notification routes", () => {
  test("/addFriend post a new notification and updates the to and from users", async () => {
    const notification: INotification = {
      notificationType: 1,
      to: testIDs.users.userOneID,
      from: testIDs.users.userTwoID,
      resolved: false,
    };
    const res = await request(app)
      .post("/api/v1/notifications/addFriend")
      .send({ ...notification });

    // find to user
    const toUser: HydratedDocument<IUser> | null = await User.findById(
      testIDs.users.userOneID
    ).populate("notifications");
    // find from user
    const fromUser: HydratedDocument<IUser> | null = await User.findById(
      testIDs.users.userTwoID
    );

    expect(toUser!.notifications!.length).toBe(1);
    expect(toUser!.notifications![0]).toMatchObject({from: testIDs.users.userTwoID})
    expect(fromUser!.pendingFriends!.length).toBe(1);
    expect(fromUser!.pendingFriends![0]).toEqual(toUser!._id);
  });

  // test /accept friend functionality 
    // create userA with a notification from userB and a few pending chats form userB (any maybe one from userC); 
    // set userA as a pending friend of userB
    // call the accept route
    // check status
    // check Notification.resolve = true
    // check that userA has no pending chats from userB
    // check that userA is friends with userB
    // check that userA has chats from userB
    // check that userB has no pending friends
    // check that userB is friends with userA
});
