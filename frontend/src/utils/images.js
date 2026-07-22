const VARIANT_WIDTHS = [400, 800, 1600];

/**
 * Builds the srcSet attribute for a photo, if the backend generated
 * responsive variants for it at upload time (photo.has_variants).
 * Variant files are named `<base>-<width>w.webp` next to the main
 * `photo.filename`.
 * @param {{filename: string, has_variants?: number|boolean}} photo
 * @returns {string|undefined}
 */
export function getSrcSet(photo) {
    if (!photo?.has_variants) return undefined;

    const base = photo.filename.replace(/\.[^./]+$/, '');
    return VARIANT_WIDTHS.map((width) => `/uploads/${base}-${width}w.webp ${width}w`).join(', ');
}
