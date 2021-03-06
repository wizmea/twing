import {TwingEnvironment} from "../../../environment";
import {DateTime, Duration} from "luxon";
import {formatDuration} from "../../../helpers/format-duration";
import {formatDateTime} from "../../../helpers/format-date-time";
import {date as createDate} from "../functions/date";

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
export function date(env: TwingEnvironment, date: DateTime | Duration | string, format: string = null, timezone: string | null | false = null, locale: string | null | false = null): Promise<string> {
    if (format === null) {
        let coreExtension = env.getCoreExtension();

        let formats = coreExtension.getDateFormat();

        format = date instanceof Duration ? formats[1] : formats[0];
    }

    return createDate(env, date, timezone, locale).then((date) => {
        let c = ""
        if (date instanceof Duration) {
            c = formatDuration(date, format)
        }else if (date instanceof DateTime){
            c = formatDateTime(date, format)
        }
        if (locale != null && locale == 'fr') {
            c = replaceAll(c)
        }
        return Promise.resolve(c);
    });
}

function replaceAll(str: string) {
    str = replace(DAYS, str)
    str =  replace(MONTHS, str)
    return str
}

function replace (arr: { [key: string]: string }, str: string) {
    if (typeof str == "number") str = `${str}`
    Object.keys(arr).forEach(element => {
        if (str.search(element) != -1) {
            str = str.replace(element, arr[element])
        }
    });
    return str
}

const DAYS : { [key: string]: string } = {
    Monday: 'Lundi',
    Tuesday: 'Mardi',
    Wednesday: 'Mercredi',
    Thursday: 'Jeudi',
    Friday: 'Vendredi',
    Saturday: 'Samedi',
    Sunday: 'Dimanche'
}

const MONTHS : { [key: string]: string; } = {
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
}
