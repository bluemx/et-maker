import lamejs from 'lamejs'

export const EncodeFN = {
  async init(audioBlobs) {
    const blobToArrayBuffer = blob =>
      new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsArrayBuffer(blob)
      })

    const audioDataPromises = audioBlobs.map(blobToArrayBuffer)
    const audioDatas = await Promise.all(audioDataPromises)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()

    const audioBufferPromises = audioDatas.map(data => audioContext.decodeAudioData(data))
    const audioBuffers = await Promise.all(audioBufferPromises)

    let offset = 0
    const totalLength = audioBuffers.reduce((length, buffer) => length + buffer.length, 0)
    const outputBuffer = audioContext.createBuffer(audioBuffers[0].numberOfChannels, totalLength, audioContext.sampleRate)

    audioBuffers.forEach((buffer) => {
      for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        const outputData = outputBuffer.getChannelData(channel)
        const inputData = buffer.getChannelData(channel)

        for (let sample = 0; sample < inputData.length; sample++)
          outputData[sample + offset] = inputData[sample]
      }

      offset += buffer.length
    })

    // convert outputBuffer to MP3 using lamejs
    const mp3encoder = new lamejs.Mp3Encoder(outputBuffer.numberOfChannels, outputBuffer.sampleRate, 128) // assuming 128 kbps bit rate
    const mp3Data = []
    const samples = []

    for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
      samples[channel] = outputBuffer.getChannelData(channel)
      samples[channel] = samples[channel].map(sample => Math.max(-32768, Math.min(32767, sample * 32768))) // convert float samples to 16-bit PCM
    }

    const sampleBlockSize = 1152
    for (let i = 0; i < samples[0].length; i += sampleBlockSize) {
      const sampleChunk = []

      for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        sampleChunk[channel] = samples[channel].subarray(i, i + sampleBlockSize)
      }

      let mp3buf = mp3encoder.encodeBuffer.apply(mp3encoder, sampleChunk)
      if (mp3buf.length > 0)
        mp3Data.push(mp3buf)
    }

    const mp3buf = mp3encoder.flush() // finish encoding
    if (mp3buf.length > 0)
      mp3Data.push(mp3buf)

    const blob = new Blob(mp3Data, { type: 'audio/mp3' })

    return blob
  }
}