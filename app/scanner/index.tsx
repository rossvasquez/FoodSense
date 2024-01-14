import { ScrollView, View, Text, Pressable, Vibration, LayoutChangeEvent } from 'react-native'

import PagerView, { PageScrollStateChangedNativeEvent, PagerViewOnPageSelectedEvent } from 'react-native-pager-view'

import { useState, useEffect } from 'react'

import { BarCodeScanner } from 'expo-barcode-scanner'

import { useRouter } from 'expo-router'

enum Status {
  prompted = 'prompted',
  granted = 'granted',
  denied = 'denied'
}

interface ScannerOutput {
  type: string,
  data: string
}

export default function Scanner() {

    const router = useRouter()

    const [hasPermission, setHasPermission] = useState<Status>()
    const [scanned, setScanned] = useState(false)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    useEffect(() => {
      const getBarCodeScannerPermissions = async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync()
        status === 'granted' ? setHasPermission(Status.granted) : setHasPermission(Status.denied)
      }

      getBarCodeScannerPermissions()
    }, [])

    const [nutritionInfo, setNutrtionInfo] = useState({
      name: '',
      nutrients: {
        calories: '',
        fat: '',
        satfat: '',
        sugar: ''
      },
      ingredients: ''
    })

    const untilComma = (phrase: string) => {
      return phrase.slice(0, phrase.indexOf(','))
    }

    const getNutrition = async (upc: string) => {
      try {
        await fetch(`https://api.edamam.com/api/food-database/v2/parser?app_id=d87901fa&app_key=acc836d0547872ca788f4868a6fc976e&upc=${upc}`)
        .then((response) => response.json())
        .then((responseJson) => {
          setNutrtionInfo({
            name: untilComma(responseJson.hints[0].food.label),
            nutrients: {
              calories: responseJson.hints[0].food.nutrients.ENERC_KCAL.toFixed(0).toString(),
              fat: responseJson.hints[0].food.nutrients.FAT.toFixed(0).toString(),
              satfat: responseJson.hints[0].food.nutrients.FASAT.toFixed(0).toString(),
              sugar: responseJson.hints[0].food.nutrients.SUGAR.toFixed(0).toString()
            },
            ingredients: responseJson.hints[0].food.foodContentsLabel
          })
        })
        setError(false)
        setLoading(false)
      } catch (error) {
        setError(true)
        setLoading(false)
      }
    }

    const handleBarCodeScanned = ({ type, data }: ScannerOutput) => {
      getNutrition(data)
      setScanned(true)
      setLoading(true)
      Vibration.vibrate()
    }

    if (hasPermission === 'prompted') {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === 'denied') {
      return <Text>No access to camera</Text>;
    }

    const Scanner = () =>
    <>
      <View className='overflow-hidden h-[260px] w-full rounded-[10px] border-[4px] border-teal-300'>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            className='w-full h-full'
          />
      </View>
      <Text className='text-xl font-light text-cyan-700 mt-4 mb-14'>Place Full Barcode in Box</Text>
    </>

    const Error = () =>
    <View className='overflow-hidden w-full h-auto bg-zinc-100 rounded-[4px] shadow-md'>
      <Text className='text-3xl font-semibold text-white p-3 bg-teal-400'>Item Not Found</Text>
      <Text className='text-xl font-normal text-cyan-700 px-3 py-4'>Sorry, we couldn't find what you're looking for, please try a different item.</Text>
    </View>

    const [height, setHeight] = useState(0)

    const onLayout = (event: LayoutChangeEvent) => {
      const {x, y, height, width} = event.nativeEvent.layout
      setHeight(height)
    }

    const Success = () => {
      
      const [currentPage, setCurrentPage] = useState(0)

      const setDot = (e: PagerViewOnPageSelectedEvent) => {
        setCurrentPage(e.nativeEvent.position)
      }

      return(
      <>
      <PagerView onPageSelected={e => setDot(e)} className='w-full h-[440px]' initialPage={0}>
        <View className='overflow-hidden w-full h-full bg-zinc-100 rounded-[4px] shadow-md' key="1">
          <Text onLayout={onLayout} className='text-3xl font-semibold text-white p-3 bg-teal-400'>{nutritionInfo.name}</Text>
          <ScrollView className='p-3'>
            <Text className='text-xl font-normal text-cyan-700'>{nutritionInfo.nutrients.calories} Calories</Text>
            <Text className='text-xl font-normal text-cyan-700'>{nutritionInfo.nutrients.fat} Grams of Fat</Text>
            <Text className='text-xl font-normal text-cyan-700'>{nutritionInfo.nutrients.satfat} Grams of Saturated Fat</Text>
            <Text className='text-xl font-normal text-cyan-700'>{nutritionInfo.nutrients.sugar} Grams of Sugar</Text>
            <Text className='text-md font-light text-cyan-700 mt-2 mb-3'>{nutritionInfo.ingredients}</Text>
          </ScrollView>
        </View>
        <View className='overflow-hidden w-full h-full bg-zinc-100 rounded-[4px] shadow-md' key="2">
          <View style={{height: height}} className='px-3 flex flex-row items-center bg-teal-400'><Text className='text-3xl font-semibold text-white'>AI Analysis</Text></View>
          <ScrollView>
            <Text className='text-xl font-normal text-cyan-700 px-3 py-3'>I'm an AI made by Sam Altman. Jajajajajajaja.</Text>
          </ScrollView>
        </View>
      </PagerView>
      <View className='w-full h-14 flex flex-row justify-center items-center gap-3'>
        <View className={`${currentPage === 0 ? 'bg-cyan-400' : 'bg-neutral-200'} h-3 w-3 rounded-[100%]`} />
        <View className={`${currentPage === 1 ? 'bg-cyan-400' : 'bg-neutral-200'} h-3 w-3 rounded-[100%]`} />
      </View>
      </>
      )
    }


    const ScannedData = () =>
    <View className='flex flex-col justify-center w-full'>
      {!error && <Success />}
      {error && <Error />}
      <Pressable className='w-full py-4 flex justify-center items-center rounded-[4px] bg-teal-400 mt-8' onPress={() => setScanned(false)}>
              <Text className='font-light text-white text-3xl'>
                  Scan Again
              </Text>
      </Pressable>
    </View>

    const Loading = () =>
    <Text className='text-3xl text-cyan-700 animate-pulse pb-20'>Searching...</Text>

    return(
        <View className='flex-1 justify-center items-center bg-cyan-200 px-3'>
            {!scanned && <Scanner />}
            {scanned && loading && <Loading />}
            {scanned && !loading && <ScannedData />}
            <Pressable className='w-full py-4 flex justify-center items-center rounded-[4px] bg-cyan-400 mt-2' onPress={() => router.push('/')}>
              <Text className='font-light text-white text-3xl'>
                  Back Home
              </Text>
            </Pressable>
        </View>
    )
}