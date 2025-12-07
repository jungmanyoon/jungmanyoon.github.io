import pandas as pd
import sys

# Set display options to show more data
pd.set_option('display.max_rows', 50)
pd.set_option('display.max_columns', 20)
pd.set_option('display.width', 1000)

file_path = r'd:\VisualStudio\10.레시피\250708_claude_code\레시피계산기.xlsx'

try:
    xl = pd.ExcelFile(file_path)
    print(f"Sheet names: {xl.sheet_names}")

    for sheet in xl.sheet_names:
        if sheet in ['제과', '소금빵']:
            print(f"\n{'='*20} Sheet: {sheet} {'='*20}")
            # Read first 20 rows and first 10 columns to get a sense of layout
            df = xl.parse(sheet, nrows=20, header=None) 
            # Fill NaN with empty string for better readability
            df = df.fillna('')
            print(df.to_string(index=False, header=False))
            print("\n")

except Exception as e:
    print(f"Error reading excel file: {e}")
