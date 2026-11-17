/** Fills in {placeholders}: fmt("Step {n}", { n: 2 }) → "Step 2". Unknown names are left as they are. */
export function fmt(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (whole, key: string) => (key in vars ? String(vars[key]) : whole));
}
