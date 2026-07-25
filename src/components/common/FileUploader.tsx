import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { Upload, File, X } from 'lucide-react'

/**
 * 文件上传组件的属性接口
 */
interface FileUploaderProps {
  /** 接受的文件格式，例如 '.md,.txt,.docx' */
  acceptedFormats: string
  /** 最大文件大小（字节） */
  maxSize: number
  /** 文件选择回调函数 */
  onFileSelect: (file: File) => void
}

/**
 * 文件上传组件
 * 支持拖拽上传和点击选择文件
 */
export default function FileUploader({
  acceptedFormats,
  maxSize,
  onFileSelect,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * 验证文件是否符合要求
   */
  const validateFile = (file: File): boolean => {
    // 检查文件大小
    if (file.size > maxSize) {
      setError(`文件大小超过限制（最大 ${maxSize / 1024 / 1024} MB）`)
      return false
    }

    // 检查文件格式
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const acceptedArray = acceptedFormats.split(',').map(format => format.trim().toLowerCase())
    
    if (!acceptedArray.includes(fileExtension)) {
      setError(`不支持的文件格式。接受: ${acceptedFormats}`)
      return false
    }

    setError('')
    return true
  }

  /**
   * 处理文件选择
   */
  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file)
      onFileSelect(file)
    }
  }

  /**
   * 处理拖拽进入
   */
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  /**
   * 处理拖拽离开
   */
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  /**
   * 处理文件放下
   */
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  /**
   * 处理点击上传
   */
  const handleClick = () => {
    fileInputRef.current?.click()
  }

  /**
   * 处理文件输入变化
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  /**
   * 清除已选择的文件
   */
  const handleClear = () => {
    setSelectedFile(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * 格式化文件大小显示
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="w-full">
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* 上传区域 */}
      {!selectedFile ? (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative border-2 border-dashed rounded-lg p-8
            transition-all duration-200 cursor-pointer
            flex flex-col items-center justify-center
            min-h-[200px]
            ${isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }
          `}
        >
          <Upload
            className={`h-12 w-12 mb-4 ${
              isDragging ? 'text-primary-500' : 'text-gray-400'
            }`}
          />
          <p className="text-sm text-gray-600 mb-2">
            拖拽文件到此处或点击选择文件
          </p>
          <p className="text-xs text-gray-400">
            支持格式: {acceptedFormats} | 最大大小: {maxSize / 1024 / 1024} MB
          </p>
        </div>
      ) : (
        /* 已选择文件显示 */
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <File className="h-8 w-8 text-primary-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
              aria-label="删除文件"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
    </div>
  )
}