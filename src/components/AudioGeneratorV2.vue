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


const generateUrl =  'http://ec2-54-149-59-254.us-west-2.compute.amazonaws.com/api/etodas/generate.php'
const voiceOptions = {
  method: 'POST',
  url: generateUrl,
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
      let streamJob = await startTranscrition({
        ...voiceOptions,
        data: { 
            text: element.dialog,
            voice: element.voice.id,
            output_format: "mp3",
            voice_engine: "PlayHT2.0",
            voice_guidance: 1,
            temperature:0.1
        }
      });
      let file = extractUrlFromStream(streamJob)
      if(file){
          audiourls.value.push(file);
      }
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
    const response = await request(options);
    return response;
  } catch (err) {
    console.error(err);
    throw err; // Re-throw the error to be handled in the calling function
  }
};

const extractUrlFromStream = (streamData) => {
  // Define the regex pattern to match the URL
  const urlPattern = /"url":"([^"]+)","duration"/;
  const match = streamData.match(urlPattern);

  // Check if the URL was found and return it
  if (match && match[1]) {
    return match[1];
  }

  return null; // Return null if no URL found
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