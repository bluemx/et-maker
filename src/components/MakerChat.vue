<template>
    <div class="relative border-2  border-b-4 border-amber-500">
        <div class="flex gap-2 justify-between items-center p-1 text-amber-500" @click="isVisible = !isVisible">
            <div>IA</div>
        </div>
        <div ref="el" class="p-1 border-1 border-amber-500 text-left">
            Instrucción
        </div>
        <div>
            <textarea v-model="inputInstruction" class="text-xs p-1 w-full h-40 relative z-0 resize-none bg-slate-800/20 dark:bg-slate-900 border-1 border-dashed border-slate-800 focus:outline-amber-500"></textarea>
        </div>
        <div ref="el" class="p-1 border-1 border-amber-500 text-left">
            Entrada
        </div>
        <div>
            <textarea v-model="inputText" class="p-1 w-full h-92 text-xs relative z-0 bg-slate-800/20 dark:bg-slate-900 border-1 border-dashed border-slate-800 focus:outline-amber-500"></textarea>
        </div>
        
        <div class="flex justify-end">
            <div  v-if="!loading" class="p-1 bg-amber-500 text-slate-800 cursor-pointer hover:bg-slate-800 hover:text-amber-500 flex gap-2 m-1" @click="convertText()" >
                <div i-carbon-workflow-automation />
                Procesar 
            </div>
            <div class="p-1 text-amber-500 flex" v-else>
                <div i-carbon-circle-dash class="animate-spin" />
            </div>
        </div>

        <div ref="el" class="p-1 border-1 border-amber-500 text-left">
            Salida
        </div>
        <div v-if="convertedObject" class="p-1  bg-slate-800 border-1 border-slate-500 ">
          <pre class="whitespace-pre-wrap text-left text-xs"><code class="text-slate-200 whitespace-pre-wrap" v-html="convertedObject"></code></pre>
          <div class="flex justify-end">

            <div class="p-1 bg-amber-500 text-slate-800 cursor-pointer hover:bg-slate-800 hover:text-amber-500 flex gap-2 m-1" @click="copy(convertedObject)" >
                <div i-carbon-copy-file />
                Copiar
            </div>
        </div>
        </div>

    </div>

  </template>
  
  <script setup>
  import { ref } from 'vue'
  import axios from 'axios'
  import { useClipboard } from '@vueuse/core'
  

  const inputInstruction = useStorage('etmaker-chatInputInstruction', 'I have a series of questions and answers for an English listening comprehension test. I need you to help me format them into a JSON structure. Each question has an audio description, a textual question, multiple choice options, the correct answer, an explanation of why that answer is correct, and additional metadata. Here´s how each entry should look in JSON format: {     "title": "Question X",     "audio": "[AUDIO] <audio description here>",     "question": "<textual question here>",     "options": [         "<Option A>",         "<Option B>",         "<Option C>",         "<Option D>"     ],     "optionk": "<correct option letter>",     "optionw": "<explanation of why the correct answer is correct>",     "eval": true,     "type": "listening" } Discard the texts that don´t fit in the object. Text between [] should be removed. Return explictly only json text. Dont return any explanation. Return only compatible json content. Audio key is "a/q<questionNumber>.mp3", like a/q1.mp3, a/q2.mp3, etc. Don´t translate content. If the texts´ source es english, it stays in english. If the text is in spanish, it stays in spanish.');
  const inputText = useStorage('etmaker-chatInput', null);
  const convertedObject = useStorage('etmaker-chatOutput', null);
  const loading = ref(false);

  const { text, copy, copied, isSupported } = useClipboard({ convertedObject })

  const convertText = async () => {
    loading.value = true
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: "gpt-4o-mini",
          messages: [
          {
              "role": "system",
              "content": inputInstruction.value
          },
          {
              "role": "user",
              "content": inputText.value
          }
      ]
      }, {
        headers: {
          'Authorization': `Bearer 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`,
          'Content-Type': 'application/json'
        }
      })
      // Parse the response as JSON
      const jsonResponse = response.data.choices[0].message.content.replace(/```json\n?|```/g, '');
      convertedObject.value = jsonResponse
      loading.value = false
    } catch (error) {
        console.error('Error converting text:', error)
        loading.value = false
    }
  }
  </script>