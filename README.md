# Mapping the SensorThings API into the OSLO data model, output to a target graphstore
======================================================================================

Both the SensorThings and SOSA/SSN data models are used to represent sensor observations.
Where SOSA / SSN is a data model, SensorThings defines both an API and a data model.

This pipeline both has a fetch component that uses the SensorThings API to retrieve relevant sensordata, 
which is then converted to RDF using the RML Mapper and the STAPI ontology we created for this use-case.
Afterwards, the data is mapped into the SOSA / SSN ontology using SPARQL Construct.

## clone

```
git clone git@github.com:rdf-connect/hamburg-urban-data-to-oslo-pipeline.git
cd hamburg-to-oslo-graphstore
```

## Setup

### Load the custom RML mapper

Since we are using some new functionality for the RML mapper, that has not yet been widely published,
we will load a custom RML mapper version.

```
wget https://pod.rubendedecker.be/scholar/misc/rml-processor-jvm-0.0.1-all.jar ; 
mv rml-processor-jvm-0.0.1-all.jar pipeline/build/plugins/.
```

### Setup the docker

Once the RML mapper is in place, start the docker compose

```
docker compose up
```

## Processing the LDES

To process the resulting LDES, we can use the ldes-client

```
ldes-client http://localhost:3000/ldes/
```