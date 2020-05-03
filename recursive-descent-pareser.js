const Lexer = require('lex');

/**
 * @typedef { 'OPENING_CURLY_BRACE' | 'CLOSING_CURLY_BRACE' | 'OPENING_BRACKET' | 'CLOSING_BRACKET' | 'COMMA' | 'COLON' | 'STRING' | 'NUMBER' | 'BOOLEAN' | 'NULL' } TokenType
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
    regEx: /{/,
    tokenType: 'OPENING_CURLY_BRACE',
  },
  {
    regEx: /}/,
    tokenType: 'CLOSING_CURLY_BRACE',
  },
  {
    regEx: /\[/,
    tokenType: 'OPENING_BRACKET',
  },
  {
    regEx: /\]/,
    tokenType: 'CLOSING_BRACKET',
  },
  {
    regEx: /,/,
    tokenType: 'COMMA',
  },
  {
    regEx: /:/,
    tokenType: 'COLON',
  },
  {
    regEx: /".*?"/,
    tokenType: 'STRING',
  },
  {
    regEx: /([0-9])+/,
    tokenType: 'NUMBER',
  },
  {
    regEx: /true|false/,
    tokenType: 'BOOLEAN',
  },
  {
    regEx: /null/,
    tokenType: 'NULL',
  },
];

lexerRules.forEach(({ regEx, tokenType }) =>
  lexer.addRule(regEx, match => ({ value: match, type: tokenType }))
);

/**
 * @param {string} str
 */
function getTokens(str) {
  /** @type {Token[]} */
  const tokens = [];
  lexer.setInput(str);

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

// const grammar = {
//   PRODUCTION1: ['NUMBER', 'PRODUCTION2'],
//   PRODUCTION2: ['OPERATOR', 'NUMBER', 'PRODUCTION2'],

//   $STARTING_PRODUCTION: 'PRODUCTION1',
//   $END_PRODUCTIONS: {
//     PRODUCTION2: {},
//   },
// };

// TODO: Empty objects are also valid
('OBJECT -> OPENING_CURLY_BRACE KEY_VALUE_PAIR CLOSING_CURLY_BRACE');
('KEY_VALUE_PAIR -> STRING COLON VALUE');
('VALUE -> STRING | NUMBER | BOOLEAN | NULL | ARRAY | OBJECT | END');
('ARRAY -> OPENING_BRACKET VALUE ARRAY_TAIL CLOSING_BRACKET');
('ARRAY_TAIL -> COMA VALUE ARRAY_TAIL | END');

const grammar = {
  OBJECT: ['OPENING_CURLY_BRACE', 'KEY_VALUE_PAIR', 'CLOSING_CURLY_BRACE'],
  // KEY_VALUE_PAIRS: ['KEY_VALUE_PAIR', 'KEY_VALUE_PAIR_TAIL'],
  KEY_VALUE_PAIR: ['STRING', 'COLON', 'VALUE'],
  // KEY_VALUE_PAIR_TAIL: ['COMMA', ],
  // STRING | NUMBER | BOOLEAN | NULL | ARRAY | OBJECT
  VALUE: ['STRING'],
  ARRAY: ['OPENING_BRACKET', 'VALUE', 'ARRAY_TAIL', 'CLOSING_BRACKET'],
  ARRAY_TAIL: ['COMMA', 'VALUE', 'ARRAY_TAIL'],

  $STARTING_PRODUCTION: 'OBJECT',
  $END_PRODUCTIONS: {
    VALUE: {},
    ARRAY_TAIL: {},
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
  console.log({ input });
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
      console.log('production', token);
      console.log('input', input);
      if (!isValidProduction(token, _input)) return false;
    } else {
      const expectedToken = _input.shift();

      if (expectedToken !== token) return false;
    }
  }

  return true;
}

const str = '{"lorem":"2"}';
const tokens = getTokens(str);
const tokenTypes = tokens.map(({ type }) => type);

console.log(isValidGrammar(tokenTypes));

('PRODUCTION1 -> NUMBER PRODUCTION2 | SIGN_OPERATOR PRODUCTION2 | END');
('PRODUCTION2 -> SIGN_OPERATOR NUMBER PRODUCTION2 | OPERATOR NUMBER PRODUCTION2 | END');
