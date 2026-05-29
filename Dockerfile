
FROM gradle:9.5.1-jdk21 AS gradle-dist

FROM timbru31/java-node:21-jdk-20

ENV GRADLE_HOME=/opt/gradle
ENV PATH="${GRADLE_HOME}/bin:${PATH}"

COPY --from=gradle-dist /opt/gradle /opt/gradle

RUN gradle --version

# Setup working folder
WORKDIR /opt/pipeline
COPY . .

RUN gradle copyPlugins --no-daemon

# Install dependencies
RUN npm install
# Container's entrypoint command
ENTRYPOINT [ "npx", "rdfc", "pipeline.ttl" ]

