import { expect, describe, vi, test } from "vitest";
import { cronify } from "../../src/util/cronify";
import { HttpUtilsError } from "../../src/error";

describe("cron", () => {
    test("success", async () => {
        const mock = vi.fn(() => {});
        const callsTheMock = async () => {
            mock();
        };

        // Abusing the comma notation in order to execute every second.
        const zeroToSixty = [...Array(60).keys()];
        const everySecond = `${zeroToSixty.join(",")} * * * * *`;
        await cronify(callsTheMock, everySecond, false)();

        // After five seconds, the function should be called five times.
        await new Promise((res) => setTimeout(res, 5_000));
        expect(mock).toHaveBeenCalledTimes(5);
    }, 10_000);

    test("invalid cron expression", () => {
        expect(cronify(async () => {}, "", false)()).rejects.toThrow(
            HttpUtilsError.invalidCronExpression(),
        );
    });
});
