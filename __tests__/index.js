const util = require('util');

const parse = require('../index');

test('export type', () => {
  expect(typeof parse).toBe('function');
});

describe('invalid input', () => {
  const invalidCases = [
    [undefined, undefined],
    ['', '2018-01-01T00:00:00Z'],
    [{year: 0}, '2018-01-01T00:00:00Z'],
    [{year: 0, day: 0}, '2018-01-01T00:00:00Z'],
    [{year: 0, month: 0, day: 0, week: 0}, '2018-01-01T00:00:00Z'],
    [{year: 0, month: 0}, '2018-01-01T00:00:00Z'],
    [{year: 0, week: 0}, '2018-01-01T00:00:00Z'],
    [{year: 0, week: 0, day: 'last'}, '2018-01-01T00:00:00Z'],
    [{year: 0, week: 0, day: 0}, ''],
    [{year: 0, week: 0, day: 0}, new Date()],
  ];

  const errorMessageRegex = /^invalid/i;

  invalidCases.forEach(testCase => {
    test(util.inspect(testCase), () => {
      expect(() => {
        parse(...testCase);
      }).toThrowError(errorMessageRegex);
    });
  });
});

test('return type', () => {
  expect(typeof parse({year: 0, month: 0, day: 0}, '2018-01-01')).toBe(
    'string'
  );
});

describe('valid input', () => {
  const cases = [
    {
      name: 'current date',
      input: [0, 0, 0, null],
      reference: '1984-12-31T00:00:00Z',
      expected: '1984-12-31T00:00:00Z',
    },
    {
      name: 'relative day (-1)',
      input: [0, 0, -1, null],
      reference: '1984-12-31T00:00:00Z',
      expected: '1984-12-30T00:00:00Z',
    },
    {
      name: 'relative day (-1, wrap month and year)',
      input: [0, 0, -1, null],
      reference: '1984-01-01T00:00:00Z',
      expected: '1983-12-31T00:00:00Z',
    },
    {
      name: 'relative day (+1)',
      input: [0, 0, '+1', null],
      reference: '1984-01-01T00:00:00Z',
      expected: '1984-01-02T00:00:00Z',
    },
    {
      name: 'relative day (+1, wrap month and year)',
      input: [0, 0, '+1', null],
      reference: '1984-12-31T00:00:00Z',
      expected: '1985-01-01T00:00:00Z',
    },
    {
      name: 'relative month (-1)',
      input: [0, -1, 0, null],
      reference: '1984-12-31T00:00:00Z',
      expected: '1984-11-30T00:00:00Z',
    },
    {
      name: 'relative month (-1, wrap year)',
      input: [0, -1, 0, null],
      reference: '1984-01-01T00:00:00Z',
      expected: '1983-12-01T00:00:00Z',
    },
    {
      name: 'relative month (+1, leap year)',
      input: [0, '+1', 0, null],
      reference: '1984-01-31T00:00:00Z',
      expected: '1984-02-29T00:00:00Z',
    },
    {
      name: 'relative month (+1, regular year)',
      input: [0, '+1', 0, null],
      reference: '1985-01-31T00:00:00Z',
      expected: '1985-02-28T00:00:00Z',
    },
    {
      name: 'relative month (+1, wrap year)',
      input: [0, '+1', 0, null],
      reference: '1984-12-31T00:00:00Z',
      expected: '1985-01-31T00:00:00Z',
    },
    {
      name: 'relative year (-1)',
      input: [-1, 0, 0, null],
      reference: '1984-01-01T00:00:00Z',
      expected: '1983-01-01T00:00:00Z',
    },
    {
      name: 'relative year (+1)',
      input: ['+1', 0, 0, null],
      reference: '1984-01-01T00:00:00Z',
      expected: '1985-01-01T00:00:00Z',
    },
    {
      name: 'absolute week',
      input: [2000, null, 1, 1],
      reference: '1984-01-02T00:00:00Z', // monday
      expected: '2000-01-03T00:00:00Z',
    },
    {
      name: 'relative week (-1)',
      input: [0, null, 0, -1],
      reference: '1984-08-14T00:00:00Z',
      expected: '1984-08-07T00:00:00Z',
    },
    {
      name: 'relative week (+1)',
      input: [0, null, 0, '+1'],
      reference: '1984-08-14T00:00:00Z',
      expected: '1984-08-21T00:00:00Z',
    },
    {
      name: 'same week in other year (-1)',
      input: [-1, null, 0, 0],
      reference: '2000-01-01T00:00:00Z',
      expected: '1999-01-01T00:00:00Z',
    },
    {
      name: 'same week in other year (+1)',
      input: ['+1', null, 0, 0],
      reference: '2000-01-01T00:00:00Z',
      expected: '2001-01-01T00:00:00Z',
    },
    {
      name: 'absolute last-day-of-month',
      input: [0, -2, 'last', null],
      reference: '1984-08-14T00:00:00Z',
      expected: '1984-06-30T00:00:00Z',
    },
    {
      name: 'current time (not set)',
      input: [0, 0, 0, null],
      reference: '1984-01-01T12:34:56Z',
      expected: '1984-01-01T12:34:56Z',
    },
    {
      name: 'current time (null)',
      input: [0, 0, 0, null, null, null, null],
      reference: '1984-01-01T12:34:56Z',
      expected: '1984-01-01T12:34:56Z',
    },
    {
      name: 'current time (undefined)',
      input: [0, 0, 0, null, undefined, undefined, undefined],
      reference: '1984-01-01T12:34:56Z',
      expected: '1984-01-01T12:34:56Z',
    },
    {
      name: 'current time (absolute)',
      input: [0, 0, 0, null, 0, 0, 0],
      reference: '1984-01-01T12:34:56Z',
      expected: '1984-01-01T00:00:00Z',
    },
    {
      name: 'relative hour (-1)',
      input: [0, 0, 0, null, -1, null, null],
      reference: '1984-01-01T12:34:56Z',
      expected: '1984-01-01T11:34:56Z',
    },
    {
      name: 'relative hour (-1, wrap day)',
      input: [0, 0, 0, null, -1, null, null],
      reference: '1984-01-08T00:12:34Z',
      expected: '1984-01-07T23:12:34Z',
    },
    {
      name: 'relative hour (+1)',
      input: [0, 0, 0, null, '+1', null, null],
      reference: '1984-01-01T12:34:56Z',
      expected: '1984-01-01T13:34:56Z',
    },
    {
      name: 'relative hour (+1, wrap day)',
      input: [0, 0, 0, null, '+1', null, null],
      reference: '1984-01-08T23:23:23Z',
      expected: '1984-01-09T00:23:23Z',
    },
  ];

  const units = ['year', 'month', 'day', 'week', 'hour', 'minute', 'second'];

  cases.forEach(testCase => {
    let {name, input, reference, expected} = testCase;
    const objectInput = {};

    units.forEach((unit, i) => {
      objectInput[unit] = input[i];
    });

    test(name, () => {
      expect(parse(input, reference)).toBe(expected);
      expect(parse(objectInput, reference)).toBe(expected);
    });
  });

  test('absolute datetime', () => {
    const reference = '2018-05-05T00:00:00Z';
    const input = '2000-01-01T11:42:42Z';

    expect(parse(input, reference)).toBe(input);
  });

  test('absolute date', () => {
    const reference = '2018-05-05T12:34:56Z';
    const input = '2000-01-01';
    const expected = '2000-01-01T12:34:56Z';

    expect(parse(input, reference)).toBe(expected);
  });
});
