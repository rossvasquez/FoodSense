import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'

export default function Home() {
    const router = useRouter()
    return(
        <View className='flex-1 justify-center items-center bg-cyan-200'>
            <Text className='text-6xl font-semibold text-cyan-700'>FoodSense</Text>
            {/* @ts-ignore */}
            <Pressable className='px-8 py-5 rounded-[4px] bg-teal-400 mt-24' onPress={() => router.push('/scanner')}>
                <Text className='text-white text-3xl font-light'>
                    Scan Now
                </Text>
            </Pressable>
        </View>
    )
}