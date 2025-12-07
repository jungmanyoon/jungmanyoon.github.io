# 팬 카테고리화 시스템 및 사용자 설정 가능한 변환 공식

## 팬 카테고리 구조

### 계층적 팬 분류 시스템

```javascript
const panCategorySystem = {
    // 대분류
    majorCategories: {
        'round': {
            name: '원형팬',
            icon: '⭕',
            description: '원형 케이크팬, 타르트팬 등'
        },
        'rectangular': {
            name: '사각팬',
            icon: '⬜',
            description: '정사각형, 직사각형 팬'
        },
        'special': {
            name: '특수팬',
            icon: '🎂',
            description: '쉬폰, 구겔호프, 번트 등'
        },
        'loaf': {
            name: '식빵팬',
            icon: '🍞',
            description: '식빵틀, 파운드케이크팬'
        },
        'sheet': {
            name: '시트팬',
            icon: '📄',
            description: '쿠키시트, 롤케이크팬'
        }
    },
    
    // 중분류
    subCategories: {
        'round': {
            'layer': '레이어 케이크팬',
            'springform': '스프링폼팬',
            'tart': '타르트팬',
            'pie': '파이팬'
        },
        'rectangular': {
            'square': '정사각팬',
            'oblong': '직사각팬',
            'brownie': '브라우니팬'
        },
        'special': {
            'chiffon': '쉬폰팬',
            'bundt': '번트팬',
            'gugelhupf': '구겔호프팬',
            'savarin': '사바랭팬',
            'angel': '엔젤푸드팬'
        },
        'loaf': {
            'pullman': '풀먼팬(뚜껑있음)',
            'standard': '표준식빵팬',
            'mini': '미니로프팬',
            'pound': '파운드케이크팬'
        }
    }
};
```

### 제조사별 팬 데이터베이스

```javascript
const manufacturerPans = {
    // 제조사별 상세 규격
    'wilton': {
        'round_6inch': {
            category: 'round.layer',
            diameter: 15.24,  // cm
            height: 5.08,      // cm
            volume: 946,       // ml
            material: 'aluminum',
            coating: 'non-stick'
        },
        'round_8inch': {
            diameter: 20.32,
            height: 5.08,
            volume: 1420,
            material: 'aluminum'
        }
    },
    
    'nordicware': {
        'bundt_10cup': {
            category: 'special.bundt',
            volume: 2366,      // ml (10 cups)
            servings: 12,
            material: 'cast_aluminum',
            design: 'heritage'
        }
    },
    
    'kaiser': {
        'springform_26cm': {
            category: 'round.springform',
            diameter: 26,
            height: 7,
            volume: 3710,
            features: ['leak-proof', 'glass-base']
        }
    },
    
    // 한국 브랜드
    'coupang': {
        'loaf_1pound': {
            category: 'loaf.standard',
            dimensions: { l: 21, w: 11, h: 11 },
            volume: 2541,
            weight_capacity: 600  // g
        }
    },
    
    // 일본 브랜드
    'chiyoda': {
        'chiffon_17cm': {
            category: 'special.chiffon',
            diameter: 17,
            height: 8,
            tube_diameter: 4,
            volume: 1450,
            material: 'aluminum'
        }
    }
};
```

## 사용자 설정 가능한 변환 공식 시스템

### 동적 매직 넘버 설정

```javascript
class CustomizableFormulas {
    constructor() {
        // 기본값 - 사용자가 수정 가능
        this.defaultSettings = {
            magicNumbers: {
                'bread.white': {
                    value: 1.78,
                    description: '흰 식빵용 매직넘버',
                    range: { min: 1.5, max: 2.0 },
                    unit: '팬부피 ÷ 반죽무게'
                },
                'bread.whole_wheat': {
                    value: 1.33,
                    description: '통밀빵용 매직넘버',
                    range: { min: 1.2, max: 1.5 }
                },
                'cake.sponge': {
                    value: 0.65,
                    description: '스펀지케이크 충전율',
                    range: { min: 0.5, max: 0.8 },
                    unit: '팬부피 대비 반죽 비율'
                },
                'cake.pound': {
                    value: 0.75,
                    description: '파운드케이크 충전율',
                    range: { min: 0.6, max: 0.85 }
                }
            },
            
            environmentalFactors: {
                'altitude.low': {
                    yeastModifier: 1.0,
                    liquidModifier: 1.0,
                    tempModifier: 0
                },
                'altitude.medium': {
                    yeastModifier: 0.9,
                    liquidModifier: 1.05,
                    tempModifier: 5
                },
                'humidity.low': {
                    liquidModifier: 1.02,
                    description: '건조한 환경 (습도 40% 이하)'
                },
                'humidity.high': {
                    liquidModifier: 0.98,
                    description: '습한 환경 (습도 70% 이상)'
                }
            },
            
            conversionRules: {
                'poolish': {
                    flourRatio: { default: 0.25, range: [0.1, 0.5] },
                    hydration: { default: 1.0, range: [0.8, 1.2] },
                    yeastRatio: { default: 0.001, range: [0.0005, 0.002] }
                },
                'overnight': {
                    yeastReduction: { default: 0.5, range: [0.3, 0.7] },
                    tempRange: { default: [4, 6], range: [2, 8] }
                }
            }
        };
        
        // 사용자 설정 저장소
        this.userSettings = this.loadUserSettings();
    }
    
    /**
     * 사용자가 매직넘버 수정
     */
    updateMagicNumber(category, newValue) {
        const setting = this.defaultSettings.magicNumbers[category];
        
        if (newValue < setting.range.min || newValue > setting.range.max) {
            throw new Error(`값은 ${setting.range.min}-${setting.range.max} 범위여야 합니다`);
        }
        
        this.userSettings.magicNumbers[category] = {
            ...setting,
            value: newValue,
            modifiedAt: new Date(),
            modifiedBy: 'user'
        };
        
        this.saveUserSettings();
        
        return {
            success: true,
            message: `${category} 매직넘버가 ${newValue}로 변경되었습니다`
        };
    }
    
    /**
     * 환경 요인 수정
     */
    updateEnvironmentalFactor(factor, property, newValue) {
        if (!this.userSettings.environmentalFactors[factor]) {
            this.userSettings.environmentalFactors[factor] = {
                ...this.defaultSettings.environmentalFactors[factor]
            };
        }
        
        this.userSettings.environmentalFactors[factor][property] = newValue;
        this.saveUserSettings();
        
        return {
            success: true,
            factor: factor,
            property: property,
            newValue: newValue
        };
    }
}
```

### 사용자 정의 팬 추가 시스템

```javascript
class CustomPanManager {
    constructor() {
        this.customPans = this.loadCustomPans();
    }
    
    /**
     * 사용자 정의 팬 추가
     */
    addCustomPan(panData) {
        const pan = {
            id: this.generateId(),
            name: panData.name,
            category: panData.category,
            subCategory: panData.subCategory,
            manufacturer: panData.manufacturer || 'custom',
            
            // 크기 정보
            dimensions: this.validateDimensions(panData),
            volume: this.calculateVolume(panData),
            
            // 사용자 노트
            notes: panData.notes,
            
            // 매직넘버 오버라이드
            customMagicNumber: panData.customMagicNumber || null,
            
            // 메타데이터
            createdAt: new Date(),
            createdBy: 'user',
            isCustom: true
        };
        
        this.customPans.push(pan);
        this.saveCustomPans();
        
        return pan;
    }
    
    /**
     * 부피 계산 (모양별)
     */
    calculateVolume(panData) {
        const { shape, dimensions } = panData;
        
        switch (shape) {
            case 'round':
                // V = πr²h
                const radius = dimensions.diameter / 2;
                return Math.PI * radius * radius * dimensions.height;
                
            case 'rectangular':
                // V = l × w × h
                return dimensions.length * dimensions.width * dimensions.height;
                
            case 'chiffon':
                // V = π(R² - r²)h (중앙 구멍 제외)
                const outerRadius = dimensions.diameter / 2;
                const innerRadius = dimensions.tubeDiameter / 2;
                return Math.PI * (outerRadius ** 2 - innerRadius ** 2) * dimensions.height;
                
            case 'bundt':
                // 복잡한 형태는 사용자 입력 또는 물 측정값 사용
                return panData.measuredVolume || dimensions.nominalVolume;
                
            default:
                return panData.measuredVolume;
        }
    }
    
    /**
     * 팬 비교 및 대체 제안
     */
    findAlternativePans(targetPan, tolerance = 0.1) {
        const targetVolume = targetPan.volume;
        const minVolume = targetVolume * (1 - tolerance);
        const maxVolume = targetVolume * (1 + tolerance);
        
        const allPans = [
            ...Object.values(manufacturerPans).flat(),
            ...this.customPans
        ];
        
        return allPans
            .filter(pan => pan.volume >= minVolume && pan.volume <= maxVolume)
            .map(pan => ({
                ...pan,
                volumeDifference: ((pan.volume - targetVolume) / targetVolume * 100).toFixed(1),
                scaleFactor: (pan.volume / targetVolume).toFixed(2)
            }))
            .sort((a, b) => Math.abs(a.volumeDifference) - Math.abs(b.volumeDifference));
    }
}
```

## 설정 UI/UX 디자인

### 매직넘버 설정 인터페이스

```html
<!-- 설정 페이지 UI -->
<div class="settings-panel">
    <h2>변환 공식 설정</h2>
    
    <!-- 매직넘버 섹션 -->
    <div class="setting-group">
        <h3>매직넘버 설정</h3>
        <p class="help-text">팬 부피와 반죽량의 비율을 조정합니다</p>
        
        <div class="magic-number-item">
            <label>흰 식빵</label>
            <input type="range" 
                   min="1.5" 
                   max="2.0" 
                   step="0.01"
                   value="1.78"
                   id="magic-bread-white">
            <span class="value-display">1.78</span>
            <button class="reset-btn">초기값</button>
        </div>
        
        <div class="magic-number-item">
            <label>통밀빵</label>
            <input type="range" 
                   min="1.2" 
                   max="1.5" 
                   step="0.01"
                   value="1.33"
                   id="magic-bread-whole">
            <span class="value-display">1.33</span>
            <button class="reset-btn">초기값</button>
        </div>
    </div>
    
    <!-- 환경 요인 섹션 -->
    <div class="setting-group">
        <h3>환경 보정값</h3>
        
        <div class="environment-setting">
            <h4>고도별 조정</h4>
            <select id="altitude-preset">
                <option value="low">해수면-900m</option>
                <option value="medium">900-1500m</option>
                <option value="high">1500m 이상</option>
                <option value="custom">사용자 정의</option>
            </select>
            
            <div class="custom-values" style="display:none;">
                <label>이스트 배율: <input type="number" step="0.01"></label>
                <label>액체 배율: <input type="number" step="0.01"></label>
                <label>온도 조정(°C): <input type="number" step="1"></label>
            </div>
        </div>
    </div>
    
    <!-- 저장 버튼 -->
    <div class="action-buttons">
        <button class="save-btn">설정 저장</button>
        <button class="export-btn">설정 내보내기</button>
        <button class="import-btn">설정 가져오기</button>
    </div>
</div>
```

### 팬 추가 마법사

```javascript
class PanAddWizard {
    constructor() {
        this.steps = [
            'category',      // 대분류 선택
            'subcategory',   // 중분류 선택
            'dimensions',    // 크기 입력
            'volume',        // 부피 확인/수정
            'properties',    // 추가 속성
            'confirm'        // 최종 확인
        ];
        
        this.currentStep = 0;
        this.panData = {};
    }
    
    // Step 1: 카테고리 선택
    renderCategoryStep() {
        return `
            <div class="wizard-step">
                <h3>팬 종류를 선택하세요</h3>
                <div class="category-grid">
                    ${Object.entries(panCategorySystem.majorCategories).map(([key, cat]) => `
                        <button class="category-btn" data-category="${key}">
                            <span class="icon">${cat.icon}</span>
                            <span class="name">${cat.name}</span>
                            <span class="desc">${cat.description}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Step 3: 크기 입력
    renderDimensionsStep() {
        const category = this.panData.category;
        
        if (category === 'round') {
            return `
                <div class="wizard-step">
                    <h3>팬 크기를 입력하세요</h3>
                    <div class="dimension-inputs">
                        <label>
                            지름 (cm):
                            <input type="number" id="diameter" step="0.1" required>
                        </label>
                        <label>
                            높이 (cm):
                            <input type="number" id="height" step="0.1" required>
                        </label>
                        ${this.panData.subcategory === 'chiffon' ? `
                            <label>
                                중앙 구멍 지름 (cm):
                                <input type="number" id="tube-diameter" step="0.1">
                            </label>
                        ` : ''}
                    </div>
                    <div class="volume-calculator">
                        <p>예상 부피: <span id="calculated-volume">-</span> ml</p>
                        <p class="help-text">
                            💡 정확한 부피를 알고 있다면 아래에 입력하세요
                        </p>
                        <label>
                            실측 부피 (ml):
                            <input type="number" id="measured-volume" step="10">
                        </label>
                    </div>
                </div>
            `;
        }
        // ... 다른 모양별 입력 폼
    }
}
```

## 설정 저장 및 공유

### 설정 내보내기/가져오기

```javascript
class SettingsManager {
    /**
     * 모든 사용자 설정을 JSON으로 내보내기
     */
    exportSettings() {
        const settings = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            
            magicNumbers: this.userSettings.magicNumbers,
            environmentalFactors: this.userSettings.environmentalFactors,
            conversionRules: this.userSettings.conversionRules,
            customPans: this.customPans,
            
            metadata: {
                panCount: this.customPans.length,
                lastModified: this.userSettings.lastModified
            }
        };
        
        const blob = new Blob(
            [JSON.stringify(settings, null, 2)], 
            { type: 'application/json' }
        );
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recipe-settings-${Date.now()}.json`;
        a.click();
        
        return settings;
    }
    
    /**
     * 설정 가져오기 및 검증
     */
    async importSettings(file) {
        try {
            const text = await file.text();
            const settings = JSON.parse(text);
            
            // 버전 호환성 검사
            if (!this.isCompatibleVersion(settings.version)) {
                throw new Error('호환되지 않는 설정 파일 버전입니다');
            }
            
            // 설정 검증
            this.validateSettings(settings);
            
            // 기존 설정과 병합 또는 덮어쓰기 선택
            const result = await this.showMergeDialog(settings);
            
            if (result.action === 'merge') {
                this.mergeSettings(settings);
            } else {
                this.replaceSettings(settings);
            }
            
            return {
                success: true,
                message: '설정을 성공적으로 가져왔습니다'
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 설정 동기화 (클라우드)
     */
    async syncSettings() {
        if (!this.user.isLoggedIn) {
            throw new Error('동기화하려면 로그인이 필요합니다');
        }
        
        const localSettings = this.exportSettings();
        const cloudSettings = await this.fetchCloudSettings();
        
        // 타임스탬프 비교로 최신 버전 결정
        const useLocal = localSettings.metadata.lastModified > 
                        cloudSettings.metadata.lastModified;
        
        if (useLocal) {
            await this.uploadSettings(localSettings);
        } else {
            await this.downloadSettings(cloudSettings);
        }
        
        return {
            synced: true,
            direction: useLocal ? 'upload' : 'download',
            timestamp: new Date()
        };
    }
}
```

## 💡 사용 시나리오

### 시나리오 1: 새로운 팬 구매
```javascript
// 사용자가 새 팬을 구매하고 등록
const newPan = {
    name: "내 새 쉬폰팬",
    category: "special",
    subCategory: "chiffon",
    manufacturer: "제과나라",
    dimensions: {
        diameter: 20,
        height: 10,
        tubeDiameter: 5
    },
    notes: "선물 받은 팬, 논스틱 코팅"
};

customPanManager.addCustomPan(newPan);
```

### 시나리오 2: 지역 특성에 맞게 조정
```javascript
// 부산(해안가, 높은 습도) 사용자
settingsManager.updateEnvironmentalFactor('humidity.high', 'liquidModifier', 0.95);
settingsManager.updateEnvironmentalFactor('altitude.low', 'yeastModifier', 1.05);

// 대구(내륙, 건조) 사용자  
settingsManager.updateEnvironmentalFactor('humidity.low', 'liquidModifier', 1.03);
```

## 🔧 구현 시 고려사항

1. **설정 검증**: 범위를 벗어난 값 입력 방지
2. **백업**: 자동 백업 및 복원 기능
3. **프리셋**: 지역별, 계절별 추천 설정
4. **A/B 테스트**: 설정 변경 전후 결과 비교
5. **커뮤니티 공유**: 검증된 설정 공유 마켓플레이스