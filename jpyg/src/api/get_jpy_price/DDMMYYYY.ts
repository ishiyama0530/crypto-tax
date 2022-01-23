export class DDMMYYYY {
  constructor(
    private readonly year: number,
    private readonly month: number,
    private readonly day: number
  ) {}

  public toString(): string {
    const format = (v: number, digit: number) => ("00" + v).slice(-digit);
    return `${format(this.day, 2)}-${format(this.month, 2)}-${format(
      this.year,
      4
    )}`;
  }

  public toDate(): Date {
    return new Date(this.year, this.month, this.day);
  }
}
