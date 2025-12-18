/**
 * ProcessPanel.tsx
 * 공정 단계 패널 + 제법별 가이드
 */

import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
import type { ProcessStep, OvenSettings } from '@/types/recipe.types'
import { translateProcessStep } from '@/data/processStepTranslations'
import { translateBakingNote } from '@/data/ingredientTranslations'
import './ProcessPanel.css'

interface ProcessPanelProps {
  steps: ProcessStep[]
  ovenSettings?: OvenSettings
  selectedMethod?: string
  originalMethod?: string
}

export default function ProcessPanel({ steps, ovenSettings, selectedMethod, originalMethod }: ProcessPanelProps) {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language === 'en' ? 'en' : 'ko'

  // 공정 단계 텍스트 번역 헬퍼
  const getLocalizedInstruction = useCallback((step: ProcessStep): string => {
    // 영어 모드이고 영어 버전이 있으면 사용
    if (currentLang === 'en') {
      if (step.instructionEn) return step.instructionEn
      // 영어 버전이 없으면 자동 번역
      const instruction = step.instruction || step.action || step.description || ''
      return translateProcessStep(instruction, 'en')
    }
    // 한국어 모드
    return step.instruction || step.action || step.description || `Step ${step.order}`
  }, [currentLang])

  // 팁 번역 헬퍼
  const getLocalizedTips = useCallback((step: ProcessStep): string | undefined => {
    if (!step.tips) return undefined
    if (currentLang === 'en') {
      if (step.tipsEn) return step.tipsEn
      return translateBakingNote(step.tips, 'en')
    }
    return step.tips
  }, [currentLang])
  const methodChanged = selectedMethod && originalMethod && selectedMethod !== originalMethod
  const methodName = selectedMethod ? t(`components.processPanel.methodInfo.${selectedMethod}.name`) : null
  const methodDesc = selectedMethod ? t(`components.processPanel.methodInfo.${selectedMethod}.desc`) : null
  const methodTime = selectedMethod ? t(`components.processPanel.methodInfo.${selectedMethod}.time`) : null

  return (
    <div className="process-panel">
      <div className="panel-header">
        <h2 className="panel-title">{t('components.processPanel.title')}</h2>
        <span className="step-count">{t('components.processPanel.stepCount', { count: steps.length })}</span>
      </div>

      {/* 제법 변경 알림 */}
      {methodChanged && methodName && (
        <div className="method-changed-notice">
          <strong>{methodName}</strong>{t('components.processPanel.changedTo')}
          <span className="method-desc">{methodDesc}</span>
          <span className="method-time">{t('components.processPanel.estimatedTime')} {methodTime}</span>
        </div>
      )}

      <div className="process-list">
        {steps.map((step, index) => (
          <div key={step.id || `step-${index}`} className="process-step">
            <div className="step-number">{index + 1}</div>
            <div className="step-content">
              <p className="step-description">
                {getLocalizedInstruction(step)}
              </p>

              <div className="step-details">
                {step.duration && (
                  <div className="detail-item time">
                    <span className="detail-icon">⏱️</span>
                    <span className="detail-label">{t('components.processPanel.time')}</span>
                    <span className="detail-value">
                      {typeof step.duration === 'object'
                        ? `${step.duration.min}-${step.duration.max}${step.duration.unit}`
                        : `${step.duration}${t('components.recipeListSidebar.timeUnit')}`}
                    </span>
                  </div>
                )}

                {step.temperature && (
                  <div className="detail-item temperature">
                    <span className="detail-icon">🌡️</span>
                    <span className="detail-label">{t('components.processPanel.temperature')}</span>
                    <span className="detail-value">
                      {typeof step.temperature === 'object'
                        ? `${step.temperature.min}-${step.temperature.max}°${step.temperature.unit}`
                        : `${step.temperature}°C`}
                    </span>
                  </div>
                )}
              </div>

              {step.tips && (
                <div className="step-tips">
                  <div className="tip-item">
                    💡 {getLocalizedTips(step)}
                  </div>
                </div>
              )}

              {step.checkpoints && step.checkpoints.length > 0 && (
                <div className="step-checkpoints">
                  {step.checkpoints.map((checkpoint, cpIndex: number) => (
                    <div key={cpIndex} className="checkpoint-item">
                      ✓ {checkpoint.criteria}: {checkpoint.expectedValue}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 굽기 설정 (별도 강조) */}
        {ovenSettings && (
          <div className="process-step baking-step">
            <div className="step-number">🔥</div>
            <div className="step-content">
              <h3 className="step-action">{t('components.processPanel.baking')}</h3>

              <div className="baking-settings">
                <div className="baking-item">
                  <span className="baking-label">{t('components.processPanel.ovenTemp')}</span>
                  <span className="baking-value temperature-value">
                    {ovenSettings.temperature}°C
                  </span>
                </div>

                {ovenSettings.mode && (
                  <div className="baking-item">
                    <span className="baking-label">{t('components.processPanel.ovenMode')}</span>
                    <span className="baking-value">{ovenSettings.mode}</span>
                  </div>
                )}

                {ovenSettings.steamDuration && (
                  <div className="baking-item">
                    <span className="baking-label">{t('components.processPanel.steam')}</span>
                    <span className="baking-value">
                      {ovenSettings.steamDuration}{t('components.processPanel.steamUnit')}
                    </span>
                  </div>
                )}

                {ovenSettings.deck && (
                  <div className="baking-item">
                    <span className="baking-label">{t('components.processPanel.deck')}</span>
                    <span className="baking-value">{ovenSettings.deck}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
