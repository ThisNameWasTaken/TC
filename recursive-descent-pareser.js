const Lexer = require('lex');

/**
 * @typedef { 'NUMBER' | 'OPERATOR' } TokenType
 */

/**
 * @typedef {{regEx: RegExp, tokenType: TokenType}} LexerRule
 */

/**
 * @typedef {{ type: TokenType, value: string }} Token
 */

const lexer = new Lexer();

/** @type {LexerRule[]} */
const lexerRules = [
  {
    regEx: /([0-9])+/,
    tokenType: 'NUMBER',
  },
  {
    regEx: /\+|\-|\*|\/|=/,
    tokenType: 'OPERATOR',
  },
];

lexerRules.forEach(({ regEx, tokenType }) =>
  lexer.addRule(regEx, match => ({ value: match, type: tokenType }))
);

/**
 * @param {string} str
 */
function getTokens(str) {
  lexer.setInput(str);

  /** @type {Token[]} */
  const tokens = [];

  try {
    for (let token = lexer.lex(); token; token = lexer.lex()) {
      tokens.push(token);
    }
  } catch (err) {
    console.error(err);

    return [];
  }

  return tokens;
}

const grammar = {
  PRODUCTION1: ['NUMBER', 'PRODUCTION2'],
  PRODUCTION2: ['OPERATOR', 'NUMBER', 'PRODUCTION2'],

  $STARTING_PRODUCTION: 'PRODUCTION1',

  $END_PRODUCTIONS: {
    PRODUCTION2: {},
  },
};

const productions = Object.keys(grammar).filter(
  element => !element.startsWith('$')
);

/**
 * @param {string} productionName
 */
function isProduction(productionName) {
  return productions.includes(productionName);
}

function isValidGrammar(input) {
  return isValidProduction(grammar.$STARTING_PRODUCTION, input);
}

/**
 * @param {string} productionName
 */
function isEndProduction(productionName) {
  return productionName in grammar.$END_PRODUCTIONS;
}

function copy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * @param {string} productionName
 * @param {string[]} input
 */
function isValidProduction(productionName, input) {
  if (!isProduction(productionName)) return false;

  if (input.length === 0) return isEndProduction(productionName);

  const production = grammar[productionName];

  /** @type {string[]} */
  const _input = copy(input);

  for (const token of production) {
    if (isProduction(token)) {
      if (!isValidProduction(token, _input)) return false;
    } else {
      const expectedToken = _input.shift();

      if (expectedToken !== token) return false;
    }
  }

  return true;
}

const str = '12+32/32=24';
const tokens = getTokens(str);
const tokenTypes = tokens.map(({ type }) => type);

console.log(isValidGrammar(tokenTypes));

// TODO: Convert the left recursive grammar to a right recursive grammar
// E -> iE'
// E' -> +iE'|#

`i+i$`;

`E -> i E'`;
`E' -> + i E' | $`;

`EXPRESSION -> NUMBER EXPRESSION'`;
`EXPRESSION' -> OPERATOR NUMBER EXPRESSION' | END`;
