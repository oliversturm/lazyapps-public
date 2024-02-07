import bcrypt from 'bcryptjs';
import readline from 'readline';
import { Writable } from 'stream';
import { Buffer } from 'buffer';

// solutions for readline prompts without echos are
// abundant but also hacky, so I'll just output
// the prompt string separately and disable
// output for the actual password input

const deadend = new Writable({
  write: (chunk, encoding, callback) => {
    callback();
  },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: deadend,
  terminal: true,
});

const prompt = (question) =>
  new Promise((resolve) => {
    process.stdout.write(question);
    return rl.question(question, (result) => {
      process.stdout.write('\n');
      resolve(result);
    });
  });

prompt('Password: ').then((password) => {
  const hash = Buffer.from(bcrypt.hashSync(password, 10)).toString('base64');
  console.log(`Password: (${password?.length || '0'} chars), hash: ${hash}`);
  rl.close();
});
