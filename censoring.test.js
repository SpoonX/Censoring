const test = require('node:test');
const assert = require("node:assert");

const Censoring = require('./index');

test('Example in the readme is correct', (t) => {
  const scan = new Censoring();
  let testSentence = '';

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
  assert.deepStrictEqual(scan.test(), [
    '555-123456',
    'me[at]example(dot)com',
    '1nt3r.n.e.t'
  ]);

  assert.strictEqual(scan.replace(), 'The *** will not be censored! Call me on ***, or send an email to ***.');
});

test('Custom replacement string function works as expected', (t) => {
  const scan = new Censoring();
  const testSentence = 'Call me on 555-123456, or send an email to me[at]example(dot)com.';
  
  scan.enableFilters(['phone_number', 'email_address']);
  
  scan.setReplacementString((m) => '*'.repeat(m.length));
  
  scan.prepare(testSentence);
  assert.strictEqual(scan.replace(), 'Call me on **********, or send an email to *********************.');
});
