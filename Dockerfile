# Start from a Node container
FROM timbru31/java-node:21-20
# Setup working folder
WORKDIR /opt/pipeline
COPY . .

RUN apt-get update && apt-get install -y wget unzip
RUN wget https://services.gradle.org/distributions/gradle-8.4.1-bin.zip -O /tmp/gradle.zip \
 && unzip /tmp/gradle.zip -d /opt/ \
 && ln -s /opt/gradle-8.4.1/bin/gradle /usr/bin/gradle

RUN gradle copyPlugins --no-daemon

# Install dependencies
RUN npm install
# Container's entrypoint command
ENTRYPOINT [ "npx", "rdfc", "pipeline.ttl" ]

