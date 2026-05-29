import { CronJob } from "cron";
import { HttpUtilsError } from "../error";

/**
 * Wraps a function inside a cron job. Note that calling `cronify` itself does
 * not schedule `func`. Only when the returned function is called will the cron
 * job initialize.
 * @param func The function to wrap inside the cron expression.
 * @param cronExpression A cron expression.
 * @param runOnInit Instantly triggers the fetch function post initialization.
 * @throws
 */
export function cronify(
    func: () => Promise<void>,
    cronExpression: string,
    runOnInit: boolean,
): () => Promise<void> {
    return async () => {
        try {
            CronJob.from({
                cronTime: cronExpression,
                onTick: func,
                start: true,
                timeZone: null,
                runOnInit: runOnInit,
            });
        } catch (e) {
            throw HttpUtilsError.invalidCronExpression();
        }
    };
}
