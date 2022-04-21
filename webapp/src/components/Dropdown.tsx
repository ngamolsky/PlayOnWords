import { Menu, Transition } from "@headlessui/react";
import classNames from "classnames";
import React, { Fragment, ReactNode } from "react";

type DropdownProps = {
  buttonContent: ReactNode;
  items: {
    node: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }[];
  selectedItemIndex?: number;
};

const Dropdown: React.FC<DropdownProps> = ({
  buttonContent,
  items,
  selectedItemIndex,
}) => {
  return (
    <Menu as="div" className="inline-block text-center outline-none">
      <Menu.Button className="outline-none">{buttonContent}</Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-50"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-50"
      >
        <Menu.Items
          className={classNames(
            "absolute grid grid-cols-1 bg-white divide-y rounded-md shadow-lg outline-none right-2 dark:bg-slate-800 dark:ring-white ring-1 ring-slate-200 cursor-pointer"
          )}
        >
          {items.map((item, index) => {
            return (
              <Menu.Item
                key={index}
                onClick={item.onClick}
                disabled={item.disabled}
              >
                {({ active, disabled }) => (
                  <div
                    className={classNames(
                      "p-2 active:bg-slate-200",
                      {
                        "bg-blue-300 dark:bg-blue-600 first:rounded-t-md last:rounded-b-md":
                          index == selectedItemIndex,
                      },
                      {
                        "bg-blue-400 dark:bg-blue-700 first:rounded-t-md last:rounded-b-md":
                          index == selectedItemIndex && active,
                      },
                      {
                        "bg-slate-200 dark:bg-slate-600 first:rounded-t-md last:rounded-b-md":
                          active,
                      },
                      {
                        "select-none dark:bg-slate-600 first:rounded-t-md":
                          disabled,
                      }
                    )}
                  >
                    {item.node}
                  </div>
                )}
              </Menu.Item>
            );
          })}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default Dropdown;
