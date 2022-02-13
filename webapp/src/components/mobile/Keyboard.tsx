import React, { MutableRefObject } from "react";
import { SimpleKeyboard } from "react-simple-keyboard";
import KeyboardLib from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

import { ACTION_KEYS } from "../../utils/keyboardUtils";

type KeyboardProps = {
  onChange: (input: string, event?: MouseEvent) => void;
  onKeyPress: (key: ACTION_KEYS) => void;
  keyboardRef: MutableRefObject<SimpleKeyboard | null>;
};

export const Keyboard = ({
  onChange,
  onKeyPress,
  keyboardRef,
}: KeyboardProps) => {
  return (
    <div>
      <KeyboardLib
        keyboardRef={(r) => (keyboardRef.current = r)}
        layout={{
          default: [
            "Q W E R T Y U I O P",
            "A S D F G H J K L",
            "{rebus} Z X C V B N M {bksp}",
          ],
        }}
        onChange={onChange}
        onKeyPress={onKeyPress}
        mergeDisplay={true}
        display={{
          "{space}": "Space",
          "{rebus}": "Rebus",
          "{bksp}": "⌫",
        }}
        buttonTheme={[
          {
            class: "w-10",
            buttons: "Rebus",
          },
        ]}
      />
    </div>
  );
};
