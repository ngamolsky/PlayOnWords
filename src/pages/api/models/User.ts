import "reflect-metadata";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import { DateScalar } from "./DateScalar";

export enum LoginType {
  LOCAL = "local",
  GOOGLE = "google",
}

@ObjectType()
export class User {
  @Field(() => ID)
  userID: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  hashedPassword?: string;

  @Field({ nullable: true })
  googleID?: string;

  @Field()
  loginType: LoginType;

  @Field(() => DateScalar)
  createDate: Date;

  @Field(() => DateScalar)
  updateDate: Date;
}

registerEnumType(LoginType, {
  name: "LoginType",
});
