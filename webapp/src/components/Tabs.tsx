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
        className={`w-full rounded-md 
           bg-slate-600/20 flex justify-around outline-none`}
        tabIndex={0}
      >
        {tabArray.map((tab, index) => (
          <Tab
            key={index}
            className={({ selected }) =>
              `${
                selected ? "bg-slate-600/70" : "bg-slate-600/20"
              } grow justify-around p-4 rounded-l-md`
            }
          >
            {tab.title}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="h-full">
        {tabArray.map((tab, index) => (
          <Tab.Panel key={index} className="h-full">
            {tab.content}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};

export default Tabs;
