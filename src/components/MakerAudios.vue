
<template>
    <MakerAudiosList @addvoice="addvoice"></MakerAudiosList>

    <MakerAudiosDialog ref="dialog"></MakerAudiosDialog>

</template>

<script setup lang="ts">
const dialog = ref()
const addvoice = (item) => {
    dialog.value.addvoice(item)
}
</script>