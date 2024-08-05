<template>

    <div class="relative text-left" >
        <textarea v-model="inputText" class="p-1 w-full h-[600px] relative z-0 resize-none bg-slate-800/20 dark:bg-slate-900 border-1 border-dashed border-slate-800 focus:outline-amber-500" ref="textarea" @scroll="syncScroll"></textarea>
        <div v-html="formattedText" class="p-1 formatted-text pointer-events-none absolute whitespace-pre-wrap top-0 left-0 z-10 w-full h-[600px] overflow-hidden border-1 border-dashed border-slate-400" ref="formattedDiv"></div>
    </div>

    <div class="flex gap-2 justify-end w-full">
        <div @click="cleanSpaces()" class="p-1 cursor-pointer hover:text-amber-500"><div i-carbon-clean /></div>
        <div @click="cleanNumbers()" class="p-1 cursor-pointer hover:text-amber-500"><div i-carbon-text-line-spacing /></div>
        <div @click="replaceDotWithParenthesis()" class="p-1 cursor-pointer hover:text-amber-500"><div i-carbon-list-numbered /></div>
        <div @click="addDotToLines()" class="p-1 cursor-pointer hover:text-amber-500"><div i-carbon-term /></div>
    </div>


</template>

<script setup lang="ts">
const props = defineProps({
    voices: Object,
    symL: Array,
    symC: Array,
    symD: Array
})
const textarea = ref<HTMLElement | null>(null)
const formattedDiv = ref<HTMLElement | null>(null)
const inputText = useStorage('etmaker-dialogInput', null);




const syncScroll = () => {
        if (textarea.value && formattedDiv.value) {
            formattedDiv.value.scrollTop = textarea.value.scrollTop;
        }
    };



    const formattedText = computed(() => {
    if (!inputText.value) return '';
    const lines = inputText.value.split('\n');
    let currentColorClass = 'bg-'; // To keep track of the current color class
    
    const formattedLines = lines.map(line => {
        if (line === '---') {
            return `<div class="min-h-[1.5em] ring-4 ">${line}</div>`;
        }
        const match = line.match(/^#([A-Z])/);
        if (match) {
            const letter = match[1];
            const letterIndex = props.symL.findIndex(l => l === letter);
            const voice = props.voices[letterIndex]?.voice || false;
            let currentColorClass = props.symC[letterIndex]; // Update the current color class
            if (voice) {
                return `<div class="relative w-full flex items-center underline w-fit ${currentColorClass.replace('bg', 'decoration')}">${line} <div class="text-xs text-dark px-2 py-0 ${currentColorClass}">${voice.name}</div></div>`;
            } else {
                return `<div class="relative w-full flex items-center text-red-600 line-through">${line} <div class="animate-pulse px-2 left-full bg-white text-red-600">ERROR</div></div>`;
            }
        }
        return `<div class="min-h-[1.5em] underline ${currentColorClass.replace('bg', 'decoration')}">${line}</div>`; // Apply the current color class to non-matched lines
    });
    return formattedLines.join('');
});

const dialogs = computed(() => {
    if (!inputText.value) return [];

    const lines = inputText.value.split('\n');
    const groups = [];
    let currentGroup = [];
    let currentVoice = '';
    let currentDialog = '';
    let groupId = 1;

    lines.forEach(line => {
        const match = line.match(/^#([A-Z])/);

        if (line === '---') {
            // If there's an existing dialog, push it to currentGroup
            if (currentVoice && currentDialog.trim() !== '') {
                const letterIndex = props.symL.findIndex(l => l === currentVoice);
                const voice = props.voices[letterIndex]?.voice || false;
                currentGroup.push({
                    voice: voice,
                    dialog: currentDialog.trim()
                });
                currentDialog = ''; // Reset for the next voice
            }

            // Push the current group to groups and start a new group
            if (currentGroup.length > 0) {
                groups.push({
                    id: `dialog-${groupId}`,
                    dialogs: currentGroup
                });
                groupId++;
                currentGroup = [];
            }

            // Reset currentVoice for the new group
            currentVoice = '';
        } else if (match) {
            // If there's an existing dialog, push it to currentGroup
            if (currentVoice && currentDialog.trim() !== '') {
                const letterIndex = props.symL.findIndex(l => l === currentVoice);
                const voice = props.voices[letterIndex]?.voice || false;
                currentGroup.push({
                    voice: voice,
                    dialog: currentDialog.trim()
                });
                currentDialog = ''; // Reset for the next voice
            }

            // Update current voice and reset currentDialog
            currentVoice = match[1];
        } else {
            // Append the line to the current dialog without the leading marker
            currentDialog += line + '\n';
        }
    });

    // Push the last dialog item if exists
    if (currentVoice && currentDialog.trim() !== '') {
        const letterIndex = props.symL.findIndex(l => l === currentVoice);
        const voice = props.voices[letterIndex]?.voice || false;
        currentGroup.push({
            voice: voice,
            dialog: currentDialog.trim()
        });
    }

    // Push the last group if exists
    if (currentGroup.length > 0) {
        groups.push({
            id: `dialog-${groupId}`,
            dialogs: currentGroup
        });
    }

    return groups;
});



function cleanSpaces() {
    inputText.value = inputText.value
        .split('\n')
        .map(line => line.replace(/\s+/g, ' ').trim())
        .filter(line => line !== '')
        .join('\n');
}
function cleanNumbers () {
    inputText.value = inputText.value
        .split('\n') // Split text into lines
        .map(line => line.replace(/\s+/g, ' ').trim()) // Replace multiple spaces with a single space and trim each line
        .filter(line => line !== '') // Remove empty lines
        .map(line => {
            if (/^\d+\.\s/.test(line)) { // Check if line starts with a number followed by a dot and a space
                return `---\n${line.replace(/^\d+\.\s/, '')}`; // Add new line with `---` and remove the number and dot
            }
            return line;
        })
        .join('\n'); // Join lines back into a single string with line breaks
}

function addDotToLines(text) {
    const lines = inputText.value.split('\n');
    const updatedLines = lines.map(line => {
        // Check if the line contains '---' or starts with '#A', '#B', etc.
        if (line === '---' || /^#[A-Z]/.test(line)) {
            return line;
        }
        return line + '.';
    });
    inputText.value = updatedLines.join('\n');
}


const replaceDotWithParenthesis = () => {
    const regex = /^([A-Z])\.\s+/gm;
    inputText.value = inputText.value.replace(regex, (match, p1) => `"${p1}"- `);
};



defineExpose({
    dialogs
})


</script>