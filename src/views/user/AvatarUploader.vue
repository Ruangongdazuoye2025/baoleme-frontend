<script setup lang="ts">
import { apiRoot } from '@/config/api';
import { useTokenStore } from '@/stores/token';
import { NFlex, NButton, NUpload, NImage, type UploadFileInfo, NCard, useMessage } from 'naive-ui'

interface Props {
    userId?: string
    imageSrc?: string
}
const props = defineProps<Props>()
const tokenStore = useTokenStore()
const message = useMessage()
const emit = defineEmits<{
    (e: 'finish', originLink: string, thumbnailLink: string): void
}>()
const handleFinished = ({ file, event } : { file: UploadFileInfo, event?: ProgressEvent }) => {
    const response = (event?.target as XMLHttpRequest).response
    emit('finish', response.origin, response.thumbnail)
}
const handleError = ({ file, event } : { file: UploadFileInfo, event?: ProgressEvent }) => {
    const response = (event?.target as XMLHttpRequest).response
    const status = (event?.target as XMLHttpRequest).status
    if (status === 413) {
        message.error('上传失败，文件过大')
        return
    }
    message.error(response.message)
}

</script>

<template>
    <n-card id="container" style="width: 400px;">
        <n-flex vertical style="width: 100%;" align="center">
            <n-image 
                :src="imageSrc"
                :width="320"
                :height="320"
                fallback-src="/default-avatar.webp"
            />
            <n-upload
                :action="`${apiRoot}/user/${props.userId}/avatar`"
                accept="image/*"
                name="avatar"
                :headers="{ Authorization: `Bearer ${tokenStore.token}` }"
                method="PATCH"
                response-type="json"
                :show-file-list="false"
                @finish="handleFinished"
                @error="handleError"
                style="display: flex; justify-content: center;"
            >
                <n-button style="align-self: center;">上传头像</n-button>
            </n-upload>
        </n-flex>
    </n-card>
</template>