## 2024-05-29 - Accessible Drag-and-Drop Zones
**Learning:** The `input[type="file"]` is often hidden in custom drag-and-drop file upload zones. If the wrapper `div` lacks a `role`, `tabIndex`, and keyboard handlers (`onKeyDown`), the primary action of the component is completely inaccessible to keyboard users.
**Action:** Always ensure that custom file upload wrappers have `role="button"`, `tabIndex={0}`, an `onKeyDown` handler to trigger the hidden file input on "Enter" or "Space", and `focus-visible` styles for visual feedback.
