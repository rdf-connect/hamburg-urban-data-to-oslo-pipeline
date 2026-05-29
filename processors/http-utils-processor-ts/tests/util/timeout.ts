import { describe, expect, test } from "vitest";
import { timeout } from "../../src/util/timeout";

/**
 * A simple promise that resolves after `ms` milliseconds.
 * @param ms The number of milliseconds to wait.
 * @return A promise that resolves after `ms` milliseconds.
 */
function wait(ms: number): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), ms));
}

describe("timeout", () => {
    test("successful", async () => {
        return expect(timeout(500, wait(100))).resolves.toBeTruthy();
    });

    test("unsuccessful", async () => {
        return expect(timeout(100, wait(500))).rejects.toThrow();
    });
});
