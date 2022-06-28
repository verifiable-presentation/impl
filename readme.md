# Verifiable Presentation Generation Service

> A plugin-based service that allows issuers to render verifiable presentations
> from templates, and store it in a queryable database for holders to
> list/retrieve.

## Specification

The detailed specification for this service can be found in the
[`spec`](github.com/verifiable-presentation/spec) repo.

## Implementation

This repository contains a barebones implementation of the specification
mentioned above. The repository is structured as a monorepo:

- The `modules/` folder contains the four individual blocks that are a part of
  the service: `generator`, `registry`, `renderer` and `template-store`.
- Each of these blocks is their own package, and are published as docker
  containers to GHCR.
- The `service/` folder contains the files necessary to run the four building
  blocks together using Docker.
