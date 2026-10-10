# Gem Artwork Assets

Each gem type has its own folder. The app loads transparent image layers from these subfolders and stacks them in this order:

1. `bases`: white gem shape, or the shattered shard replacement.
2. `colors`: prefix- or color-specific multiply-blended overlay, masked to the base.
3. `highlights`: highlight for the selected base cut; independent of prefix and color.
4. `extras`: prefix markings and other unblended details, masked to the base.
5. `status`: crack overlay for the selected base cut, or shattered overlay over a replacement shard base.

Assets can be supplied as either `<name>.png` or `<name>.gif`; the game tries PNG first, then GIF. If both exist, PNG is used. Animated GIFs work as layers, and gem overlays use the loaded base image as their mask. Keep the same 512 x 512 canvas and use transparency where appropriate. Existing `.png.txt` placeholders show the expected basename; use that basename with either image extension. Folder names follow the existing type folders; `Amethyst`, `Lapis Lazuli`, `Porcelain`, `Rhodonite`, `Tiger's Eye`, and `Hawk's Eye` use the existing folder names `amythyst`, `lapiz lazuli`, `porceline`, `rhodanite`, `tigers eye`, and `hawks eye`.

Run `node Assets/gems/generate-placeholders.js` from the project root to add placeholders for new gem types or prefixes in `gemData.js`. Existing PNGs and notes are left untouched.

## Bases

The regular base is named `<type>-base-normal.png` or `.gif`. Defective and perfect bases use `<type>-base-defective` and `<type>-base-perfect` with either extension. A `-2` variant is also provided for each cut; the game randomly picks between the two. Defective gems use the defective base 20% of the time, and perfect gems use the perfect base 10% of the time. All other rolls use the normal base. Matching highlights use `<type>-highlight-<base-cut>`; cracks use `<type>-crack-<base-cut>`.

Spinel additionally has `<prefix>-spinel-base-<cut>` bases for every prefix in its generation table. A matching prefix base takes precedence over the generic Spinel base; if its image has not been added yet, the generic Spinel base is used.

## Overlays

Color-specific overlays use two variants named `<type>-<color>-1` and `<type>-<color>-2` (for example, `agate-blue-1`). Prefix-specific overlays use `<prefix>-<type>` (for example, `pink-sapphire` or `star-sapphire`). If an optional overlay is missing in both formats, it is omitted and the base gem remains visible. `highlights` do not use these prefix/color names; they always follow the selected base cut. Prefix-specific extras use the matching prefix stem and may have a `-2` randomized variant.

Jasper's `Redstripe` prefix randomly selects `redstripe-jasper1` or `redstripe-jasper2` for its color and extras layers.

## Status

Shattered gems replace the normal base with `status/gem-shard-<type>`, then apply `status/shattered-<type>` when supplied.