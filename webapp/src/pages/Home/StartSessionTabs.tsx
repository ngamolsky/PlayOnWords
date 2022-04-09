import { Tab } from "@headlessui/react";
import React, { ReactNode } from "react";

const StartSessionTabs = ({ tabArray }: { tabArray: ReactNode[] }) => {
  return (
    <Tab.Group>
      <Tab.List
        className={`w-full rounded-md 
           bg-slate-600/20 flex justify-around outline-none`}
        tabIndex={0}
      >
        <Tab
          className={({ selected }) =>
            `${
              selected ? "bg-slate-600/70" : "bg-slate-600/20"
            } grow justify-around p-4 rounded-l-md`
          }
        >
          New
        </Tab>
        <Tab
          className={({ selected }) =>
            `${
              selected ? "bg-slate-600/70" : "bg-slate-600/20"
            } grow justify-around p-4`
          }
        >
          In Progress
        </Tab>
        <Tab
          className={({ selected }) =>
            `${
              selected ? "bg-slate-600/70" : "bg-slate-600/20"
            } grow justify-around p-4 rounded-r-md`
          }
        >
          Completed
        </Tab>
      </Tab.List>
      <Tab.Panels className="h-full overflow-auto">
        {tabArray.map((tabContent, index) => (
          <Tab.Panel key={index} className="h-full">
            {tabContent}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};

export default StartSessionTabs;
