import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

export function loadScript(dom, relativePath) {
  const scriptPath = path.resolve(process.cwd(), relativePath);
  const source = fs.readFileSync(scriptPath, 'utf8');
  vm.runInContext(source, dom.getInternalVMContext(), { filename: scriptPath });
}
