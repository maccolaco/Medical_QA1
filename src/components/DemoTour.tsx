import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDemoStore } from '../stores/demoStore'
import { X, ChevronLeft, ChevronRight, Play, RotateCcw } from 'lucide-react'

export const DemoTour: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    isDemoMode,
    isPlaying,
    currentStep,
    demoSteps,
    completedSteps,
    nextStep,
    previousStep,
    setDemoMode,
    resetDemo
  } = useDemoStore()

  const currentStepData = demoSteps[currentStep]
  const progress = ((currentStep + 1) / demoSteps.length) * 100

  useEffect(() => {
    if (isPlaying && currentStepData) {
      const targetPage = currentStepData.page
      if (!targetPage.includes(':id') && location.pathname !== targetPage) {
        navigate(targetPage)
      }
    }
  }, [currentStep, isPlaying, currentStepData, location.pathname, navigate])

  if (!isDemoMode || !isPlaying) {
    return null
  }

  const handleClose = () => {
    setDemoMode(false)
    resetDemo()
  }

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      nextStep()
    } else {
      handleClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      previousStep()
    }
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-auto" />

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 pointer-events-auto">
        <div className="bg-white rounded-lg shadow-2xl border-2 border-blue-500">
          <div className="h-2 bg-gray-200 rounded-t-lg overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-blue-600">
                    Step {currentStep + 1} of {demoSteps.length}
                  </span>
                  {completedSteps.includes(currentStepData.id) && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Completed
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {currentStepData.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {currentStepData.description}
                </p>
                {currentStepData.action && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                    <Play size={14} />
                    <span className="font-medium">{currentStepData.action}</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleClose}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => resetDemo()}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <RotateCcw size={16} />
                Restart Demo
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {currentStep === demoSteps.length - 1 ? 'Finish' : 'Next'}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Demo Progress</div>
          <div className="flex gap-1">
            {demoSteps.map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-blue-500'
                    : completedSteps.includes(step.id)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
