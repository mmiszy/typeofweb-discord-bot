/* eslint no-implicit-dependencies: "off" */
/* eslint no-magic-numbers: "off" */
/* eslint no-let: "off" */
/* tslint:disable:no-implicit-dependencies no-magic-numbers */

import { expect } from 'chai';
import 'mocha';
import * as execute from './execute';

const Template = (language: string, code: string) => `!execute \`\`\`${language}
${code}
\`\`\``;

const tsCode = 'function foo(a: number) {return a * 2}; foo(2)';

describe('Command: execute', () => {
  it('parses valid message', () => {
    const code = '2 + 2';
    const message = Template('js', code);
    const parseResult = execute.parseMessage(message);
    expect(parseResult.language).to.equal('js');
    expect(parseResult.source.trim()).to.equal(code);
  });

  it('throws invalid message', () => {
    const message = '!execute ``js\nsdfs\n```';
    expect(() => execute.parseMessage(message)).to.throw();
  });

  it('sets javascript as default', () => {
    const code = '2 + 2';
    const message = Template('', code);
    const parseResult = execute.parseMessage(message);
    expect(parseResult.language).to.equal('js');
  });

  it('throws when language is not known', () => {
    expect(() => execute.executeCode('2 + 2', 'prolog')).to.throw();
  });

  it('executes simple program', () => {
    const executeResult = execute.executeCode('2 + 2', 'js');
    expect(executeResult.stdout.length).to.equal(0);
    expect(executeResult.result).to.equal(4);
  });

  it('executes typescript', () => {
    const executeResult = execute.executeCode(tsCode, 'ts');
    expect(executeResult).to.be.not.an('undefined');
    expect(executeResult.stdout.length).to.equal(0);
    expect(executeResult.result).to.equal(4);
  });

  it('displays objects as jsons', () => {
    const code = 'console.log({foo: "bar"})';
    const executeResult = execute.executeCode(code, 'js');
    expect(executeResult.stdout.length).to.be.equal(1);
    expect(executeResult.stdout[0]).to.be.equal('{"foo":"bar"}');
  });

  it('grabs console.log', () => {
    const executeResult = execute.executeCode('console.log(1, 2);console.log(3, 4);', 'js');
    expect(executeResult.stdout.length).to.equal(2);
  });

  it('omitts long output log', () => {
    const iters = 2000;
    const executeResult = execute.executeCode(`for(let i=0; i<${iters}; i++) console.log(1)`, 'js');
    const stdout = execute.prepareOutput(executeResult);
    expect(stdout.text.length).is.not.greaterThan(execute.MaxOutputCharacters);
    expect(executeResult.stdout.length).to.equal(iters);
    expect(stdout.text.split('\n').length).is.not.greaterThan(execute.MaxOutputLines);
  });

  it('result is written', () => {
    const result = {
      stdout: ['hello', 'world'],
      result: 5,
      time: 10,
    };
    const expected = [
      'Wyjście (2 linie): ```',
      'hello',
      'world',
      '```',
      'Wynik (10 ms): ```json',
      '5',
      '```',
    ].join('\n');
    const response = execute.writeResponse(result);
    expect(response).to.be.equal(expected);
  });

  it('"output" is omitted when none', () => {
    const result = {
      stdout: [],
      result: 5,
      time: 10,
    };
    const expected = ['Wynik (10 ms): ```json', '5', '```'].join('\n');
    const response = execute.writeResponse(result);
    expect(response).to.be.equal(expected);
  });

  it('throws when code executes dangerous code', () => {
    const dangerous = [
      'while(1){}',
      'let fs = require("fs")',
      'let fs = require("child_process")',
      'process.exit(0)',
      'eval("require("fs"))',
      'new Function(""))',
    ];
    dangerous.forEach(code => {
      expect(() => execute.executeCode(code, 'js')).to.throw();
    });
  });
});
