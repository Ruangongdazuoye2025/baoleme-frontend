<script setup lang="ts">
import AMapLoader from "@amap/amap-jsapi-loader";
import { onMounted, watch } from "vue";

let map: any
let AMap: any

interface Props {
    startLongitude: number
    startLatitude: number
    currentLongitude: number
    currentLatitude: number
    endLongitude: number
    endLatitude: number
}
const props = defineProps<Props>()

onMounted(async () => {
    (window as any)._AMapSecurityConfig = {
        serviceHost: import.meta.env.VITE_AMAP_SERVICE,
    }
    AMap = await AMapLoader.load({
        key: import.meta.env.VITE_AMAP_KEY,
        version: "2.0",
        plugins: ["AMap.Scale", "AMap.Riding"],
    })
    map = new AMap.Map("container", {
        viewMode: '3D',
        zoom: 13,
        center: [props.currentLongitude, props.currentLatitude],
    })
    await updateRoute()
})

const updateRoute = () => {
    return new Promise<void>((resolve, reject) => {
        if (!map) {
            resolve()
            return
        }
        const start = new AMap.LngLat(props.startLongitude, props.startLatitude);
        const end = new AMap.LngLat(props.endLongitude, props.endLatitude);
        const riding = new AMap.Riding({
            map: map,
        });
        const marker = new AMap.Marker({
            position: new AMap.LngLat(props.currentLongitude, props.currentLatitude),
        });
        map.add(marker);
        riding.search(start, end, (status: string, result: any) => {
            if (status === 'complete') {

            } else {
                console.error('路线规划失败', result);
                reject(new Error('路线规划失败'));
            }
            resolve()
        });
    })
}

watch(props, async () => {
    await updateRoute()
})


</script>
<template>
    <div id="container" style="width: 100%; height: 100%;"></div>
</template>