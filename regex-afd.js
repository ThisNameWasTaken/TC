function isChar(obj) {
  return (typeof obj === 'string' || obj instanceof String) && obj.length === 1;
}

function isLetter(obj) {
  return isChar(obj) && !!obj.match(/[a-z]/i);
}

function isRegExpKeyword(obj) {
  const regExpKeywords = ['*', '|', '(', ')'];
  return isChar(obj) && regExpKeywords.includes(obj);
}

/**
 *
 * @param {string} string
 */
function getAugmentedRegularExpression(string) {
  const augmentedRegEx = [];

  const steps = string.length - 1;
  for (let i = 0; i < steps; i++) {
    const char = string[i];
    const nextChar = string[i + 1];

    if (!isRegExpKeyword(char) && isLetter(nextChar)) {
      augmentedRegEx.push('.');
    }

    augmentedRegEx.push(char);
  }

  const lastChar = string[string.length - 1];

  if (isLetter(lastChar)) {
    augmentedRegEx.push('.');
  }

  augmentedRegEx.push(lastChar);
  augmentedRegEx.push('#');

  return augmentedRegEx;
}

function isNullable(node) {
  const nullableValues = ['*', 'epsilon'];
  return nullableValues.includes(node);
}

function calcFirstPos(node) {
  // ...
}

function calcLastPos(node) {
  // ...
}

/**
 * @typedef SyntaxTreeNode
 * @property {string} value
 * @property {string[]} firstPos
 * @property {string[]} lastPos
 * @property {boolean} isNullable
 */

const node = {
  value: '',
  firstPos: [],
  lastPos: [],
  isNullable: false,
};

/**
 * @param {string[]} augmentedRegEx
 */
function createSyntaxTree(augmentedRegEx) {
  //
}

createSyntaxTree(getAugmentedRegularExpression('(a|b)*abb'));

console.log(getAugmentedRegularExpression('(a|b)*abb').join(''));
console.log(getAugmentedRegularExpression('(a|b)*abb'));
