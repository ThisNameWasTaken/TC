const fs = require('fs');
const Lexer = require('lex');

/** @typedef {'OPEN_PARENTHESES' | 'CLOSED_PARENTHESES' | 'STAR' | 'OR' | 'LETTER' | 'CONCAT' | 'END'} TokenType */

/** @typedef {{ type: TokenType, value: string }} Token */

/** @typedef {{regEx: RegExp, tokenType: TokenType}} LexerRule */

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
  lexer.addRule(regEx, match => ({ value: match, type: tokenType }))
);

/**
 * @param {string} str
 */
function getTokens(str) {
  lexer.setInput(str);

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

  // Add concatenation node for the END type
  rpnRegEx.push('.');
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
      firstPos.push([...firstPos[i - 2], ...firstPos[i - 1]]);
    } else if (token.type === 'STAR') {
      firstPos.push(copy(firstPos[i - 1]));
    } else if (token.type === 'CONCAT') {
      if (nullable[i - 2]) {
        firstPos.push([...firstPos[i - 2], ...firstPos[i - 1]]);
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
      lastPos.push([...lastPos[i - 2], ...lastPos[i - 1]]);
    } else if (token.type === 'STAR') {
      lastPos.push(copy(lastPos[i - 1]));
    } else if (token.type === 'CONCAT') {
      if (nullable[i - 1]) {
        lastPos.push([...lastPos[i - 2], ...lastPos[i - 1]]);
      } else {
        lastPos.push(copy(lastPos[i - 1]));
      }
    }
  }

  return lastPos;
}

/**
 * @param {Token[]} tokens
 * @param {any[]} firstPos
 * @param {any[]} lastPos
 */
function getFollowPos(tokens, firstPos, lastPos) {
  const followPos = tokens
    .filter(token => token.type !== 'STAR' && token.type !== 'CONCAT')
    .map(elem => []);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type !== 'STAR' && token.type !== 'CONCAT') continue;

    if (token.type === 'STAR') {
      for (const elem of lastPos[i]) {
        followPos[elem] = [...followPos[elem], ...firstPos[i]];
      }
    } else if (token.type === 'CONCAT') {
      for (const elem of lastPos[i - 2]) {
        followPos[elem] = [
          ...new Set([...followPos[elem], ...firstPos[i - 1]]),
        ];
      }
    }
  }

  return followPos;
}

class AFD {
  states = {};

  /**
   * @param {string | number} state
   */
  hasState(state) {
    return !!this.states[state];
  }

  /**
   * @param {string | number} state
   * @param {{value?: any, isFinal?: boolean}} options
   */
  addState(state, { value = {}, isFinal = false }) {
    if (this.hasState(state)) return;

    this.states[state] = { ...value, isFinal };
  }

  /**
   * @param {string | number} fromState
   * @param {string | number} transition
   * @param {string | number} toState
   */
  addTransition(fromState, transition, toState) {
    if (!this.states[fromState]) {
      this.states[fromState] = {};
    }

    if (!this.states[fromState][transition]) {
      this.states[fromState][transition] = [];
    }

    this.states[fromState][transition].push(toState);
  }
}

/**
 * @param {Token[]} rpnTokens
 * @param {any[]} firstPos
 * @param {any[]} lastPos
 * @param {any[]} followPos
 */
function getAFD(rpnTokens, firstPos, lastPos, followPos) {
  const nodeIndices = [];
  rpnTokens.forEach((token, i) => {
    if (token.type === 'LETTER' || token.type === 'END') {
      nodeIndices.push(i);
    }
  });

  const table = nodeIndices.map((nodeIndex, i) => ({
    label: rpnTokens[nodeIndex].value,
    value: lastPos[nodeIndex][0],
    followPos: followPos[i + 1],
  }));

  console.log(table);

  const afd = new AFD();

  const initialState = firstPos[firstPos.length - 1]; // firstPos of root

  const states = new Set([initialState.join(',')]);

  const finalStateValue = table[table.length - 1].value;

  for (const state of states) {
    const isFinalState = !!state
      .split(',')
      .find(elem => parseInt(elem) === finalStateValue);

    afd.addState(state, { isFinal: isFinalState });

    const transitions = state
      .split(',')
      .map(pos => table.find(elem => elem.value === parseInt(pos)));

    // console.log(transitions);

    const transitionLabels = [
      ...new Set(transitions.map(({ label }) => label)),
    ];

    transitionLabels.forEach(label => {
      const newState = transitions
        .filter(transition => transition.label === label)
        .reduce((acc, transition) => [...acc, ...transition.followPos], [])
        .join(',');

      if (!newState) return;

      states.add(newState);
      afd.addTransition(state, label, newState);
    });
  }

  return afd;
}

// '(a|bb(a|b)*)*abb'
// '(a|b)*abb'
// '(ab|b)*abb'

const str = fs.readFileSync('regex-input.txt', 'utf-8');
const rpnRegEx = getRpnRegEx(str);
const rpnTokens = getTokens(rpnRegEx);
const nullable = getNullable(rpnTokens);
const firstPos = getFirstPos(rpnTokens, nullable);
const lastPos = getLastPos(rpnTokens, nullable);
const followPos = getFollowPos(rpnTokens, firstPos, lastPos);

console.log(getAFD(rpnTokens, firstPos, lastPos, followPos).states);

// Merge numai in browser
if (typeof window !== 'undefined') {
  import('p5').then(p5 => {
    console.log(p5);

    const afd = {
      '1,2,3': { isFinal: false, a: ['1,2,3,4'], b: ['1,2,3'] },
      '1,2,3,4': { isFinal: false, a: ['1,2,3,4'], b: ['1,2,3,5'] },
      '1,2,3,5': { isFinal: false, a: ['1,2,3,4'], b: ['1,2,3,6'] },
      '1,2,3,6': { isFinal: true, a: ['1,2,3,4'], b: ['1,2,3'] },
    };

    function randomColor() {
      return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }

    let s = ctx => {
      const padding = 0;
      const stateSpacing = 80;
      const stateSize = 80;

      ctx.setup = () => {
        ctx.createCanvas(window.innerWidth, window.innerHeight);

        ctx.background(255);

        const states = Object.keys(afd);

        function drawArrow(base, vec, myColor) {
          ctx.push();
          ctx.stroke(myColor);
          ctx.strokeWeight(3);
          ctx.fill(myColor);
          ctx.translate(base.x, base.y);
          // ctx.arc(10, 10, vec.x, vec.y, 0, ctx.PI + ctx.QUARTER_PI, ctx.OPEN);
          ctx.line(0, 0, vec.x, vec.y);
          ctx.rotate(vec.heading());
          let arrowSize = 7;
          ctx.translate(vec.mag() - arrowSize, 0);
          ctx.triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
          ctx.pop();
        }

        ctx.textSize(20);
        ctx.stroke(38, 148, 251);
        states.forEach((stateLabel, index) => {
          const stateX =
            padding + stateSize / 2 + index * (stateSize + stateSpacing);
          const stateY = padding + stateSize / 2;
          ctx.strokeWeight(3);

          const state = afd[stateLabel];

          if (index !== 0) {
            if (afd[stateLabel].isFinal) {
              ctx.stroke(78, 211, 2);
            } else {
              ctx.stroke(0);
            }
          }
          ctx.fill('#fff');
          ctx.circle(stateX, stateY, stateSize);

          ctx.fill('#000');
          ctx.stroke(0);
          ctx.strokeWeight(0);
          ctx.text(stateLabel, stateX, stateY);

          const transitions = Object.keys(afd[stateLabel]).filter(
            key => !['isFinal'].includes(key)
          );

          transitions.forEach((transitionLabel, transitionIndex) => {
            state[transitionLabel].forEach((destination, destinationIndex) => {
              const destinationStateIndex = states.indexOf(destination);
              const destinationStateX =
                padding +
                stateSize / 2 +
                (-index + destinationStateIndex) * (stateSize + stateSpacing);
              const destinationStateY = 0;

              const color = randomColor();

              ctx.fill(color);
              ctx.text(
                transitionLabel,
                stateX,
                stateY + (1 + transitionIndex) * 20
              );

              drawArrow(
                ctx.createVector(stateX, stateY + (1 + transitionIndex) * 20),
                ctx.createVector(destinationStateX, destinationStateY + 10),
                color
              );

              console.log({ destinationStateIndex });
              console.log(index - destinationStateIndex);
            });
          });
        });
      };
    };

    new p5(s);
  });
}
