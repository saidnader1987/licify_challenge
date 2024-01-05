export class Item {
  constructor(
    public _id: string,
    public quantity: number,
    public description: string,
    public quantityUnit: string,
    public price: number
  ) {}
}
