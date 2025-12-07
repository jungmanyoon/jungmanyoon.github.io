/**
 * ProcessPanel.tsx
 * 공정 단계 패널 + 제법별 가이드
 */

import React from 'react'
import type { ProcessStep, OvenSettings } from '@/types/recipe.types'
import './ProcessPanel.css'

interface ProcessPanelProps {
  steps: ProcessStep[]
  ovenSettings?: OvenSettings
  selectedMethod?: string
  originalMethod?: string
}

// 제법별 설명
const METHOD_INFO: Record<string, { name: string; desc: string; time: string }> = {
  straight: { name: '직반죽법', desc: '모든 재료를 한번에 믹싱', time: '3-4시간' },
  sponge: { name: '스펀지법', desc: '밀가루 30-60% + 물 + 이스트로 스펀지 발효 후 본반죽', time: '6-8시간' },
  poolish: { name: '폴리시법', desc: '동량의 물과 밀가루 + 소량 이스트로 12-16시간 발효', time: '14-18시간' },
  biga: { name: '비가법', desc: '되직한 반죽(수화율 50-60%)으로 12-24시간 발효', time: '14-26시간' },
  overnight: { name: '냉장숙성법', desc: '저온(4-6°C)에서 12-24시간 천천히 발효', time: '14-26시간' },
  sourdough: { name: '사워도우', desc: '천연발효종(르방)으로 발효', time: '24-48시간' },
}

export default function ProcessPanel({ steps, ovenSettings, selectedMethod, originalMethod }: ProcessPanelProps) {
  const methodChanged = selectedMethod && originalMethod && selectedMethod !== originalMethod
  const methodInfo = selectedMethod ? METHOD_INFO[selectedMethod] : null

  return (
    <div className="process-panel">
      <div className="panel-header">
        <h2 className="panel-title">공정</h2>
        <span className="step-count">{steps.length}단계</span>
      </div>

      {/* 제법 변경 알림 */}
      {methodChanged && methodInfo && (
        <div className="method-changed-notice">
          <strong>{methodInfo.name}</strong>으로 변경됨
          <span className="method-desc">{methodInfo.desc}</span>
          <span className="method-time">예상 시간: {methodInfo.time}</span>
        </div>
      )}

      <div className="process-list">
        {steps.map((step, index) => (
          <div key={step.id || `step-${index}`} className="process-step">
            <div className="step-number">{index + 1}</div>
            <div className="step-content">
              <p className="step-description">
                {step.instruction || step.action || step.description || `Step ${index + 1}`}
              </p>

              <div className="step-details">
                {step.duration && (
                  <div className="detail-item time">
                    <span className="detail-icon">⏱️</span>
                    <span className="detail-label">시간:</span>
                    <span className="detail-value">{step.duration}분</span>
                  </div>
                )}

                {step.temperature && (
                  <div className="detail-item temperature">
                    <span className="detail-icon">🌡️</span>
                    <span className="detail-label">온도:</span>
                    <span className="detail-value">{step.temperature}°C</span>
                  </div>
                )}
              </div>

              {step.tips && step.tips.length > 0 && (
                <div className="step-tips">
                  {step.tips.map((tip, tipIndex) => (
                    <div key={tipIndex} className="tip-item">
                      💡 {tip}
                    </div>
                  ))}
                </div>
              )}

              {step.checkpoints && step.checkpoints.length > 0 && (
                <div className="step-checkpoints">
                  {step.checkpoints.map((checkpoint, cpIndex) => (
                    <div key={cpIndex} className="checkpoint-item">
                      ✓ {checkpoint}
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
              <h3 className="step-action">굽기</h3>

              <div className="baking-settings">
                <div className="baking-item">
                  <span className="baking-label">온도</span>
                  <span className="baking-value temperature-value">
                    {ovenSettings.temperature}°C
                  </span>
                </div>

                {ovenSettings.mode && (
                  <div className="baking-item">
                    <span className="baking-label">모드</span>
                    <span className="baking-value">{ovenSettings.mode}</span>
                  </div>
                )}

                {ovenSettings.steamDuration && (
                  <div className="baking-item">
                    <span className="baking-label">스팀</span>
                    <span className="baking-value">
                      {ovenSettings.steamDuration}초
                    </span>
                  </div>
                )}

                {ovenSettings.deck && (
                  <div className="baking-item">
                    <span className="baking-label">데크</span>
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
