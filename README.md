# Censoring
This module allows you to detect patterns in texts, even when attempted to be hidden and then either highlight (markup) or censor (replace) them.
It checks for upper casing, lower casing, 1337 replacements, or s,p-l.'i*t.

**Note:** This module works in the browser as a global, or AMD module, as well as in node.js.

## Example:

```javascript
var Censoring    = require('censoring'),
    scan         = new Censoring(),
    testSentence = '';

// Enable filters we want to use
scan.enableFilters(['phone_number', 'email_address', 'words']);

// Word
testSentence += 'The 1nt3r.n.e.t will not be censored! ';

// Phone number
testSentence += 'Call me on 555-123456';

// Email address
testSentence += ', or send an email to me[at]example(dot)com.';

// Let's make the word internet illegal.
scan.addFilterWord('internet');

// Tell the scanner we're done, and it can prepare the results.
scan.prepare(testSentence);

// Did we have a match?
if (scan.test()) {
  console.log(
    'We had a match! Here it is, but censored:',
    scan.replace()
  );

  // The *** will not be censored! Call me on ***, or send an email to ***.
}
```


## Installation
`npm install --save censoring`

## Filters

| Pattern       | Description                              |
| :------------ | :----------------------------------------|
| long_number   | Matches long, consecutive numbers        |
| phone_number  | Matches phone numbers.                   |
| email_address | Matches email addresses in many formats. |
| url           | Matches URL patterns.                    |
| words         | Finds words, even when in disguise.      |

## Methods
A `Censoring` instance has the following methods.

### .enableFilter(string filterName)
Enable a filter from the list of filters. By default, they're all disabled.

```javascript
var scan = new Censoring();

scan.enableFilter('email_address');
```

### .enableFilters(Array filterNames)
Enable multiple filters from the list of filters. By default, they're all disabled.

```javascript
var scan = new Censoring();

scan.enableFilters(['phone_number', 'email_address']);
```

### .disableFilter(string filterName)
Disable a previously enabled filter.

```javascript
var scan = new Censoring();

scan.enableFilter('email_address');
scan.disableFilter('email_address');
```

### .addFilterWords(Array filterWords)
Add multiple words to filter on.

```javascript
var scan = new Censoring();

scan.enableFilter('words');
scan.addFilterWord(['stoopid head', 'big meany']);
```

### .addFilterWord(string filterWord)
Add a word to filter on.

```javascript
var scan = new Censoring();

scan.enableFilter('words');
scan.addFilterWord('doody face');
```

### .setReplacementString(string replacementString)
Set the string to replace matches with. Defaults to `***`.

```javascript
var scan = new Censoring();

scan.setReplacementString('pony');
```

### .getReplacementString()
Get the currently set replacement string.

```javascript
var scan = new Censoring();

scan.getReplacementString(); // Returns '***'
```

### .setHighlightColor(string hexCode)
Set the color for highlighted occurrences. Defaults to `#F2B8B8`.

```javascript
var scan = new Censoring();

scan.setHighlightColor('#ff0');
```

### .prepare(string inputString[, bool highlight])
Prepare a string, and optionally supply `highlight` to not replace occurrences, but highlight them using html.

```javascript
var scan = new Censoring();

scan.enableFilter('email_address');
scan.prepare('me@example[dot]com', true);
```

### .test()
Test if the string you've prepared matches any of the filters.

```javascript
var scan = new Censoring();

scan.enableFilter('email_address');
scan.prepare('me@example[dot]com');

if (scan.test()) {
  console.log('We have a match!');
}
```

### .replace()
Replace all occurrences found in the prepared string.

> Note: This will return HTML with the matches highlighted if the scan was prepared with .prepare(txt, true).

```javascript
var scan = new Censoring();

scan.enableFilter('email_address');
scan.prepare('Email me at me@example[dot]com');

console.log(scan.replace());
// Outputs: Email me at ***
```

### .filterString(string inputString[, bool highlight])
Filter a string directly, without preparing it first.

> Note: Bad for performance When combined with `.test()` and `.replace`.

```javascript
var scan = new Censoring(),
    testString = "I'm going to tell mommy that you're a big meany!",
    result;

scan.enableFilter('words');
scan.addFilterWord(['stoopid head', 'big meany']);

result = scan.filterString(testString);

console.log(result);
// Outputs: I'm going to tell mommy that you're a ***!
```

### .addFilter(string name)
Add a new filter. A filter is essentially a `name` and a `pattern`.

```javascript
var scan = new Censoring();

scan.addFilter('bigot', {
    enabled: true,
    pattern: /^I'm not a racist,? but/
});
```

## Support / contributing
If you have any questions or feature requests (such as publishing on bower..?) you can:

* Check out the issues
* Join us on freenode (#spoonx)
