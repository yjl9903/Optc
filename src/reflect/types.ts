export enum ValueType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Array = 'string[]'
}

export interface Argument {
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
  arguments: Argument[];
  description: string;
}
