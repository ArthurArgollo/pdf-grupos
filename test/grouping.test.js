import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addFileToGroup,
  downloadName,
  getUngrouped,
  isPdf,
  moveFile,
  removeFileFromGroups,
} from '../src/grouping.js';

const files = [{ id: 'a', name: 'a.pdf' }, { id: 'b', name: 'b.pdf' }, { id: 'c', name: 'c.txt' }];
const groups = [{ id: 'g1', files: ['a'] }, { id: 'g2', files: [] }];

test('identifica PDFs por MIME type ou extensão', () => {
  assert.equal(isPdf({ type: 'application/pdf', name: 'arquivo.bin' }), true);
  assert.equal(isPdf({ type: '', name: 'arquivo.PDF' }), true);
  assert.equal(isPdf({ type: 'text/plain', name: 'arquivo.txt' }), false);
});

test('encontra arquivos sem grupo', () => {
  assert.deepEqual(getUngrouped(files, groups).map((file) => file.id), ['b', 'c']);
});

test('move um arquivo para outro grupo e remove do anterior', () => {
  assert.deepEqual(addFileToGroup(groups, 'a', 'g2'), [{ id: 'g1', files: [] }, { id: 'g2', files: ['a'] }]);
});

test('remove um arquivo de todos os grupos', () => {
  assert.deepEqual(removeFileFromGroups(groups, 'a'), [{ id: 'g1', files: [] }, { id: 'g2', files: [] }]);
});

test('reordena arquivos dentro do grupo', () => {
  const source = [{ id: 'g1', files: ['a', 'b', 'c'] }];
  assert.deepEqual(moveFile(source, 'g1', 1, -1)[0].files, ['b', 'a', 'c']);
  assert.deepEqual(moveFile(source, 'g1', 1, 1)[0].files, ['a', 'c', 'b']);
  assert.deepEqual(moveFile(source, 'g1', 0, -1)[0].files, ['a', 'b', 'c']);
});

test('gera nome seguro para o PDF baixado', () => {
  assert.equal(downloadName('Meu Grupo 2026!'), 'meu-grupo-2026.pdf');
  assert.equal(downloadName('   '), 'grupo.pdf');
});
