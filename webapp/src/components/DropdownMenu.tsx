import { Menu, Transition } from "@headlessui/react";
import React, { Fragment } from "react";

type DropdownMenuProps = {
  items: {
    node: React.ReactNode;
    onClick: () => void;
  }[];
  buttonContent: React.ReactNode;
  selectedItemIndex?: number;
};

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  buttonContent,
  items,
  selectedItemIndex,
}) => {
  return (
    <Menu as="div">
      <Menu.Button as="div">{buttonContent}</Menu.Button>
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
          className={`absolute right-0
          bg-white divide-y divide-gray-100 rounded-md 
            shadow-lg ring-1 ring-black ring-opacity-5`}
        >
          {items.map((item, index) => (
            <Menu.Item key={index}>
              {({ active }) => {
                return (
                  <div
                    className={`${
                      (active || index == selectedItemIndex) && "bg-blue-400"
                    } py-1 px-2 ${index == 0 && "rounded-t-md"}`}
                    onClick={item.onClick}
                  >
                    {item.node}
                  </div>
                );
              }}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default DropdownMenu;