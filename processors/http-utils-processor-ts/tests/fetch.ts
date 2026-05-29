import { vi, Mock } from "vitest";
import { Auth } from "../src/auth";

export type FetchArgs = {
    status?: number;
    timeout?: number;
    nullBody?: boolean;
    credentials?: Auth;
};

export class Fetch {
    private fetch: Mock<typeof fetch> = vi.fn(Fetch.build());
    private readonly original: typeof fetch;

    private static build(args: FetchArgs = {}): typeof fetch {
        return (async (req: Request) => {
            // Insert timeout if needed.
            await new Promise((resolve) =>
                setTimeout(resolve, args.timeout ?? 0),
            );

            // If credentials are supplied, check them.
            if (args.credentials && !args.credentials.check(req)) {
                return new Response("Unauthorized", {
                    status: 401,
                });
            }

            // Return response with requested body and status.
            return new Response(args.nullBody ? null : "Hello, World!", {
                status: args.status ?? 200,
            });
        }) as typeof fetch;
    }

    public constructor() {
        this.original = global.fetch;
        global.fetch = this.fetch;
    }

    public getArgs(): Parameters<typeof fetch> {
        if (this.fetch.mock.calls.length == 0) {
            throw new Error("fetch was not called");
        }

        return this.fetch.mock.calls[0];
    }

    public set(args: FetchArgs = {}): Fetch {
        this.fetch.mockImplementation(Fetch.build(args));
        return this;
    }

    public default(): Fetch {
        this.fetch.mockImplementation(Fetch.build({}));
        return this;
    }

    public clear(): Fetch {
        this.fetch.mockClear();
        return this;
    }

    public restore(): Fetch {
        global.fetch = this.original;
        return this;
    }
}
