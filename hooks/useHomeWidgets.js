import useHomeWidgetsApiManager from '@/api-managers/HomeWidgetsApiManager';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const HOME_WIDGETS_QUERY_KEY = ['home-widgets'];

export default function useHomeWidgets() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const homeWidgetsApiManager = useHomeWidgetsApiManager();

	const { data: slugs = [] } = useQuery({
		queryKey: HOME_WIDGETS_QUERY_KEY,
		queryFn: () => homeWidgetsApiManager.readHomeWidgets(),
	});

	const { mutate: addWidget } = useMutation({
		mutationFn: (investigation) => homeWidgetsApiManager.createHomeWidget(investigation),
		onMutate: async (investigation) => {
			await queryClient.cancelQueries({ queryKey: HOME_WIDGETS_QUERY_KEY });
			const previous = queryClient.getQueryData(HOME_WIDGETS_QUERY_KEY) ?? [];
			if (!previous.includes(investigation)) {
				queryClient.setQueryData(HOME_WIDGETS_QUERY_KEY, [...previous, investigation]);
			}
			return { previous };
		},
		onError: (error, _investigation, context) => {
			if (context?.previous !== undefined) {
				queryClient.setQueryData(HOME_WIDGETS_QUERY_KEY, context.previous);
			}
			toast({ description: error.message });
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: HOME_WIDGETS_QUERY_KEY });
		},
	});

	const { mutate: removeWidget } = useMutation({
		mutationFn: (investigation) => homeWidgetsApiManager.deleteHomeWidget(investigation),
		onMutate: async (investigation) => {
			await queryClient.cancelQueries({ queryKey: HOME_WIDGETS_QUERY_KEY });
			const previous = queryClient.getQueryData(HOME_WIDGETS_QUERY_KEY) ?? [];
			queryClient.setQueryData(
				HOME_WIDGETS_QUERY_KEY,
				previous.filter((slug) => slug !== investigation)
			);
			return { previous };
		},
		onError: (error, _investigation, context) => {
			if (context?.previous !== undefined) {
				queryClient.setQueryData(HOME_WIDGETS_QUERY_KEY, context.previous);
			}
			toast({ description: error.message });
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: HOME_WIDGETS_QUERY_KEY });
		},
	});

	return { slugs, addWidget, removeWidget };
}
