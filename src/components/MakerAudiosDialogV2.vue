<template>
    <div class="relative border-2  border-b-4 border-amber-500">
        <div class="flex gap-2 justify-between items-center p-1 text-amber-500" @click="isVisible = !isVisible">
            <div>Diálogos</div>
        </div>
    
    <div ref="el" class="p-1 border-1 border-amber-500 flex flex-col gap-1">
        <div v-for="(item, index) in voices" :key="item.id">
            <div class="border-1 border-slate-800 bg-slate-90 p-0.5 bg-slate-800/20">
                <div class="flex gap-1 items-center">
                    <div>
                        <div :class="symC[index]" class="text-dark font-bold aspect-square w-5 block grow-0 shrink-0">{{ symL[index] }}</div>
                    </div>
                    <div i-carbon-draggable class="cursor-grab handle " />
                    <VoiceViewV2 sample :item="item.voice"></VoiceViewV2>
                    <input class="ml-auto w-14 text-xs text-center text-amber-600 dark:text-amber-500" v-model="item.note">
                    <div class=" cursor-pointer hover:text-amber-500" @click="remove(index)">
                        <div i-carbon-delete />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="p-1 border-1 border-amber-500">
      <MakerAudiosDialogInputV2 ref="DialogInput" v-if="voices.length>0" :voices="voices" :symL="symL" :symC="symC" :symD="symD"></MakerAudiosDialogInputV2>
    </div>


    <div class="relative border-2  border-b-4 border-amber-500">
        <div class="flex gap-2 justify-between items-center p-1 text-amber-500" @click="isVisible = !isVisible">
            <div>Generar</div>
            <div>
                <input type="text" v-model="fileprefixname" class="text-xs bg-slate-800 p-1" >
            </div>
        </div>

        

        <template v-for="(item, index) in DialogInput.dialogs" v-if="DialogInput && DialogInput.dialogs">
            <div class="border-1 border-slate-800 bg-slate-90 p-0.5 bg-slate-800/20 p-1">
                <div class="flex gap-2 items-center">
                        <div i-carbon-document-audio />
                        {{ fileprefixname?fileprefixname+'-'+index : item.id }}
                        <div class="ml-auto">
                            <AudioGeneratorV2 :filename="fileprefixname?fileprefixname+'-'+index : item.id" :item="item"></AudioGeneratorV2>
                        </div>
                   
                </div>
            </div>
        </template>


        
    </div>




<!--end dialog-->
    </div>

</template>

<script setup lang="ts">
import { useSortable } from '@vueuse/integrations/useSortable'
    const sortableElement = ref<HTMLElement | null>(null)
    const props = defineProps({

    })

    const fileprefixname = useStorage('etmaker-voicesdialogV2-filename')
    
    const el = ref<HTMLElement | null>(null)
    const DialogInput = ref<HTMLElement | null>(null)
    
    const symL = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"]
    const symC = [   "bg-gray-500",   "bg-yellow-600",   "bg-green-600",   "bg-teal-600",   "bg-blue-600",   "bg-purple-600",   "bg-pink-600",   "bg-red-600",   "bg-orange-600",   "bg-amber-600",   "bg-lime-600" ];
    const symD = [   "decoration-gray-500",   "decoration-yellow-600",   "decoration-green-600",   "decoration-teal-600",   "decoration-blue-600",   "decoration-purple-600",   "decoration-pink-600",   "decoration-red-600",   "decoration-orange-600",   "decoration-amber-600",   "decoration-lime-600" ];
    
    const voices = useStorage('etmaker-voicesDialogV2', []);




    const addvoice = (item) => {

        if(voices.value.length==symL.length){ return false }
        let exists = voices.value.some((i) => i.voice.id === item.id);
        console.log('exists?', item)
        if(exists) { return false }
        voices.value.push({id: voices.value.length, voice: item, dialog:'', note:''})

    }
    

    const clone = (item) => {
        voices.value.push({id: voices.value.length, voice: item.voice, dialog:item.dialog})
    }
    const remove = (index) => {
        voices.value.splice(index, 1)
        voices.value = voices.value.map((item, index)=>{
            let newItem = {...item}
            newItem.id = index
            return newItem
        })
    }


    


    useSortable(el, voices, {
        animation: 200,
        handle: '.handle'
    })

    defineExpose({
        addvoice
    })

</script>