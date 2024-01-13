import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
    return (
        // @ts-ignore
        <SafeAreaView className='flex-1 bg-cyan-200'>
            {/* @ts-ignore */}
            <Stack screenOptions={{ header: () => null }} />
        </SafeAreaView>

    );
}