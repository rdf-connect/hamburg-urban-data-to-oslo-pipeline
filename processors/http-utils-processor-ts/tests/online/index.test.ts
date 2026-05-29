import { describe, test, expect } from "vitest";
import { SimpleStream } from "@rdfc/js-runner";
import { HttpUtilsError } from "../../src/error";
import { httpFetch } from "../../src";
import { writer } from "../writer";

describe("Real world datasets", () => {
    // Retrieve RINF credentials.
    const rinfUsername = process.env["RINF_USERNAME"];
    const rinfPassword = process.env["RINF_PASSWORD"];
    const rinfTest = rinfUsername && rinfPassword ? test : test.skip;

    rinfTest(
        "RINF - success",
        async () => {
            // Output stream which we'll check for correctness.
            const writeStream = writer((output) => {
                const json = JSON.parse(output);
                expect(json["@odata.context"]).toEqual(
                    "https://rinf.era.europa.eu/API/$metadata#DatasetImports",
                );
            });

            // Execute the function.
            const func = await httpFetch(
                "https://rinf.era.europa.eu/api/DatasetImports",
                writeStream,
                {
                    auth: {
                        type: "oauth2",
                        username: rinfUsername!,
                        password: rinfPassword!,
                        endpoint: "https://rinf.era.europa.eu/api/token",
                    },
                },
            );

            await func();
        },
        10 * 1000,
    );

    rinfTest(
        "RINF - missing credentials",
        async () => {
            const func = await httpFetch(
                "https://rinf.era.europa.eu/api/DatasetImports",
                new SimpleStream<Buffer>(),
            );

            return expect(func()).rejects.toThrow(
                HttpUtilsError.unauthorizedError(),
            );
        },
        10 * 1000,
    );

    rinfTest(
        "RINF - invalid credentials",
        async () => {
            const func = await httpFetch(
                "https://rinf.era.europa.eu/api/DatasetImports",
                new SimpleStream<Buffer>(),
                {
                    auth: {
                        type: "oauth2",
                        username: "invalid",
                        password: "invalid",
                        endpoint: "https://rinf.era.europa.eu/api/token",
                    },
                },
            );

            return expect(func()).rejects.toThrow(
                HttpUtilsError.oAuth2TokenError(400),
            );
        },
        10 * 1000,
    );

    // Retrieve WoRMS credentials.
    const wormsUsername = process.env["WoRMS_USERNAME"];
    const wormsPassword = process.env["WoRMS_PASSWORD"];
    const wormsTest = wormsUsername && wormsPassword ? test : test.skip;

    wormsTest(
        "WoRMS - success",
        async () => {
            const func = await httpFetch(
                "https://www.marinespecies.org/download/",
                new SimpleStream<string>(),
                {
                    auth: {
                        type: "basic",
                        username: wormsUsername!,
                        password: wormsPassword!,
                    },
                },
            );

            return expect(func()).resolves.toBeUndefined();
        },
        10 * 1000,
    );

    wormsTest(
        "WoRMS - missing credentials",
        async () => {
            const func = await httpFetch(
                "https://www.marinespecies.org/download/",
                new SimpleStream<string>(),
            );

            return expect(func()).rejects.toThrow(
                HttpUtilsError.unauthorizedError(),
            );
        },
        10 * 1000,
    );

    wormsTest(
        "WoRMS - invalid credentials",
        async () => {
            const func = await httpFetch(
                "https://www.marinespecies.org/download/",
                new SimpleStream<string>(),
                {
                    auth: {
                        type: "basic",
                        username: "invalid",
                        password: "invalid",
                    },
                },
            );

            return expect(func()).rejects.toThrow(
                HttpUtilsError.credentialIssue(),
            );
        },
        10 * 1000,
    );

    // Check if BLUE_BIKE is defined.
    const blueBike = process.env["BLUE_BIKE"];
    const blueBikeTest = blueBike === "true" ? test : test.skip;

    blueBikeTest("BlueBike - success", async () => {
        const writeStream = writer((output) => {
            expect(JSON.parse(output).length).toBeGreaterThan(100);
        });

        const func = await httpFetch(
            "https://api.blue-bike.be/pub/location",
            writeStream,
        );

        return expect(func()).resolves.toBeUndefined();
    });

    test(
        "Swedish - success",
        async () => {
            const writeStream = writer((output) => {
                console.log(
                    `Size of incoming data: ${output.length} characters.`,
                );
            });

            const func = await httpFetch(
                "https://admin.dataportal.se/all.rdf",
                writeStream,
            );

            return expect(func()).resolves.toBeUndefined();
        },
        60 * 1000,
    );
});
