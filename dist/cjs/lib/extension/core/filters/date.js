"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const luxon_1 = require("luxon");
const format_duration_1 = require("../../../helpers/format-duration");
const format_date_time_1 = require("../../../helpers/format-date-time");
const date_1 = require("../functions/date");
/**
 * Converts a date to the given format.
 *
 * <pre>
 *   {{ post.published_at|date("m/d/Y") }}
 * </pre>
 *
 * @param {TwingEnvironment} env
 * @param {DateTime|Duration|string} date A date
 * @param {string|null} format The target format, null to use the default
 * @param {string|null|boolean} timezone The target timezone, null to use the default, false to leave unchanged
 * @param {string|null|boolean} locale The target locale, null to use the default, false to leave unchanged
 *
 * @return {Promise<string>} The formatted date
 */
function date(env, date, format = null, timezone = null, locale = null) {
    if (format === null) {
        let coreExtension = env.getCoreExtension();
        let formats = coreExtension.getDateFormat();
        format = date instanceof luxon_1.Duration ? formats[1] : formats[0];
    }
    return date_1.date(env, date, timezone, locale).then((date) => {
        let c = "";
        if (date instanceof luxon_1.Duration) {
            c = format_duration_1.formatDuration(date, format);
        }
        else if (date instanceof luxon_1.DateTime) {
            c = format_date_time_1.formatDateTime(date, format);
        }
        if (locale != null && locale == 'fr') {
            c = replaceAll(c);
        }
        return Promise.resolve(c);
    });
}
exports.date = date;
function replaceAll(str) {
    str = replace(DAYS, str);
    str = replace(MONTHS, str);
    return str;
}
function replace(arr, str) {
    if (typeof str == "number")
        str = `${str}`;
    Object.keys(arr).forEach(element => {
        if (str.search(element) != -1) {
            str = str.replace(element, arr[element]);
        }
    });
    return str;
}
const DAYS = {
    Monday: 'Lundi',
    Tuesday: 'Mardi',
    Wednesday: 'Mercredi',
    Thursday: 'Jeudi',
    Friday: 'Vendredi',
    Saturday: 'Samedi',
    Sunday: 'Dimanche'
};
const MONTHS = {
    January: 'Janvier',
    February: 'Février',
    March: 'Mars',
    April: 'Avril',
    May: 'Mai',
    June: 'Juin',
    July: 'Juillet',
    August: 'Août',
    September: 'Septembre',
    November: 'Novembre',
    December: 'Décembre'
};
