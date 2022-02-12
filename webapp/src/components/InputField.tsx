import React, { InputHTMLAttributes } from "react";
import { ErrorMessage, Field, useField } from "formik";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  validate?: (value: string) => undefined | string | Promise<string>;
};

export const InputField: React.FC<InputFieldProps> = ({
  label,
  size: _,
  required,
  validate,
  ...props
}) => {
  const [field] = useField({ ...props, validate });
  return (
    <div className="flex flex-col mx-4 ">
      <Field
        id={field.name}
        name={field.name}
        placeholder={label}
        className="border border-black rounded-lg p-2 active:border-blue-400 w-full"
      />
      <ErrorMessage
        name={field.name}
        component="div"
        className="text-red-600 mt-1"
      />
    </div>
  );
};
