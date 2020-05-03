`i+i$`;
`E->iT`;
`T->+iT|$`;

const input = 'i+i+';

let inputIndex = 0;
let lookAhead = '';
let lookAheadIndex = 0;

const grammar = {
  E: 'iT',
  T: '+iT',

  $BEGIN_STATE: 'E',
  $END_STATES: ['T'],
};

function isTerminal(elem) {
  return !Object.keys(grammar)
    .filter(key => !key.startsWith('$'))
    .includes(elem);
}

function match(elem) {
  const expectedValue = input[inputIndex++];
  console.log({ expectedValue, elem });
  return elem === expectedValue;
}

function callFunction(elem) {
  lookAhead = grammar[elem];
  lookAheadIndex = 0;
}

function isValid() {
  callFunction(grammar.$BEGIN_STATE);

  while (inputIndex < input.length) {
    if (isTerminal(lookAhead[lookAheadIndex])) {
      if (!match(lookAhead[lookAheadIndex])) return false;
      lookAheadIndex++;
    } else {
      callFunction(lookAhead[lookAheadIndex]);
    }
  }

  return true;
}

console.log(isValid());
