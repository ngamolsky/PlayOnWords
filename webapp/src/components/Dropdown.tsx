import { Menu, Transition } from "@headlessui/react";
import React, { Fragment, ReactNode } from "react";

type DropdownProps = {
  buttonContent: ReactNode;
  items: {
    node: React.ReactNode;
    onClick?: () => void;
  }[];
  selectedItemIndex?: number;
};

const Dropdown: React.FC<DropdownProps> = ({
  buttonContent,
  items,
  selectedItemIndex,
}) => {
  return (
    <Menu as="div" className="inline-block text-center">
      <Menu.Button>{buttonContent}</Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-50"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-50"
      >
        <Menu.Items className="absolute p-2 px-8 mt-2 bg-white divide-y rounded-md shadow-lg outline-none right-2 dark:bg-slate-800 active:bg-slate-200 active:bg-opacity-95 dark:active:bg-slate-500 dark:active:bg-opacity-95">
          {items.map((item, index) => (
            <Menu.Item key={index} onClick={item.onClick}>
              {item.node}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default Dropdown;
