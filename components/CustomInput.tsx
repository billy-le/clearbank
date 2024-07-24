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
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  type?: JSX.IntrinsicElements["input"]["type"];
};

export function CustomInput<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  onChange,
  type = "text",
}: CustomInputProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { onChange: fieldOnChange, ...fieldProps } }) => (
        <FormItem className="form-item">
          <FormLabel className="form-label">{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              className="input-class"
              type={type}
              onChange={(e) => {
                if (onChange) {
                  onChange(e);
                } else {
                  fieldOnChange(e);
                }
              }}
              {...fieldProps}
            />
          </FormControl>
          <FormMessage className="form-message" />
        </FormItem>
      )}
    />
  );
}
