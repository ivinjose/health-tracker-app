import { Separator } from "@/components/ui/separator";
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
            <View className="overflow-hidden bg-white">
                {children}

                {actions.length > 0 && (
                    <View className="absolute right-2 top-2">
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
            <Separator className="my-4" />
        </>
    );
};

export default CardView;