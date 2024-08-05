<template>
  <button @click="togglePlay" class="audio-button cursor-pointer hover:text-amber-500">
    <div i-carbon-stop-filled v-if="isPlaying" />
    <div i-carbon-play-filled v-else />
  </button>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  audioUrl: {
    type: String,
    required: true
  }
});

const isPlaying = ref(false);
let audio = new Audio(props.audioUrl);

const togglePlay = () => {
  if (isPlaying.value) {
    audio.pause();
  } else {
    audio.play();
  }
  isPlaying.value = !isPlaying.value;
};

const handleAudioEnd = () => {
  isPlaying.value = false;
};

const setupAudio = () => {
  audio.addEventListener('ended', handleAudioEnd);
};

const cleanupAudio = () => {
  audio.removeEventListener('ended', handleAudioEnd);
};

// Watch for changes in audioUrl to create a new audio object
watch(() => props.audioUrl, (newUrl) => {
  audio.pause();
  isPlaying.value = false;
  cleanupAudio();
  audio = new Audio(newUrl);
  setupAudio();
});

onMounted(setupAudio);
onUnmounted(cleanupAudio);

</script>

<style scoped>
/* Add your styles here */
</style>