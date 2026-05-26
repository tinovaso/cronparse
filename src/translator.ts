import { parseCron } from './parser';
import { humanize } from './humanize';
import { CronExpression } from './types';

export type Locale = 'en' | 'es' | 'fr' | 'de';

export interface TranslationMap {
  every: string;
  at: string;
  on: string;
  and: string;
  through: string;
  minute: string;
  minutes: string;
  hour: string;
  hours: string;
  day: string;
  days: string;
  weekday: Record<number, string>;
  month: Record<number, string>;
}

const translations: Record<Locale, TranslationMap> = {
  en: {
    every: 'every', at: 'at', on: 'on', and: 'and', through: 'through',
    minute: 'minute', minutes: 'minutes', hour: 'hour', hours: 'hours',
    day: 'day', days: 'days',
    weekday: { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' },
    month: { 1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May', 6: 'June', 7: 'July', 8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December' },
  },
  es: {
    every: 'cada', at: 'a las', on: 'el', and: 'y', through: 'hasta',
    minute: 'minuto', minutes: 'minutos', hour: 'hora', hours: 'horas',
    day: 'día', days: 'días',
    weekday: { 0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miércoles', 4: 'jueves', 5: 'viernes', 6: 'sábado' },
    month: { 1: 'enero', 2: 'febrero', 3: 'marzo', 4: 'abril', 5: 'mayo', 6: 'junio', 7: 'julio', 8: 'agosto', 9: 'septiembre', 10: 'octubre', 11: 'noviembre', 12: 'diciembre' },
  },
  fr: {
    every: 'chaque', at: 'à', on: 'le', and: 'et', through: 'jusqu\'à',
    minute: 'minute', minutes: 'minutes', hour: 'heure', hours: 'heures',
    day: 'jour', days: 'jours',
    weekday: { 0: 'dimanche', 1: 'lundi', 2: 'mardi', 3: 'mercredi', 4: 'jeudi', 5: 'vendredi', 6: 'samedi' },
    month: { 1: 'janvier', 2: 'février', 3: 'mars', 4: 'avril', 5: 'mai', 6: 'juin', 7: 'juillet', 8: 'août', 9: 'septembre', 10: 'octobre', 11: 'novembre', 12: 'décembre' },
  },
  de: {
    every: 'jeden', at: 'um', on: 'am', and: 'und', through: 'bis',
    minute: 'Minute', minutes: 'Minuten', hour: 'Stunde', hours: 'Stunden',
    day: 'Tag', days: 'Tage',
    weekday: { 0: 'Sonntag', 1: 'Montag', 2: 'Dienstag', 3: 'Mittwoch', 4: 'Donnerstag', 5: 'Freitag', 6: 'Samstag' },
    month: { 1: 'Januar', 2: 'Februar', 3: 'März', 4: 'April', 5: 'Mai', 6: 'Juni', 7: 'Juli', 8: 'August', 9: 'September', 10: 'Oktober', 11: 'November', 12: 'Dezember' },
  },
};

export function getTranslation(locale: Locale): TranslationMap {
  return translations[locale] ?? translations['en'];
}

export function translateCron(expression: string, locale: Locale): string {
  if (locale === 'en') return humanize(expression);
  const parsed = parseCron(expression);
  if (!parsed) throw new Error(`Invalid cron expression: ${expression}`);
  return translateParsed(parsed, locale);
}

export function translateParsed(parsed: CronExpression, locale: Locale): string {
  const t = getTranslation(locale);
  const parts: string[] = [];

  if (parsed.minute === '*' && parsed.hour === '*') {
    parts.push(`${t.every} ${t.minute}`);
  } else if (parsed.minute !== '*' && parsed.hour === '*') {
    parts.push(`${t.every} ${t.hour} ${t.at} ${t.minute} ${parsed.minute}`);
  } else if (parsed.minute === '0' && parsed.hour !== '*') {
    const hourStr = parsed.hour.includes('/') ? `${t.every} ${parsed.hour.split('/')[1]} ${t.hours}` : `${t.at} ${parsed.hour}:00`;
    parts.push(hourStr);
  } else {
    parts.push(`${t.at} ${parsed.hour}:${parsed.minute.padStart(2, '0')}`);
  }

  if (parsed.dayOfWeek !== '*') {
    const dayNums = parsed.dayOfWeek.split(',').map(Number);
    const dayNames = dayNums.map(d => t.weekday[d]).filter(Boolean);
    if (dayNames.length) parts.push(`${t.on} ${dayNames.join(`, ${t.and} `)}`);
  } else if (parsed.dayOfMonth !== '*') {
    parts.push(`${t.on} ${t.day} ${parsed.dayOfMonth}`);
  }

  if (parsed.month !== '*') {
    const monthNums = parsed.month.split(',').map(Number);
    const monthNames = monthNums.map(m => t.month[m]).filter(Boolean);
    if (monthNames.length) parts.push(`${t.on} ${monthNames.join(`, ${t.and} `)}`);
  }

  return parts.join(' ');
}

export function listLocales(): Locale[] {
  return Object.keys(translations) as Locale[];
}
