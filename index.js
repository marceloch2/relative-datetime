var moment = require('moment');

var relativePartRegex = /^[+-]/;
var units = ['year', 'month', 'day', 'week', 'hour', 'minute', 'second'];
var optionalUnits = ['hour', 'minute', 'second'];

/**
 * Parse a relative date description to a Date object, relative to the current
 * date or the given referenceDate.
 *
 * Input can be an object or an array. The year and day fields are mandatory.
 * In addition to that, either month or week must be given.
 *
 * @param {object|array}    input
 * @param   {number|string}   input.year
 * @param   {number|string}   [input.month]
 * @param   {number|string}   input.day
 * @param   {number|string}   [input.week]
 * @param {string}            [referenceDate]
 *
 * @return {string}
 */
module.exports = function parse(input, referenceDate) {
  referenceDate = parseStringDate(referenceDate);

  return typeof input === 'string'
    ? parseAbsoluteInput(input, referenceDate)
    : parseRelativeInput(input, referenceDate);
};

function parseAbsoluteInput(input, referenceDate) {
  var inputDate = parseStringDate(input);
  var dateParts = inputDate.toArray();

  if (input.indexOf('T') === -1) {
    return referenceDate
      .set({
        year: dateParts[0],
        month: dateParts[1],
        date: dateParts[2],
      })
      .format();
  }

  return inputDate.format();
}

function parseRelativeInput(input, referenceDate) {
  input = parseInput(input);
  validateInput(input);

  applyYear(referenceDate, input);
  applyMonth(referenceDate, input);
  applyWeek(referenceDate, input);
  applyDay(referenceDate, input);
  applyTimePart(referenceDate, 'hour', input);
  applyTimePart(referenceDate, 'minute', input);
  applyTimePart(referenceDate, 'second', input);

  return referenceDate.format();
}

function parseStringDate(input) {
  if (typeof input !== 'string') {
    throw new Error('Invalid date string (' + input + ')');
  }

  input = moment.parseZone(input || '');

  if (!input.isValid()) {
    throw new Error('Invalid date string (' + input + ')');
  }

  return input;
}

function applyYear(result, input) {
  var year = input.year;
  var week = input.week;
  var weekYear;

  if (week.valid && !week.relative) {
    weekYear = year.relative ? result.year() + year.value : year.value;

    result.isoWeekYear(weekYear);
  } else if (year.relative) {
    result.add(year.value, 'year');
  } else {
    result.set('year', year.value);
  }
}

function applyMonth(result, input) {
  var month = input.month;

  if (!month.valid) {
    return;
  }

  if (month.relative) {
    result.add(month.value, 'month');
  } else {
    result.set('month', month.value - 1);
  }
}

function applyWeek(result, input) {
  var week = input.week;

  if (week.relative) {
    result.add(week.value * 7, 'day');
  } else {
    result.set('isoWeek', week.value);
  }
}

function applyDay(result, input) {
  var week = input.week;
  var day = input.day;
  var unit, array;

  if (day.relative) {
    result.add(day.value, 'day');
  } else if (day.value === 'last') {
    array = result.toArray();

    result.endOf('month');
    result.hour(array[3]);
    result.minute(array[4]);
    result.second(array[5]);
  } else {
    unit = week.valid ? 'day' : 'date';
    result.set(unit, day.value);
  }
}

function applyTimePart(result, unit, input) {
  var part = input[unit];

  if (part.relative) {
    result.add(part.value, unit);
  } else {
    result.set(unit, part.value);
  }
}

function parseInput(input) {
  var isArray, parsedInput;

  if (typeof input !== 'object') {
    throw new Error('Invalid input type (' + typeof input + ')');
  }

  isArray = Array.isArray(input);
  parsedInput = {};

  units.forEach(function parsePart(unit, i) {
    var value = isArray ? input[i] : input[unit];
    var valid = isValid(unit, value);
    var relative = valid && isRelative(unit, value);

    value = value === 'last' ? value : parseInt(value, 10);
    parsedInput[unit] = {value: value, valid: valid, relative: relative};
  });

  return parsedInput;
}

function isValid(unit, value) {
  return (
    (typeof value === 'string' && !isNaN(parseInt(value, 10))) ||
    typeof value === 'number' ||
    (unit === 'day' && value === 'last') ||
    (optionalUnits.indexOf(unit) !== -1 &&
      (value === null || value === undefined))
  );
}

function isRelative(unit, value) {
  if (['hour', 'minute', 'second'].indexOf(unit) !== -1) {
    return relativePartRegex.test(value) || parseInt(value, 10) < 0;
  }

  return relativePartRegex.test(value) || value === '0' || value <= 0;
}

function validateInput(input) {
  if (!input.year.valid) {
    throw new Error('Invalid year');
  }

  if (!input.day.valid) {
    throw new Error('Invalid day');
  }

  if (!input.month.valid && !input.week.valid) {
    throw new Error('Invalid month or week');
  }

  if (input.month.valid && input.week.valid) {
    throw new Error('Invalid input: month and week cannot be combined');
  }

  if (input.week.valid && input.day.value === 'last') {
    throw new Error('Invalid day: "last" day of week not supported');
  }

  if (!input.hour.valid) {
    throw new Error('Invalid hour');
  }

  if (!input.minute.valid) {
    throw new Error('Invalid minute');
  }

  if (!input.second.valid) {
    throw new Error('Invalid second');
  }
}
