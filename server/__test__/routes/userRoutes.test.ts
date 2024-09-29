import { serverConnect, serverDisconnect } from "../../db/testConfig";
import { NextFunction, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { User, Chat } from "../../src/models";
import { HydratedDocument, Types } from "mongoose";
import { IChat, IMessage, IUser } from "../../src/interfaces";
import { createTestData, testIDs } from "./utils/testData";
import { chatSchema } from "../../src/models/Chat";

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
    const res = await request(app).get("/api/v1/users/pjf564");

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
    const oldUser: IUser = { authId: "123", username: "oldUserName" };
    await User.create(oldUser);

    const newUserInfo: IUser = { authId: "123", username: "newUserName" };
    const res = await request(app)
      .put("/api/v1/users/123")
      .send({ ...newUserInfo });

    const userCheck: HydratedDocument<IUser> | null = await User.findOne({
      authId: oldUser.authId,
    });

    expect(res.status).toBe(200);
    expect(userCheck?.username).toEqual(newUserInfo.username);
  });

  test("GET chats/:authId gets all the chats for a user and the most recent message for each chat", async () => {
    const res = await request(app).get("/api/v1/users/pjf564/chats");

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
});
