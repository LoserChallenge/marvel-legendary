---
name: block-asset-edits
enabled: true
event: file
action: block
tool_matcher: Edit|Write|MultiEdit
conditions:
  - field: file_path
    operator: regex_match
    pattern: (Visual Assets|Audio Assets)
---

🚫 **Asset folder is read-only**

You attempted to edit a file inside `Visual Assets/` or `Audio Assets/`. These folders contain binary image and audio files that should never be directly edited.

**If you need to:**
- Replace an image → copy the new file manually into the folder
- Reference an asset → update the path in `index.html`, `script.js`, or `styles.css` instead
