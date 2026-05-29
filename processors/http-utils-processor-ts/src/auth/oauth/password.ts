import { HttpUtilsError } from "../../error";
import { Auth, AuthConfig } from "../index";

export class OAuth2PasswordAuth implements Auth {
    private readonly username: string;
    private readonly password: string;
    private readonly endpoint: string;

    constructor(username: string, password: string, endpoint: string) {
        this.username = username;
        this.password = password;
        this.endpoint = endpoint;
    }

    async authorize(req: Request): Promise<void> {
        const authRequest = new Request(this.endpoint, {
            body: new URLSearchParams({
                grant_type: "password",
                username: this.username,
                password: this.password,
            }),
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const authResponse = await fetch(authRequest);

        // Check if request was successful.
        if (!authResponse.ok) {
            throw HttpUtilsError.oAuth2TokenError(authResponse.status);
        }

        // Append the access token to the original request.
        const authData = (await authResponse.json()) as {
            access_token: string | undefined;
        };
        const token = authData["access_token"];

        if (!token) {
            throw HttpUtilsError.unauthorizedError();
        }

        req.headers.set("Authorization", `Bearer ${authData.access_token}`);
    }

    check(): boolean {
        throw new Error("Method not implemented.");
    }

    static from(auth: AuthConfig): OAuth2PasswordAuth {
        if (!auth.username) {
            throw HttpUtilsError.illegalParameters(
                "Username is required for OAuth2.0 Password Grant.",
            );
        }

        if (!auth.password) {
            throw HttpUtilsError.illegalParameters(
                "Password is required for OAuth2.0 Password Grant.",
            );
        }

        if (!auth.endpoint) {
            throw HttpUtilsError.illegalParameters(
                "Endpoint is required for OAuth2.0 Password Grant.",
            );
        }

        return new OAuth2PasswordAuth(
            auth.username,
            auth.password,
            auth.endpoint,
        );
    }
}
