<script setup lang="ts">
defineOptions({
  name: 'IndexPage',
})
const user = useUserStore()
const name = ref(user.savedName)

const router = useRouter()
function go() {
  if (name.value)
    router.push(`/hi/${encodeURIComponent(name.value)}`)
}

const { t } = useI18n()
</script>

<template>
  <div class="grid grid-cols-3 gap-10">

    <div><MakerAudios></MakerAudios></div>
    <div><MakerAudiosV2></MakerAudiosV2></div>
    <div><MakerChat></MakerChat></div>

  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
