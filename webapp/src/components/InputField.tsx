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
  const [field, { error, touched }] = useField({ ...props, validate });
  const hasError = !!(error && touched && field.value.length > 0);
  return (
    <div>
      <Field id={field.name} name={field.name} />
      <ErrorMessage component="a" name={field.name} />
    </div>
  );
};
