import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment } from "react";

const Modal = ({
  isOpen,
  setIsOpen,
  title,
  content,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  content: React.ReactNode;
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 p-4 overflow-y-auto"
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <button />
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
          <div className="flex flex-col w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl h-4/5 rounded-2xl dark:bg-slate-700 dark:text-white">
            <Dialog.Title
              as="h3"
              className="mb-4 text-lg font-medium leading-6"
            >
              {title}
            </Dialog.Title>
            {content}
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default Modal;
