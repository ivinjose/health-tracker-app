import { EllipsisVertical } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CardView = ({ children, actions = [] }) => {
    return (
        <>
            <View className="overflow-hidden bg-white flex-row items-start justify-between gap-0">
                <View className="flex-1 min-w-0">{children}</View>

                {actions.length > 0 && (
                    <View className="shrink-0 pt-0.5">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Pressable className="p-1 -m-1">
                                    <EllipsisVertical size={20} color="#565656" />
                                </Pressable>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent>
                                {actions.map((action, index) => (
                                    <DropdownMenuItem key={index} onPress={action.action}>
                                        <Text>{action.label}</Text>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </View>
                )}
            </View>
        </>
    );
};

export default CardView;