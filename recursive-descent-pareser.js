`i+i$`;
`E->iT`;
`T->+iT|$`;

const input = '+i+i+i';

let inputIndex = 0;
let lookAhead = '';
let lookAheadIndex = 0;

const grammar = {
  E: 'iT',
  T: '+iT',

  $BEGIN_STATE: 'E',
  $FINAL_STATES: ['T'],
};

function isTerminal(elem) {
  return !Object.keys(grammar)
    .filter(key => !key.startsWith('$'))
    .includes(elem);
}

function match(elem) {
  const expectedValue = input[inputIndex];
  inputIndex++;
  lookAheadIndex++;
  return elem === expectedValue;
}

function callFunction(elem) {
  lookAhead = grammar[elem];
  lookAheadIndex = 0;
}

function isFinalState(state) {
  return grammar.$FINAL_STATES.includes(state);
}

function isValid() {
  callFunction(grammar.$BEGIN_STATE);

  while (inputIndex < input.length) {
    const _lookAhead = lookAhead[lookAheadIndex];

    if (isTerminal(_lookAhead)) {
      if (!match(_lookAhead)) return false;
    } else {
      callFunction(_lookAhead);
    }
  }

  return isFinalState(lookAhead[lookAheadIndex]);
}

console.log(isValid());
