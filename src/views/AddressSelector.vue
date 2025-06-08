<script setup lang="ts">
import { onMounted, onUnmounted, watchEffect, ref, watch } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import { NButton, NInput, NInputGroup, useMessage, NInfiniteScroll, NList, NListItem, NThing, c } from "naive-ui";
import { CheckCircleFilled } from "@vicons/antd";

(window as any)._AMapSecurityConfig = {
    serviceHost: import.meta.env.VITE_AMAP_SERVICE,
}

let map: any
let dummyMap: any

interface Props {
    latitude: number
    longitude: number
}
const props = defineProps<Props>()
const latitude = defineModel<number>('latitude', { default: 39.90923 })
const longitude = defineModel<number>('longitude', { default: 116.397428 })

const message = useMessage()

let AMap: any
let marker: any

onMounted(async () => {
    AMap = await AMapLoader.load({
        key: import.meta.env.VITE_AMAP_KEY,
        version: "2.0",
        plugins: ["AMap.Scale", "AMap.PlaceSearch"],
    })
    map = new AMap.Map("container", {
        viewMode: '3D',
        zoom: 11,
        center: [longitude.value, latitude.value],
    })
    const marker = new AMap.Marker({
        position: map.getCenter(),
    });
    map.add(marker);
    dummyMap = new AMap.Map("dummy-comtainer")
    map.on('moveend', () => {
        const center = map.getCenter()
        latitude.value = center.lat
        longitude.value = center.lng
        marker.setPosition(center)
        updatePlaces()
    })
    await updatePlaces()
})

onUnmounted(() => {
    map?.destroy()
})

watchEffect(() => {
    if (!map)
        return
    map.setCenter([longitude.value, latitude.value])
})

const keyword = ref<string>("")
watch(keyword, (newKeyword) => {
    if (newKeyword.trim() === "") {
        updatePlaces()
    }
})

interface PlaceOfInterest {
    name: string
    address: string
    lat: number
    lng: number
    id: string
    province: string
    city: string
    district: string
}
const places = ref<PlaceOfInterest[]>([])

const currentPlace = ref<PlaceOfInterest | null>(null)

let updateFlag = true

const updatePlaces = async () => {
    if (!updateFlag) {
        updateFlag = true
        return
    }
    places.value = []
    currentPlace.value = null
    await loadMorePlaces()
}

const loadMorePlaces = () => {
    return new Promise<void>((resolve) => {
        if (!AMap || !map) {
            resolve()
            return
        }
        AMap.plugin("AMap.PlaceSearch", function () {
            var placeSearch = new AMap.PlaceSearch({
                pageIndex: places.value.length / 10 + 1,
                pageSize: 10,
                map: dummyMap,
            })
            placeSearch.searchNearBy(keyword.value, map.getCenter(), 50000, (status: any, result: any) => {
                if (result.info === "OK") {
                    const pois = result.poiList.pois
                    pois.forEach((poi: any) => {
                        places.value.push({
                            name: poi.name,
                            address: poi.address,
                            lat: poi.location.lat,
                            lng: poi.location.lng,
                            id: poi.id,
                            province: poi.pname,
                            city: poi.cityname,
                            district: poi.adname,
                        })
                    })
                }
                resolve()
            })
        })
    })
}

const selectPlace = async (place: PlaceOfInterest) => {
    if (!map)
        return
    if (place.id === currentPlace.value?.id) {
        currentPlace.value = null
        return
    }
    updateFlag = false
    map.setCenter([place.lng, place.lat])
    map.setZoom(15)

    currentPlace.value = place
}

const emit = defineEmits<{
    (e: 'select', province: string, city: string, district: string, address: string, longitude: number, latitude: number): void
}>()

const handleSelect = () => {
    if (!currentPlace.value) {
        return
    }
    emit('select', currentPlace.value.province, currentPlace.value.city, currentPlace.value.district, currentPlace.value.address + currentPlace.value.name, currentPlace.value.lng, currentPlace.value.lat)
}

</script>
<template>
    <div id="dummy-comtainer" style="display: none;"></div>
    <div id="container" style="width: 100%; height: 200px;"></div>
    <n-input-group style="padding: 8px;">
        <n-input v-model:value="keyword" style="width: 100%;" clearable />
        <n-button type="primary" @click="updatePlaces">
            搜索
        </n-button>
    </n-input-group>
    
    <n-infinite-scroll style="height: 400px;" @load="loadMorePlaces">
        <n-list hoverable clickable>
            <n-list-item v-for="place in places" :key="place.id" @click="selectPlace(place)">
                <n-thing content-indented>
                    <template v-if="place.id === currentPlace?.id" #avatar>
                        <n-icon><CheckCircleFilled/></n-icon>
                    </template>
                    <template #header>
                        {{ place.name }}
                    </template>
                    <template #description>
                        {{ place.address }}
                    </template>
                </n-thing>
            </n-list-item>
        </n-list>
    </n-infinite-scroll>
    <n-button :disabled="!currentPlace" type="primary" style="width: 100%; margin: 8px;" @click="handleSelect">
        确认选择
    </n-button>
</template>