## 2024-05-31 - Keyboard Accessibility for Custom File Dropzone
**Learning:** Hidden file inputs inside `div` dropzones completely break keyboard navigation unless the wrapper `div` is explicitly made focusable (`tabIndex={0}`), given a semantic role (`role="button"`), and wired to proxy keyboard events (Enter/Space) to the hidden input.
**Action:** Always verify keyboard accessibility on custom dropzones and proxy both `onClick` and `onKeyDown` to hidden file inputs.
