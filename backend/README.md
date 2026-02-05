# Boring Board

Database command
`docker run --name boring-board-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=boringboard -p 127.0.0.1:5432:5432 -d postgres`

`DATABASE_URL=postgresql://postgres:password@localhost:5432/boringboard`

[DB Migration Docs](https://github.com/salsita/node-pg-migrate)
Command For Creating Database Migration
`npm run migrate create this-is-the-migration-name`

Command For Running Database Migration
`npm run migrate up`

Minio (Object Storage) Docker command
`docker run -p 9000:9000 -p 9001:9001   quay.io/minio/minio server /data --console-address ":9001"`

[Minio Docker Docs](https://hub.docker.com/r/minio/minio)
