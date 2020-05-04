const fs = require('fs');

/**
 * @param {string} str
 */
function parseGrammar(str) {
  const grammarRegEx = /(\w)\s*->\s*([^\|\s]+)\s*\|?\s*(\$?)/;

  let match = str.match(grammarRegEx);
  const grammar = { $FINAL_STATES: [] };

  while (match) {
    const [strToReplace, state, stateValue, isFinalState] = match;

    if (!('$BEGIN_STATE' in grammar)) {
      grammar.$BEGIN_STATE = state;
    }

    grammar[state] = stateValue;

    if (!!isFinalState) {
      grammar.$FINAL_STATES.push(state);
    }

    str = str.replace(strToReplace, '');
    match = str.match(grammarRegEx);
  }

  return grammar;
}

const grammar = parseGrammar(fs.readFileSync('grammar-input.txt', 'utf-8'));

const input = fs.readFileSync('words-input.txt', 'utf-8');

let inputIndex = 0;
let lookAhead = '';
let lookAheadIndex = 0;

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

  if (input.length === 0 && isFinalState(grammar.$BEGIN_STATE)) return true;

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
