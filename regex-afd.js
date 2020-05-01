function isChar(obj) {
  return (typeof obj === 'string' || obj instanceof String) && obj.length === 1;
}

function isLetter(obj) {
  return isChar(obj) && !!obj.match(/[a-z]|\*/i);
}

function isRegExpKeyword(obj) {
  const regExpKeywords = ['|', '(', ')'];
  return isChar(obj) && regExpKeywords.includes(obj);
}

/**
 *
 * @param {string} str
 */
function getAugmentedRegularExpression(str) {
  const augmentedRegEx = [];

  // const
  for (let i = 0; i < str.length - 1; i++) {
    const chr = str[i];
    const nextChr = str[i + 1];

    augmentedRegEx.push(chr);
    if (isLetter(chr) && isLetter(nextChr)) {
      augmentedRegEx.push('.');
    }
  }

  const lastChr = str[str.length - 1];
  augmentedRegEx.push(lastChr);
  if (isLetter(lastChr)) {
    augmentedRegEx.push('.');
  }

  augmentedRegEx.push('#');

  return augmentedRegEx.join('');
}

function isNullable(node) {
  return node === '*';
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
  console.log({ nodes });
}

let subtreeCount = 0;

/**
 * @param {string} str
 */
function handleParentheses(str) {
  const parenthesesRegExp = /\(([^\)\(]*)\)/;

  let match;
  while ((match = str.match(parenthesesRegExp))) {
    str = str.replace(match[0], `<${subtreeCount++}>`);
    console.log({ str });
  }
}

handleParentheses('(a|bb(a|b)*)*abb');

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

// console.log('(ab|b)*ab(a(ab|b)*b|bc)*b'.match(/\(([^\)\(]*)\)/));
console.log('(a|b)*abb'.match(/\(([^\)\(]*)\)/));

// console.log(matches);
