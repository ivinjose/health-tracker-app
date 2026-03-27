import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCallback, useMemo, useState } from "react";
import { Linking, Text, View } from "react-native";

import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { BellRing, Train } from "lucide-react-native";


import useTrainBookingApiManager from "@/api-managers/TrainBookingApiManager";
import CardView from "@/components/CardView";
import { buildGoogleCalendarUrl } from "@/lib/helpers";

const REMINDER_EVENT_DURATION_HOURS = 1;
/** Reminder offsets: 0 = exact time, 1 = 1hr before, 24 = 1 day before */
const REMINDER_HOURS_BEFORE = [0];

const TrainBookingCard = ({ _id, name, travel_date, train_booking_date, remarks, is_tatkal, time_slot, isReadOnly }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const { toast } = useToast();
    const trainBookingApiManager = useTrainBookingApiManager();
    const queryClient = useQueryClient();

    const travelDate = travel_date ? (typeof travel_date === "string" ? new Date(travel_date) : travel_date) : null;
    const bookingDate = train_booking_date
        ? typeof train_booking_date === "string"
            ? new Date(train_booking_date)
            : train_booking_date
        : null;

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

    const handleAddReminder = useCallback(() => {
        if (!bookingDate) return;
        const [hours, minutes] = displayTimeSlot.split(":").map(Number);
        const dateTime = new Date(bookingDate);
        dateTime.setHours(hours, minutes, 0, 0);

        const title = name ? `Train booking opens – ${name}` : "Train booking opens";
        const descriptionParts = [];
        if (travelDate) descriptionParts.push(`Travel date: ${format(travelDate, "PPPP")}`);
        if (remarks) descriptionParts.push(remarks);
        const description = descriptionParts.join("\n\n") || undefined;

        REMINDER_HOURS_BEFORE.forEach((hoursBefore) => {
            const url = buildGoogleCalendarUrl({
                dateTime,
                hoursBefore,
                title,
                description,
                durationHours: REMINDER_EVENT_DURATION_HOURS,
            });
            Linking.openURL(url);
        });
    }, [bookingDate, name, travelDate, remarks, displayTimeSlot]);

    const actions = useMemo(() => {
        if (isReadOnly) {
            return [];
        }
        return [
            {
                label: "Delete",
                action: () => setShowConfirm(true),
            },
        ];
    }, [isReadOnly]);

    return (
        <>
            <CardView actions={actions}>
                <View className="flex-row gap-4 p-1">
                    <View className="items-center justify-center">
                        <Train size={64} color="#1C2B3A" strokeWidth={1.5} />
                    </View>
                    <View className="flex-1 min-w-0 justify-start">
                        {!!name && <Text className="font-semibold my-1 text-[#111] text-base">{name}</Text>}
                        {travelDate && (
                            <View className="flex-row flex-wrap items-center gap-1 mb-1">
                                <Text className="text-sm font-normal text-[#6b7280]">
                                    Travel: {format(travelDate, "PPPP")}
                                </Text>
                                {!!is_tatkal && <Badge variant="destructive">
                                    <Text className="text-white font-medium text-[13px]">Tatkal</Text>
                                </Badge>}
                            </View>
                        )}
                        {bookingDate && (
                            <Text className="text-sm font-normal text-[#6b7280] mb-1">
                                Booking opens: {format(bookingDate, "PPPP")} at {displayTimeSlot} am
                            </Text>
                        )}
                        {!!remarks && <Text className="text-[13px] text-[#6b7280] my-1">{remarks}</Text>}
                        {!isReadOnly && (
                            // <Pressable
                            //     onPress={handleAddReminder}
                            //     className="mt-4 items-center justify-center rounded-lg bg-[#7aaeee] px-4 py-3 active:opacity-90"
                            // >
                            <BellRing size={26} color="#3469d3" onPress={handleAddReminder} />
                            // </Pressable>
                        )}
                    </View>
                </View>
            </CardView>

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this train booking.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onPress={() => setShowConfirm(false)}>
                            <Text>Cancel</Text>
                        </AlertDialogCancel>
                        <AlertDialogAction onPress={onDelete}>
                            <Text>Continue</Text>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default TrainBookingCard;
