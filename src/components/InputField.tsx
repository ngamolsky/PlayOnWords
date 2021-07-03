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
};

export const InputField: React.FC<InputFieldProps> = ({
  label,
  size: _,
  required,
  ...props
}) => {
  const [field, { error }] = useField(props);
  return (
    <Box h="100px" mb={2}>
      <FormControl isInvalid={!!error} isRequired={required}>
        <FormLabel htmlFor={field.name}>{label}</FormLabel>
        <Input {...field} {...props} id={field.name} />
        {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
      </FormControl>
    </Box>
  );
};
