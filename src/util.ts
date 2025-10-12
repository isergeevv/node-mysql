export const AND = (...args: string[]): string => `(${args.join(' AND ')})`;
export const OR = (...args: string[]): string => `(${args.join(' OR ')})`;
