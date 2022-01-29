export type Convertor = {
  handle: (
    data: string[][]
  ) => Promise<{ newRows: string[][]; errorRows: string[][] }>;
};
