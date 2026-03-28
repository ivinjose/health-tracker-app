import * as Calendar from "expo-calendar";
import { useCallback, useMemo } from "react";
import { Alert, Linking, Platform, Text, View } from "react-native";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { BellRing } from "lucide-react-native";


import useTrainBookingApiManager from "@/api-managers/TrainBookingApiManager";
import CardView from "@/components/CardView";
import { buildGoogleCalendarUrl } from "@/lib/helpers";

const REMINDER_EVENT_DURATION_HOURS = 1;
const MS_PER_HOUR = 60 * 60 * 1000;
/** Reminder offsets: 0 = exact time, 1 = 1hr before, 24 = 1 day before */
const REMINDER_HOURS_BEFORE = [0];

const TrainBookingCard = ({ _id, name, travel_date, train_booking_date, remarks, is_tatkal, time_slot, isReadOnly }) => {
    const { toast } = useToast();
    const trainBookingApiManager = useTrainBookingApiManager();
    const queryClient = useQueryClient();

    const travelDate = travel_date ? (typeof travel_date === "string" ? new Date(travel_date) : travel_date) : null;
    const bookingDate = train_booking_date
        ? typeof train_booking_date === "string"
            ? new Date(train_booking_date)
            : train_booking_date
        : null;

    const confirmDelete = () =>
        Alert.alert('Are you sure?', 'Do you want to delete this record?', [
            {
                text: 'No',
                // onPress: () => setShowConfirm(false),
                style: 'cancel',
            },
            { text: 'Yes', onPress: () => onDelete() },
        ]);

    /* delete op */
    const { mutateAsync: removeTrainBooking } = useMutation({
        mutationFn: (id) => trainBookingApiManager.deleteTrainBooking(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries(["trainBookings"]);
            toast({
                variant: "",
                description: "Your train booking was deleted successfully!",
                className: "bg-green-600 text-white",
            });
        },
    });

    const onDelete = useCallback(() => {
        removeTrainBooking(_id);
    }, [_id, removeTrainBooking]);

    const displayTimeSlot = time_slot;

    const handleAddReminder = useCallback(async () => {
        if (!bookingDate) return;
        const [hours, minutes] = displayTimeSlot.split(":").map(Number);
        const dateTime = new Date(bookingDate);
        dateTime.setHours(hours, minutes, 0, 0);

        const title = name ? `Train booking opens – ${name}` : "Train booking opens";
        const descriptionParts = [];
        if (travelDate) descriptionParts.push(`Travel date: ${format(travelDate, "PPPP")}`);
        if (remarks) descriptionParts.push(remarks);
        const description = descriptionParts.join("\n\n") || undefined;

        if (Platform.OS !== "web") {
            const { status } = await Calendar.requestCalendarPermissionsAsync();
            if (status !== "granted") {
                toast({
                    variant: "destructive",
                    description: "Calendar access is needed to add a reminder.",
                });
                return;
            }
        }

        try {
            for (const hoursBefore of REMINDER_HOURS_BEFORE) {
                if (Platform.OS === "web") {
                    const url = buildGoogleCalendarUrl({
                        dateTime,
                        hoursBefore,
                        title,
                        description,
                    });
                    await Linking.openURL(url);
                } else {
                    const eventStart = new Date(dateTime.getTime() - hoursBefore * MS_PER_HOUR);
                    const eventEnd = new Date(
                        eventStart.getTime() + REMINDER_EVENT_DURATION_HOURS * MS_PER_HOUR
                    );
                    const defaultCal = await Calendar.getDefaultCalendarAsync();
                    await Calendar.createEventAsync(defaultCal.id, {
                        title,
                        startDate: eventStart,
                        endDate: eventEnd,
                        notes: description ?? "",
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        alarms: [{ relativeOffset: 0 }],
                    });
                }
            }

            if (Platform.OS !== "web") {
                toast({
                    variant: "",
                    description: "Reminder added to your calendar.",
                    className: "bg-green-600 text-white",
                });
            }
        } catch {
            toast({
                variant: "destructive",
                description: "Could not add the reminder. Try again.",
            });
        }
    }, [bookingDate, name, travelDate, remarks, displayTimeSlot, toast]);

    const actions = useMemo(() => {
        if (isReadOnly) {
            return [];
        }
        return [
            {
                label: "Delete",
                action: () => confirmDelete(),
            },
        ];
    }, [isReadOnly]);

    return (
        <>
            <CardView actions={actions}>
                <View className="flex-row gap-4 p-1">
                    {/* <View className="items-center justify-center">
                        <Train size={32} color="#1C2B3A" strokeWidth={1.5} />
                    </View> */}
                    <View className="flex-1 min-w-0 justify-start">
                        {!!name && <Text className="font-semibold my-1 text-[#111] text-base">{name}</Text>}
                        {!!is_tatkal &&
                            <View className="flex-row flex-wrap items-center gap-1 mb-1">
                                <Badge variant="destructive">
                                    <Text className="text-white font-medium text-[13px]">Tatkal</Text>
                                </Badge>
                            </View>
                        }
                        {bookingDate && (
                            <Text className="text-sm font-normal text-[#6b7280] mt-2">
                                Booking opens: {format(bookingDate, "PPPP")} at {displayTimeSlot} am
                            </Text>
                        )}
                        {travelDate && (
                            <Text className="text-sm font-normal text-[#6b7280] mt-2">
                                Travel: {format(travelDate, "PPPP")}
                            </Text>
                        )}
                        {!!remarks && <Text className="text-[13px] text-[#6b7280] mt-2">{remarks}</Text>}
                        {!isReadOnly && (
                            <Button
                                onPress={handleAddReminder}
                                className="mt-4 gap-3 mb-2"
                                variant="outline"
                            >
                                <>
                                    <BellRing size={18} color="#3469d3" />
                                    <Text className="font-medium">Add reminder</Text>
                                </>
                            </Button>
                        )}
                    </View>
                </View>
            </CardView>
        </>
    );
};

export default TrainBookingCard;
