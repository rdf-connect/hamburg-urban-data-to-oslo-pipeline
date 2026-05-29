import { expect, test, describe } from "vitest";
import { extractProcessors, extractSteps, Source } from "@rdfc/js-runner";

describe("processor", () => {
    const pipeline = `
        @prefix js: <https://w3id.org/conn/js#>.
        @prefix ws: <https://w3id.org/conn/ws#>.
        @prefix : <https://w3id.org/conn#>.
        @prefix owl: <http://www.w3.org/2002/07/owl#>.
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
        @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
        @prefix sh: <http://www.w3.org/ns/shacl#>.

        <> owl:imports <./node_modules/@rdfc/js-runner/ontology.ttl>, <./processors.ttl>.

        [ ] a :Channel;
            :writer <jw>.

        <jw> a js:JsWriterChannel.
    `;

    const baseIRI = process.cwd() + "/config.ttl";

    test("definition", async () => {
        const proc = `
            [ ] a js:HttpFetch;
                js:url "http://example.com";
                js:writer <jw>.
        `;

        const source: Source = {
            value: pipeline + proc,
            baseIRI,
            type: "memory",
        };

        const {
            processors,
            quads,
            shapes: config,
        } = await extractProcessors(source);
        const env = processors.find((x) => x.ty.value.endsWith("HttpFetch"))!;
        expect(env).toBeDefined();

        const argss = extractSteps(env, quads, config);
        expect(argss.length).toBe(1);
        expect(argss[0].length).toBe(3);

        const [[url, writer, options]] = argss;

        // URL must be set.
        expect(url).toEqual(["http://example.com"]);

        // Writer must be valid.
        testWriter(writer);

        // No other options are given.
        expect(options).toBeUndefined();
    });
});

function testWriter(arg: any) {
    expect(arg).toBeInstanceOf(Object);
    expect(arg.ty).toBeDefined();
    expect(arg.config.channel).toBeDefined();
    expect(arg.config.channel.id).toBeDefined();
}
