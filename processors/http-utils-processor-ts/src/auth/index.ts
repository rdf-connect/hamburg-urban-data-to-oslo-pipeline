import { HttpUtilsError } from "../error";
import { HttpBasicAuth } from "./basic";
import { OAuth2PasswordAuth } from "./oauth/password";

/**
 * Describe how an authentication instance should be configured as a turtle
 * file. Validity is checked at runtime, but `type` is always required.
 */
export type AuthConfig = {
    type: "basic" | "oauth2";
    [key: string]: string;
};

export abstract class Auth {
    abstract authorize(req: Request): Promise<void>;
    abstract check(req: Request): boolean;

    /**
     * Parse an AuthConfig object into an Auth instance.
     * @param config The configuration object.
     * @return An object which conforms to Auth.
     * @throws HttpUtilsError If configuration is invalid.
     */
    static from(config: AuthConfig): Auth {
        if (config.type == "basic") {
            return HttpBasicAuth.from(config);
        }

        if (config.type === "oauth2") {
            return OAuth2PasswordAuth.from(config);
        }

        throw HttpUtilsError.illegalParameters(
            `Unknown auth type: '${config.type}'`,
        );
    }
}
