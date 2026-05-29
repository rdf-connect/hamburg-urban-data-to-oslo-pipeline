import {
    describe,
    expect,
    test,
    beforeEach,
    beforeAll,
    afterAll,
} from "vitest";
import { HttpUtilsError } from "../../src/error";
import { Fetch } from "../fetch";
import { HttpBasicAuth } from "../../src/auth/basic";
import { httpFetch } from "../../src";
import { SimpleStream } from "@rdfc/js-runner";

const mockFetch = new Fetch();

beforeAll(() => {
    mockFetch.default();
});

beforeEach(() => {
    mockFetch.clear();
    mockFetch.default();
});

afterAll(() => {
    mockFetch.restore();
});

describe("basic.ts auth", () => {
    test("successful", async () => {
        mockFetch.set({ credentials: new HttpBasicAuth("admin", "password") });

        const func = await httpFetch(
            "https://example.com",
            new SimpleStream<string>(),
            {
                auth: {
                    type: "basic",
                    username: "admin",
                    password: "password",
                },
            },
        );

        return expect(func()).resolves.toBeUndefined();
    });

    test("invalid credentials", async () => {
        mockFetch.set({ credentials: new HttpBasicAuth("admin", "password") });

        const func = await httpFetch(
            "https://example.com",
            new SimpleStream<string>(),
            {
                auth: {
                    type: "basic",
                    username: "admin",
                    password: "invalid",
                },
            },
        );

        return expect(func()).rejects.toThrow(HttpUtilsError.credentialIssue());
    });

    test("no credentials", async () => {
        mockFetch.set({ credentials: new HttpBasicAuth("admin", "password") });

        const func = await httpFetch(
            "https://example.com",
            new SimpleStream<string>(),
        );

        return expect(func()).rejects.toThrow(
            HttpUtilsError.unauthorizedError(),
        );
    });

    test("incomplete config", async () => {
        let func = httpFetch(
            "https://example.com",
            new SimpleStream<string>(),
            {
                auth: { type: "basic", password: "password" },
            },
        );

        await expect(func).rejects.toThrow(
            HttpUtilsError.illegalParameters(
                "Username is required for HTTP Basic Auth.",
            ),
        );

        func = httpFetch("https://example.com", new SimpleStream<string>(), {
            auth: { type: "basic", username: "username" },
        });

        await expect(func).rejects.toThrow(
            HttpUtilsError.illegalParameters(
                "Password is required for HTTP Basic Auth.",
            ),
        );
    });
});
