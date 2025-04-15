export class FormatUtils {
  static toFixedWithoutZeros = (input: number | string, to: number): string => {
    const num = typeof input === 'number' ? input : Number(input);
    return Number(num.toFixed(to)).toString();
  };
}
