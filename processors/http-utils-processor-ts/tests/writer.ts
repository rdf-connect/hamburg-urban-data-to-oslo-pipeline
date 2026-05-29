import { SimpleStream } from "@rdfc/js-runner";

export function writer(callback: (str: string) => void) {
    const writeStream = new SimpleStream<string>();
    let output = "";

    writeStream
        .data((data) => {
            output += data;
        })
        .on("end", () => {
            callback(output);
        });

    return writeStream;
}
