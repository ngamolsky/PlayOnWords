import { Ctx, Query, Resolver } from "type-graphql";
import { User } from "../models/User";
import { MyContext } from "../../../types";

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<User | undefined> {
    return req.user;
  }
}
