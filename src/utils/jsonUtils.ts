/**
 * converts raw json data (as string) to object.
 * Detects ISO date strings and converts them to Date
 * @param raw json data as string
 */
export function jsonDateEnhancer(raw: string) {
  const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+Z?$/;

  function reviver(key: string, value: any) {
    if (typeof value === "string" && dateFormat.test(value)) {
      return new Date(value);
    }
    return value;
  }
  return JSON.parse(raw, reviver);
}
