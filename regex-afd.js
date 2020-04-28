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

  for (let i = 1; i < string.length; i++) {
    const prevChar = string[i - 1];
    const char = string[i];

    augmentedRegEx.push(prevChar);

    const isStarExp = prevChar === '*';
    if ((isLetter(prevChar) && !isRegExpKeyword(char)) || isStarExp) {
      augmentedRegEx.push('.');
    }
  }

  const lastLetter = string[string.length - 1];
  augmentedRegEx.push(lastLetter);

  return augmentedRegEx.join('');
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
 * @param {string} augmentedRegEx
 */
function createSyntaxTree(augmentedRegEx) {
  const nodes = augmentedRegEx.split('.');
}

createSyntaxTree(getAugmentedRegularExpression('(a|b)*abb'));

// console.log(getAugmentedRegularExpression('(a|b)*abb').split('.'));
console.log(getAugmentedRegularExpression('(a|b)*abb'));
// console.log(getAugmentedRegularExpression('(ab|b)*abb').split('.'));
// console.log(getAugmentedRegularExpression('(ab|b)*abb'));
// console.log(
//   getAugmentedRegularExpression('(ab|b)*ab(a(ab|b)*b|bc)*b').split('.')
// );
// console.log(getAugmentedRegularExpression('(ab|b)*ab(a(ab|b)*b|bc)*b'));

// console.log('(ad(asd)(as(sad)d))asdad(asd)'.match(/(\((?>[^()]+|(?1))*\))/));

// const matches = '(ab|b)*ab(a(ab|b)*b|bc)*b'.match(/(\(([^()]|(?R))*\))/g);

console.log('(ab|b)*ab(a(ab|b)*b|bc)*b'.match(/\(([^\)\(]*)\)/));

// console.log(matches);
