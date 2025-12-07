import pandas as pd

pd.set_option('display.max_rows', 100)
pd.set_option('display.max_columns', 100)
pd.set_option('display.width', 1000)

file_path = r'd:\VisualStudio\10.레시피\250708_claude_code\레시피계산기.xlsx'

try:
    xl = pd.ExcelFile(file_path)
    for sheet in ['소금빵', '제과']:
        if sheet in xl.sheet_names:
            print(f"\n>>> SHEET: {sheet} <<<")
            df = xl.parse(sheet, header=None)
            # Print first 15 rows, replacing NaN with ''
            for i, row in df.head(15).iterrows():
                row_str = " | ".join([str(x) if pd.notna(x) else "" for x in row])
                print(f"Row {i}: {row_str}")
except Exception as e:
    print(e)
