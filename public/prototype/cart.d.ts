type Item = { id: string; status: string };
export function read(products: readonly Item[]): Record<string, number>;
export function change(products: readonly Item[], id: string, delta: number): Record<string, number>;
