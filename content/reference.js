/* Reference pages. They stay useful after the course; add rows as new weeks introduce new ideas. */
(function () {
  Course.addReference({
    id: "ref-shortcuts", title: "Keyboard shortcuts", icon: "keyboard", keywords: "shortcut keys ctrl cmd f4 f2",
    lede: "The shortcuts used in this course. Switch between Windows and Mac keys.",
    blocks: [{ type: "widget", name: "shortcuts", title: "All shortcuts" }]
  });
  Course.addReference({
    id: "ref-formats", title: "Number format codes", icon: "pencil", keywords: "format code custom percent brackets",
    lede: "Press Ctrl+1 (Mac: Cmd+1), choose Custom, and type a code. Parts: positive ; negative ; zero.",
    blocks: [
      { type: "table", head: ["Code", "Value", "Shows", "Use for"], rows: [
        ["<code>#,##0</code>", "1234567.891", "1,234,568", "Whole numbers"],
        ["<code>#,##0;(#,##0);\"-\"</code>", "−45230", "(45,230)", "Financial statements"],
        ["<code>#,##0;(#,##0);\"-\"</code>", "0", "-", "Zero as a dash"],
        ["<code>#,##0.00</code>", "17.5", "17.50", "Share prices"],
        ["<code>0.0%</code>", "0.4123", "41.2%", "Margins and growth (store 12% as 0.12)"],
        ["<code>0.0%;(0.0%)</code>", "−0.0375", "(3.8%)", "Negative percentages"],
        ["<code>0.0\"x\"</code>", "8.456", "8.5x", "Multiples"],
        ["<code>#,##0.0,,</code>", "268400000", "268.4", "Showing millions"]
      ] },
      { type: "widget", name: "formats", title: "Try any code" }
    ]
  });
  Course.addReference({
    id: "ref-functions", title: "Functions A to Z", icon: "list", keywords: "function list syntax",
    lede: "Every function used so far, with its pattern and the lesson that teaches it. This list grows each week.",
    blocks: [{ type: "widget", name: "functions" }]
  });
  Course.addReference({
    id: "ref-errors", title: "Error messages", icon: "alert", keywords: "error #n/a #name #div/0 #value #ref",
    lede: "What each error means and how to fix it.",
    blocks: [{ type: "table", head: ["You see", "It means", "Fix"], rows: [
      ["<code>#N/A</code>", "A lookup can't find the value", "Check the spelling and extra spaces (TRIM). Add a fourth part to XLOOKUP, like \"Not found\"."],
      ["<code>#NAME?</code>", "Excel doesn't recognise a word in the formula", "Check the function spelling. Put text in quotes. Older Excel? Use INDEX-MATCH instead of XLOOKUP."],
      ["<code>#DIV/0!</code>", "Dividing by zero or an empty cell", "Fix the input, or use IFERROR where zero is expected."],
      ["<code>#VALUE!</code>", "Text used where a number is needed", "Check the inputs are numbers (numbers sit on the right of a cell)."],
      ["<code>#REF!</code>", "The formula points at a deleted cell", "Undo, or rewrite the address."],
      ["<code>#####</code>", "The column is too narrow", "Double-click the column's right border."],
      ["Wrong numbers after copying", "A missing or misplaced $", "Press F2 and look at the coloured borders. Lock what must not move."],
      ["Formula shows as text", "The cell is formatted as Text", "Format as General, then retype the formula."]
    ] }]
  });
  Course.addReference({
    id: "ref-glossary", title: "Glossary", icon: "book", keywords: "glossary terms definitions",
    lede: "Plain-language meanings of the terms used in the lessons.",
    blocks: [{ type: "table", head: ["Term", "Meaning"], rows: [
      ["Address", "A cell's column letter and row number, like B5"],
      ["Range", "A block of cells, written first:last, like B6:B17"],
      ["Input", "A number someone typed in, shown in blue"],
      ["Hard-code", "A number typed inside a formula instead of pointing at a cell. Avoid it."],
      ["Relative reference", "An address that moves when copied, like B4"],
      ["Absolute reference", "An address locked with $, like $B$4"],
      ["Mixed reference", "Only the row or the column is locked, like B$4 or $B4"],
      ["Discount factor", "What KES 1 received in a future year is worth today: 1 / (1 + rate)^year"],
      ["Current ratio", "Current assets ÷ current liabilities. Can the company pay its bills this year?"],
      ["Debt / equity", "Total debt ÷ equity. How much the company borrows compared with what owners put in."],
      ["Trial balance", "Every account's balance at one date. Total debits equal total credits."],
      ["Mapping", "Assigning each account to a line in the financial statements"],
      ["FY2025A / FY2026E", "Financial year, actual / estimate"]
    ] }]
  });
})();
