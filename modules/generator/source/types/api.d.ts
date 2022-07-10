// source/types/api.d.ts
// The type definitions for the project.

/**
 * The ID of ... anything, really.
 */
export declare type WebDid = string

/**
 * A URL to a resource.
 */
export declare type Url = string

/**
 * The date and time of an event in ISO 8601 format.
 */
export declare type IsoDateTime = string

/**
 * A credential passed to the generator to derive a presentation from.
 */
export declare type Credential = Record<string, unknown>

/**
 * The output format to render the presentation in.
 */
export declare type OutputFormat = string

/**
 * A presentation issued by the generator.
 */
export declare type Presentation = {
	certificate: string
	presentation: Record<string, unknown>
}

/**
 * The payload required to create a `Presentation`.
 */
export declare type PresentationDto = {
	credentials: Credential[]
	output: OutputFormat
	holder: WebDid
}

/**
 * The algorithm used to generate the key pair.
 */
export declare type KeyType = 'Ed25519VerificationKey2020'

/**
 * A key used to sign verifiable presentations.
 */
export declare interface Key {
	id: WebDid
	name: string
	type: KeyType
	created: IsoDateTime
	public: string
	private: string
}

/**
 * The query for `Key`s.
 */
export declare type KeyQuery = Pick<Key, 'name'>
/**
 * The payload required to create a `Key`.
 */
export declare type KeyDto = Pick<Key, 'name' | 'type'>
/**
 * The payload required to update a `Key`.
 */
export declare type UpdateKeyDto = Pick<Key, 'name'>

/**
 * A generated key pair.
 */
export declare interface KeyPair {
	public: string
	private: string
}

/**
 * The application's template configuration.
 */
export declare interface TemplateConfiguration {
	id: WebDid
}

/**
 * The configuration for the renderer.
 */
export declare interface RendererConfiguration {
	api: Url
}

/**
 * The configuration for the registry.
 */
export declare interface RegistryConfiguration {
	api: Url
}

/**
 * An application used to render presentations for a batch of people.
 */
// eslint-disable-next-line unicorn/prevent-abbreviations
export declare interface Application {
	id: WebDid
	name: string
	template: TemplateConfiguration
	renderer: RendererConfiguration
	registry: RegistryConfiguration
	keys: Array<Key['id']>
}

/**
 * The query for `Application`s.
 */
// eslint-disable-next-line unicorn/prevent-abbreviations
export declare type ApplicationQuery = Pick<Application, 'name'>
/**
 * The payload required to update an `Application`.
 */
// eslint-disable-next-line unicorn/prevent-abbreviations
export declare type UpdateApplicationDto = Pick<
	Application,
	'name' | 'template' | 'renderer' | 'registry' | 'keys'
>
/**
 * The payload required to create a `Application`.
 */
// eslint-disable-next-line unicorn/prevent-abbreviations
export declare type ApplicationDto = Pick<
	Application,
	'name' | 'template' | 'renderer' | 'registry' | 'keys'
>
