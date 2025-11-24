<script setup lang="ts">
import { ref } from 'vue'
import { UploadCloud, FileImage, Download, Loader2, AlertCircle, X } from 'lucide-vue-next'
import { downloadBlob } from '../utils/file'
import '../assets/css/main.css'

const file = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const conversionType = ref<'icns' | 'png-set'>('icns')
const isDragging = ref(false)
const isConverting = ref(false)
const error = ref<string | null>(null)

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const droppedFile = e.dataTransfer?.files[0]
  if (droppedFile && droppedFile.type === 'image/png') {
    file.value = droppedFile
    error.value = null
  } else {
    error.value = '请上传 PNG 文件'
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    file.value = target.files[0]
    error.value = null
  }
}

const convert = async () => {
  if (!file.value) return

  isConverting.value = true
  error.value = null

  const formData = new FormData()
  formData.append('file', file.value)
  formData.append('type', conversionType.value)

  try {
    const response = await $fetch('/api/convert', {
      method: 'POST',
      body: formData,
      responseType: 'blob'
    })

    const filename = file.value.name.replace(/\.[^/.]+$/, '')
    const ext = conversionType.value === 'icns' ? '.icns' : '-icons.zip'
    downloadBlob(response as Blob, `${filename}${ext}`)
  } catch (e: any) {
    error.value = e.message || '转换失败，请重试'
  } finally {
    isConverting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans text-slate-600 relative selection:bg-sky-100 selection:text-sky-900">
    <!-- Background Elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <!-- Grid Pattern -->
      <div class="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>
      
      <!-- Radial Gradient -->
      <div class="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_50%_200px,#E0F2FE,transparent)] opacity-70"></div>
    </div>

    <div class="max-w-xl w-full relative z-10">
      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold text-slate-800 tracking-tight">素裁</h1>
        <p class="text-slate-400 mt-3 text-lg font-light tracking-wide">优雅的 macOS 图标转换工具</p>
      </div>

      <!-- Main Card -->
      <div class="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white/80 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:bg-white/70">
        <div class="p-8 space-y-8">
          
          <!-- Drop Zone -->
          <div
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            class="group relative border border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer overflow-hidden"
            :class="[
              isDragging 
                ? 'border-sky-400 bg-sky-50/30 scale-[1.01]' 
                : 'border-slate-200/80 hover:border-sky-300 hover:bg-slate-50/50'
            ]"
            @click="fileInput?.click()"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/png"
              class="hidden"
              @change="handleFileSelect"
            />

            <!-- Empty State -->
            <div v-if="!file" class="flex flex-col items-center space-y-5 transition-transform duration-300 group-hover:-translate-y-1">
              <div class="p-5 bg-white rounded-2xl text-slate-400 shadow-sm border border-slate-100 group-hover:text-sky-500 group-hover:border-sky-100 group-hover:shadow-md transition-all duration-300">
                <UploadCloud :size="36" stroke-width="1.5" />
              </div>
              <div>
                <p class="font-medium text-slate-600 text-lg">点击或拖拽 PNG 文件</p>
                <p class="text-sm text-slate-400 mt-1.5 font-light">支持最大 10MB 的 PNG 文件</p>
              </div>
            </div>

            <!-- File Selected State -->
            <div v-else class="flex flex-col items-center space-y-4">
              <div class="relative">
                <div class="p-5 bg-white rounded-2xl text-emerald-500 shadow-sm border border-emerald-100/50">
                  <FileImage :size="36" stroke-width="1.5" />
                </div>
                <button 
                  @click.stop="file = null"
                  class="absolute -top-2 -right-2 p-1.5 bg-white rounded-full text-slate-300 hover:text-rose-500 shadow-sm border border-slate-100 transition-colors"
                >
                  <X :size="14" />
                </button>
              </div>
              <div>
                <p class="font-medium text-slate-700 text-lg truncate max-w-[250px]">{{ file.name }}</p>
                <p class="text-sm text-slate-400 mt-1">{{ (file.size / 1024).toFixed(1) }} KB</p>
              </div>
            </div>
          </div>

          <!-- Controls -->
          <div class="space-y-4">
            <label class="block text-sm font-medium text-slate-400 ml-1">选择转换格式</label>
            <div class="grid grid-cols-2 gap-4">
              <button
                @click="conversionType = 'icns'"
                class="relative overflow-hidden group p-5 rounded-2xl border transition-all duration-300 text-left"
                :class="[
                  conversionType === 'icns' 
                    ? 'border-sky-200 bg-sky-50/30 text-sky-900 shadow-sm' 
                    : 'border-slate-100 hover:border-sky-100 hover:bg-slate-50/50 text-slate-500'
                ]"
              >
                <div class="font-medium text-lg">ICNS</div>
                <div class="text-xs opacity-60 mt-1 font-light">macOS 图标文件</div>
                <div v-if="conversionType === 'icns'" class="absolute right-4 top-4 w-1.5 h-1.5 rounded-full bg-sky-400"></div>
              </button>

              <button
                @click="conversionType = 'png-set'"
                class="relative overflow-hidden group p-5 rounded-2xl border transition-all duration-300 text-left"
                :class="[
                  conversionType === 'png-set' 
                    ? 'border-sky-200 bg-sky-50/30 text-sky-900 shadow-sm' 
                    : 'border-slate-100 hover:border-sky-100 hover:bg-slate-50/50 text-slate-500'
                ]"
              >
                <div class="font-medium text-lg">PNG Set</div>
                <div class="text-xs opacity-60 mt-1 font-light">多尺寸图标集合</div>
                <div v-if="conversionType === 'png-set'" class="absolute right-4 top-4 w-1.5 h-1.5 rounded-full bg-sky-400"></div>
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="flex items-center space-x-3 text-rose-500 bg-rose-50/50 p-4 rounded-xl text-sm border border-rose-100 animate-in fade-in slide-in-from-top-2">
            <AlertCircle :size="18" />
            <span>{{ error }}</span>
          </div>

          <!-- Action Button -->
          <button
            @click="convert"
            :disabled="!file || isConverting"
            class="w-full group relative flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl font-medium text-lg shadow-xl shadow-slate-200/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0"
          >
            <Loader2 v-if="isConverting" :size="22" class="animate-spin text-slate-400" />
            <Download v-else :size="22" class="text-slate-300 group-hover:text-white transition-colors" />
            <span class="tracking-wide">{{ isConverting ? '正在转换...' : '开始转换并下载' }}</span>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <p class="mt-10 text-center text-slate-300 text-sm font-light tracking-wide">
        © {{ new Date().getFullYear() }} 素裁 · 您的文件仅在本地处理，安全无忧
      </p>
    </div>
  </div>
</template>

<style>
/* Custom scrollbar for webkit */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
