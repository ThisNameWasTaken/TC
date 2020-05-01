function isChar(obj) {
  return (typeof obj === 'string' || obj instanceof String) && obj.length === 1;
}

function isLetter(obj) {
  return isChar(obj) && !!obj.match(/[a-z]|\*|>/i);
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
  // if (isLetter(lastChr)) {
  //   augmentedRegEx.push('.');
  // }

  // augmentedRegEx.push('#');

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

class SyntaxTreeNode {
  constructor({
    label = undefined,
    firstPos = [],
    lastPos = [],
    isNullable = false,
    leftChild = undefined,
    rightChild = undefined,
    parent = undefined,
  }) {
    this.label = label;
    this.firstPos = firstPos;
    this.lastPos = lastPos;
    this.isNullable = isNullable;
    this.leftChild = leftChild;
    this.rightChild = rightChild;
    this.parent = parent;
  }
}

class SyntaxTree {
  // /** @type {SyntaxTreeNode[]} */
  // nodes = [];
  /** @type {SyntaxTreeNode} */
  root;

  /**
   * @param {string} label
   */
  add(label) {
    // if root is undefined
    // root = newNode;
    // if root does not have parent
    // root.parent = newNode
    // root = newNode;
    // if root does not have a leftChild
    // root.leftChild = newNode;
    // if root does not have a rightChild and the root is not a star
    // root.rightChild = newNode;

    const newNode = new SyntaxTreeNode({ label });

    this.nodes.push(newNode);

    if (this.nodes.length == 1) return;

    const lastAddedNode = this.nodes[this.nodes.length - 1];
    newNode.leftChild = this.nodes[this.nodes.length - 1];

    if (this.nodes.length % 2 === 0) {
      lastAddedNode.rightChild = newNode;
    }
  }
}

const syntaxTrees = {
  // ...
};

let subtreeCount = 0;

/**
 * @param {string} str
 */
function addSyntaxTree(str) {
  const augmentedRegEx = getAugmentedRegularExpression(str);
  console.log({ augmentedRegEx });
  const newTree = createSyntaxTree(augmentedRegEx);
  syntaxTrees[`<${subtreeCount}>`] = newTree;
}

/**
 * @param {string} augmentedRegEx
 */
function createSyntaxTree(augmentedRegEx) {
  const syntaxTree = new SyntaxTree();

  const orNodes = augmentedRegEx.split('|');
  console.log({ orNodes });

  orNodes.forEach(node => {
    const nodesToConcat = node.split('.');

    syntaxTree.add(node);

    console.log({ nodesToConcat });
  });

  console.log('');

  return syntaxTree;
}

/**
 * @param {string} str
 */
function handleParentheses(str) {
  const parenthesesRegExp = /\(([^\)\(]*)\)/;

  let match;
  while ((match = str.match(parenthesesRegExp))) {
    addSyntaxTree(match[1]);
    str = str.replace(match[0], `<${subtreeCount++}>`);
  }

  addSyntaxTree(str);
}

handleParentheses('(a|bb(a|b)*)*abb');
// handleParentheses('(ab)*abb');

// createSyntaxTree(getAugmentedRegularExpression('(a|b)*abb'));

// console.log(getAugmentedRegularExpression('(a|b)*abb').split('.'));
// console.log(getAugmentedRegularExpression('(a|b)*abb'));
// console.log(getAugmentedRegularExpression('(ab|b)*abb').split('.'));
// console.log(getAugmentedRegularExpression('(ab|b)*abb'));
// console.log(
//   getAugmentedRegularExpression('(ab|b)*ab(a(ab|b)*b|bc)*b').split('.')
// );
// console.log(getAugmentedRegularExpression('(ab|b)*ab(a(ab|b)*b|bc)*b'));

// console.log('(ad(asd)(as(sad)d))asdad(asd)'.match(/(\((?>[^()]+|(?1))*\))/));

// const matches = '(ab|b)*ab(a(ab|b)*b|bc)*b'.match(/(\(([^()]|(?R))*\))/g);

// console.log('(ab|b)*ab(a(ab|b)*b|bc)*b'.match(/\(([^\)\(]*)\)/));
// console.log('(a|b)*abb'.match(/\(([^\)\(]*)\)/));

// console.log(matches);
