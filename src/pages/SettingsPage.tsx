import React, { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw, 
  Download, 
  Upload,
  Key,
  Database,
  Cloud,
  CloudOff
} from 'lucide-react'

interface Settings {
  hipaa_mode: boolean
  ocr_provider: string
  cloud_ocr_enabled: boolean
  llm_provider?: string
  encryption_key?: string
  rules_config: any
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    hipaa_mode: true,
    ocr_provider: 'tesseract',
    cloud_ocr_enabled: false,
    llm_provider: undefined,
    encryption_key: undefined,
    rules_config: {}
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showEncryptionKey, setShowEncryptionKey] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'integrations' | 'rules'>('general')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const result = await invoke<Settings>('get_settings')
      setSettings(result)
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await invoke('update_settings', { settings })
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const generateEncryptionKey = () => {
    const newKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setSettings(prev => ({ ...prev, encryption_key: newKey }))
  }

  const exportSettings = async () => {
    try {
      const dataStr = JSON.stringify(settings, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'claimsense-settings.json'
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting settings:', error)
    }
  }

  const importSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importedSettings = JSON.parse(text)
      setSettings(importedSettings)
    } catch (error) {
      console.error('Error importing settings:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Configure application settings and preferences
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportSettings}
            className="btn btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <label className="btn btn-secondary cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
            />
          </label>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="btn btn-primary disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', label: 'General', icon: Database },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'integrations', label: 'Integrations', icon: Cloud },
            { id: 'rules', label: 'Rules Engine', icon: RefreshCw }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    OCR Provider
                  </label>
                  <p className="text-sm text-gray-500">
                    Choose the OCR engine for processing scanned documents
                  </p>
                </div>
                <select
                  value={settings.ocr_provider}
                  onChange={(e) => setSettings(prev => ({ ...prev, ocr_provider: e.target.value }))}
                  className="input w-48"
                >
                  <option value="tesseract">Tesseract (Local)</option>
                  <option value="google">Google Cloud Vision</option>
                  <option value="azure">Azure Computer Vision</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Enable Cloud OCR
                  </label>
                  <p className="text-sm text-gray-500">
                    Use cloud-based OCR services (requires API keys)
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cloud_ocr_enabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, cloud_ocr_enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    HIPAA Mode
                  </label>
                  <p className="text-sm text-gray-500">
                    Enable local-only processing to ensure HIPAA compliance
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.hipaa_mode}
                    onChange={(e) => setSettings(prev => ({ ...prev, hipaa_mode: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Encryption Key
                  </label>
                  <p className="text-sm text-gray-500">
                    Key used to encrypt sensitive data at rest
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type={showEncryptionKey ? 'text' : 'password'}
                    value={settings.encryption_key || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, encryption_key: e.target.value }))}
                    className="input w-64"
                    placeholder="Enter encryption key"
                  />
                  <button
                    onClick={() => setShowEncryptionKey(!showEncryptionKey)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    {showEncryptionKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={generateEncryptionKey}
                    className="btn btn-secondary"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {!settings.hipaa_mode && (
            <div className="card bg-yellow-50 border-yellow-200">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    HIPAA Mode Disabled
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    You are sharing PHI with third-party services. Ensure you have proper 
                    Business Associate Agreements (BAA) with all cloud providers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cloud Integrations</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LLM Provider
                </label>
                <select
                  value={settings.llm_provider || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, llm_provider: e.target.value || undefined }))}
                  className="input w-full"
                >
                  <option value="">None (Local processing only)</option>
                  <option value="openai">OpenAI GPT</option>
                  <option value="anthropic">Anthropic Claude</option>
                  <option value="azure">Azure OpenAI</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Choose an LLM provider for intelligent suggestions and analysis
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">API Keys</h4>
                <p className="text-sm text-gray-600">
                  Configure API keys for cloud services in the environment variables or 
                  through the application configuration.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rules Engine Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rules Configuration (JSON)
                </label>
                <textarea
                  value={JSON.stringify(settings.rules_config, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      setSettings(prev => ({ ...prev, rules_config: parsed }))
                    } catch (error) {
                      // Invalid JSON, keep the text for editing
                    }
                  }}
                  className="input w-full h-64 font-mono text-sm"
                  placeholder="Enter rules configuration in JSON format"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Configure validation rules for claim processing
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button className="btn btn-secondary">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test Rules
                </button>
                <button className="btn btn-secondary">
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage

