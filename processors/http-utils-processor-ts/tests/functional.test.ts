import {
    describe,
    expect,
    test,
    beforeEach,
    beforeAll,
    afterAll,
} from "vitest";
import { HttpUtilsError } from "../src/error";
import { Fetch } from "./fetch";
import { httpFetch } from "../src";
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

describe("httpFetch - sanity checks", () => {
    test("status code - malformed range", async () => {
        const func = httpFetch(
            "https://example.com",
            new SimpleStream<string>(),
            {
                acceptStatusCodes: ["2oo-3oo"],
            },
        );

        return expect(func).rejects.toThrow(
            HttpUtilsError.invalidStatusCodeRange(),
        );
    });

    test("headers - malformed", async () => {
        const func = httpFetch(
            "https://example.com",
            new SimpleStream<string>(),
            {
                headers: ["a: b", "c"],
            },
        );

        return expect(func).rejects.toThrow(HttpUtilsError.invalidHeaders());
    });

    test("empty body - illegal head method", async () => {
        const func = httpFetch(
            "https://example.com",
            new SimpleStream<string>(),
            {
                method: "HEAD",
                bodyCanBeEmpty: false,
            },
        );

        return expect(func).rejects.toThrow(
            HttpUtilsError.illegalParameters(
                "Cannot use HEAD method with bodyCanBeEmpty set to false",
            ),
        );
    });
});

describe("httpFetch - runtime", () => {
    test("status code - unsuccessful default", async () => {
        mockFetch.set({ status: 500 });

        const func = await httpFetch(
            "https://example.com",
            new SimpleStream<string>(),
        );

        return expect(func()).rejects.toThrow(
            HttpUtilsError.statusCodeNotAccepted(500),
        );
    });

    test("status code - unsuccessful overwritten", async () => {
        const func = await httpFetch(
            "https://example.com",
            new SimpleStream<string>(),
            {
                acceptStatusCodes: ["201"],
            },
        );

        return expect(func()).rejects.toThrow(
            HttpUtilsError.statusCodeNotAccepted(200),
        );
    });

    test("status code - successful range", async () => {
        mockFetch.set({ status: 501 });

        const func = await httpFetch(
            "https://example.com",
            new SimpleStream<string>(),
            {
                acceptStatusCodes: ["500-502"],
            },
        );

        await func();
    });

    test("status code - successful single", async () => {
        mockFetch.set({ status: 500 });

        const func = await httpFetch(
            "https://example.com",
            new SimpleStream<string>(),
            {
                acceptStatusCodes: ["500"],
            },
        );

        await func();
    });

    test("headers - successful", async () => {
        const func = await httpFetch(
            "https://example.com",
            new SimpleStream<string>(),
            {
                headers: ["Content-Type: text/plain", "Accept: text/plain"],
            },
        );

        await func();

        const req = mockFetch.getArgs()[0]! as Request;
        expect(req).toBeDefined();

        // Check varia.
        expect(req.method).toEqual("GET");

        // Check headers.
        expect(req.headers.get("content-type")).toEqual("text/plain");
        expect(req.headers.get("accept")).toEqual("text/plain");
    });

    test("empty body - error", async () => {
        mockFetch.set({ nullBody: true });

        const func = await httpFetch(
            "https://example.com",
            new SimpleStream<string>(),
            {
                bodyCanBeEmpty: false,
            },
        );

        return expect(func()).rejects.toThrow(
            HttpUtilsError.noBodyInResponse(),
        );
    });

    test("timeout - successful", async () => {
        mockFetch.set({ timeout: 100 });

        const func = await httpFetch(
            "https://example.com",
            new SimpleStream<string>(),
            {
                timeOutMilliseconds: 500,
            },
        );

        await func();
    });

    test("timeout - exceeded", async () => {
        mockFetch.set({ timeout: 500 });

        const func = await httpFetch(
            "https://example.com",
            new SimpleStream<string>(),
            {
                timeOutMilliseconds: 100,
            },
        );

        return expect(func()).rejects.toThrow(HttpUtilsError.timeOutError(100));
    });
});
