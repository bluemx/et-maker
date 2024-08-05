<template>
    <div class="flex gap-1 items-center text-xs">
        <!--player-->
        <audio-player-btn  v-if="item.sample && sample" :audio-url="item.sample"></audio-player-btn>
        <!--FLAG-->
        <div i-flagpack-gb-ukm v-if="item.languageCode == 'en-GB'" />
        <div i-flagpack-us v-if="item.languageCode == 'en-US'" />
        <div i-flagpack-mx v-if="item.languageCode == 'es-MX'" />
        <!--GENDER-->
        <div i-noto-female-sign v-if="item.gender=='Female'" />
        
        <div i-noto-male-sign v-if="item.gender=='Male'" />
        <!--NAME-->
        <div class="w-14 text-left">{{ item.name }}</div>
        <template v-if="info">
            <!--VOICETYPE-->
            <div class="text-xs  px-1 text-white" :class="[
                    item.voiceType=='Standard'?'bg-blue-600':'',
                    item.voiceType=='Neural'?'bg-cyan-600':''
                ]">{{ item.voiceType }}</div>
            <!--STYLES-->
            <div v-if="item.styles" class="text-xs  px-1 text-white bg-stone-700" :alt="item.styles" :title="item.styles">Styles</div>
            <!--isKID-->
            <div class="text-xs  px-1 text-white flex gap-2 bg-purple-600" v-if="item.isKid"><div i-noto-boy-medium-light-skin-tone />Kid</div>
        </template>
        <template v-else>
            <div class="text-xs" v-if="item.isKid"><div i-noto-boy-medium-light-skin-tone /></div>

        </template>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    item: Object,
    sample: Boolean,
    info: Boolean,
})
</script>