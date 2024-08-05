<template>
    <div class="relative border-2  border-b-4" :class="isVisible?'border-amber-500':'border-slate-800'">
        <div class="flex gap-2 justify-between items-center p-1 hover:text-amber-500 cursor-pointer" :class="isVisible?'text-amber-500':''" @click="isVisible = !isVisible">
            <div>Voces</div>
            <div i-carbon-chevron-down-outline v-if="!isVisible" />
            <div i-carbon-chevron-up-outline v-if="isVisible" />
        </div>
        <div v-show="isVisible" class="">
            <div class="flex gap-2 p-2 bg-slate-800/20 items-center">
                <div class="text-sm">Filtros:</div>
                <div class="flex border-slate-800 border-1 gap-2 p-1 px-2">
                    <div i-flagpack-gb-ukm @click="selCoun='enGB'" class="cursor-pointer hover:scale-110" :class="selCoun=='enGB'?'':'grayscale opacity-50'" />
                    <div i-flagpack-us @click="selCoun='enUS'" class="cursor-pointer hover:scale-110" :class="selCoun=='enUS'?'':'grayscale opacity-50'" />
                    <div i-flagpack-mx @click="selCoun='esMX'" class="cursor-pointer hover:scale-110" :class="selCoun=='esMX'?'':'grayscale opacity-50'" />
                </div>
                <div class="flex border-slate-800 border-1 gap-2 p-1 px-2">
                    <div i-noto-female-sign @click="selGen='Female'" class="cursor-pointer hover:scale-110 " :class="selGen=='Female'?'':'grayscale opacity-50'" />
                    <div i-noto-male-sign  @click="selGen='Male'" class="cursor-pointer hover:scale-110"  :class="selGen=='Male'?'':'grayscale opacity-50'" />
                </div>
            </div>
            <div class="flex flex-col gap-1 h-80 overflow-scroll p-2">
                <template v-for="(item, index) in filteredVoices" :key="item.value">
                    <div class="px-1 border-1 border-gray-800 flex gap-2 items-center flex-wrap bg-slate-800/20">
                        <VoiceView :item="item" sample info></VoiceView>
                        <!--BTN-->
                        <div class="ml-auto cursor-pointer hover:text-amber-500" @click="emit('addvoice', item)">
                            <div i-carbon-add-alt />
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useStorage } from '@vueuse/core';
import useAxiosAudio from '../composables/axiosAudio';
import AudioPlayer from '@liripeng/vue-audio-player';


const isVisible = ref(false)

const emit=defineEmits(['addvoice'])


const { request } = useAxiosAudio();

const voiceslist = useStorage('etmaker-voiceslist', {});
const selCoun = useStorage('etmaker-audiocountry', 'enUS');
const selGen = useStorage('etmaker-audiogender', 'Male');

const filterVoices = (voicesdata) => {
    const allowedLanguageCodes = ['en-US', 'en-GB', 'es-MX'];
    const filtered = voicesdata.filter(voice => allowedLanguageCodes.includes(voice.languageCode));
    
    return {
        enUSMale: filtered.filter(voice => voice.languageCode === 'en-US' && voice.gender === 'Male'),
        enUSFemale: filtered.filter(voice => voice.languageCode === 'en-US' && voice.gender === 'Female'),
        enGBMale: filtered.filter(voice => voice.languageCode === 'en-GB' && voice.gender === 'Male'),
        enGBFemale: filtered.filter(voice => voice.languageCode === 'en-GB' && voice.gender === 'Female'),
        esMXMale: filtered.filter(voice => voice.languageCode === 'es-MX' && voice.gender === 'Male'),
        esMXFemale: filtered.filter(voice => voice.languageCode === 'es-MX' && voice.gender === 'Female'),
    }
};

const filteredVoices = computed(() => {
    const filtername = `${selCoun.value}${selGen.value}`;
    return voiceslist.value[filtername] || [];
});

onMounted(async () => {
    const options = {
        method: 'GET',
        url: 'https://api.play.ht/api/v1/getVoices',
        //url: 'http://ec2-54-149-59-254.us-west-2.compute.amazonaws.com/api/etodas/list.php',
        headers: {
            accept: 'application/json',
        },
    };

    try {
        const response = await request(options);
        voiceslist.value = filterVoices(response.voices);
    } catch (err) {
        console.error(err);
    }
});
</script>