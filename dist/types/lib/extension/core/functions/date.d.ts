import { TwingEnvironment } from "../../../environment";
import { DateTime, Duration } from "luxon";
/**
 * Converts an input to a DateTime instance.
 *
 * <pre>
 *    {% if date(user.created_at) < date('+2days') %}
 *      {# do something #}
 *    {% endif %}
 * </pre>
 *
 * @param {TwingEnvironment} env
 * @param {Date | DateTime | Duration | number | string} date A date or null to use the current time
 * @param {string | null | boolean} timezone The target timezone, null to use the default, false to leave unchanged
 *
 * @returns {Promise<DateTime | Duration>}
 */
export declare function date(env: TwingEnvironment, date: Date | DateTime | Duration | number | string, timezone?: string | null | false, locale?: string | false): Promise<DateTime | Duration>;
