import { Item } from './item';

export class Quotation {
  constructor(
    public supplier: Supplier,
    public project: Project,
    public items: Array<ItemQuotation>
  ) {}
}

interface ItemQuotation {
  item: Item;
  quotedPrice: number;
}

interface Supplier {
  company: string;
}

interface Project {
  projectConstructor: string;
}
