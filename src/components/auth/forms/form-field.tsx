import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
	name: Path<T>;
	control: Control<T>;
	label: string;
	placeholder?: string;
	type?: "text" | "email" | "password";
}

const FormField = <T extends FieldValues>({ name, control, label, placeholder, type = "text" }: FormFieldProps<T>) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<Input placeholder={placeholder} {...field} type={type} />
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

export default FormField;
