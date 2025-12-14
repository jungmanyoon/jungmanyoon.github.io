const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, LevelFormat, BorderStyle, ShadingType, WidthType, Table, TableRow, TableCell } = require('docx');
const fs = require('fs');

const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

const doc = new Document({
  styles: {
    default: { document: { run: { font: "맑은 고딕", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 48, bold: true, color: "8B4513", font: "맑은 고딕" },
        paragraph: { spacing: { before: 0, after: 300 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: "D2691E", font: "맑은 고딕" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: "333333", font: "맑은 고딕" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-list",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "number-list",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "question-list",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    children: [
      // 제목
      new Paragraph({ heading: HeadingLevel.TITLE, children: [
        new TextRun("[개발중] 제과제빵 레시피 팬 변환 프로그램"),
        new TextRun({ text: " 🍞", size: 48 })
      ]}),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [
        new TextRun({ text: "의견 부탁드립니다!", color: "666666", size: 24 })
      ]}),

      // 인사
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun("안녕하세요, 회원님들! "),
        new TextRun({ text: "👋", size: 24 })
      ]}),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun("홈베이킹 5년차 + 개발자입니다.")
      ]}),
      new Paragraph({ spacing: { after: 300 }, children: [
        new TextRun("베이킹하다가 항상 불편했던 게 있어서 직접 프로그램을 만들어보고 있는데요,"),
        new TextRun({ text: " 혹시 저만 불편했던 건지", bold: true }),
        new TextRun(" 여쭤보고 싶어서 글 올립니다!")
      ]}),

      // 섹션 1: 이런 경험 있으신가요?
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [
        new TextRun({ text: "😅 ", size: 28 }),
        new TextRun("이런 경험 있으신가요?")
      ]}),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 100 }, children: [
        new TextRun("유튜브 레시피가 "),
        new TextRun({ text: "18cm 원형팬", bold: true }),
        new TextRun("인데 집에는 "),
        new TextRun({ text: "15cm팬", bold: true }),
        new TextRun("밖에 없을 때")
      ]}),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 100 }, children: [
        new TextRun("식빵틀 크기가 달라서 "),
        new TextRun({ text: "재료 계산", bold: true }),
        new TextRun("을 매번 다시 해야 할 때")
      ]}),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 100 }, children: [
        new TextRun("\"이 레시피 "),
        new TextRun({ text: "8개 분량", bold: true }),
        new TextRun("인데 난 "),
        new TextRun({ text: "12개", bold: true }),
        new TextRun(" 만들고 싶은데...\"")
      ]}),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 200 }, children: [
        new TextRun("바게트 레시피인데 "),
        new TextRun({ text: "분할 중량", bold: true }),
        new TextRun("을 몇 g으로 해야 할지 모를 때")
      ]}),
      new Paragraph({ spacing: { after: 300 }, children: [
        new TextRun({ text: "저는 매번 계산기 두드리다가 짜증나서 그냥 프로그램을 만들어버렸습니다 ㅋㅋ", italics: true, color: "666666" })
      ]}),

      // 섹션 2: 만들고 있는 기능
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [
        new TextRun({ text: "🍞 ", size: 28 }),
        new TextRun("만들고 있는 기능")
      ]}),

      // 기능 테이블
      new Table({
        columnWidths: [2500, 6860],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA },
                shading: { fill: "FFF3E0", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
                  new TextRun({ text: "기능", bold: true, size: 22 })
                ]})] }),
              new TableCell({ borders: cellBorders, width: { size: 6860, type: WidthType.DXA },
                shading: { fill: "FFF3E0", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
                  new TextRun({ text: "설명", bold: true, size: 22 })
                ]})] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "팬 크기 변환", bold: true })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6860, type: WidthType.DXA },
                children: [
                  new Paragraph({ children: [new TextRun("원래 레시피 팬 → 내가 가진 팬으로 자동 환산")] }),
                  new Paragraph({ children: [new TextRun({ text: "식빵틀, 원형팬, 파운드틀, 쉬폰틀, 무스링 등 지원", color: "888888", size: 20 })] })
                ] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "개수 변환", bold: true })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6860, type: WidthType.DXA },
                children: [
                  new Paragraph({ children: [new TextRun("소금빵 8개 → 12개로 늘리면 재료 자동 계산")] }),
                  new Paragraph({ children: [new TextRun({ text: "분할 중량도 자동 계산", color: "888888", size: 20 })] })
                ] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "베이커스 퍼센트", bold: true })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6860, type: WidthType.DXA },
                children: [
                  new Paragraph({ children: [new TextRun("재료 입력하면 BP% 자동 표시")] }),
                  new Paragraph({ children: [new TextRun({ text: "수분율, 당분율 등 한눈에", color: "888888", size: 20 })] })
                ] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "레시피 저장", bold: true })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6860, type: WidthType.DXA },
                children: [
                  new Paragraph({ children: [new TextRun("유튜브/책 레시피 저장해두고 관리")] }),
                  new Paragraph({ children: [new TextRun({ text: "출처 표시 (빵준서, 호야TV 등)", color: "888888", size: 20 })] })
                ] })
            ]
          })
        ]
      }),

      new Paragraph({ spacing: { before: 400 } }),

      // 섹션 3: 여쭤보고 싶은 것들
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [
        new TextRun({ text: "🙋‍♀️ ", size: 28 }),
        new TextRun("여쭤보고 싶은 것들")
      ]}),
      new Paragraph({ numbering: { reference: "question-list", level: 0 }, spacing: { after: 100 }, children: [
        new TextRun({ text: "이런 프로그램 필요하신가요?", bold: true })
      ]}),
      new Paragraph({ indent: { left: 720 }, spacing: { after: 200 }, children: [
        new TextRun({ text: "→ 아니면 그냥 계산기로 충분하신가요?", color: "666666" })
      ]}),
      new Paragraph({ numbering: { reference: "question-list", level: 0 }, spacing: { after: 100 }, children: [
        new TextRun({ text: "주로 어떤 상황에서 불편하셨나요?", bold: true })
      ]}),
      new Paragraph({ indent: { left: 720 }, spacing: { after: 200 }, children: [
        new TextRun({ text: "→ 팬 크기? 개수 변환? 다른 거?", color: "666666" })
      ]}),
      new Paragraph({ numbering: { reference: "question-list", level: 0 }, spacing: { after: 100 }, children: [
        new TextRun({ text: "있으면 좋겠다 싶은 기능이 있으신가요?", bold: true })
      ]}),
      new Paragraph({ indent: { left: 720 }, spacing: { after: 200 }, children: [
        new TextRun({ text: "→ 예: 원가 계산, 영양 정보, 타이머 등", color: "666666" })
      ]}),
      new Paragraph({ numbering: { reference: "question-list", level: 0 }, spacing: { after: 100 }, children: [
        new TextRun({ text: "웹/앱 중 어떤 게 편하실까요?", bold: true })
      ]}),
      new Paragraph({ indent: { left: 720 }, spacing: { after: 300 }, children: [
        new TextRun({ text: "→ 현재는 웹(PC/모바일 둘 다 가능)으로 개발 중", color: "666666" })
      ]}),

      // 섹션 4: 마무리
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [
        new TextRun({ text: "💬 ", size: 28 }),
        new TextRun("솔직한 피드백 부탁드려요!")
      ]}),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "\"이거 필요없을 것 같아요\"", bold: true }),
        new TextRun(" 라는 의견도 환영합니다!")
      ]}),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun("시장조사 중이라 솔직한 의견이 제일 도움 됩니다 🙏")
      ]}),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun("관심 있으시면 아래 링크에서 "),
        new TextRun({ text: "직접 체험", bold: true, color: "D2691E" }),
        new TextRun("해보실 수 있어요!")
      ]}),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "👉 ", size: 24 }),
        new TextRun({ text: "https://illustrious-nasturtium-22dbeb.netlify.app/", bold: true, color: "0066CC", underline: { type: "single" } })
      ]}),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "(아직 개발 중이라 버그 있을 수 있음 주의 ㅋㅋ)", italics: true, color: "888888" })
      ]}),
      new Paragraph({ spacing: { after: 400 }, children: [
        new TextRun("읽어주셔서 감사합니다! 🥐")
      ]}),

      // 참고 박스
      new Table({
        columnWidths: [9360],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 9360, type: WidthType.DXA },
                shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
                children: [
                  new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: "[참고]", bold: true })] }),
                  new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("완전 무료 / 광고 없음")] }),
                  new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("개인 프로젝트라 상업적 목적 없습니다")] }),
                  new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 100 }, children: [new TextRun("빵준서, 호야TV 등 유튜브 레시피 10개 샘플로 넣어뒀어요")] })
                ]
              })
            ]
          })
        ]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("d:\\VisualStudio\\10.레시피\\250708_claude_code\\카페_홍보글_레시피변환기.docx", buffer);
  console.log("워드 문서 생성 완료: 카페_홍보글_레시피변환기.docx");
});
