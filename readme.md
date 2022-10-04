# Verifiable Presentation Generation Service

> A plugin-based service that allows issuers to render verifiable presentations
> from templates, and store it in a queryable database for holders to
> list/retrieve.

## Specification

The detailed specification for this service can be found in the
[`spec`](https://github.com/verifiable-presentation/spec) repo.

## Implementation

This repository contains a barebones implementation of the specification
mentioned above. The repository is structured as a monorepo:

- The `modules/` folder contains the four individual blocks that are a part of
  the service: `generator`, `registry`, `renderer` and `template-store`.
- Each of these blocks is their own package, and are published as docker
  containers to GHCR.
- The `service/` folder contains the files necessary to run the four building
  blocks together using Docker.

## Usage

> To follow the examples below, you will need to install
> [Docker](https://docs.docker.com/engine/install/) and
> [HTTPie](https://httpie.io/docs/cli/installation).

The four modules are published as containers on GHCR. To use them, `docker pull`
them from GHCR and then use `docker run` to start them:

```sh
> docker pull ghcr.io/verifiable-presentation/registry:latest
> docker run -p 9267:9267 ghcr.io/verifiable-presentation/registry

> docker pull ghcr.io/verifiable-presentation/template-store:latest
> docker run -p 9277:9277 ghcr.io/verifiable-presentation/template-store

> docker pull ghcr.io/verifiable-presentation/renderer:latest
> docker run -p 9287:9287 ghcr.io/verifiable-presentation/renderer

> docker pull ghcr.io/verifiable-presentation/generator:latest
> docker run -p 9297:9297 ghcr.io/verifiable-presentation/generator
```

```sh
# To create a template
echo '{
  "template": "Hello <strong><%= data.name %></strong>",
    "renderer": "ejs",
    "schema": {
      "type": "object",
      "properties": {
      "name": { "type": "string" }
    },
    "required": ["name"],
    "additionalProperties": false
  }
}' | http post :9277/templates

# To retrieve a template
http get :9277/templates/{id}

# To create a new keypair to sign verifiable presentations
echo '{
  "name": "Hello Certificate Signing Key",
  "type": "Ed25519VerificationKey2020"
}' | http post :9297/keys

# To create an application, used to sign and create presentations.
echo '{
	"name": "Happy Template Issuer",
	"template": {
		"id": "did:web:localhost%3A9277:templates:{template-id}"
	},
	"renderer": {
		"api": "http://localhost:9287"
	},
	"registry": {
		"api": "http://localhost:9267"
	},
	"keys": ["{key-id}"]
}' | http post :9297/applications

# To create and sign a verifiable presentation using the template and key
# we created
echo '{
	"credentials": [
		{
			"@context": [
				"https://www.w3.org/2018/credentials/v1",
				"https://w3id.org/security/suites/ed25519-2020/v1",
				{ "name": "https://schema.org/name" }
			],
			"credentialSubject": { "name": "Happy" },
			"id": "did:example:F4RGIuxcKIjygFThqsXW9GX6HocV",
			"issuanceDate": "2010-01-01T19:23:24Z",
			"issuer": "did:web:localhost%3A9267:entities:oLrLuxcK8nNupXoNsXW9G",
			"type": ["VerifiableCredential", "IdentityCredential"],
			"proof": {
				"type": "Ed25519Signature2020",
				"created": "2022-07-09T13:29:11Z",
				"verificationMethod": "did:web:localhost%3A9267:keys:zF7T2UyK4dk0D1sJsHYuJ6gkmlhu",
				"proofPurpose": "assertionMethod",
				"proofValue": "z5weBQmFAUeq8JVyfW5JuET89aBiK1HquiHCLv8yPAjYG91ohSLmetaddVdrhbWj71jKXg795Bapt5ba3dqwfTqzs"
			}
		}
	],
	"output": "svg",
	"holder": "did:web:localhost%3A9267:entities:tpohz5uFEJFIteq3jY7vaG4gROLb"
}' | http post :9297/applications/{id}/issue
```
