'use strict';

const DEFAULT_SETTINGS = {
    proLayout: true,
    uploadCode: false,
    syncLocal: true,
    syncOnline: false,
    consoleSpace: false,
    zenMode: false,
};

// --- LOGGING ---
const libName = 'CodinGame Pro Mode';
const styles = 'background: #5c3cd4; color: #fff; padding: 2px 6px; border-radius: 3px;';
const logError = (...args) => console.error(`%c${libName}`, styles, ...args);
const log = (...args) => console.log(`%c${libName}`, styles, ...args);
// --- END LOGGING ---


// --- CONSTANTS ---
const IS_FIREFOX = navigator.userAgent.toLowerCase().includes('firefox');
const FSO_API_AVAILABLE = 'showOpenFilePicker' in self && typeof window.showOpenFilePicker === 'function';

const ICONS = {
    PRO_LAYOUT: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" class="pro-icon"><path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/></svg>`,
    SYNC_UP: `<svg fill="currentColor" viewBox="0 0 24 24" class="pro-icon" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" opacity="0"/><path d="M17.67 7A6 6 0 0 0 6.33 7a5 5 0 0 0-3.08 8.27A1 1 0 1 0 4.75 14 3 3 0 0 1 7 9h.1a1 1 0 0 0 1-.8 4 4 0 0 1 7.84 0 1 1 0 0 0 1 .8H17a3 3 0 0 1 2.25 5 1 1 0 0 0 .09 1.42 1 1 0 0 0 .66.25 1 1 0 0 0 .75-.34A5 5 0 0 0 17.67 7z"/><path d="M14.31 16.38L13 17.64V12a1 1 0 0 0-2 0v5.59l-1.29-1.3a1 1 0 0 0-1.42 1.42l3 3A1 1 0 0 0 12 21a1 1 0 0 0 .69-.28l3-2.9a1 1 0 1 0-1.38-1.44z" transform="rotate(180, 12, 16.5)"/></svg>`,
    SYNC_DOWN: `<svg fill="currentColor" viewBox="0 0 24 24" class="pro-icon" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" opacity="0"/><path d="M17.67 7A6 6 0 0 0 6.33 7a5 5 0 0 0-3.08 8.27A1 1 0 1 0 4.75 14 3 3 0 0 1 7 9h.1a1 1 0 0 0 1-.8 4 4 0 0 1 7.84 0 1 1 0 0 0 1 .8H17a3 3 0 0 1 2.25 5 1 1 0 0 0 .09 1.42 1 1 0 0 0 .66.25 1 1 0 0 0 .75-.34A5 5 0 0 0 17.67 7z"/><path d="M14.31 16.38L13 17.64V12a1 1 0 0 0-2 0v5.59l-1.29-1.3a1 1 0 0 0-1.42 1.42l3 3A1 1 0 0 0 12 21a1 1 0 0 0 .69-.28l3-2.9a1 1 0 1 0-1.38-1.44z"/></svg>`,
    UPLOAD_CODE: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="pro-icon" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/></svg>`,
    ZEN_MODE: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" class="pro-icon"> <path d="M9.167 4.5a1.167 1.167 0 1 1-2.334 0 1.167 1.167 0 0 1 2.334 0"/> <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M1 8a7 7 0 0 1 7-7 3.5 3.5 0 1 1 0 7 3.5 3.5 0 1 0 0 7 7 7 0 0 1-7-7m7 4.667a1.167 1.167 0 1 1 0-2.334 1.167 1.167 0 0 1 0 2.334"/> </svg>`
};
// --- END CONSTANTS ---


// --- STATE MANAGEMENT ---
// Grouping state variables into a single object for better organization.
const state = {
    isInitialized: false,
    isProLayoutActive: localStorage.getItem('isProLayoutActive') !== 'false',
    proLayoutObserver: null,
    consoleResizeObserver: null,
    currentCode: '',
    sync: {
        local: {
            active: false, lastModified: 0,
        }, online: {
            active: false,
        }, fileHandle: null,
    },
};
// --- END STATE MANAGEMENT ---


// --- HELPER UTILITIES ---
/**
 * Verifies and, if necessary, requests a permission for a file handle.
 * @param {FileSystemFileHandle} fileHandle The file handle to check.
 * @param {'read' | 'readwrite'} mode The permission mode to check.
 * @returns {Promise<boolean>} True if permission is granted, false otherwise.
 */
async function verifyPermission(fileHandle, mode) {
    const options = { mode };
    if ((await fileHandle.queryPermission(options)) === 'granted') return true;
    if ((await fileHandle.requestPermission(options)) === 'granted') return true;
    logError(`Permission for "${mode}" was not granted.`);
    return false;
}

/**
 * Gets a file handle, requesting it from the user if one is not already stored.
 * @param {'read' | 'readwrite'} mode The permission needed for the handle.
 * @returns {Promise<boolean>} True if the handle was acquired and has permission.
 */
async function getFileHandle(mode) {
    try {
        if (!state.sync.fileHandle) {
            const [newHandle] = await window.showOpenFilePicker();
            state.sync.fileHandle = newHandle;
        }
        return await verifyPermission(state.sync.fileHandle, mode);
    } catch (error) {
        if (error.name === 'AbortError') {
            log("User aborted the file picker.");
        } else {
            logError("Error getting file handle:", error);
        }
        return false;
    }
}

/**
 * Dispatches a custom event to communicate with the page's scripts.
 * @param {string} eventName The name of the custom event.
 * @param {object} detail The data to send with the event.
 */
function dispatchCustomEvent(eventName, detail) {
    const eventData = IS_FIREFOX ? cloneInto(detail, window) : detail;
    window.document.dispatchEvent(new CustomEvent(eventName, { detail: eventData }));
}

/**
 * Creates or updates the timestamp display in the UI.
 */
function updateTimestampDisplay() {
    let codeTimestamp = document.querySelector(".code-timestamp");
    if (!codeTimestamp) {
        const codeManagement = document.querySelector(".bloc-header");
        if (!codeManagement) return; // Exit if the target element isn't there
        codeTimestamp = document.createElement('div');
        codeTimestamp.className = 'code-timestamp';
        codeManagement.appendChild(codeTimestamp);
        log("Created timestamp display.");
    }
    codeTimestamp.textContent = `Last synchronized: ${new Date().toLocaleString()}`;
}

/**
 * Removes the timestamp display if no sync processes are active.
 */
function maybeRemoveTimestamp() {
    if (state.sync.local.active || state.sync.online.active) return;
    const codeTimestamp = document.querySelector(".code-timestamp");
    if (codeTimestamp) {
        log("Removing timestamp display.");
        codeTimestamp.remove();
    }
}

/**
 * Clears the file handle if no sync processes are active.
 */
function maybeClearFileHandle() {
    if (!state.sync.local.active && !state.sync.online.active) {
        state.sync.fileHandle = null;
    }
}


function createThrottledObserver(ObserverClass, callback, delay) {
    let timer = null;

    return new ObserverClass((...args) => {
        if (timer) return;

        timer = setTimeout(() => {
            timer = null;
            callback(...args);
        }, delay);
    });
}

// --- END HELPER UTILITIES ---


// --- PRO LAYOUT FUNCTIONALITY ---
function toggleProLayout(enable) {
    state.isProLayoutActive = enable;
    localStorage.setItem('isProLayoutActive', enable);
    document.body.classList.toggle('pro-layout-active', enable);

    const consoleBlock = document.querySelector('.console-bloc');
    const actionsBlock = document.querySelector('.testcases-actions-container');
    const consoleHeaderButtons = document.querySelector('.console-bloc .header-buttons');

    if (enable) {
        if (!consoleBlock || !actionsBlock) return;

        // Auto-unminimize the console when activating
        const unminimizeButton = document.querySelector('.console-bloc .unminimize-button');
        if (unminimizeButton) unminimizeButton.click();
        if (consoleHeaderButtons) consoleHeaderButtons.style.display = 'none';

        // This function keeps the console and actions blocks aligned.
        const syncPanelPosition = () => {
            const statementBlock = document.querySelector('.statement-bloc');
            if (!statementBlock) return;
            const targetLeft = actionsBlock.style.left;
            const targetRight = statementBlock.style.right;
            if (targetLeft && consoleBlock.style.left !== targetLeft) consoleBlock.style.left = targetLeft;
            if (targetRight && actionsBlock.style.right !== targetRight) actionsBlock.style.right = targetRight;
        };

        state.proLayoutObserver = new MutationObserver(syncPanelPosition);
        state.proLayoutObserver.observe(actionsBlock, { attributes: true, attributeFilter: ['style'] });
        syncPanelPosition(); // Initial sync
    } else {
        if (state.proLayoutObserver) state.proLayoutObserver.disconnect();
        state.proLayoutObserver = null;
        if (consoleBlock) consoleBlock.style.left = '';
        if (consoleHeaderButtons) consoleHeaderButtons.style.display = '';
        if (actionsBlock) actionsBlock.style.right = '';
    }
}

// --- END PRO LAYOUT FUNCTIONALITY ---


// --- SYNC FUNCTIONALITY ---

// -- UPLOAD CODE (Upload code just once) --
function initializeUploadCode() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';

    fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            logError("No file selected for upload.");
            return;
        }

        try {
            const text = await file.text();
            updateEditorCode(text);
            log("Code uploaded from local file.");
        } catch (error) {
            logError("Failed to read file:", error);
        }

        event.target.value = '';
    }

    const menuContainer = document.querySelector('.menu-entries');
    menuContainer.appendChild(fileInput);
    return fileInput;
}


// -- SYNC LOCAL (Upload from File to Editor) --
function updateEditorCode(code) {
    if (!code) return;
    log("Updating editor code from local file.");
    state.currentCode = code;
    const cleanCode = code.replace(/\r\n|\r/g, '\n');
    dispatchCustomEvent('ExternalEditorToIDE', { status: 'updateCode', code: cleanCode });
    updateTimestampDisplay();
}

async function observeFileForChangesLoop() {
    if (!state.sync.local.active) return;

    try {
        if (!await verifyPermission(state.sync.fileHandle, 'read')) {
            stopSyncLocal();
            return;
        }

        const file = await state.sync.fileHandle.getFile();
        if (file.lastModified > state.sync.local.lastModified) {
            log("Detected file change, updating editor.");
            state.sync.local.lastModified = file.lastModified;
            updateEditorCode(await file.text());
        }

        setTimeout(observeFileForChangesLoop, 500);
    } catch (error) {
        logError("Error observing file, stopping sync.", error);
        stopSyncLocal();
    }
}

async function startSyncLocal() {
    if (state.sync.local.active) return;
    if (!FSO_API_AVAILABLE) {
        alert("File System Access API not enabled in this browser.\n\nTry enabling:\nchrome://flags/#file-system-access-api\n\nRead more:\nhttps://github.com/sjmikler/codingame-pro-mode");
        return;
    }

    if (!await getFileHandle('read')) return;

    // Set active state before doing anything else
    state.sync.local.active = true;
    document.querySelector('.sync-local-button')?.classList.add('selected');

    log("Sync Local started.");
    observeFileForChangesLoop();
}

function stopSyncLocal() {
    if (!state.sync.local.active) return;

    state.sync.local.active = false;
    document.querySelector('.sync-local-button')?.classList.remove('selected');
    maybeClearFileHandle();
    maybeRemoveTimestamp();
    log("Sync Local stopped.");
}

// -- SYNC ONLINE (Download from Editor to File) --
async function writeCodeToLocalFile(code) {
    if (!state.sync.fileHandle) {
        logError("No file handle available for writing.");
        stopSyncOnline();
        return;
    }

    try {
        const writable = await state.sync.fileHandle.createWritable();
        await writable.write(code);
        await writable.close();
        updateTimestampDisplay();

        // Prevent immediate re-upload if Sync Local is also active
        if (state.sync.local.active) {
            const file = await state.sync.fileHandle.getFile();
            state.sync.local.lastModified = file.lastModified;
        }
    } catch (error) {
        logError("Failed to write to local file. Stopping sync.", error);
        stopSyncOnline();
    }
}

async function handleSyncOnlineEvent(event) {
    if (!state.sync.online.active || !event.detail.code || event.detail.code === state.currentCode) return;
    if (!await verifyPermission(state.sync.fileHandle, 'readwrite')) {
        stopSyncOnline();
        return;
    }
    state.currentCode = event.detail.code;
    await writeCodeToLocalFile(event.detail.code);
    log("Code updated in local file.");
}

async function startSyncOnline() {
    if (state.sync.online.active) return;
    if (!FSO_API_AVAILABLE) {
        alert("File System Access API not enabled in this browser.\n\nTry enabling:\nchrome://flags/#file-system-access-api\n\nRead more:\nhttps://github.com/sjmikler/codingame-pro-mode");
        return;
    }

    if (!await getFileHandle('readwrite')) return;

    state.sync.online.active = true;
    document.querySelector('.sync-online-button')?.classList.add('selected');

    // Enable CodinGame's internal sync and request initial code
    dispatchCustomEvent('ExternalEditorToIDE', { status: 'synchronized', value: true });
    dispatchCustomEvent('ExternalEditorToIDE', { status: 'getCode' });

    log("Sync Online started. Your local file will now be updated.");
}

function stopSyncOnline() {
    if (!state.sync.online.active) return;

    // Disable CodinGame's internal sync
    dispatchCustomEvent('ExternalEditorToIDE', { status: 'synchronized', value: false });

    state.sync.online.active = false;
    document.querySelector('.sync-online-button')?.classList.remove('selected');
    maybeClearFileHandle();
    maybeRemoveTimestamp();
    log("Sync Online stopped.");
}

// --- END SYNC FUNCTIONALITY ---


// --- INITIALIZATION ---
/**
 * A reusable function to create a menu button.
 * @param {{id: string, text: string, icon: string, onClick: function, disabled?: boolean}} options
 */
function createMenuButton({ id, text, icon, onClick, disabled = false }) {
    const menuContainer = document.querySelector('.menu-entries');
    const settingsEntry = menuContainer?.querySelector('.menu-entry.settings');
    if (!settingsEntry) return null; // Can't add the button

    const menuEntryDiv = document.createElement('div');
    menuEntryDiv.className = `menu-entry ${id}-entry`;

    const button = document.createElement('button');
    button.className = `menu-entry-inner ${id}-button`;
    button.onclick = onClick;
    button.disabled = disabled;

    // Safely parse the SVG string into a DOM element
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(icon, "image/svg+xml");
    const svgElement = svgDoc.documentElement;

    const span = document.createElement('span');
    span.className = 'entry-label';
    span.textContent = text;
    button.appendChild(svgElement);
    button.appendChild(span);
    menuEntryDiv.appendChild(button);

    settingsEntry.insertAdjacentElement('afterend', menuEntryDiv);
    return button;
}

function maybeAddConsoleSpace(settings) {
    if (!settings.consoleSpace) return;

    const frameContainer = document.querySelector('.cg-ide-console-frame-container');
    if (!frameContainer) return;

    let consoleSpace = document.querySelector('.console-space');
    if (!consoleSpace) {
        consoleSpace = document.createElement('div');
        consoleSpace.className = 'console-space';
        frameContainer.appendChild(consoleSpace);
    }

    const keyframes = frameContainer.getElementsByClassName('keyframe');
    if (keyframes.length <= 1) return;

    const lastKeyframe = keyframes[keyframes.length - 1];
    const cgIdeConsole = document.querySelector('.cg-ide-console');
    if (!cgIdeConsole) return 0;

    if (!state.consoleResizeObserver) {
        let callback = () => {
            let height = cgIdeConsole.offsetHeight - lastKeyframe.offsetHeight - 7;
            if (height < 0) height = 0;

            const height_str = `${height}px`;
            if (consoleSpace.style.height !== height_str) {
                log("Setting virtual space height to", height_str);
                consoleSpace.style.height = height_str;
            }
        };

        state.consoleResizeObserver = createThrottledObserver(ResizeObserver, callback, 500);
    }
    state.consoleResizeObserver.disconnect();
    state.consoleResizeObserver.observe(cgIdeConsole);
    state.consoleResizeObserver.observe(lastKeyframe);
}

function initializeZen() {
    let header = document.querySelector('.ide-header');
    if (header) {
        header.hidden = true;

        const content = document.querySelector('.ide-content');
        if (content) {
            content.style.top = '10px';
            content.style.height = 'calc(100% - 10px)';
        }
    }

    let statement = document.querySelector('.cg-ide-statement');
    if (statement) statement.hidden = true;

    const zenBar = document.createElement('div');
    const colorReferece = document.querySelector('.main-inner')
    zenBar.style.position = 'absolute';
    zenBar.style.top = '0';
    zenBar.style.left = '0';
    zenBar.style.width = '100%';
    zenBar.style.height = '10px';
    zenBar.style.backgroundColor = colorReferece ? getComputedStyle(colorReferece).backgroundColor : 'black';
    zenBar.style.zIndex = '999998'; // Much higher z-index
    zenBar.style.pointerEvents = 'none'; // Allow clicking through
    document.body.appendChild(zenBar);

    let menu = document.querySelector('.menu');
    if (menu) menu.hidden = true;

    // if (menu) {
    // also add a left bar to enable the menu when hovering
    // const leftBar = document.createElement('div');
    // leftBar.style.position = 'absolute';
    // leftBar.style.top = '0';
    // leftBar.style.left = '0';
    // leftBar.style.width = '10px';
    // leftBar.style.height = '100%';
    // leftBar.style.backgroundColor = 'transparent';
    // leftBar.style.zIndex = '9999999'; // Much higher z-index
    // leftBar.style.pointerEvents = 'auto'; // Allow clicking
    // leftBar.style.transition = 'background-color 0.3s';
    // leftBar.style.transitionDelay = '0.3s'; // Delay the transition for a smoother effect


    // document.body.appendChild(leftBar);
    // leftBar.onclick = () => {
    //     menu.hidden = !menu.hidden;
    //     log("Toggled menu for Zen Mode.");
    // }
    // leftBar.onmouseenter = () => {
    //     leftBar.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    // }
    // leftBar.onmouseleave = () => {
    //     leftBar.style.backgroundColor = 'transparent';
    // }
    // document.addEventListener('mouseleave', () => {
    //     leftBar.style.backgroundColor = 'transparent';
    // })
    // }

    log("Zen Mode enabled.");
}


function initializeUI(settings) {
    if (state.isInitialized) return;

    // Zen Mode Button
    if (settings.zenMode) {
        createMenuButton({
            id: 'zen-mode', text: 'Zen Mode', icon: ICONS.ZEN_MODE, onClick: (e) => {
                e.currentTarget.classList.toggle('selected', true);
                initializeZen();
            }
        });
    }

    // Sync Online Button (Download)
    if (settings.syncOnline) {
        createMenuButton({
            id: 'sync-online',
            text: 'Sync Online',
            icon: ICONS.SYNC_DOWN,
            onClick: () => (state.sync.online.active ? stopSyncOnline() : startSyncOnline()),
        });

        if (FSO_API_AVAILABLE) {
            window.document.addEventListener('IDEToExternalEditor', handleSyncOnlineEvent);
        }
    }

    // Sync Local Button (Upload)
    if (settings.syncLocal) {
        createMenuButton({
            id: 'sync-local',
            text: 'Sync Local',
            icon: ICONS.SYNC_UP,
            onClick: () => (state.sync.local.active ? stopSyncLocal() : startSyncLocal()),
        });
    }

    if (settings.uploadCode) {
        // Initialize the upload code functionality
        const fileInput = initializeUploadCode();
        createMenuButton({
            id: 'upload-code', text: 'Upload Code', icon: ICONS.UPLOAD_CODE, onClick: () => fileInput.click(),
        });
    }

    // Pro Layout Button
    if (settings.proLayout) {
        const proLayoutButton = createMenuButton({
            id: 'pro-layout', text: 'Pro Layout', icon: ICONS.PRO_LAYOUT, onClick: (e) => {
                toggleProLayout(!state.isProLayoutActive);
                e.currentTarget.classList.toggle('selected', state.isProLayoutActive);
            }
        });
        if (proLayoutButton) proLayoutButton.classList.toggle('selected', state.isProLayoutActive);
        if (state.isProLayoutActive) toggleProLayout(true);
    }

    state.isInitialized = true;
    log("UI Initialized.");
}


function handlePageChanges() {
    // If the menu exists and we haven't initialized, run the setup.
    if (document.querySelector('.menu-entries')) {
        if (!state.isInitialized) chrome.storage.sync.get(DEFAULT_SETTINGS, initializeUI);
    }

    if (!state.isInitialized) return;
    chrome.storage.sync.get(DEFAULT_SETTINGS, maybeAddConsoleSpace);

    // If the menu disappears, reset the state.
    if (!document.querySelector('.menu-entries')) {
        log("IDE menu not found. Tearing down features.");
        if (state.sync.local.active) stopSyncLocal();
        if (state.sync.online.active) stopSyncOnline();
        state.isInitialized = false;

        if (state.consoleResizeObserver) state.consoleResizeObserver.disconnect();
        state.consoleResizeObserver = null;
    }
}

// Observe the DOM for changes to initialize the extension when the IDE loads.
const pageObserver = createThrottledObserver(MutationObserver, handlePageChanges, 500);
pageObserver.observe(document.body, { childList: true, subtree: true });
