![icon](icons/icon96.png)

# CodinGame Pro Mode

> [Install from Chrome Web Store](https://chromewebstore.google.com/detail/fleeplnobejocpmlphmbhlnhnimoglpa)

Do you prefer coding in your own local editor? This extension optimizes the CodinGame UI for you. It hides the unused online editor to reclaim screen space, provides an expanded console, offers seamless code synchronization with your local files and more!


## Key Features
* **Pro Layout**: A minimalist layout that hides the online editor and maximizes space for the console
* Two-Way Code Synchronization:
  * **Sync Local**: Changes to your local file are instantly sent to the online editor
  * **Sync Online**: Changes in the online editor are instantly saved to your local file
* **Configurable**: Enable or disable features easily from the extension's popup menu

## Pro Layout

Click the **Pro Layout** button to optimize the UI. This action:
* Hides the code editor
* Moves the 'Console output' to the right
* Moves 'Players' and 'Actions' to the left, under the game visualization

This is a toggle button. Click it again to restore the default layout.

![screenshot](images/screenshot.png)
*Screenshot showing how **Pro Layout** looks in practice.*

## Code Synchronization

This extension offers code synchronization functionality, with no external apps needed. You can choose to use a one-way sync or a two-way sync. Just click one of the buttons and select a local file that will be synchronized.

### Browser support

* **Edge**: works out of the box
* **Chrome**: works out of the box
* **Brave**: works if API is enabled
* **Firefox**: currently not supported

Synchronization requires the **File System Access API**. If this API is disabled or not supported, the synchronization cannot be enabled. Other features like **Pro Layout** will still work perfectly. To manually enable the API, go to: `chrome://flags/#file-system-access-api`. As an alterative to synchronization, there's also a one-time **Upload Code** feature available. You can enable it from the popup menu.

## Popup menu

You can enable or disable individual features from the extension's popup menu.
Refresh the CodinGame website after making changes for them to take effect.

![popup](images/popup.png)

## Troubleshooting

> Synchronization feature does not work

This usually means the File System Access API is not available in your browser.

* If you are using a compatible browser like Brave, try enabling the API manually at `chrome://flags/#file-system-access-api`
* If you cannot resolve the issue, you can disable the sync features entirely from the extension's popup menu

> How can I use this on Firefox?

Firefox does not currently support the necessary subset of File System Access API.
While the code synchronization won't work, you can still install the extension manually to use other features:
1. Download the source code of this extension
2. Follow the official guide for [temporary installation in Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox)

## Development

Install test dependencies with `npm install`.

Run unit tests with `npm run test:unit`.

Run the extension smoke test with `npm run test:e2e`.
