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
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View className="w-full">
                    {!!labelText && (
                        <Text className={labelStyleClass}>
                            {labelText}
                        </Text>
                    )}

                    <Select value={value} onValueChange={onChange}>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>

                        <SelectContent>
                            {dropdownOptions.map(({ value: optionValue, label }) => (
                                <SelectItem key={optionValue} value={optionValue}>
                                    <Text className="text-black">{label}</Text>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {error && (
                        <Text className="text-red-500 mt-1">
                            {error.message}
                        </Text>
                    )}
                </View>
            )}
        />
    );
};

export default FormFieldSelect;