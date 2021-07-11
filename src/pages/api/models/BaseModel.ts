import { v4 as uuid } from "uuid";

export class BaseModel {
  static getModelName(): string {
    throw Error("Please override this on the subclass");
  }

  static generateID(): string {
    return `${this.getModelName()}.${uuid()}`;
  }
}
