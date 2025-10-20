import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { invoke } from '@tauri-apps/api/tauri'
import { Upload, File, X, Play, AlertCircle } from 'lucide-react'
import { useClaimsStore } from '../stores/claimsStore'

const UploadPage: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [processing, setProcessing] = useState(false)
  const { setLoading } = useClaimsStore()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'ready',
      progress: 0,
      error: null
    }))
    setUploadedFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']
    },
    multiple: true
  })

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id))
  }

  const startProcessing = async () => {
    if (uploadedFiles.length === 0) return

    setProcessing(true)
    setLoading(true)

    try {
      const filePaths = uploadedFiles.map(f => f.file.path || f.file.name)
      
      const results = await invoke<Array<{
        file_id: string
        filename: string
        status: string
        progress: number
        error?: string
      }>>('upload_files', { filePaths })

      // Update file statuses
      setUploadedFiles(prev => prev.map(file => {
        const result = results.find(r => r.filename === file.file.name)
        if (result) {
          return {
            ...file,
            status: result.status,
            progress: result.progress,
            error: result.error || null
          }
        }
        return file
      }))

      // Start OCR processing for each file
      for (const result of results) {
        if (result.status === 'uploaded') {
          try {
            await invoke('start_ocr', { claimId: result.file_id })
            await invoke('run_rules', { claimId: result.file_id })
          } catch (error) {
            console.error('Processing error:', error)
          }
        }
      }

    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setProcessing(false)
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <File className="h-5 w-5 text-gray-400" />
      case 'uploaded':
        return <Upload className="h-5 w-5 text-blue-500" />
      case 'processing':
        return <Play className="h-5 w-5 text-yellow-500" />
      case 'completed':
        return <File className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <File className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-gray-600'
      case 'uploaded':
        return 'text-blue-600'
      case 'processing':
        return 'text-yellow-600'
      case 'completed':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Claims</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload PDF documents or scanned images for processing and validation.
        </p>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              or click to select files
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Supports PDF, PNG, JPG, JPEG, TIFF, BMP files
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Uploaded Files ({uploadedFiles.length})
            </h3>
            <button
              onClick={startProcessing}
              disabled={processing || uploadedFiles.some(f => f.status === 'processing')}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : 'Start Processing'}
            </button>
          </div>

          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(file.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file.file.name}
                    </p>
                    <p className={`text-xs ${getStatusColor(file.status)}`}>
                      {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                      {file.progress > 0 && ` - ${Math.round(file.progress)}%`}
                    </p>
                    {file.error && (
                      <p className="text-xs text-red-600 mt-1">{file.error}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {file.status === 'ready' && (
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Processing Steps</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Upload PDF documents or scanned images using drag & drop or file picker</li>
          <li>Click "Start Processing" to begin OCR and field extraction</li>
          <li>Claims will be automatically routed to appropriate queues based on validation results</li>
          <li>Review and fix any issues in the Critical Errors or Warnings queues</li>
          <li>Approved claims can be exported or submitted to payers</li>
        </ol>
      </div>
    </div>
  )
}

export default UploadPage

