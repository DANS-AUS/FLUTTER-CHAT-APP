import { serverConnect, serverDisconnect } from "../../db/testConfig";
import { NextFunction, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/models";
import { HydratedDocument, Types } from "mongoose";
import { IUser } from "../../src/interfaces";
import { createTestData, testIDs } from "./utils/testData";

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

describe("User Routes", () => {
  test("GET /:id should return a user based on the auth0 id", async () => {
    const res = await request(app).get(
      `/api/v1/users/${testIDs.users.userOneID}`
    );

    expect(res.status).toBe(200);
    expect(res.body.user.username).toEqual("test user one");
  });

  test("POST / should create a new user", async () => {
    const user: IUser = { authId: "567", username: "userName" };
    const res = await request(app)
      .post("/api/v1/users")
      .send({ ...user });
    const userCheck: HydratedDocument<IUser> | null = await User.findOne({
      authId: user.authId,
    });

    expect(res.status).toBe(201);
    expect(userCheck?.username).toEqual(user.username);
  });

  test("PUT /:id should update a user", async () => {
    const newUserInfo: IUser = { authId: "123", username: "newUserName" };
    const res = await request(app)
      .put(`/api/v1/users/${testIDs.users.userFourID}`)
      .send({ ...newUserInfo });

    const userCheck: HydratedDocument<IUser> | null = await User.findById(
      testIDs.users.userFourID
    );

    expect(res.status).toBe(200);
    expect(userCheck?.username).toEqual(newUserInfo.username);
  });

  test("GET /:id/chats gets all the chats for a user and the most recent message for each chat", async () => {
    const res = await request(app).get(
      `/api/v1/users/${testIDs.users.userOneID}/chats`
    );

    expect(res.body.user.chats.length).toBe(2);
    expect(res.body.user.chats[0].messages.length).toBe(1);
    expect(res.body.user.chats[1].messages.length).toBe(1);
    expect(res.body.user.chats[0].messages[0].message).toEqual(
      "Test message two!"
    );
    expect(res.body.user.chats[1].messages[0].message).toEqual(
      "Test message four!"
    );
  });

  test("PUT /:id/newUser sends notification to pending friends and updates the new user bool", async () => {
    const newUserInfo: IUser = {
      authId: "gjl454",
      username: "my new username",
      pendingFriends: [testIDs.users.userThreeID, testIDs.users.userFourID],
    };

    const res = await request(app)
      .put(`/api/v1/users/${testIDs.users.userTwoID}/newUser`)
      .send({ ...newUserInfo });

    const user: HydratedDocument<IUser> | null = await User.findById(testIDs.users.userTwoID);
    expect(res.status).toBe(200);
    expect(user).toBeTruthy();

    expect(user!.username).toEqual("my new username");
    expect(user!.pendingFriends!.length).toBe(2);
    expect(user!.newUser).toBeFalsy();

    const userFriendOne: HydratedDocument<IUser> | null = await User.findById(
      testIDs.users.userThreeID
    ).populate({ path: "notifications", select: "from" });
    const userFriendTwo: HydratedDocument<IUser> | null = await User.findById(
      testIDs.users.userFourID
    ).populate({ path: "notifications", select: "from" });

    expect(userFriendOne!.notifications![0]).toMatchObject({
      from: testIDs.users.userTwoID,
    });
    expect(userFriendTwo!.notifications![0]).toMatchObject({
      from: testIDs.users.userTwoID,
    });
  });
});
