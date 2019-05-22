// The individual search terms
export interface UITerm {
  term: string;
  status: 'and' | 'not';
}

// The status of the labels
export interface UIField {
  field: string;
  status: 'default' | 'included' | 'excluded';
  options: boolean;
  disabled: boolean;
}

// The UI query object
export interface UIQuery {
  terms: UITerm[];
  fields: {
    subject: UIField[];
    content: UIField[];
  };
  options: boolean;
  disabled: boolean;
  selected: boolean;
}

// The ES 'exists' schema
interface Exists {
  exists: {
    field: string;
  };
}

interface ExistsBool {
  bool: { must: [Exists] };
}

// The ES query object
export interface QueryObject {
  query: {
    bool: {
      must: [
        { query_string: { query: string } },
        { bool: { should: [ExistsBool] } }
      ];
    };
  };
  size: number;
}

interface Results {
  data: any[];
  queryObj: any[];
}

// An individual tab
export interface Tab {
  uiQuery: UIQuery[];
  searchMachine: any;
  name: string;
  results: Results;
  visible: boolean;
}

// The whole shebang
export interface Store {
  [x: string]: Tab;
}
