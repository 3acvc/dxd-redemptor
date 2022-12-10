/**
 * Returns true if value is proper url
 * @param urlString
 */
export function isValidURL(urlString: any): boolean {
    let url: URL;

    try {
        url = new URL(urlString);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}
