import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { loadScript } from '../helpers/load-script.js';
import vm from 'node:vm';

class MockObserver {
  constructor(callback) {
    this.callback = callback;
    this.observe = vi.fn();
    this.disconnect = vi.fn();
  }
}

function createChromeMock() {
  return {
    storage: {
      sync: {
        get(defaults, callback) {
          callback(defaults);
        },
      },
    },
  };
}

function createDom() {
  return new JSDOM(
    `<!doctype html>
    <html>
      <body>
        <div class="main-inner" style="background-color: rgb(12, 34, 56);"></div>
        <div class="ide-header"></div>
        <div class="ide-content"></div>
        <div class="cg-ide-statement"></div>
        <div class="menu">
          <div class="menu-entries">
            <div class="menu-entry settings"></div>
          </div>
        </div>
        <div class="bloc-header"></div>
        <div class="statement-bloc" style="right: 24px;"></div>
        <div class="testcases-actions-container" style="left: 16px;"></div>
        <div class="console-bloc">
          <button class="unminimize-button"></button>
          <div class="header-buttons"></div>
        </div>
      </body>
    </html>`,
    {
      runScripts: 'outside-only',
      url: 'https://www.codingame.com/ide/test',
    },
  );
}

function runInDomContext(dom, source) {
  return vm.runInContext(source, dom.getInternalVMContext());
}

describe('content.js timestamp behavior', () => {
  let dom;

  beforeEach(() => {
    dom = createDom();
    dom.window.chrome = createChromeMock();
    dom.window.self = dom.window;
    dom.window.showOpenFilePicker = () => {};
    dom.window.ResizeObserver = MockObserver;
    dom.window.MutationObserver = MockObserver;
    dom.window.CustomEvent = class CustomEvent extends dom.window.Event {
      constructor(name, params = {}) {
        super(name, params);
        this.detail = params.detail;
      }
    };
    loadScript(dom, 'src/content.js');
  });

  it('creates a timestamp label in the header', () => {
    dom.window.updateTimestampDisplay();

    const timestamp = dom.window.document.querySelector('.code-timestamp');
    expect(timestamp).not.toBeNull();
    expect(timestamp.textContent).toMatch(/^Last synchronized:/);
  });

  it('restores the timestamp after the header is recreated while sync is active', () => {
    runInDomContext(dom, 'state.sync.local.active = true; state.isInitialized = true;');
    dom.window.updateTimestampDisplay();

    dom.window.document.querySelector('.bloc-header').remove();
    const replacementHeader = dom.window.document.createElement('div');
    replacementHeader.className = 'bloc-header';
    dom.window.document.body.appendChild(replacementHeader);

    dom.window.handlePageChanges();

    const timestamp = dom.window.document.querySelector('.code-timestamp');
    expect(timestamp).not.toBeNull();
    expect(timestamp.parentElement).toBe(replacementHeader);
  });

  it('removes the timestamp when sync is inactive', () => {
    dom.window.updateTimestampDisplay();

    dom.window.maybeRemoveTimestamp();

    expect(dom.window.document.querySelector('.code-timestamp')).toBeNull();
  });
});

describe('content.js feature behavior', () => {
  let dom;

  beforeEach(() => {
    dom = createDom();
    dom.window.chrome = createChromeMock();
    dom.window.self = dom.window;
    dom.window.showOpenFilePicker = () => {};
    dom.window.ResizeObserver = MockObserver;
    dom.window.MutationObserver = MockObserver;
    dom.window.CustomEvent = class CustomEvent extends dom.window.Event {
      constructor(name, params = {}) {
        super(name, params);
        this.detail = params.detail;
      }
    };
    loadScript(dom, 'src/content.js');
  });

  it('enables and disables pro layout without disturbing the rest of the DOM', () => {
    let unminimizeClicks = 0;
    dom.window.document.querySelector('.unminimize-button')
      .addEventListener('click', () => { unminimizeClicks += 1; });

    dom.window.toggleProLayout(true);

    expect(dom.window.document.body.classList.contains('pro-layout-active')).toBe(true);
    expect(dom.window.document.querySelector('.console-bloc').style.left).toBe('16px');
    expect(dom.window.document.querySelector('.testcases-actions-container').style.right).toBe('24px');
    expect(dom.window.document.querySelector('.console-bloc .header-buttons').style.display).toBe('none');
    expect(unminimizeClicks).toBe(1);
    expect(dom.window.localStorage.getItem('isProLayoutActive')).toBe('true');

    dom.window.toggleProLayout(false);

    expect(dom.window.document.body.classList.contains('pro-layout-active')).toBe(false);
    expect(dom.window.document.querySelector('.console-bloc').style.left).toBe('');
    expect(dom.window.document.querySelector('.testcases-actions-container').style.right).toBe('');
    expect(dom.window.document.querySelector('.console-bloc .header-buttons').style.display).toBe('');
    expect(dom.window.localStorage.getItem('isProLayoutActive')).toBe('false');
  });

  it('applies zen mode by hiding the IDE chrome and adding the top bar', () => {
    dom.window.initializeZen();

    expect(dom.window.document.querySelector('.ide-header').hidden).toBe(true);
    expect(dom.window.document.querySelector('.cg-ide-statement').hidden).toBe(true);
    expect(dom.window.document.querySelector('.menu').hidden).toBe(true);
    expect(dom.window.document.querySelector('.ide-content').style.top).toBe('10px');
    expect(dom.window.document.querySelector('.ide-content').style.height).toBe('calc(100% - 10px)');

    const zenBar = [...dom.window.document.body.children]
      .find((element) => element.style.height === '10px' && element.style.pointerEvents === 'none');
    expect(zenBar).toBeDefined();
    expect(zenBar.style.backgroundColor).toBe('rgb(12, 34, 56)');
  });

  it('creates feature buttons and wires zen mode from the generated menu', () => {
    runInDomContext(dom, 'state.isInitialized = false; state.isProLayoutActive = false;');

    dom.window.initializeUI({
      proLayout: true,
      uploadCode: false,
      syncLocal: true,
      syncOnline: false,
      consoleSpace: false,
      zenMode: true,
    });

    expect(dom.window.document.querySelector('.pro-layout-button')).not.toBeNull();
    expect(dom.window.document.querySelector('.sync-local-button')).not.toBeNull();
    expect(dom.window.document.querySelector('.zen-mode-button')).not.toBeNull();
    expect(runInDomContext(dom, 'state.isInitialized')).toBe(true);

    dom.window.document.querySelector('.zen-mode-button').click();

    expect(dom.window.document.querySelector('.ide-header').hidden).toBe(true);
    expect(dom.window.document.querySelector('.menu').hidden).toBe(true);
    expect(dom.window.document.querySelector('.zen-mode-button').classList.contains('selected')).toBe(true);
  });
});
