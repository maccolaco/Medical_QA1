import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, Play, AlertCircle, Database } from 'lucide-react'
import { useClaimsStore } from '../stores/claimsStore'
import { useAuthStore } from '../stores/authStore'
import { useDemoStore } from '../stores/demoStore'
import { loadDemoClaims } from '../utils/demoData'

const UploadPage: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [processing, setProcessing] = useState(false)
  const [loadingDemo, setLoadingDemo] = useState(false)
  const [demoMessage, setDemoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { setLoading } = useClaimsStore()
  const { user } = useAuthStore()
  const { completeStep } = useDemoStore()

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

  const handleLoadDemoClaims = async () => {
    if (!user?.id) return

    setLoadingDemo(true)
    setDemoMessage(null)

    try {
      const result = await loadDemoClaims(user.id)

      if (result.success) {
        setDemoMessage({
          type: 'success',
          text: `Successfully loaded ${result.count} demo claims! Check the Queues page to review them.`
        })
        completeStep('upload-demo')
        completeStep('ocr-process')
        completeStep('validation')
      } else {
        setDemoMessage({
          type: 'error',
          text: `Failed to load demo claims: ${result.error}`
        })
      }
    } catch (error) {
      console.error('Demo load error:', error)
      setDemoMessage({
        type: 'error',
        text: 'An error occurred while loading demo claims'
      })
    } finally {
      setLoadingDemo(false)
    }
  }

  const startProcessing = async () => {
    if (uploadedFiles.length === 0) return

    setProcessing(true)
    setLoading(true)

    try {
      console.log('Processing files (Tauri backend not available in web mode)')
      setDemoMessage({
        type: 'error',
        text: 'File processing requires the desktop app. Use "Load Demo Claims" to see sample data.'
      })
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Claims</h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload PDF documents or scanned images for processing and validation.
          </p>
        </div>
        <button
          id="demo-button"
          onClick={handleLoadDemoClaims}
          disabled={loadingDemo}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Database size={16} />
          {loadingDemo ? 'Loading...' : 'Load Demo Claims'}
        </button>
      </div>

      {demoMessage && (
        <div className={`card ${demoMessage.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-sm ${demoMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {demoMessage.text}
          </p>
        </div>
      )}

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

