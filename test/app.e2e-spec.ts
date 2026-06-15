import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "@/app.module.js";

describe("App (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("rejects anonymous requests", async () => {
    const response = await request(app.getHttpServer()).get("/");

    expect(response.status).toBe(401);
    expect(response.headers["www-authenticate"]).toBe('Basic realm="Restricted Area", charset="UTF-8"');
  });
});
