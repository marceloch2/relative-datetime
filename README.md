# Relative datetime parser

Parse a relative datetime description and a reference ISO8601 datetime string to
a new ISO6801 datetime string.

## Usage

```bash
npm install @c16s/relative-datetime
```

#### String input

```js
const parseDate = require('@c16s/relative-datetime');

let date = parseDate('2017-01-01', '2018-01-03T12:12:12Z');
// '2017-01-01T12:12:12Z'

let date = parseDate('2017-01-01T00:00:00Z', '2018-01-03T12:12:12Z');
// '2017-01-01T00:00:00Z'
```

#### Object input

```js
let date = parseDate({ year: -1, month: 0, day: 1 }, '2018-01-03T12:12:12Z');
// '2017-01-01T12:12:12Z'
```

#### Array input

```js
let date = parseDate([ 2017, "+3", "last" ],  '2018-01-03T12:12:12Z');
// '2017-04-30T12:12:12Z'
```

### Relative datetime description format

A datetime description can describe a **date** (year, month, day) or a **weekday**
(year, week, day). It's also possible to set the **time** (optional).

```js
let description = [year, month, day, week, hour, minute, second];
```

Each part of the **date** can be _absolute_ (e.g. the year `2017`) or _relative_
(`-1`, `0`, `'+5'`).

Each part of the **time** can be _absolute_ (e.g. `0`, `1`, `30`) or _relative_
(ommitted, `null`, `undefined`, `0`, `-1`, `'+15'`).

#### Date (day of month)

A date can be described by a `year`, `month`, and `day`. In this case `day` is
the day of the month. It can have the special value `"last"`, meaning "the last
day of the given month". Unlike with native JavaScript dates, `month` is base 1
(januari is month `1`).

#### Weekday

A weekdays can be described by a `year`, `week` and `day`. In this case, `day`
is the day of the week, starting with monday as `1`. This follows the ISO 8601
standard. Keep in mind that a date in a certain year's first or last week does
not necessarily fall in that year. For example, `{ year: 2015, week: 1, day: 1
}` means 2014-12-29.

#### Time

Time is described by an `hour`, `minute` and `second`. When ommitted, the
reference datetime's time is used. Each segment can be an absolute or a relative
value. The value `0` is an absolute value. To actively ommit one segment, set it
to `null` or `undefined`.
