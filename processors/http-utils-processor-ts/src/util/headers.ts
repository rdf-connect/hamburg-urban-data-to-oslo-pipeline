import { HttpUtilsError } from "../error";

/**
 * Parses an array of headers into a Headers object.
 * @param headers Array of headers in the format "key: value".
 * @throw { HttpUtilsError } If the headers are invalid.
 */
export function parseHeaders(headers: string[]): Headers {
    const result = new Headers();
    headers.forEach((header) => {
        const [key, value] = header.split(":");
        if (!key || !value) {
            throw HttpUtilsError.invalidHeaders();
        }
        result.append(key.trim(), value.trim());
    });
    return result as Headers; // Weird bug?
}
