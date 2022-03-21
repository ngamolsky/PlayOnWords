import React, { InputHTMLAttributes } from "react";
import { ErrorMessage, Field, useField } from "formik";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  validate?: (
    value: string
  ) => undefined | string | Promise<string | undefined>;
};

export const InputField: React.FC<InputFieldProps> = ({
  label,
  validate,
  value,
  className,
  ...props
}) => {
  const [field] = useField({ ...props, validate });
  return (
    <div className={className}>
      <Field
        type={props.type}
        id={field.name}
        name={field.name}
        placeholder={label}
        className="border border-black dark:border-white rounded-lg p-2 focus:border-teal-600 w-full dark:bg-slate-500 outline-none mb-4"
        value={value}
      />
      <ErrorMessage
        name={field.name}
        component="div"
        className="text-red-600 dark:text-red-500 absolute -translate-y-3 ml-1"
      />
    </div>
  );
};
