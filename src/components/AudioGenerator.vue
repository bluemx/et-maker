<template>
  <div class="flex gap-2 items-center">
    <div class="flex gap-2 items-center" v-if="audiourls.length > 0">
      <div v-for="(url, index) in audiourls" :key="index" class="flex items-center">
        <audio-player-btn :audio-url="url"></audio-player-btn>
      </div>
    </div>
    <div class="p-1 bg-amber-500 text-slate-800 cursor-pointer hover:bg-slate-800 hover:text-amber-500" @click="downloadMp3File()" v-if="mp3file">
      <div i-carbon-download />
    </div>
    <div class="p-1 bg-amber-500 text-slate-800 cursor-pointer hover:bg-slate-800 hover:text-amber-500" @click="generate()" v-if="!loading">
      <div i-carbon-data-player />
    </div>
    <div class="p-1 text-amber-500 " v-else>
      <div i-carbon-circle-dash class="animate-spin" />
    </div>
  </div>
</template>

<script setup lang="ts">
import lamejs from 'lamejs'
import { EncodeFN } from '../composables/AudioProcess'
import Crunker from 'crunker'; // Import Crunker library
import useAxiosAudio from '../composables/axiosAudio';
const { request } = useAxiosAudio();
const props = defineProps({
  item: Object,
  filename: String
})

const audiourls = ref([]);
const loading = ref(false);
const audiofile = ref(null);
const mp3file = ref(null);

const voiceOptions = {
  method: 'POST',
  url: 'https://api.play.ht/api/v1/convert',
  headers: {accept: 'application/json', 'content-type': 'application/json'},
};

const jobOptions = {
  method: 'GET',
  url: 'https://api.play.ht/api/v1/articleStatus',
}

// Function to create a delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const generate = async () => {
  loading.value = true;
  audiourls.value = [];
  audiofile.value = null;
  mp3file.value = null;

  let filename = props.item.id;

  try {
    for (const element of props.item.dialogs) {
      let transcriptionID = await startTranscrition({
        ...voiceOptions,
        data: { content: [element.dialog], voice: element.voice.value }
      });

      let file = await checkJob({
        ...jobOptions,
        params: { transcriptionId: transcriptionID }
      });

      //Push individuals
      audiourls.value.push(file);
    }
    await mergeAudioFiles(audiourls.value);
    
  } catch (err) {
    console.error('Error in generating transcription:', err);
    // Optionally, handle the error to show a message to the user or perform other actions
  } finally {
    loading.value = false;
  }
};

const startTranscrition = async (options) => {
  try {
    console.log('startTranscrition', options)
    const response = await request(options);
    return response.transcriptionId;
  } catch (err) {
    console.error(err);
    throw err; // Re-throw the error to be handled in the calling function
  }
};

const checkJob = async (options) => {
  try {
    while (true) {
      const response = await request(options);
      console.log('checkJob', response);

      if (response.error) {
        console.error(response.message);
        throw new Error(response.message); // This will break the loop and stop further requests
      }

      if (response.converted) {
        return response.audioUrl;
      }

      // Wait for 5 seconds before checking again
      await delay(2000);
    }
  } catch (err) {
    console.error(err);
    throw err; // Re-throw the error to be handled in the calling function
  }
};

const mergeAudioFiles = async (urls) => {
  const crunker = new Crunker();
  crunker.fetchAudio(...urls)
  .then((buffers)=>{
    return crunker.concatAudio(buffers)
  })
  .then((merged)=>{
    return crunker.export(merged, 'audio/mp3')
  })
  .then((output)=>{
    audiourls.value = [output.url];
    audiofile.value = output.url;
    startConvertion(output.blob)
  })
};

const startConvertion = async (audioOutput) => {
   let outputEncode = await EncodeFN.init([audioOutput])
   mp3file.value = URL.createObjectURL(outputEncode)
}

const convertToMp3 = async (outputBuffer) => {

  const mp3encoder = new lamejs.Mp3Encoder(outputBuffer.numberOfChannels, outputBuffer.sampleRate, 128) // assuming 128 kbps bit rate
    const mp3Data = []
    let samples = outputBuffer.getChannelData(0) // assuming mono audio

    samples = samples.map(sample => sample * 32767.5) // convert float samples to 16-bit PCM
    samples = new Int16Array(samples)

    let mp3buf = mp3encoder.encodeBuffer(samples)
    if (mp3buf.length > 0)
      mp3Data.push(mp3buf)

    mp3buf = mp3encoder.flush() // finish encoding
    if (mp3buf.length > 0)
      mp3Data.push(mp3buf)

    const blob = new Blob(mp3Data, { type: 'audio/mp3' })
    const url = URL.createObjectURL(blob);
    mp3file.value = url


/*
  try {
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const samples = audioBuffer.getChannelData(0); // assuming mono channel
    const mp3Encoder = new lamejs.Mp3Encoder(1, audioBuffer.sampleRate, 128);
    const mp3Data = [];
    let sampleBlockSize = 1152;

    for (let i = 0; i < samples.length; i += sampleBlockSize) {
      const sampleChunk = samples.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }
    const endMp3Buf = mp3Encoder.flush();
    if (endMp3Buf.length > 0) {
      mp3Data.push(endMp3Buf);
    }

    const blob = new Blob(mp3Data, { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);
    

    // Optionally download the MP3 file
    //downloadMp3File();
  } catch (error) {
    console.error('Error converting audio to MP3:', error);
  }
    */
};

const downloadMp3File = () => {
  if (mp3file.value) {
    const downloadLink = document.createElement('a');
    downloadLink.href = mp3file.value;
    downloadLink.download = props.filename + '.mp3';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
};

const downloadAudioFile = () => {
  if (audiofile.value) {
    // Automatically trigger the download
    const downloadLink = document.createElement('a');
    downloadLink.href = audiofile.value;
    downloadLink.download = props.filename + '.mp3';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
};
</script>