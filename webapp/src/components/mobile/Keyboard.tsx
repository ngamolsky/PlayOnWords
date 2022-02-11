import React, { MutableRefObject, useState } from "react";
import { SimpleKeyboard } from "react-simple-keyboard";
import KeyboardLib from "react-simple-keyboard";

import "react-simple-keyboard/build/css/index.css";

type KeyboardProps = {
  onChange: (input: string, event?: MouseEvent) => void;
  keyboardRef: MutableRefObject<SimpleKeyboard | null>;
};

export const Keyboard = ({ onChange, keyboardRef }: KeyboardProps) => {
  const [layoutName, setLayoutName] = useState("default");

  const onKeyPress = (button: string) => {
    if (button === "{shift}" || button === "{lock}") {
      setLayoutName(layoutName === "default" ? "shift" : "default");
    }
  };
  // sx={{
  //   ".keyboard": { textColor: "black" },
  //   ".rebus": { width: "40px !important" },
  // }}
  return (
    <div>
      <KeyboardLib
        keyboardRef={(r) => (keyboardRef.current = r)}
        layout={{
          default: [
            "Q W E R T Y U I O P {bksp}",
            "A S D F G H J K L",
            "Rebus Z X C V B N M",
            "{space}",
          ],
        }}
        theme={`hg-theme-default keyboard`}
        onChange={onChange}
        onKeyPress={onKeyPress}
        mergeDisplay={true}
        display={{
          "{space}": "Space",
          "{bksp}": "⌫",
        }}
        buttonTheme={[
          {
            class: "rebus",
            buttons: "Rebus",
          },
        ]}
      />
    </div>
  );
};
