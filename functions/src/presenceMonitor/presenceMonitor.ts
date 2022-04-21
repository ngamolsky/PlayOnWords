import { database } from "firebase-functions";
import { getUserSessions, setUserOnlineForSession } from "../models/Session";
import { getUserByID, setUserOnlineStatus } from "../models/User";

export const PresenceMonitor = database
  .ref("/status/{sanitizedUserID}")
  .onWrite(async (change, context) => {
    const eventStatus = change.after.val();

    const sanitizedUserID = context.params.sanitizedUserID;

    const userID = sanitizedUserID.replace("%%%", ".");
    const user = await getUserByID(userID);

    const statusSnapshot = await change.after.ref.once("value");
    const status = statusSnapshot.val();

    // If the current timestamp for this data is newer than
    // the data that triggered this event, we exit this function.
    if (status.last_changed > eventStatus.last_changed) {
      return null;
    }

    const isOnline = eventStatus.state == "online";

    if (isOnline) {
      console.log(
        "User is online, updating global status to online for user",
        userID
      );

      return setUserOnlineStatus(user, true);
    } else {
      console.log(
        "User is offline, removing online status from all sessions and on user",
        userID
      );

      const userSessions = await getUserSessions(user);
      userSessions.forEach((session) => {
        setUserOnlineForSession(session.sessionID, user, false);
      });

      return setUserOnlineStatus(user, false);
    }
  });
