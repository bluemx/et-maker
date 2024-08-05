<template>
    <div class="flex gap-1 items-center text-xs">
        <!--player-->
        <audio-player-btn  v-if="item.sample && sample" :audio-url="item.sample"></audio-player-btn>
        <!--FLAG-->
        <div i-flagpack-gb-ukm v-if="item.language_code == 'en-GB'" />
        <div i-flagpack-us v-if="item.language_code == 'en-US'" />
        <!--GENDER-->
        <div i-noto-female-sign v-if="item.gender=='female'" />
        <div i-noto-male-sign v-if="item.gender=='male'" />
        <!--NAME-->
        <div class="w-20 text-left">{{ item.name }}</div>
        
        <div class="flex justify-end gap-1" v-if="info">
            <div class="text-xs  px-1 text-white bg-stone-700" v-if="item.age">{{ item.age }}</div>
            <div class="text-xs  px-1 text-white bg-gray-700" v-if="item.style">{{ item.style }}</div>
            <div class="text-[6px] " v-if="item.voice_engine" :class="item.voice_engine == 'PlayHT2.0' ? 'text-amber-500' : 'text-lime-400'">{{ item.voice_engine }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    item: Object,
    sample: Boolean,
    info: Boolean,
})
</script>