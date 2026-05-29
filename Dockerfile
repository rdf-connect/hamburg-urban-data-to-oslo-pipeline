FROM timbru31/java-node:21-20

# Setup working folder
WORKDIR /opt/pipeline
COPY . .

RUN wget https://pod.rubendedecker.be/scholar/misc/rml-processor-jvm-0.0.1-all.jar ; 
RUN mkdir -p build/plugins && \
    mv rml-processor-jvm-0.0.1-all.jar build/plugins/


# Install dependencies
RUN npm install
# Container's entrypoint command
ENTRYPOINT [ "npx", "rdfc", "pipeline.ttl" ]

