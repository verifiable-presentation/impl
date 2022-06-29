// source/types/api.d.ts
// The type definitions for the project.

import type { JSONSchemaType } from 'ajv'

/**
 * The renderer to use to render the data using the template.
 */
export declare type SupportedTemplateEngine = 'ejs'
/**
 * The supported output formats of the rendered data.
 */
export declare type SupportedOutputFormat = 'htm'

/**
 * The template object.
 */
export declare interface Template {
	// The actual template.
	template: string
	// The rendering engine to use to parse the template.
	renderer: SupportedTemplateEngine
	// The schema of the data that is needed by to fill the template.
	schema?: JSONSchemaType<unknown>
}

/**
 * The input required to render something.
 */
export declare interface RenderDto {
	// The template to use.
	template: Template
	// The data to fill in the template.
	data: Record<string, unknown>
	// The format to ouput the rendered data in.
	output: SupportedOutputFormat
}
