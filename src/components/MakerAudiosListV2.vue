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
                </div>
                <div class="flex border-slate-800 border-1 gap-2 p-1 px-2">
                    <div i-noto-female-sign @click="selGen='Female'" class="cursor-pointer hover:scale-110 " :class="selGen=='Female'?'':'grayscale opacity-50'" />
                    <div i-noto-male-sign  @click="selGen='Male'" class="cursor-pointer hover:scale-110"  :class="selGen=='Male'?'':'grayscale opacity-50'" />
                </div>
            </div>
            <div class="flex flex-col gap-1 h-80 overflow-scroll p-2">
                <template v-for="(item, index) in filteredVoices" :key="item.value">
                    <div class="px-1 border-1 border-gray-800 flex gap-2 items-center flex-wrap bg-slate-800/20">
                        <VoiceViewV2 :item="item" sample info></VoiceViewV2>
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

const voiceslist = useStorage('etmaker-voiceslistV2', {});
const selCoun = useStorage('etmaker-audiocountryV2', 'enUS');
const selGen = useStorage('etmaker-audiogenderV2', 'Male');

const filterVoices = (voicesdata) => {
    const allowedlanguage_codes = ['en-US', 'en-GB', 'es-MX'];
    const filtered = voicesdata.filter(voice => allowedlanguage_codes.includes(voice.language_code));
    
    return {
        enUSMale: filtered.filter(voice => voice.language_code === 'en-US' && voice.gender === 'male'),
        enUSFemale: filtered.filter(voice => voice.language_code === 'en-US' && voice.gender === 'female'),
        enGBMale: filtered.filter(voice => voice.language_code === 'en-GB' && voice.gender === 'male'),
        enGBFemale: filtered.filter(voice => voice.language_code === 'en-GB' && voice.gender === 'female')
    }
};

const filteredVoices = computed(() => {
    const filtername = `${selCoun.value}${selGen.value}`;
    return voiceslist.value[filtername] || [];
});

onMounted(async () => {
    const options = {
        method: 'GET',
        //url: 'https://api.play.ht/api/v1/getVoices',
        url: 'http://ec2-54-149-59-254.us-west-2.compute.amazonaws.com/api/etodas/list.php',
        headers: {
            accept: 'application/json',
        },
    };

    try {
        const response = await request(options);
        voiceslist.value = filterVoices(response);
    } catch (err) {
        console.error(err);
    }
});
</script>