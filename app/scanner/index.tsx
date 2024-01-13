import { View, Text, Pressable, Vibration } from 'react-native'

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
    const [scanData, setScanData] = useState<ScannerOutput>({
      type: '',
      data: ''
    })

    useEffect(() => {
      const getBarCodeScannerPermissions = async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync()
        status === 'granted' ? setHasPermission(Status.granted) : setHasPermission(Status.denied)
      };

      getBarCodeScannerPermissions()
    }, []);

    const handleBarCodeScanned = ({ type, data }: ScannerOutput) => {
      setScanData({type, data})
      setScanned(true)
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

    const ScannedData = () =>
    <>
      <Text className='text-2xl font-light text-cyan-700'>Type: {scanData.type}</Text>
      <Text className='text-2xl font-light text-cyan-700'>Data: {scanData.data}</Text>
      <Pressable className='w-full py-4 flex justify-center items-center rounded-[4px] bg-teal-400 mt-24' onPress={() => setScanned(false)}>
              <Text className='font-light text-white text-3xl'>
                  Scan Again
              </Text>
      </Pressable>
    </>

    return(
        <View className='flex-1 justify-center items-center bg-cyan-200 px-3'>
            {scanned === false && <Scanner />}
            {scanned && <ScannedData />}
            <Pressable className='w-full py-4 flex justify-center items-center rounded-[4px] bg-cyan-400 mt-2' onPress={() => router.push('/')}>
              <Text className='font-light text-white text-3xl'>
                  Back Home
              </Text>
            </Pressable>
        </View>
    )
}