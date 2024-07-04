import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import type { FieldValues, UseFormReturn, Path } from "react-hook-form";

type CustomInputProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
  type?: JSX.IntrinsicElements["input"]["type"];
};

export function CustomInput<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  type = "text",
}: CustomInputProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="form-item">
          <FormLabel className="form-label">{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              className="input-class"
              type={type}
              {...field}
            />
          </FormControl>
          <FormMessage className="form-message" />
        </FormItem>
      )}
    />
  );
}
