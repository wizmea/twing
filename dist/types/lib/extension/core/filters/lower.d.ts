import { TwingEnvironment } from "../../../environment";
import { TwingMarkup } from "../../../markup";
/**
 * Converts a string to lowercase.
 *
 * @param {TwingEnvironment} env
 * @param {string | TwingMarkup} string A string
 *
 * @returns {Promise<string>} The lowercased string
 */
export declare function lower(env: TwingEnvironment, string: string | TwingMarkup): Promise<string>;
