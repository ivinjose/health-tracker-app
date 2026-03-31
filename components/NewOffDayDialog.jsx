import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CircleX, Plus } from "lucide-react-native";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import useOffDaysApiManager from "../api-managers/OffDaysApiManager";

import FormFieldInput from "@/components/ui/form-field-input";
import FormFieldSelect from "@/components/ui/form-field-select";
import FormFieldTextarea from "@/components/ui/form-field-textarea";
import { Text } from "@/components/ui/text";
import {
    TRAIN_BOOKING_BUFFER,
    TRAIN_NORMAL_BOOKING_OPENING_TIME,
    TRAIN_TATKAL_BOOKING_OPENING_TIME,
} from "@/constants/trainBooking";
import formSchema from "@/schemas/OffDay";
import { Calendar as CalendarIcon } from "lucide-react-native";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const defaultFormValues = {
    offday_name: "",
    offday_owner: "AV",
    start_date: new Date(),
    end_date: new Date(),
    remarks: "",
};

export default function NewTrainBookingDialog() {
    const insets = useSafeAreaInsets();
    const [isOpen, setIsOpen] = useState(false);
    const [isCalculated, setIsCalculated] = useState(false);
    const [isTatkalBooking, setIsTatkalBooking] = useState(false);
    const scrollViewRef = useRef(null);
    const { toast } = useToast();

    const form = useForm({
        resolver: zodResolver(formSchema),
    });

    const offDaysApiManager = useOffDaysApiManager();
    const queryClient = useQueryClient();

    /* create op */
    const { mutateAsync: addOffDay } = useMutation({
        mutationFn: (data) => {
            console.log('DEBUG: data', data);
            const {
                offday_name,
                offday_owner,
                start_date,
                end_date,
                remarks,
            } = data;
            const startDayWithoutTime = format(start_date, 'yyyy-MM-dd');
            const endDayWithoutTime = format(end_date, 'yyyy-MM-dd');
            return offDaysApiManager.createOffDay({ offday_name, offday_owner, start_date: startDayWithoutTime, end_date: endDayWithoutTime, remarks })
        },
        onSuccess: async () => {
            form.reset();

            await queryClient.invalidateQueries(['processedOffdays']);
            toast({
                variant: "",
                description: "Your off day was saved successfully!",
                className: "bg-green-600 text-white"
            });
        }
    });

    const onCancel = () => {
        form.reset({ ...defaultFormValues, travel_date: new Date() });
        setIsCalculated(false);
        setIsTatkalBooking(false);
        setIsOpen(false);
    };

    const formContent = (
        <View className="mt">
            <Form {...form}>
                <View>
                    {/* Name */}
                    <View className="mb-5 flex gap-2.5">
                        <FormFieldInput
                            formControl={form.control}
                            schemaProperty="offday_name"
                            placeholder="Christmas holidays"
                            labelText="Give a name to your off day"
                            labelStyleClass="mb-2.5 block font-normal text-base text-[#4c4c4c]"
                        />
                    </View>

                    {/* User */}
                    <View className="mb-5">
                        <FormFieldSelect
                            formControl={form.control}
                            schemaProperty="offday_owner"
                            labelText="Who's off day is this?"
                            labelStyleClass="mb-2.5 block font-normal text-base text-[#4c4c4c]"
                            placeholder="Select a user"
                            dropdownOptions={[
                                { label: "Anju Varghese - AV", value: "AV" },
                                { label: "Ivin Jose - IJ", value: "IJ" },
                            ]}
                        />
                    </View>

                    {/* Off day starts on */}
                    <FormLabel className="mb-0 block font-normal text-base text-[#4c4c4c]">
                        Off day starts on
                    </FormLabel>
                    <View className="mb-5 flex gap-2.5">
                        <FormField
                            control={form.control}
                            name="start_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormControl>
                                        <Accordion type='single' collapsible>
                                            <AccordionItem value='item-1'>
                                                <AccordionTrigger className="flex-row items-center gap-2 justify-start">
                                                    <CalendarIcon size={24} color="#000" />
                                                    {field.value ? <Text>{format(field.value, "PPP")}</Text> : <Text>Pick a date</Text>}
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <Calendar
                                                        initialDate={field.value ? format(field.value, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
                                                        enableSwipeMonths={true}
                                                        minDate={format(new Date(), "yyyy-MM-dd")}
                                                        markedDates={
                                                            field.value
                                                                ? { [format(field.value, "yyyy-MM-dd")]: { selected: true } }
                                                                : {}
                                                        }
                                                        onDayPress={(day) => {
                                                            field.onChange(new Date(day.dateString));
                                                        }}
                                                    />
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </View>

                    {/* Off day ends on */}
                    <FormLabel className="mb-0 block font-normal text-base text-[#4c4c4c]">
                        Off day ends on
                    </FormLabel>
                    <View className="mb-5 flex gap-2.5">
                        <FormField
                            control={form.control}
                            name="end_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormControl>
                                        <Accordion type='single' collapsible>
                                            <AccordionItem value='item-1'>
                                                <AccordionTrigger className="flex-row items-center gap-2 justify-start">
                                                    <CalendarIcon size={24} color="#000" />
                                                    {field.value ? <Text>{format(field.value, "PPP")}</Text> : <Text>Pick a date</Text>}
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <Calendar
                                                        initialDate={field.value ? format(field.value, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
                                                        enableSwipeMonths={true}
                                                        minDate={format(new Date(), "yyyy-MM-dd")}
                                                        markedDates={
                                                            field.value
                                                                ? { [format(field.value, "yyyy-MM-dd")]: { selected: true } }
                                                                : {}
                                                        }
                                                        onDayPress={(day) => {
                                                            field.onChange(new Date(day.dateString));
                                                        }}
                                                    />
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </View>

                    <View className="mb-5">
                        <FormFieldTextarea
                            formControl={form.control}
                            schemaProperty="remarks"
                            placeholder="Type anything you want to remember"
                            labelText="Remarks"
                            labelStyleClass="mb-2.5 block font-normal text-base text-[#4c4c4c]"
                            inputStyleClass="min-h-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                    </View>
                </View>
            </Form>
        </View>
    );

    return (
        <>
            <View
                pointerEvents="box-none"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                }}
            >
                <Pressable
                    onPress={() => setIsOpen(true)}
                    style={{
                        position: "absolute",
                        right: 33,
                        bottom: insets.bottom,
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: "#2563eb",
                        alignItems: "center",
                        justifyContent: "center",
                        elevation: 4,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                    }}
                    className="active:opacity-90"
                >
                    <Plus size={24} color="#ffffff" />
                </Pressable>
            </View>
            <Modal
                visible={isOpen}
                onRequestClose={onCancel}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View className="flex-1">
                    <Pressable
                        onPress={onCancel}
                        className="absolute left-4 top-4 z-10"
                        hitSlop={8}
                    >
                        <CircleX size={28} color="#4c4c4c" />
                    </Pressable>
                    <ScrollView
                        ref={scrollViewRef}
                        className="flex-1"
                        contentContainerStyle={{ padding: 40, paddingTop: 56, paddingBottom: 24 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {formContent}
                    </ScrollView>
                    <View className="px-10 p-4">
                        <Button onPress={form.handleSubmit(addOffDay)}>
                            <Text>{"Save off day"}</Text>
                        </Button>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const CalculatedBookingDate = ({ className, travelDate, trainBookingDate, isTatkalBooking }) => {
    if (!travelDate || !trainBookingDate) return null;

    const openingTime = isTatkalBooking ? TRAIN_TATKAL_BOOKING_OPENING_TIME : TRAIN_NORMAL_BOOKING_OPENING_TIME;

    return (
        <View className={className}>
            {isTatkalBooking && (
                <Text className="mb-4 text-xs font-semibold text-[#b45309]">
                    This needs to be booked as a{" "}
                    <Text className="font-bold">tatkal</Text> ticket.
                </Text>
            )}
            <Text className="font-normal text-xs text-[#4b5269]">
                {isTatkalBooking ? "Tatkal ticket " : "Ticket"} booking opens on:
            </Text>
            <Text className="my-1.5 text-lg font-medium text-[#1C398E]">
                {format(trainBookingDate, "PPP")} at {openingTime} am
            </Text>
            <Text className="font-normal text-xs text-[#4b5269]">
                {isTatkalBooking
                    ? `1 day before your travel on ${format(travelDate, "PPP")}`
                    : `${TRAIN_BOOKING_BUFFER} days before your travel on ${format(travelDate, "PPP")}`}
            </Text>
        </View>
    );
};

