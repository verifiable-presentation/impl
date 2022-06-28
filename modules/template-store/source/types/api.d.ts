// source/types/api.d.ts
// The type definitions for the project.

/**
 * The renderer to use to render the data using the template.
 */
export declare type SupportedTemplateEngine = 'ejs'

/**
 * The template object.
 */
export declare interface Template {
	// The ID of the template.
	id: string
	// The actual template.
	template: string
	// The rendering engine to use to parse the template.
	renderer: SupportedTemplateEngine
	// The schema of the data that is needed by to fill the template.
	schema?: Record<string, unknown>
}

/**
 * The payload required to create a `Template`.
 */
export declare type TemplateDto = Pick<
	Template,
	'template' | 'renderer' | 'schema'
>
