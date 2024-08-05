
<template>
    <MakerAudiosListV2 @addvoice="addvoice"></MakerAudiosListV2>

    <MakerAudiosDialogV2 ref="dialog"></MakerAudiosDialogV2>

</template>

<script setup lang="ts">
const dialog = ref()
const addvoice = (item) => {
    dialog.value.addvoice(item)

}
</script>