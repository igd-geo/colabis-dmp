FROM openjdk:latest as build

RUN apt update && apt install -y build-essential

COPY . /app/dmp
WORKDIR /app/dmp
RUN ./gradlew installDist

FROM openjdk:alpine

WORKDIR /app
COPY --from=build /app/dmp/build/install/dmp .

VOLUME ["/config", "/storage"]

ENTRYPOINT ["/app/bin/server"]
CMD ["-conf", "/app/conf/config.json"]
