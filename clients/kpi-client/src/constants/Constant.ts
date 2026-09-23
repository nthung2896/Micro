type ConstantDefinition = Record<string, string | number>;
type ConstantData = Record<
  string | number,
  { displayName: string; color?: string }
>;

export function createConstant<
  T extends ConstantDefinition,
  D extends ConstantData,
>(definition: T, data: D) {
  return {
    ...definition,
    data,
    getDisplayName(value: number | string): string | number | "" {
      return data[value as keyof D]?.displayName || "";
    },
    getColor(value: number | string): string {
      return data[value as keyof D]?.color || "#0355a2";
    },
    getDropdownList(): { label: string; value: number | string }[] {
      return Object.entries(data).map(([key, value]) => ({
        label: value.displayName,
        value: typeof key === "number" ? Number(key) : key,
      }));
    },
    getDropdownListKey(): { label: string; value: number }[] {
      return Object.entries(data).map(([key, value]) => ({
        label: value.displayName,
        value: Number(key),
      }));
    },
  } as T & {
    data: D;
    getDisplayName: (value: number | string) => string | number | "";
    getColor: (value: number | string) => string;
    getDropdownList: () => { label: string; value: number | string }[];
    getDropdownListKey: () => { label: string; value: number }[];
  };
}
