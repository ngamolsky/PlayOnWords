import React, { InputHTMLAttributes } from "react";
import { useField } from "formik";
import {
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Box,
} from "@chakra-ui/react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  validate?: (value: any | any[]) => undefined | string | Promise<any>;
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
    <Box h="100px" mb={2}>
      <FormControl isInvalid={hasError} isRequired={required}>
        <FormLabel htmlFor={field.name}>{label}</FormLabel>
        <Input {...field} {...props} id={field.name} />
        {hasError ? <FormErrorMessage>{error}</FormErrorMessage> : null}
      </FormControl>
    </Box>
  );
};
