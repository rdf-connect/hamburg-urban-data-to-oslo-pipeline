# http-utils-processor-ts

[![Build and test](https://github.com/jenspots/http-utils-processor-ts/actions/workflows/build-test.yml/badge.svg)](https://github.com/jenspots/http-utils-processor-ts/actions/workflows/build-test.yml) [![Coverage Status](https://coveralls.io/repos/github/jenspots/http-utils-processor-ts/badge.svg?branch=main)](https://coveralls.io/github/jenspots/http-utils-processor-ts?branch=main) [![npm](https://img.shields.io/npm/v/@rdfc/http-utils-processor-ts.svg?style=popout)](https://npmjs.com/package/@rdfc/http-utils-processor-ts)

RDF-Connect Typescript processors for handling HTTP operations. The main processor fetches a URL and writes the response to an output channel. It supports configurable HTTP methods, headers, authentication, and scheduling via cron expressions.

---

## Usage

### Installation

```bash
npm install
npm run build
```

Or install from NPM:

```bash
npm install @rdfc/http-utils-processor-ts
```

---

### Pipeline Configuration Example

```turtle
@prefix rdfc: <https://w3id.org/rdf-connect#>.
@prefix owl: <http://www.w3.org/2002/07/owl#>.

### Import the processor definitions
<> owl:imports <./node_modules/@rdfc/http-utils-processor-ts/processors.ttl>.

### Define the channels your processor needs
<out> a rdfc:Writer.

### Define and configure the processor
<fetcher> a rdfc:HttpFetch;
    rdfc:url "https://example.org/api/data";
    rdfc:writer <out>;
    rdfc:options [
        rdfc:method "GET";
        rdfc:headers "Authorization: Bearer TOKEN";
        rdfc:acceptStatusCodes "200-300";
        rdfc:closeOnEnd true;
        rdfc:timeOutMilliseconds 5000;
        rdfc:cron "*/5 * * * *";
        rdfc:runOnInit true;
        rdfc:errorsAreFatal true;
        rdfc:outputAsBuffer false;
        rdfc:auth [
            rdfc:type "basic";
            rdfc:username "user";
            rdfc:password "pass"
        ]
    ].
```

---

## Configuration

### Parameters of `rdfc:HttpFetch`:

- `rdfc:url` (**string**, required): URL(s) to fetch. Can be a single string or an array of strings.
- `rdfc:writer` (**rdfc:Writer**, required): Output channel to write the fetched response.
- `rdfc:options` (**rdfc:HttpFetchOptions**, optional): Optional settings including method, headers, timeout, authentication, cron, and more.

---

### Parameters of `rdfc:HttpFetchOptions`:

- `rdfc:method` (**string**, optional): HTTP method (default: `GET`).
- `rdfc:headers` (**string[]**, optional): Array of header strings (default: `[]`).
- `rdfc:acceptStatusCodes` (**string[]**, optional): List of accepted status codes or ranges, e.g., `["200", "201-300"]` (default: `["200-300"]`).
- `rdfc:closeOnEnd` (**boolean**, optional): Whether to close the writer after execution. Default depends on cron: `true` if no cron, `false` otherwise.
- `rdfc:timeOutMilliseconds` (**integer**, optional): Maximum wait time for a response before throwing a timeout error.
- `rdfc:auth` (**rdfc:HttpFetchAuth**, optional): Authentication configuration (see below).
- `rdfc:cron` (**string**, optional): Cron expression to schedule repeated executions.
- `rdfc:runOnInit` (**boolean**, optional): Run immediately upon initialization if cron is set (default: `false`).
- `rdfc:errorsAreFatal` (**boolean**, optional): Exit on fetch errors (default: `true`).
- `rdfc:outputAsBuffer` (**boolean**, optional): Whether the response is returned as a buffer (default: `false`).

---

### Authentication (`rdfc:HttpFetchAuth`)

Supported types:

#### HTTP Basic Authentication

- `rdfc:type`: `"basic"`
- `rdfc:username`: Username string
- `rdfc:password`: Plaintext password

#### OAuth 2.0 Password Grant

- `rdfc:type`: `"oauth2"`
- `rdfc:endpoint`: URL of the OAuth 2.0 server
- `rdfc:username`: Username string
- `rdfc:password`: Plaintext password

> Credentials are only sent to the authentication endpoint, not to the target URL.

---

## Errors

All errors thrown are of type `HttpFetchError` and include a `HttpUtilsErrorType` enum describing the error nature.

---

## Tests

Use Node.js to run tests:

```bash
npm run build
npm test
```

Some tests interact with real servers and may require credentials via a `.env` file:

```shell
# OAuth 2.0 Password Grant
RINF_USERNAME=
RINF_PASSWORD=

# HTTP Basic Auth
WoRMS_USERNAME=
WoRMS_PASSWORD=

# Set to true to enable real requests
BLUE_BIKE=true
```

Additional test information can be found [here](./tests/README.md).  
