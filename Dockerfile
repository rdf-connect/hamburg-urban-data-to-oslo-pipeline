# Start from a Node container
FROM timbru31/java-node:21-20
# Setup working folder
WORKDIR /opt/pipeline
COPY . .
# Install dependencies
RUN npm install
# Container's entrypoint command
ENTRYPOINT [ "npx", "rdfc", "pipeline.ttl" ]

