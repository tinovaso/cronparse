import { parseCron } from './parser';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

function describeField(
  value: string,
  unit: string,
  names?: string[]
): string {
  if (value === '*') return `every ${unit}`;

  if (value.startsWith('*/')) {
    const step = value.slice(2);
    return `every ${step} ${unit}s`;
  }

  if (value.includes('-')) {
    const [start, end] = value.split('-');
    const startLabel = names ? names[parseInt(start)] : start;
    const endLabel = names ? names[parseInt(end)] : end;
    return `from ${startLabel} to ${endLabel}`;
  }

  if (value.includes(',')) {
    const parts = value.split(',');
    const labels = parts.map(p => (names ? names[parseInt(p)] ?? p : p));
    const last = labels.pop();
    return labels.length > 0
      ? `${labels.join(', ')} and ${last}`
      : `${last}`;
  }

  const label = names ? names[parseInt(value)] ?? value : value;
  return `at ${unit} ${label}`;
}

export function humanize(expression: string): string {
  const parsed = parseCron(expression);

  const minutePart = describeField(parsed.minute, 'minute');
  const hourPart = describeField(parsed.hour, 'hour');
  const domPart = describeField(parsed.dayOfMonth, 'day of month');
  const monthPart = describeField(parsed.month, 'month', MONTHS);
  const dowPart = describeField(parsed.dayOfWeek, 'weekday', WEEKDAYS);

  const parts: string[] = [];

  if (parsed.minute === '*' && parsed.hour === '*') {
    parts.push('every minute');
  } else if (parsed.minute === '*') {
    parts.push(`every minute of ${hourPart}`);
  } else {
    parts.push(`${minutePart} past ${hourPart}`);
  }

  if (parsed.dayOfMonth !== '*') parts.push(`on ${domPart}`);
  if (parsed.month !== '*') parts.push(`in ${monthPart}`);
  if (parsed.dayOfWeek !== '*') parts.push(`on ${dowPart}`);

  return parts.join(', ');
}
