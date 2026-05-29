# Mapping the Hamburg Urban Data platform into the OSLO data model
==================================================================

This pipeline maps data from the [Hamburg Urban Data platform](http://iot.hamburg.de/)
published under the [SensorThings API specification](https://docs.ogc.org/is/18-088/18-088.html),
into the [OSLO Verkeersmetingen standard]([https://docs.ogc.org/is/18-088/18-088.html](https://data.vlaanderen.be/doc/applicatieprofiel/verkeersmetingen/erkendestandaard/2024-04-17/)).

The pipeline performs the fetch of the provided datastream, performs an RML mapping according to the internal mappings,
available in [yarrrml format](./mappings/yarrrml/mapping.yml), and in [RML format](./mappings/mapping.rml.yml), 
for which the compliance shape is available as a [shacl shape](https://data.vlaanderen.be/doc/applicatieprofiel/verkeersmetingen/erkendestandaard/2024-04-17/shacl/Verkeersmetingen-ap-SHACL.ttl). The resuling mapped data is then published to a target graphstore.


## Preparation
The pipeline expects a graphstore to be avaialable to which it can output the mapping results of the datastream. 
You can setup a local oxigraph to test this behavior with the following `docker-compose.yml` file:

```
services:
  oxigraph:
    image: ghcr.io/oxigraph/oxigraph:latest
    container_name: oxigraph
    command: serve --location /data --bind 0.0.0.0:7878
    ports:
      - "7878:7878"
    volumes:
      - ./oxigraph-data:/data
    restart: unless-stopped%    
```

## Setup

The pipeline is made available as a docker image at:

```
ghcr.io/rdf-connect/hamburg-urban-data-to-oslo-pipeline:latest
```

It can be loaded into docker compose as follows:
```
services:
  pipeline:
    image: ghcr.io/rdf-connect/hamburg-urban-data-to-oslo-pipeline:latest
    environment:
      - DEBUG=*
      - DATASTREAM=https://iot.hamburg.de/v1.1/Datastreams(26598)
      - GRAPHSTORE=http://host.docker.internal:7878/store?default
    volumes:
      - ./state:/opt/state
```



## Development

The repository can be cloned as follows:

```
git clone git@github.com:rdf-connect/hamburg-urban-data-to-oslo-pipeline.git
cd hamburg-to-oslo-graphstore
```

Note that if you want to publish an updated pipeline, you will need to fork the repository and publish the new pipeline under your newly created repository.
