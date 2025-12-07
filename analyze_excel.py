import pandas as pd

file_path = r'd:\VisualStudio\10.레시피\250708_claude_code\레시피계산기.xlsx'

try:
    xl = pd.ExcelFile(file_path)
    print(f"Sheet names: {xl.sheet_names}")

    for sheet in xl.sheet_names:
        print(f"\n--- Sheet: {sheet} ---")
        df = xl.parse(sheet, nrows=10) # Read first 10 rows
        print(df.to_string())
        print("-" * 30)

except Exception as e:
    print(f"Error reading excel file: {e}")
