import { Item } from './item';

export class Project {
  constructor(
    public _id: string,
    public name: string,
    public startDate: Date,
    public endDate: Date,
    public images: Array<String>,
    public projectConstructor: String | ProjectConstructor,
    public items?: Array<Item>
  ) {}
}

export interface ProjectConstructor {
  company: string;
}
