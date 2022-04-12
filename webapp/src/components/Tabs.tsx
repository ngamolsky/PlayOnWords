import { Tab } from "@headlessui/react";
import React, { ReactNode } from "react";

const Tabs = ({
  tabArray,
}: {
  tabArray: { title: string; content: ReactNode }[];
}) => {
  return (
    <Tab.Group>
      <Tab.List
        className={`w-full 
           flex justify-around outline-none`}
        tabIndex={0}
      >
        {tabArray.map((tab, index) => (
          <Tab
            key={index}
            className={({ selected }) =>
              `${
                selected
                  ? "dark:bg-slate-600 bg-slate-300"
                  : "dark:bg-slate-700 bg-slate-200"
              } grow justify-around p-4 outline-none`
            }
          >
            {tab.title}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="flex flex-col h-full overflow-auto grow">
        {tabArray.map((tab, index) => {
          return (
            <Tab.Panel key={index} className="flex flex-col h-full grow">
              {tab.content}
            </Tab.Panel>
          );
        })}
      </Tab.Panels>
    </Tab.Group>
  );
};

export default Tabs;
