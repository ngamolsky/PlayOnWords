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
  ...props
}) => {
  const [field] = useField({ ...props, validate });
  return (
    <div className="flex flex-col mx-4 ">
      <Field
        type={props.type}
        id={field.name}
        name={field.name}
        placeholder={label}
        className="border border-black rounded-lg p-2 active:border-blue-400 w-full"
        value={value}
      />
      <ErrorMessage
        name={field.name}
        component="div"
        className="text-red-600 mt-1"
      />
    </div>
  );
};
