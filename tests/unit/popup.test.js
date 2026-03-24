import { beforeEach, describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { loadScript } from '../helpers/load-script.js';

function createChromeMock(settings = {}) {
  const store = { ...settings };

  return {
    storage: {
      sync: {
        get(defaults, callback) {
          callback({ ...defaults, ...store });
        },
        set(update) {
          Object.assign(store, update);
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
        <div id="container"></div>
        <div id="settings-container"></div>
        <p id="description-field"></p>
      </body>
    </html>`,
    {
      runScripts: 'outside-only',
      url: 'https://example.test/src/popup.html',
    },
  );
}

describe('popup.js', () => {
  let dom;

  beforeEach(() => {
    dom = createDom();
    dom.window.chrome = createChromeMock({ syncLocal: false });
    dom.window.self = dom.window;
    dom.window.showOpenFilePicker = () => {};
    loadScript(dom, 'src/popup.js');
  });

  it('formats camelCase labels for display', () => {
    expect(dom.window.camelCaseToLabel('syncLocal')).toBe('Sync Local');
    expect(dom.window.camelCaseToLabel('zenMode')).toBe('Zen Mode');
  });

  it('creates popup switches from stored settings on DOMContentLoaded', () => {
    dom.window.initializePopup();

    const checkboxCount = dom.window.document.querySelectorAll('input[type="checkbox"]').length;
    const syncLocal = dom.window.document.getElementById('syncLocal');
    const proLayout = dom.window.document.getElementById('proLayout');

    expect(checkboxCount).toBe(6);
    expect(Boolean(syncLocal)).toBe(true);
    expect(Boolean(proLayout)).toBe(true);
    expect(syncLocal.checked).toBe(false);
    expect(proLayout.checked).toBe(true);
  });

  it('shows the setting description on hover', () => {
    const switchElement = dom.window.createSwitch('syncLocal', 'Sync Local', true);
    dom.window.document.getElementById('settings-container').appendChild(switchElement);

    switchElement.dispatchEvent(new dom.window.MouseEvent('mouseenter', { bubbles: true }));
    expect(dom.window.document.getElementById('description-field').textContent)
      .toContain('Pick a local file');

    switchElement.dispatchEvent(new dom.window.MouseEvent('mouseleave', { bubbles: true }));
    expect(dom.window.document.getElementById('description-field').textContent)
      .toContain('Refresh CodinGame website');
  });
});
