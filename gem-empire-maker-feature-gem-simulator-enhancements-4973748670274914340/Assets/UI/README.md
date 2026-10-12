# UI PNG Assets

Replace a `.png.txt` note with a PNG or GIF using the same basename before `.txt`. The app tries PNG first, then GIF. If neither loads, the existing coded UI remains in use.

UI PNGs are component skins. Their image fills the component bounds; interactive fields remain editable and clickable. Button PNGs replace the visible button face and label, while the button action and accessible name remain available.

Assets are grouped into `UIBoxes/`, `ProfileCards/`, `Infrastructure/`, `Profile/`, and `Bubbles/`. Diamond color buttons, editable inputs/selects, starting-menu surfaces, headers, notification panels, colony panels, status directories, and the shared structure menu are in `UIBoxes/`; gem-type profile cards are in `ProfileCards/`; structure panels and build/open/level/action buttons are in `Infrastructure/`.

`Profile/` contains separate profile box skins for every caste, gem type, placement, personality, quality, status, and guard type, plus the gallery frame, nameplate, quote, level, boosts, and guards panels. Replace a `.png.txt` note with a PNG or GIF using the same basename. PNG is preferred when both formats exist; otherwise GIF is loaded. Run `node Assets/UI/Profile/generate-placeholders.js` from the project root to create placeholders for supported game options.

Fusion profiles use `fusion-guard-ineligible-panel-ui`, `fusion-quality-box-ui`, `fusion-caste-box-ui`, and one `fusion-type-box-ui`. Their placement and personality facts use one canonical unordered-pair asset each, such as `fusion-placement-chest-forehead-box-ui` or `fusion-personality-fiery-loyal-box-ui`. The Profile placeholder generator creates all supported pairs without reversed duplicates.

`fusion-types.js` generates a list of every unordered gem-type pairing, including same-type pairings. Each fusion type defaults to `placeholder`; add individual type names to `FUSION_GEM_TYPE_OVERRIDES` to customize them.

`Bubbles/` contains transparent overlays named `bubble-<color>-card` and `bubble-<color>-menu` for red, orange, yellow, green, blue, and purple. Card overlays are used in the bubbled-gem directory; menu overlays are used on a bubbled gem's profile portrait. Run `node Assets/UI/Bubbles/generate-placeholders.js` to recreate missing overlay notes.

Textbox skins are applied as CSS backgrounds to native input/select elements. Typing, selection, focus, and their normal behavior remain active over the image. Run `node Assets/UI/generate-placeholders.js` from the project root to recreate missing categorized notes. The generator never overwrites a PNG or existing note.