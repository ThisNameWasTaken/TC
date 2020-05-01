const Lexer = require('lex');

/**
 * @typedef {'OPEN_PARENTHESES' | 'CLOSED_PARENTHESES' | 'STAR' | 'OR' | 'LETTER' | 'CONCAT' | 'END'} TokenType
 */

/**
 * @typedef {{regEx: RegExp, tokenType: TokenType}} LexerRule
 */

const lexer = new Lexer();

/** @type {LexerRule[]} */
const lexerRules = [
  {
    regEx: /\(/,
    tokenType: 'OPEN_PARENTHESES',
  },
  {
    regEx: /\)/,
    tokenType: 'CLOSED_PARENTHESES',
  },
  {
    regEx: /\|/,
    tokenType: 'OR',
  },
  {
    regEx: /\*/,
    tokenType: 'STAR',
  },
  {
    regEx: /\./,
    tokenType: 'CONCAT',
  },
  {
    regEx: /[a-z]/i,
    tokenType: 'LETTER',
  },
  {
    regEx: /#/,
    tokenType: 'END',
  },
];

lexerRules.forEach(({ regEx, tokenType }) =>
  lexer.addRule(regEx, () => tokenType)
);

class Token {
  /**
   * @param {{ type: TokenType, value: string }} param0
   */
  constructor({ type, value }) {
    this.type = type;
    this.value = value;
  }
}

/**
 * @param {string} str
 */
function getTokens(str) {
  lexer.setInput(str);

  const tokens = [];

  try {
    let i = 0;
    for (let tokenType = lexer.lex(); tokenType; tokenType = lexer.lex()) {
      tokens.push(new Token({ type: tokenType, value: str[i] }));
      i++;
    }
  } catch (err) {
    console.error(err);

    return [];
  }

  return tokens;
}

function getAugmentedRegEx(str) {
  const tokens = getTokens(str);
  let canConcatenate = false;
  const augmentedRegEx = [];

  /**
   *
   * @param {Token} token
   * @param {number} i
   */
  function handleAugmentation(token, i) {
    if (token.type === 'LETTER' || token.type === 'END') {
      if (!canConcatenate) {
        canConcatenate = true;
        return;
      }

      const prevToken = tokens[i - 1];
      if (prevToken.type === 'OPEN_PARENTHESES') return;

      augmentedRegEx.push('.');
    } else if (token.type === 'STAR' || token.type === 'CLOSED_PARENTHESES') {
      canConcatenate = true;
    } else if (token.type === 'OPEN_PARENTHESES' && i > 0) {
      const prevToken = tokens[i - 1];
      if (prevToken.type === 'LETTER' || prevToken.type === 'STAR') {
        augmentedRegEx.push('.');
      }
    } else {
      canConcatenate = false;
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    handleAugmentation(token, i);

    augmentedRegEx.push(token.value);
  }

  return augmentedRegEx.join('');
}

function getRpnRegEx(str) {
  const augmentedRegEx = getAugmentedRegEx(str);
  const tokens = getTokens(augmentedRegEx);
  /** @type {Token[]} */
  const operatorStack = [];
  const rpnRegEx = [];

  tokens.forEach((token, i) => {
    if (
      token.type === 'LETTER' ||
      token.type === 'STAR' ||
      token.type === 'END'
    ) {
      rpnRegEx.push(token.value);
    } else if (token.type === 'OPEN_PARENTHESES') {
      operatorStack.push(token);
    } else if (token.type === 'CLOSED_PARENTHESES') {
      while (
        operatorStack[operatorStack.length - 1].type !== 'OPEN_PARENTHESES'
      ) {
        rpnRegEx.push(operatorStack.pop().value);
      }
      // Pop the matching operator
      operatorStack.pop();
    } else if (token.type === 'OR' || token.type === 'CONCAT') {
      if (operatorStack.length > 0) {
        const prevOperator = operatorStack[operatorStack.length - 1];
        if (
          prevOperator.type !== 'OPEN_PARENTHESES' &&
          prevOperator.type !== 'CLOSED_PARENTHESES'
        ) {
          rpnRegEx.push(operatorStack.pop().value);
          operatorStack.push(token);
        } else {
          operatorStack.push(token);
        }
      } else {
        operatorStack.push(token);
      }
    }
  });

  return rpnRegEx.join('');
}

function copy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * @param {Token[]} tokens
 */
function getNullable(tokens) {
  const nullable = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'LETTER' || token.type === 'END') {
      nullable.push(false);
    } else if (token.type === 'STAR') {
      nullable.push(true);
    } else if (token.type === 'CONCAT') {
      nullable.push(nullable[i - 2] && nullable[i - 1]);
    } else if (token.type === 'OR') {
      nullable.push(nullable[i - 2] || nullable[i - 1]);
    }
  }

  return nullable;
}

/**
 * @param {Token[]} tokens
 * @param {boolean[]} nullable
 */
function getFirstPos(tokens, nullable) {
  const firstPos = [];
  let currentNumber = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === 'LETTER' || token.type === 'END') {
      firstPos.push([++currentNumber]);
    } else if (token.type === 'OR') {
      firstPos.push([...copy(firstPos[i - 2]), ...copy(firstPos[i - 1])]);
    } else if (token.type === 'STAR') {
      firstPos.push(copy(firstPos[i - 1]));
    } else if (token.type === 'CONCAT') {
      if (nullable[i - 2]) {
        firstPos.push([...copy(firstPos[i - 2]), ...copy(firstPos[i - 1])]);
      } else {
        firstPos.push(copy(firstPos[i - 2]));
      }
    }
  }

  return firstPos;
}

/**
 * @param {Token[]} tokens
 * @param {boolean[]} nullable
 */
function getLastPos(tokens, nullable) {
  const lastPos = [];
  let currentNumber = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === 'LETTER' || token.type === 'END') {
      lastPos.push([++currentNumber]);
    } else if (token.type === 'OR') {
      lastPos.push([...copy(lastPos[i - 2]), ...copy(lastPos[i - 1])]);
    } else if (token.type === 'STAR') {
      lastPos.push(copy(lastPos[i - 1]));
    } else if (token.type === 'CONCAT') {
      if (nullable[i - 1]) {
        lastPos.push([...copy(lastPos[i - 2]), ...copy(lastPos[i - 1])]);
      } else {
        lastPos.push(copy(lastPos[i - 1]));
      }
    }
  }

  return lastPos;
}

// '(a|bb(a|b)*)*abb'
// '(a|b)*abb'
// '(ab|b)*abb'

// console.log(tokenize('(a|bb(a|b)*)*abb#'));
// console.log(getAugmentedRegEx('(a|bb(a|b)*)*abb#'));
// console.log(getRpnRegEx('((a|bb(a|b)*)*abb)#'));
const rpnRegEx = getRpnRegEx('(a|b)*abb#');
const rpnTokens = getTokens(rpnRegEx);
const nullable = getNullable(rpnTokens);
const firstPos = getFirstPos(rpnTokens, nullable);

console.log(getLastPos(rpnTokens, nullable));
