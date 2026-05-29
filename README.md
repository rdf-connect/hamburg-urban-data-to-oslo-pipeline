# Mapping the SensorThings API into the OSLO data model, output to a target graphstore
======================================================================================

Both the SensorThings and SOSA/SSN data models are used to represent sensor observations.
Where SOSA / SSN is a data model, SensorThings defines both an API and a data model.

This pipeline both has a fetch component that uses the SensorThings API to retrieve relevant sensordata, 
which is then converted to RDF using the RML Mapper and the STAPI ontology we created for this use-case.
Afterwards, the data is mapped into the SOSA / SSN ontology using SPARQL Construct.

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

First clone the pipeline repository

```
git clone git@github.com:rdf-connect/hamburg-urban-data-to-oslo-pipeline.git
cd hamburg-to-oslo-graphstore
```

After which you can edit the 
