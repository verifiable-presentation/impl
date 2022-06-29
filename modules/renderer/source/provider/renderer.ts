// source/provider/renderer.ts
// Defines and exports the renderer service used by the server.

import { render } from 'ejs'

import type { RenderDto, Template } from '../types/api.js'

/**
 * Renders the given data in the specified template.
 *
 * @param {string} template - The template to fill data into.
 * @param {object} data - The data to fill into the template.
 * @param {string} renderer - The renderer to use to fill in the template.
 * @param {string} output - The format in which the renderer should output the product.
 * @returns
 */
const compile = async (
	template: Template['template'],
	data: RenderDto['data'],
	_renderer: Template['renderer'],
	_output: RenderDto['output'],
): Promise<string> => {
	// Here, we don't care about output or renderer because they both can only be
	// `htm` and`ejs`. So we directly render the EJS.
	return render(template, { data })
}

export const renderer = { compile }
