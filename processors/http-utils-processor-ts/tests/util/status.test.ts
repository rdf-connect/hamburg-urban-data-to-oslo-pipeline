import { describe, expect, test } from "vitest";
import { statusCodeAccepted } from "../../src/util/status";
import { HttpUtilsError } from "../../src/error";

describe("statusCodeAccepted", () => {
    const validInput = ["100", "200-300", "400"];

    test("contained as literal", () => {
        expect(statusCodeAccepted(100, validInput)).toBe(true);
    });

    test("contained as range", () => {
        expect(statusCodeAccepted(299, validInput)).toBe(true);
    });

    test("not contained", () => {
        expect(statusCodeAccepted(150, validInput)).toBe(false);
    });

    test("not contained as end of range", () => {
        expect(statusCodeAccepted(300, validInput)).toBe(false);
    });

    test("no accepted status codes", () => {
        expect(statusCodeAccepted(200, [])).toBe(false);
    });

    test("invalid literal - non numerical", () => {
        expect(() => statusCodeAccepted(200, ["200-300", "a"])).toThrow(
            HttpUtilsError.invalidStatusCodeRange(),
        );
    });

    test("invalid range - delimiter", () => {
        expect(() => statusCodeAccepted(0, ["200_300"])).toThrow(
            HttpUtilsError.invalidStatusCodeRange(),
        );
    });

    test("invalid range - non numerical", () => {
        expect(() => statusCodeAccepted(0, ["a-b"])).toThrow(
            HttpUtilsError.invalidStatusCodeRange(),
        );
    });
});
