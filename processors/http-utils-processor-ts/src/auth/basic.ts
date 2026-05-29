import { Auth, AuthConfig } from ".";
import { HttpUtilsError } from "../error";

export class HttpBasicAuth implements Auth {
    private readonly username: string;
    private readonly password: string;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }

    encode(): string {
        return (
            "Basic " +
            Buffer.from(`${this.username}:${this.password}`).toString("base64")
        );
    }

    async authorize(req: Request): Promise<void> {
        req.headers.set("Authorization", this.encode());
    }

    check(req: Request): boolean {
        return req.headers.get("Authorization") == this.encode();
    }

    static from(config: AuthConfig): HttpBasicAuth {
        if (!config.username) {
            throw HttpUtilsError.illegalParameters(
                "Username is required for HTTP Basic Auth.",
            );
        }

        if (!config.password) {
            throw HttpUtilsError.illegalParameters(
                "Password is required for HTTP Basic Auth.",
            );
        }

        return new HttpBasicAuth(config.username, config.password);
    }
}
