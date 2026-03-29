import { useCallback, useMemo } from "react";
import { Alert, Text, View } from "react-native";
// import { Calendar } from "@/components/ui/calendar";

import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isSameDay } from "date-fns";

import CardView from "@/components/CardView";
import useOffDaysApiManager from "../api-managers/OffDaysApiManager";

const OffDayCard = ({
    _id,
    offday_name,
    offday_owner,
    start_date,
    end_date,
    remarks,
    isReadOnly,
    datesToWeekend = [],
    weekendProximity = {},
    lastOffDay = {},
    nextOffDay = {},
}) => {
    const { toast } = useToast();
    const offDaysApiManager = useOffDaysApiManager();
    const queryClient = useQueryClient();

    const { mutateAsync: removeOffDay } = useMutation({
        mutationFn: (data) => offDaysApiManager.deleteOffDay(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries(["processedOffdays"]);

            toast({
                description: "Your off day was deleted successfully!",
            });
        },
    });

    const onDelete = useCallback(() => {
        removeOffDay(_id);
    }, [_id, removeOffDay]);

    const confirmDelete = () =>
        Alert.alert('Are you sure?', 'Do you want to delete this record?', [
            {
                text: 'No',
                style: 'cancel',
            },
            { text: 'Yes', onPress: () => onDelete() },
        ]);

    const actions = useMemo(() => {
        if (isReadOnly) return [];

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
                <View className="flex-row items-center p-4">
                    <View className="flex-1 min-w-0">
                        <Text className="text-base font-semibold text-[#212933]">
                            {offday_name}
                        </Text>
                        <Text className="mt-1 text-sm font-normal text-[#444]">
                            {offday_owner}
                        </Text>
                        <OffDays start_date={start_date} end_date={end_date} />
                        {remarks ? (
                            <Text className="mt-1 text-sm text-[#555]">{remarks}</Text>
                        ) : null}
                    </View>
                </View>

                <View className="px-4 pb-2">
                    <WeekendProximityAlert
                        weekendProximity={weekendProximity}
                        start_date={start_date}
                        end_date={end_date}
                    />
                    <PTORecommendationForWeekend datesToWeekend={datesToWeekend} />
                    <OffDayRecommendation recommendation={lastOffDay} />
                    <OffDayRecommendation recommendation={nextOffDay} />
                </View>
            </CardView>
        </>
    );
};

const OffDays = ({ start_date, end_date }) => {
    const rowClass = "text-sm font-normal text-[#444]";
    if (isSameDay(start_date, end_date)) {
        return <Text className={`${rowClass} mt-0.5`}>{format(start_date, 'PPPP')}</Text>;
    }
    return (
        <View className="mt-0.5 gap-0.5">
            <Text className={rowClass}>From: {format(start_date, 'PPPP')}</Text>
            <Text className={rowClass}>To: {format(end_date, 'PPPP')}</Text>
        </View>
    )
}

const WeekendProximityAlert = ({ weekendProximity, start_date, end_date }) => {
    const rowClass = "text-sm font-normal text-[#444] mb-1.5 last:mb-0";
    const sectionClass = "p-3 rounded mt-2.5 border border-[#c9f2d5] bg-[#edfbf1]";
    if (weekendProximity.startDate > 1 && weekendProximity.endDate > 1) {
        return null;
    }
    if (start_date === end_date) {
        return (
            <View className={sectionClass}>
                <Text className={rowClass}>This off day is next to a weekend</Text>
            </View>
        );
    } else {
        return (
            <View className={sectionClass}>
                {weekendProximity.startDate === 1 && (
                    <Text className={rowClass}>Your start date is next to a weekend</Text>
                )}
                {weekendProximity.endDate === 1 && (
                    <Text className={rowClass}>Your end date is next to a weekend</Text>
                )}
            </View>
        );
    }
}

const PTORecommendationForWeekend = ({ datesToWeekend }) => {
    const rowClass = "text-sm font-normal text-[#444] mb-1.5 last:mb-0";
    const sectionClass = "p-3 rounded mt-2.5 border border-[#e1e4e8] bg-[#f0f4f8]";
    if (datesToWeekend.length === 0) {
        return null;
    }
    return (
        <View className={sectionClass}>
            <Text className={rowClass}>Combine this off day with weekend by taking off on these days:</Text>
            {datesToWeekend.map((suggestedDate, index) => (
                <Text key={index} className={rowClass}>{format(suggestedDate, 'PPPP')}</Text>
            ))}
        </View>
    )
}

const OffDayRecommendation = ({ recommendation }) => {
    const rowClass = "text-sm font-normal text-[#444] mb-1.5 last:mb-0";
    const sectionClass = "p-3 rounded mt-2.5 border border-[#e1e4e8] bg-[#f0f4f8]";
    if (!recommendation || !recommendation.dates || recommendation.dates.length === 0) {
        return null;
    }

    /* no point in showing recommendations that are more than 2 days */
    if (recommendation.dates.length > 2) {
        return null;
    }

    return (
        <View className={sectionClass}>
            <Text className={rowClass}>Combine this with {recommendation.day.offday_name} by taking off on these days:</Text>
            {recommendation.dates.map((suggestedDate, index) => (
                <Text key={index} className={rowClass}>{format(suggestedDate, 'PPPP')}</Text>
            ))}
        </View>
    )
}

export default OffDayCard;