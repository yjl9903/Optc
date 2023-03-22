export enum ValueType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Array = 'string[]'
}

export interface Parameter {
  name: string;
  type: ValueType;
  required: boolean;
}

export interface Option {
  name: string;
  type: ValueType;
  required: boolean;
  description: string;
}

export interface Command {
  name: string;
  default: boolean;
  options: Option[];
  parameters: Parameter[];
  description: string;
}
