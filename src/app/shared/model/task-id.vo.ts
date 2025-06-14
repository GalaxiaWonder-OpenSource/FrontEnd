import { v4 as uuidv4 } from 'uuid';

export class TaskId {
  constructor(public readonly value: string = uuidv4()) {
    if (!value) {
      throw new Error('Task ID cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }
}
