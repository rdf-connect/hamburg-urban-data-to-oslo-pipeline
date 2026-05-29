/**
 * Will either return the result of the given promise, or reject if it takes
 * longer than a given amount of milliseconds to run.
 * @param ms The maximum runtime in milliseconds. If null, no timeout is set.
 * The promise will simply return as-is.
 * @param promise The promise to run.
 * @return The result of the original promise.
 */
export async function timeout<T>(
    ms: number | null | undefined,
    promise: Promise<T>,
): Promise<T> {
    // Makes the actual httpFetch implementation a bit cleaner.
    if (ms === null || ms === undefined) {
        return promise;
    }

    // We keep track of the timer in order to cancel it later.
    let timeoutHandle: any;

    // Rejects after `ms` milliseconds.
    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => reject(), ms);
    }).catch(() => {
        throw "timeout";
    });

    // The only way we get a result is if the original promise resolves, since
    // the timeout promise can only be rejected.
    return Promise.race([promise, timeoutPromise]).finally(() => {
        clearTimeout(timeoutHandle);
    }) as Promise<T>;
}
