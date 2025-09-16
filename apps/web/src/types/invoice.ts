export type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Invoice = {
  _id?: string;
  vendor: {
    name: string;
  };
  invoice: {
    number: string;
    date: string;
    total: number;
    lineItems?: LineItem[];
  };
  items?: LineItem[];
};
