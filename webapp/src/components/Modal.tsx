import { Dialog, Transition } from "@headlessui/react";
import classNames from "classnames";
import React, { Fragment } from "react";

const Modal = ({
  isOpen,
  setIsOpen,
  title,
  children,
  className,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 p-8"
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div
            className={classNames(
              "flex flex-col w-full max-w-lg overflow-hidden text-left transition-all transform bg-white shadow-xl dark:bg-slate-800 dark:text-white outline-none p-4 mx-auto rounded-lg",
              className
            )}
          >
            {title && (
              <Dialog.Title
                as="h3"
                className="mb-4 text-lg font-medium leading-6"
              >
                {title}
              </Dialog.Title>
            )}
            {children}
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default Modal;
