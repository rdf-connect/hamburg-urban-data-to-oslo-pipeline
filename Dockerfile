FROM timbru31/java-node:21-20

# Setup working folder
WORKDIR /opt/pipeline
COPY . .

ARG CACHE_BUST=1
RUN mkdir -p build/plugins && \
    curl -fL https://jitpack.io/com/github/rdf-connect/rml-processor-jvm/master-SNAPSHOT/rml-processor-jvm-master-SNAPSHOT-all.jar \
      -o build/plugins/rml-processor-jvm-master-SNAPSHOT-all.jar && \
    ls -l build/plugins

# Install dependencies
RUN npm install
# Container's entrypoint command
ENTRYPOINT [ "npx", "rdfc", "pipeline.ttl" ]

