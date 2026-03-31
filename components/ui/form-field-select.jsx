import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"; // adjust path based on your setup

import { Controller } from "react-hook-form";
import { Text, View } from "react-native";

const FormFieldSelect = ({
    formControl,
    schemaProperty,
    placeholder,
    labelText,
    labelStyleClass,
    dropdownOptions,
}) => {
    return (
        <Controller
            control={formControl}
            name={schemaProperty}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
                const stringValue =
                    typeof value === "string"
                        ? value
                        : value && typeof value === "object" && "value" in value
                          ? String(value.value)
                          : "";
                const selectedOption = dropdownOptions.find(
                    (o) => o.value === stringValue
                );
                const selectValue = selectedOption
                    ? {
                          value: selectedOption.value,
                          label: selectedOption.label,
                      }
                    : undefined;

                return (
                <View className="w-full">
                    {!!labelText && (
                        <Text className={labelStyleClass}>
                            {labelText}
                        </Text>
                    )}

                    <Select
                        value={selectValue}
                        onValueChange={(option) =>
                            onChange(option?.value ?? "")
                        }
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>

                        <SelectContent>
                            {dropdownOptions.map(({ value: optionValue, label }) => (
                                <SelectItem
                                    className="text-black"
                                    key={optionValue}
                                    value={optionValue}
                                    label={label}
                                />
                            ))}
                        </SelectContent>
                    </Select>

                    {error && (
                        <Text className="text-red-500 mt-1">
                            {error.message}
                        </Text>
                    )}
                </View>
                );
            }}
        />
    );
};

export default FormFieldSelect;