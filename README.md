# Colabis Data Management Platform

The Data Management Platform (DMP) is a platform to collect, manage and publish
existing data which will become accessible via the COLABIS platform. A
collaborative, semi-automatic process of semantic enrichment can be applied to
the uploaded data, while the system keeps track about the changes. All data
satisfying the needs of the COLABIS API can be publish with a single click to
grant public access to it.

# Projects

The Data Management Platform consists of two projects. One representing the client
the other the server side implementation. The client, build with angular2
basically provides the UI which is used to guide the user through the publishing
process. An REST API offered by the server component allows to store all
datasets along with additional information gathered by the UI. Furthermore, the
server is able to deliver static web content (i.e. the client-bundle) which
simplifies the deployment process.

# Build and Deployment

There are three different approaches to build and deploy the DMP:

## Build client and server separatly

If the server is supposed to deliver the client implementation as well make sure
that you build the client beforehand.

### Client

To build the client, just execute the following command

    ./gradlew client:build

Basically, this is equivalent to executing the following from inside the client folder

    npm install
    npm run build

### Server

To build the server, just execute the following command:

    ./gradlew server:build

Be aware that you have to build the client first, if the UI should be delivered
by the server component.

### Run Client and Server for development

Just execute the following commands to run both server and client:

    ./gradlew server:run

    ./gradlew client:run

After that, the DMP Client can be accessed via port 3000, while the Server is
accessible via port 8080.

## All-in-one Distribution

Just call one of the following commands

    ./gradlew installDist
    ./gradlew distZip
    ./gradlew distTar

This builds all required projects and creates a distribution of the Data Management Platform
as folder, zip- or tar-archive. The `build` directory will contain the resulting files.

## Using Docker

To deploy the Data Management Platform, the provided Dockerfile can be used to build a docker image which runs both, the client and the server component.

    docker build -t dmp .

The DMP requires to have access to an instance of MongoDB. The configuration should be adapted acordingly.

Furthermore there is a `docker-compose.yaml` which allows to run the Data Management Platform along with a new MongoDB instance. Therefore no additional configuration is required for this.

### Configuration file
Certain adaptions in the existing example config.json are needed, e.g. host and port of the MongoDB instance. Furthermore you should consider a proper path for storage_path, since all data is stored there. An example with all available options can be found in `server/conf/config.json`

A volume should be used to provide access to a custom config file, whereas the location can be passed on to the DMP using the commandline argument `-conf` (e.g. `-conf /config/config.json`). An minimal working example is provided in `conf/config.json`.


### Volumes

The docker image defines two volumes to store files on the host while the container is able to access them.

* /config:
  Used to access config files
* /storage:
  Location to store uploaded content (Required to persist files)


### Ports

To access the DMP it's compulsory to expose the ports according to the provided config file. Usually this is port 80 (http) and 443 (https). For testing purposes it might be useful to map the ports to another port such as 8080 and 8443. In this case the parameters look as follows ('-p 8080:80 -p 8443:443')


# Enable Authentication using Keycloak

User authentication is supported using the identity and access management
solution Keycloak. To enable this, the configuration has to be adapted accordingly.
Keycloak allows to export all required information about the running instance
using the Keycloak OIDC JSON format. The Data Management Platform expects this file
called `keycloak.json` to be placed in the classpath.

config.json:
```
{
    ...
    "authentication": true,
    ...
}
```
