import { create } from 'zustand'

interface AppState {
  // 当前编辑的内容
  content: string
  setContent: (content: string) => void

  // 上传的文件信息
  uploadedFile: File | null
  setUploadedFile: (file: File | null) => void

  // 转换结果
  convertedResult: string | Blob | null
  setConvertedResult: (result: string | Blob | null) => void

  // 加载状态
  isConverting: boolean
  setIsConverting: (status: boolean) => void

  // 错误信息
  error: string | null
  setError: (error: string | null) => void
}

export const useStore = create<AppState>((set) => ({
  content: '',
  setContent: (content) => set({ content }),

  uploadedFile: null,
  setUploadedFile: (uploadedFile) => set({ uploadedFile }),

  convertedResult: null,
  setConvertedResult: (convertedResult) => set({ convertedResult }),

  isConverting: false,
  setIsConverting: (isConverting) => set({ isConverting }),

  error: null,
  setError: (error) => set({ error }),
}))