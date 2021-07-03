import passport from "passport";
import GoogleOAuth from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { v4 as uuid } from "uuid";
import {
  addUser,
  getUserByUsername,
  getUserByGoogleID,
  getUserByID,
  LoginType,
  User,
  verifyPassword,
} from "../models/User";
import { XWordErrors } from "../models/XWordError";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await getUserByUsername(username);

    if (!user) {
      return done(XWordErrors.USERNAME_NOT_FOUND);
    }

    if (user.loginType == LoginType.GOOGLE) {
      return done(XWordErrors.GOOGLE_EMAIL_THROUGH_LOCAL);
    }

    const passwordsMatch = await verifyPassword(password, user.hashedPassword!);
    if (!passwordsMatch) {
      return done(XWordErrors.WRONG_PASSWORD);
    }
    return done(null, user);
  })
);

const googleLoginStrategy = new GoogleOAuth.Strategy(
  {
    clientID:
      "1048302721554-l07ftc38icndqf5q0csq40hp1b3c313q.apps.googleusercontent.com",
    clientSecret: "GKivK7fGCMT-eQ-CNcBk6s9a",
    callbackURL: "/api/auth/google/callback",
  },
  async (_, __, profile, done) => {
    const existingUser = await getUserByGoogleID(profile.id);
    if (existingUser) {
      return done(null, existingUser);
    } else {
      const email = profile.emails![0].value;
      const newUser: User = {
        userID: `user.${uuid()}`,
        email,
        googleID: profile.id,
        loginType: LoginType.GOOGLE,
        displayName: profile.displayName,
        createDate: new Date(),
        updateDate: new Date(),
      };

      await addUser(newUser);
      return done(null, newUser);
    }
  }
);

passport.use(googleLoginStrategy);

passport.serializeUser((user, done) => {
  return done(null, user.userID);
});

passport.deserializeUser(async (userID, done) => {
  const user = await getUserByID(userID as string);
  return done(null, user);
});

export default passport;
