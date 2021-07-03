import { NextApiRequest, NextApiResponse } from "next";
import { ErrorHandler } from "next-connect";
import { XWordError } from "../models/XWordError";

export const withOptions = (
  attachParams = false,
  onError?: ErrorHandler<NextApiRequest, NextApiResponse>
) => {
  const onErrorFunc: ErrorHandler<NextApiRequest, NextApiResponse> = onError
    ? onError
    : (err, _, res, __) => {
        if (err instanceof XWordError) {
          console.log("XWORD ERROR", err.code, err.message);
          res.status(err.code).json({
            code: err.code,
            message: err.toString(),
          });
        } else {
          console.log("NON XWORD ERROR: ", err);
          res.status(500).json({
            code: err.code,
            message: err.toString(),
          });
        }
      };
  return {
    attachParams,
    onError: onErrorFunc,
  };
};
