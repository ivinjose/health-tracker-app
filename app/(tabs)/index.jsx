import CardView from "@/components/CardView";
import NewOffDayDialog from "@/components/NewOffDayDialog";
import OffDayCard from "@/components/OffDayCard";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, View } from "react-native";
import useOffDaysApiManager from "../../api-managers/OffDaysApiManager";

export default function HomePage() {
	const offDaysApiManager = useOffDaysApiManager();

	const { data: processedOffdays = [], isLoading } = useQuery({
		queryKey: ["processedOffdays"],
		queryFn: () => offDaysApiManager.getProcessedOffDays({}),
	});

	const isEmpty = !isLoading && processedOffdays.length === 0;

	return (
		<View className="flex-1 bg-white">
			{isLoading ? (
				<Loading />
			) : isEmpty ? (
				<View className="flex-1 flex-col items-center justify-center gap-4 px-4">
					<Text className="text-sm text-[#6b7280] text-center">
						Looks like you haven&apos;t added anything yet. Add something to get started
					</Text>
				</View>
			) : (
				<ScrollView
					className="flex-1"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ padding: 16, paddingTop: 16 }}
				>
					<View className="gap-4">
						{processedOffdays?.map((offDay) => (
							<View key={offDay._id ?? `${offDay.start_date}-${offDay.end_date ?? ""}`}>
								<OffDayCard {...offDay} />
								<Separator className="my-4" />
							</View>
						))}
					</View>
				</ScrollView>
			)}

			<NewOffDayDialog />
		</View>
	);
}

function Loading() {
	return (
		<View className="gap-4" style={{ padding: 16, paddingTop: 16 }}>
			<CardView actions={[]}>
				<View className="flex-row gap-4 p-4">
					<View className="h-16 w-16 rounded-lg bg-[#f3f4f6]" />
					<View className="flex-1 gap-2">
						<View className="h-4 w-[190px] rounded bg-[#f3f4f6]" />
						<View className="h-4 w-[160px] rounded bg-[#f3f4f6]" />
						<View className="h-4 w-[220px] rounded bg-[#f3f4f6]" />
						<View className="h-4 w-[120px] rounded bg-[#f3f4f6]" />
					</View>
				</View>
			</CardView>
		</View>
	);
}
