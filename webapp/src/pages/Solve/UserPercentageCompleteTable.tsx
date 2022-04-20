import React from "react";
import { Session } from "../../models/Session";
import {
  getPercentageComplete,
  getSessionCompletionPercentages,
  getSessionRevealedPercentage,
} from "../../utils/sessionUtils";

const UserPercentageCompleteTable = ({ session }: { session: Session }) => {
  const sessionResults = getSessionCompletionPercentages(session);
  const sessionPercentRevealed = getSessionRevealedPercentage(session);
  return (
    <div className="flex-col p-4 mt-4 rounded-md bg-slate-200 dark:bg-slate-700">
      <table className="w-full table-fixed">
        <thead>
          <tr>
            <th className="py-2">Participants</th>
            <th className="py-2">Percent Complete</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(sessionResults)
            .sort(
              ([, percentComplete1], [, percentComplete2]) =>
                percentComplete2 - percentComplete1
            )
            .map(([username, percentComplete], index) => (
              <tr key={index}>
                <td className="py-2">{username}</td>
                <td className="py-2">{`${(percentComplete * 100).toFixed(
                  2
                )}%`}</td>
              </tr>
            ))}
          {sessionPercentRevealed > 0 && (
            <tr key={"revealed"} className="text-red-600 dark:text-red-400">
              <td className="py-2">Revealed</td>
              <td className="py-2">{`${sessionPercentRevealed.toFixed(
                2
              )}%`}</td>
            </tr>
          )}
          <tr key={"total"} className="font-bold">
            <td className="py-2">Total</td>
            <td className="py-2">{`${getPercentageComplete(
              session.boardState,
              session.puzzle.solutions
            ).toFixed(2)}%`}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default UserPercentageCompleteTable;
