import chalk from 'chalk';
import { createInterface } from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import { colord, extend } from 'colord';
import harmonies from 'colord/plugins/harmonies';
extend([harmonies]);

function getContrastingColor(background) {
  const bg = colord(background);
  const fg = bg.harmonies('complementary')[1].toHex();
  return fg;
}

const levelColors = {
  TRACE: chalk.white.bgMagenta,
  DEBUG: chalk.white.bgCyan,
  INFO: chalk.white.bgBlue,
  WARN: chalk.black.bgYellow.bold,
  ERROR: chalk.yellow.bgRed.bold,
};

const sourceColor = chalk.blue;

const correlationBackgroundColors = [
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#ff00ff',
  '#00ffff',
  '#ff8000',
  '#ff0080',
  '#0080a0',
  '#8000ff',
  '#ff8080',
  '#a0ffa0',
  '#8080ff',
  '#ffff80',
  '#ff80ff',
];

const correlationHighlighters = correlationBackgroundColors.map((bg) => ({
  highlight: chalk.bgHex(bg).hex(getContrastingColor(bg)),
}));

const specialHighlighters = {
  INIT: chalk.green.bgBlack.bold,
  'CORR-NONE': chalk.redBright.bgBlack.bold,
  undefined: chalk.redBright.bgBlack.bold,
};

const idHighlighters = {};

const pad = (s) => ` ${s} `;

let lineNo = 0;

const getHighlighter = (correlationId) => {
  lineNo++;

  if (typeof correlationId === 'undefined') {
    return { highlight: specialHighlighters['undefined'] };
  }

  if (specialHighlighters[correlationId]) {
    return { highlight: specialHighlighters[correlationId] };
  }

  // If a highlighter for this id is configured already, use it again
  if (idHighlighters[correlationId] >= 0) {
    return correlationHighlighters[idHighlighters[correlationId]];
  }
  // Find the first available highlighter, if one is available
  const unusedHighlighterIndex = correlationHighlighters.findIndex(
    (highlighter) => typeof highlighter.lastUsed === 'undefined',
  );
  if (unusedHighlighterIndex !== -1) {
    idHighlighters[correlationId] = unusedHighlighterIndex;
    correlationHighlighters[unusedHighlighterIndex].lastUsed = lineNo;
    return correlationHighlighters[unusedHighlighterIndex];
  }

  // No unused highlighter found, so find the least recently used one
  const leastRecentlyUsedHighlighterIndex = correlationHighlighters.reduce(
    (prev, current, index) =>
      current.lastUsed < prev.lastUsed
        ? { index, lastUsed: current.lastUsed }
        : prev,
    { index: -1, lastUsed: Infinity },
  ).index;
  idHighlighters[correlationId] = leastRecentlyUsedHighlighterIndex;
  correlationHighlighters[leastRecentlyUsedHighlighterIndex].lastUsed = lineNo;
  return correlationHighlighters[leastRecentlyUsedHighlighterIndex];
};

const rl = createInterface({
  input,
  //output, // no echo
  crlfDelay: Infinity,
});

let lastOutput = '';
let lfNeeded = false;

function processLines() {
  return new Promise((resolve) => {
    rl.on('line', (line) => {
      const match = line.match(
        /((?<service>[^|]+)\|\s+)?(?<date>\d{4}-\d{2}-\d{2}[\d\s:]+)\[(?<source>[^\]]+)\]\s+(?<level>\w+):\s+\[(?<correlationId>[^\]]+)\](?<rest>.*)/,
      );
      let thisOutput = '';
      if (match) {
        const { service, date, source, level, correlationId, rest } =
          match.groups;
        const levelColor = levelColors[level] || chalk.white;
        const hl = getHighlighter(correlationId);
        thisOutput = `${service ? `${service}|` : ''}${date}[${sourceColor(
          source,
        )}] ${levelColor(pad(level))}: [${hl.highlight(
          pad(correlationId),
        )}]\n -> ${rest}\n`;
      } else {
        thisOutput = `--- skipping line starting with: ${chalk.italic(
          line.slice(0, 20),
        )} ...`;
      }
      if (thisOutput !== lastOutput) {
        if (lfNeeded) {
          console.log();
          lfNeeded = false;
        }
        console.log(thisOutput);
        lastOutput = thisOutput;
      } else {
        process.stdout.write(chalk.gray('[+1]'));
        lfNeeded = true;
      }
    });

    rl.on('close', () => {
      resolve();
    });
  });
}

processLines().catch((error) => {
  console.error('Error:', error);
});
