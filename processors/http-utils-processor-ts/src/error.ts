/**
 * Enumeration of the different types of errors that can be thrown by
 * HttpUtils.
 */
enum HttpUtilsErrorType {
    StatusCodeNotAccepted,
    NoBodyInResponse,
    InvalidStatusCodeRange,
    InvalidHeaders,
    GenericFetchError,
    IllegalParameters,
    ConnectionError,
    TimeOutError,
    UnauthorizedError,
    CredentialIssue,
    OAuth2TokenError,
    InvalidCronExpression,
}

/**
 * Extension of the Error class specifically designed for HttpFetch.
 */
export class HttpUtilsError extends Error {
    readonly type: HttpUtilsErrorType;

    constructor(message: string, type: HttpUtilsErrorType) {
        super(message);
        this.name = "HttpUtilsError";
        this.type = type;
    }

    static statusCodeNotAccepted(statusCode: number) {
        return new HttpUtilsError(
            `Status code ${statusCode} not accepted`,
            HttpUtilsErrorType.StatusCodeNotAccepted,
        );
    }

    static noBodyInResponse() {
        return new HttpUtilsError(
            "No body in response",
            HttpUtilsErrorType.NoBodyInResponse,
        );
    }

    static invalidStatusCodeRange() {
        return new HttpUtilsError(
            "Invalid status code range",
            HttpUtilsErrorType.InvalidStatusCodeRange,
        );
    }

    static invalidHeaders() {
        return new HttpUtilsError(
            "Invalid headers",
            HttpUtilsErrorType.InvalidHeaders,
        );
    }

    static genericFetchError(error: Error) {
        return new HttpUtilsError(
            `Generic fetch error: ${error.message}`,
            HttpUtilsErrorType.GenericFetchError,
        );
    }

    static illegalParameters(info: string | null = null) {
        return new HttpUtilsError(
            info ?? "Illegal parameters",
            HttpUtilsErrorType.IllegalParameters,
        );
    }

    static connectionError() {
        return new HttpUtilsError(
            "Connection error",
            HttpUtilsErrorType.ConnectionError,
        );
    }

    static timeOutError(ms: number | null | undefined) {
        return new HttpUtilsError(
            `Request exceeded time limit of ${ms} ms`,
            HttpUtilsErrorType.TimeOutError,
        );
    }

    static unauthorizedError() {
        return new HttpUtilsError(
            "Unauthorized",
            HttpUtilsErrorType.UnauthorizedError,
        );
    }

    static credentialIssue() {
        return new HttpUtilsError(
            "Credentials are invalid or have insufficient access",
            HttpUtilsErrorType.CredentialIssue,
        );
    }

    static oAuth2TokenError(code: number) {
        return new HttpUtilsError(
            `An issue occurred while retrieving the OAuth2 token. Response with status code ${code}.`,
            HttpUtilsErrorType.OAuth2TokenError,
        );
    }

    static invalidCronExpression() {
        return new HttpUtilsError(
            "The provided cron job expression is invalid",
            HttpUtilsErrorType.InvalidCronExpression,
        );
    }
}
