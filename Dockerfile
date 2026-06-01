FROM timbru31/java-node:21-20

# Setup working folder
WORKDIR /opt/pipeline
COPY . .

RUN mkdir -p build/plugins && \
    curl -L https://jitpack.io/com/github/rdf-connect/rml-processor-jvm/master-SNAPSHOT/rml-processor-jvm-master-SNAPSHOT-all.jar \
      -o build/plugins/rml-processor-jvm-master-SNAPSHOT-all.jar

# Install dependencies
RUN npm install
# Container's entrypoint command
ENTRYPOINT [ "npx", "rdfc", "pipeline.ttl" ]

