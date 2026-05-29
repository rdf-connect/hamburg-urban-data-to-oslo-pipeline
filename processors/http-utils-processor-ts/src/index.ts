import { Processor, Writer, Reader } from "@rdfc/js-runner";
import { HttpUtilsError } from "./error";
import { timeout } from "./util/timeout";
import { statusCodeAccepted } from "./util/status";
import { parseHeaders } from "./util/headers";
import { Auth, AuthConfig } from "./auth";
import { cronify } from "./util/cronify";

/**
 * An instance of this class defines how the process should execute a request
 * against a given URL. All fields are optional and contain default values.
 */
class HttpFetchArguments {
    // The HTTP method to use.
    public readonly method: string = "GET";

    // A list of strings specifying which headers to embed in the request.
    // Must be in `key: value` format.
    public readonly headers: string[] = [];

    // A list of integer literals or integer ranges encoded as strings. For
    // example, `200` and `200-300`. Note that `a-b` is inclusive `a`, exclusive
    // `b`.
    public readonly acceptStatusCodes: string[] = ["200-300"];

    // Indicate the channel must be closed when the response has been
    // transmitted.
    public readonly closeOnEnd: boolean = true;

    // Whether to throw an error when the body is empty or not. Note that this
    // cannot be used in conjunction with `method = "HEAD"`.
    public readonly bodyCanBeEmpty: boolean = false;

    // How much time a request might take before an error is thrown. If `null`,
    // no timeout is set.
    public readonly timeOutMilliseconds: number | null | undefined = null;

    // Configuration of authentication. If `null`, no authentication is used.
    public readonly auth: AuthConfig | null = null;

    // Cron expression which indicates how often the function should be run. If
    // `null`, the function returns immediately after one call.
    public readonly cron: string | null | undefined = null;

    // Instantly triggers the fetch function post initialization. This only works
    // if `cron` is not set to `null` (otherwise, this is the default behavior).
    public readonly runOnInit: boolean = false;

    // If set, any error on any request will terminate the processor.
    public readonly errorsAreFatal: boolean = true;

    // If set, the output will be returned as a buffer instead of a string.
    public readonly outputAsBuffer: boolean = false;

    /**
     * Construct a new HttpFetchArgs object by overwriting specific fields.
     * @param partial An object which may contain any fields of the class, which
     * will overwrite the default values.
     */
    constructor(partial: Partial<HttpFetchArguments>) {
        Object.assign(this, partial);

        // Sanity check.
        if (!partial.bodyCanBeEmpty && partial.method == "HEAD") {
            throw HttpUtilsError.illegalParameters(
                "Cannot use HEAD method with bodyCanBeEmpty set to false",
            );
        }

        // Sanity check.
        if (partial.closeOnEnd && partial.cron) {
            throw HttpUtilsError.illegalParameters(
                "Cannot close stream when using cron.",
            );
        }

        // TODO: Find neat solution for this problem. Since JS-Runner uses an
        // empty list as a default value, it will always be overwritten using
        // Object.assign.
        if (this.acceptStatusCodes.length === 0) {
            this.acceptStatusCodes.push("200-300");
        }

        // Check validity of the status code range. Will throw error if invalid.
        statusCodeAccepted(0, this.acceptStatusCodes);
    }

    /**
     * Construct an `Auth` object based on the parameters given by the user.
     * Note that this may return `null` if no authentication method is set.
     */
    public getAuth(): Auth | null {
        return this.auth ? Auth.from(this.auth) : null;
    }
}

/**
 * Fetches data from an HTTP endpoint and streams it to a writer.
 * @param url The URL to fetch data from.
 * @param writer The output channel into which the body will be written.
 * @param options An instance of HttpFetchArgs defining various additional
 * parameters.
 * @throws HttpUtilsError
 */
type HttpFetchArgs = {
    url: string | string[];
    writer: Writer;
    reader: Reader;
    options: Partial<HttpFetchArguments>;
};

export class HttpFetch extends Processor<HttpFetchArgs> {
    protected arguments: HttpFetchArguments;
    protected auth: Auth | null = null;
    protected requests: Request[] = [];

    async init(this: HttpFetchArgs & this): Promise<void> {
        // If only a single URL is given, we save it as an array anyway.
        this.url = (
            Array.isArray(this.url) ? this.url : [this.url]
        ) as string[];

        // Parse the options as provided by the user.
        this.arguments = new HttpFetchArguments(this.options || {});
        this.auth = this.arguments.getAuth();

        // Create request objects, throws error if invalid.
        const headers = parseHeaders(this.arguments.headers);
        this.requests = this.url.map((x) => {
            return new Request(x, {
                method: this.arguments.method,
                headers,
            });
        });
    }

    async transform(this: HttpFetchArgs & this): Promise<void> {
        // nothing
        if (this.arguments.method !== "POST" && this.arguments.method !== "PUT") { return }
        
        let executeAllRequests = async () => {
        
            const headers = parseHeaders(this.arguments.headers);
            for await (let body of this.reader.strings()) {
                this.logger.debug(`BODY: \n${body}`)
                this.logger.debug(`HEADERS: \n${headers}\n\n${JSON.stringify(this.arguments.headers)}`)
                const promises = this.requests
                    .map((req) => new Request(req.url, { ...req, method: this.arguments.method, headers: headers, body }))
                    .map((req) => this.executeRequest(req))
                    .map((promise) =>
                        promise.catch((err) => {
                            // Propagate error to caller if required. Otherwise, simply
                            // print to std error.
                            if (this.arguments.errorsAreFatal) {
                                throw err;
                            } else {
                                console.error(err);
                            }
                        }),
                    );

                await Promise.all(promises);

                if (this.arguments.closeOnEnd) {
                    await this.writer.close();
                }
            }
         
        };

        return await executeAllRequests();
    }

    async produce(this: HttpFetchArgs & this): Promise<void> {
        
        if (this.arguments.method === "POST" || this.arguments.method === "PUT") { return }

        // Executes each individual request and groups them into a single promise.
        // Note that we use Promise.all over Promise.allSettled, which means a
        // single rejected promise would cause the overarching promise to reject as
        // well. Therefore, we only rethrow any potential error if `errorsAreFatal`
        // is set. If set to false,
        let executeAllRequests = async () => {
            const promises = this.requests
                .map((req) => this.executeRequest(req))
                .map((promise) =>
                    promise.catch((err) => {
                        // Propagate error to caller if required. Otherwise, simply
                        // print to std error.
                        if (this.arguments.errorsAreFatal) {
                            throw err;
                        } else {
                            console.error(err);
                        }
                    }),
                );

            await Promise.all(promises);

            if (this.arguments.closeOnEnd) {
                await this.writer.close();
            }
        };

        // If a cron expression is given, call the helper function which will
        // wrap the current result inside a scheduler.
        if (this.arguments.cron) {
            executeAllRequests = cronify(
                executeAllRequests,
                this.arguments.cron,
                this.arguments.runOnInit,
            );
        }

        return await executeAllRequests();
    }

    /**
     * Executes a single request and streams the result to the writer.
     * @param req The request to execute.
     * @throws HttpUtilsError
     */
    async executeRequest(
        this: HttpFetchArgs & this,
        req: Request,
    ): Promise<void> {
        this.logger.debug(`Executing request to '${req.url}' with the following parameters\nmethod:${JSON.stringify(req.method, null, 2)}\nheaders:${JSON.stringify(req.headers, null, 2)}\nbody:${JSON.stringify(req.body, null, 2)}`);

        // Authentication the request before executing it. We do this every time
        // to assure credentials don't expire.
        if (this.auth) {
            await this.auth.authorize(req);
        }

        // Initialize the fetch promise.
        const fetchPromise = fetch(req).catch((err) => {
            throw HttpUtilsError.genericFetchError(err);
        });

        // Wrap the fetch promise in a timeout and execute.
        const res = await timeout(
            this.arguments.timeOutMilliseconds,
            fetchPromise,
        ).catch((err) => {
            if (err === "timeout") {
                throw HttpUtilsError.timeOutError(
                    this.arguments.timeOutMilliseconds,
                );
            } else {
                throw err;
            }
        });

        this.logger.debug(`Request status: ${res.status}`)
        // Check if we accept the status code.
        if (!statusCodeAccepted(res.status, this.arguments.acceptStatusCodes)) {
            if (res.status === 401 && this.auth) {
                throw HttpUtilsError.credentialIssue();
            } else if (res.status === 401) {
                throw HttpUtilsError.unauthorizedError();
            } else {
                throw HttpUtilsError.statusCodeNotAccepted(res.status);
            }
        }

        // Special case: if the body is empty. We either throw an error or exit
        // early. Make sure to close the writer if required.
        if (!res.body) {
            if (!this.arguments.bodyCanBeEmpty) {
                throw HttpUtilsError.noBodyInResponse();
            }

            // We can assume that closeOnEnd is false when a cron expression is
            // set due to earlier sanity checks.
            if (!this.arguments.cron && this.arguments.closeOnEnd) {
                await this.writer.close();
            }

            return;
        }

        // Push the data down the pipeline.
        if (this.writer) {
            try {
                const body = this.arguments.outputAsBuffer
                    ? { buffer: Buffer.from(await res.arrayBuffer()) }
                    : { string: await res.text() };
                await this.writer.any(body);
            } catch (e) {
                console.error(e);
            }
        }
    }
}

