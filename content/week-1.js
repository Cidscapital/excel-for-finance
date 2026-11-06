/* Week 1 · Excel foundations. Lesson numbers (L1-L13) match the workbook tabs, the notes and the lesson plan. */
(function () {
  var NUM = '#,##0;(#,##0);"-"', PCT = '0.0%;(0.0%);"-"', X = '0.00"x"', DF = "0.0000", P2 = "#,##0.00";
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var SALES = [18250, 17480, 20115, 19870, 21340, 22905, 21760, 23410, 24085, 25190, 26730, 31455];
  function salesCells(startRow, withHeader) {
    var c = {};
    if (withHeader) { c["A" + (startRow - 1)] = "Month"; c["B" + (startRow - 1)] = "Sales, KES '000"; }
    MONTHS.forEach(function (m, i) { c["A" + (startRow + i)] = m; c["B" + (startRow + i)] = SALES[i]; });
    return c;
  }
  var COS = [
    ["Amani Foods", 4200, 310, 1450, 980, 1200, 2100, 0.08],
    ["Baraka Logistics", 2850, -120, 620, 710, 2400, 900, -0.04],
    ["Chui Tech", 0, -85, 140, 60, 50, 400, 0],
    ["Dafina Pharma", 6700, 905, 3100, 1250, 1800, 4600, 0.12],
    ["Elimu Books", 980, 38, 410, 300, 150, 520, 0.03],
    ["Faraja Energy", 3300, 140, 1020, 1150, 3900, 1700, 0.06]
  ];
  function companyCells(top) {
    var c = {}, heads = ["Company", "Revenue", "Net income", "Current assets", "Current liabilities", "Total debt", "Equity", "Sales growth"];
    "ABCDEFGH".split("").forEach(function (col, i) { c[col + top] = heads[i]; });
    COS.forEach(function (co, i) { "ABCDEFGH".split("").forEach(function (col, k) { c[col + (top + 1 + i)] = co[k]; }); });
    return c;
  }
  function merge() { var o = {}; for (var i = 0; i < arguments.length; i++) for (var k in arguments[i]) o[k] = arguments[i][k]; return o; }
  var DIR = [["AMNF", "Amani Foods", "Consumer goods", 42.5, 380], ["BRKL", "Baraka Logistics", "Transport", 11.2, 650], ["CHUI", "Chui Tech", "Technology", 6.85, 120],
    ["DFNP", "Dafina Pharma", "Healthcare", 128, 210], ["ELMB", "Elimu Books", "Education", 23.75, 95], ["FRJE", "Faraja Energy", "Energy", 18.4, 540]];
  function dirCells() {
    var c = { A5: "Code", B5: "Company", C5: "Sector", D5: "Share price, KES", E5: "Shares, m" };
    DIR.forEach(function (r, i) { "ABCDE".split("").forEach(function (col, k) { c[col + (6 + i)] = r[k]; }); });
    return c;
  }
  var NAMES = DIR.map(function (r) { return r[1]; });

  /* ---------- Function cards: definitions, arguments, worked examples (results are calculated live) ---------- */
  var SALES_SHEET = { title: "Example data: first-half sales", cols: "A:C", rows: [3, 9],
    cells: { A3: "Month", B3: "Sales, KES '000", C3: "Units", A4: "Jan", B4: 18250, C4: 1220, A5: "Feb", B5: 17480, C5: 1165, A6: "Mar", B6: 20115, C6: 1340, A7: "Apr", B7: 19870, C7: 1325, A8: "May", B8: 21340, C8: 1420, A9: "Jun", B9: 22905, C9: 1530 },
    formats: { "B4:C9": NUM }, styles: { head: ["A3:C3"], input: ["B4:C9"] } };
  var INV_SHEET = { title: "Example data: invoices this week", cols: "A:B", rows: [3, 9],
    cells: { A3: "Client", B3: "Invoice, KES", A4: "Amani Foods", B4: 12500, A5: "Baraka Logistics", B5: "pending", A6: "Chui Tech", A7: "Dafina Pharma", B7: 8400, A8: "Elimu Books", B8: 0, A9: "Faraja Energy", B9: 15250 },
    formats: { "B4:B9": NUM }, styles: { head: ["A3:B3"], input: ["B4:B9"] } };
  var PROD_SHEET = { title: "Example data: products sold", cols: "A:C", rows: [3, 7],
    cells: { A3: "Product", B3: "Units sold", C3: "Price, KES", A4: "Maize flour 2kg", B4: 12400, C4: 215, A5: "Cooking oil 1L", B5: 8650, C5: 340, A6: "Sugar 1kg", B6: 10200, C6: 185, A7: "Rice 2kg", B7: 5300, C7: 420 },
    formats: { "B4:C7": NUM }, styles: { head: ["A3:C3"], input: ["B4:C7"] } };
  var LEDGER_SHEET = { title: "Example data: expense ledger, KES", cols: "A:D", rows: [3, 11],
    cells: { A3: "Account", B3: "Category", C3: "Month", D3: "Amount",
      A4: "Rent", B4: "Opex", C4: "Jan", D4: 120000, A5: "Salaries", B5: "Opex", C5: "Jan", D5: 450000, A6: "Loan interest", B6: "Finance", C6: "Jan", D6: 38000,
      A7: "Rent", B7: "Opex", C7: "Feb", D7: 120000, A8: "Salaries", B8: "Opex", C8: "Feb", D8: 455000, A9: "Loan interest", B9: "Finance", C9: "Feb", D9: 37500,
      A10: "Audit fees", B10: "Opex", C10: "Feb", D10: 85000, A11: "Equipment", B11: "Capex", C11: "Feb", D11: 260000 },
    formats: { "D4:D11": NUM }, styles: { head: ["A3:D3"], input: ["D4:D11"] } };
  var RATIO_SHEET = { title: "Example data: four companies, KES m", cols: "A:E", rows: [3, 7],
    cells: { A3: "Company", B3: "Revenue", C3: "Net income", D3: "Current ratio", E3: "Debt / equity",
      A4: "Amani Foods", B4: 4200, C4: 310, D4: 1.48, E4: 0.57, A5: "Baraka Logistics", B5: 2850, C5: -120, D5: 0.87, E5: 2.67,
      A6: "Chui Tech", B6: 0, C6: -85, D6: 2.33, E6: 0.13, A7: "Dafina Pharma", B7: 6700, C7: 905, D7: 2.48, E7: 0.39 },
    formats: { "B4:C7": NUM, "D4:E7": X }, styles: { head: ["A3:E3"], input: ["B4:E7"] } };
  var LOOK_SHEET = { title: "Example data: company directory and a commission table", cols: ["A", "B", "C", "D", "E", "G", "H"], rows: [5, 11],
    cells: merge(dirCells(), { G5: "Sales from", H5: "Commission", G6: 0, H6: 0.02, G7: 100000, H7: 0.03, G8: 250000, H8: 0.04, G9: 500000, H9: 0.05 }),
    formats: { "D6:D11": P2, "E6:E11": NUM, "G6:G9": "#,##0", "H6:H9": "0%" }, styles: { head: ["A5:E5", "G5:H5"], input: ["D6:E11", "G6:H9"] } };

  var CARDS = {
    SUM: { type: "fn", name: "SUM", cat: "Maths",
      does: "Adds numbers together. You can give it single cells, whole ranges, typed numbers, or a mix of all three, and it returns the total.",
      syntax: "SUM(number1, [number2], ...)",
      args: [
        { n: "number1", means: "The first thing to add: a cell (<code>B4</code>), a range (<code>B4:B9</code>), or a typed number.", eg: "<code>B4:B9</code>" },
        { n: "number2, ...", req: false, means: "More cells, ranges or numbers to add, separated by commas. Up to 255 in total.", eg: "<code>B4:B6, B8</code>" }
      ],
      returns: "One number: the total of every number it was given.",
      how: ["Excel goes through each argument in turn.", "Inside a range, it adds every cell that holds a number. Blank cells, text and TRUE/FALSE in a range are skipped.", "If any cell in the range holds an error (like #DIV/0!), SUM returns that error instead of a total."],
      sheet: SALES_SHEET,
      examples: [
        { f: "=SUM(B4:B9)", fmt: NUM, why: "Total sales for January to June. Same as <code>=B4+B5+B6+B7+B8+B9</code>, but shorter and it can't miss a cell." },
        { f: "=SUM(B4:B6)", fmt: NUM, why: "First quarter only (Jan to Mar)." },
        { f: "=SUM(B4:B6, B9)", fmt: NUM, why: "Two separate pieces: Q1 plus June. Commas separate the arguments." },
        { f: "=SUM(B4:B9)/SUM(C4:C9)", fmt: P2, why: "Two SUMs inside one formula: average price per unit, in KES '000." }
      ],
      uses: ["Totals and subtotals on every statement: total revenue, total operating expenses, total assets.", "Balance checks: <code>=SUM(assets) - SUM(liabilities and equity)</code> should be 0.", "Trial balance: total debits and total credits."],
      mistakes: ["Numbers stored as text (left-aligned, often with a small green triangle) are skipped, so the total is too low. Fix them with Data → Text to Columns → Finish.", "Rows inserted just below the range are not included. Check the range after adding rows.", "Summing a column that already contains subtotals counts them twice."],
      tip: "Select a range and look at the bottom-right of the Excel window: the status bar shows its Sum, Average and Count without any formula. <kbd>Alt</kbd>+<kbd>=</kbd> writes a SUM for you; check the range it guessed.",
      related: ["AVERAGE", "SUMIF", "SUMPRODUCT"] },

    AVERAGE: { type: "fn", name: "AVERAGE", cat: "Statistics",
      does: "Returns the arithmetic mean: the total of the numbers divided by how many numbers there are.",
      syntax: "AVERAGE(number1, [number2], ...)",
      args: [
        { n: "number1", means: "The first cell, range or number to average.", eg: "<code>B4:B9</code>" },
        { n: "number2, ...", req: false, means: "More cells, ranges or numbers.", eg: "<code>B4:B6, B9</code>" }
      ],
      returns: "One number: SUM of the numbers ÷ COUNT of the numbers.",
      how: ["Excel collects every number in the arguments.", "Blank cells and text are left out completely: they don't count as zero.", "A cell that holds 0 <b>is</b> a number, so it is included and pulls the average down.", "If there are no numbers at all, the result is #DIV/0!."],
      sheet: SALES_SHEET,
      examples: [
        { f: "=AVERAGE(B4:B9)", fmt: P2, why: "Average monthly sales, January to June." },
        { f: "=SUM(B4:B9)/COUNT(B4:B9)", fmt: P2, why: "The same thing written out: this is exactly what AVERAGE does." },
        { f: "=ROUND(AVERAGE(B4:B9), 0)", fmt: NUM, why: "AVERAGE inside ROUND: a whole number for a report." }
      ],
      uses: ["Average monthly revenue or cost, to set a run-rate for a forecast.", "Average margin across several years.", "Average share price over a period."],
      mistakes: ["Blank vs zero: a month left blank is ignored, a month with 0 counts. Decide which you mean.", "An average of percentages is not the overall percentage. Overall margin is total profit ÷ total revenue, not the average of each year's margin.", "Averages hide the spread: check MIN and MAX too."],
      related: ["SUM", "COUNT", "MIN", "MAX", "SUMPRODUCT"] },

    MIN: { type: "fn", name: "MIN", cat: "Statistics",
      does: "Returns the smallest number in a set of cells or values.",
      syntax: "MIN(number1, [number2], ...)",
      args: [
        { n: "number1", means: "A cell, range or number.", eg: "<code>B4:B9</code>" },
        { n: "number2, ...", req: false, means: "More cells, ranges or numbers. A typed number works too, which is how MIN caps a value.", eg: "<code>500000</code>" }
      ],
      returns: "The lowest number. Blank cells and text are ignored.",
      sheet: SALES_SHEET,
      examples: [
        { f: "=MIN(B4:B9)", fmt: NUM, why: "The worst month for sales." },
        { f: "=MIN(620000, 500000)", fmt: NUM, why: "Capping: a bonus of 620,000 limited to a maximum of 500,000. Whichever is smaller wins." },
        { f: "=MIN(B9/B8-1, 10%)", fmt: "0.0%", why: "Growth was 7.3%; the cap of 10% doesn't bite, so the real growth is used." }
      ],
      uses: ["Lowest month or year in a series.", "Caps and limits: a loan drawdown can't exceed the facility, <code>=MIN(needed, facility)</code>.", "Worst-case checks in a sensitivity table."],
      mistakes: ["MIN of an empty range is 0, not an error, which can look like a real value.", "MIN ignores numbers stored as text."],
      related: ["MAX", "AVERAGE"] },

    MAX: { type: "fn", name: "MAX", cat: "Statistics",
      does: "Returns the largest number in a set of cells or values.",
      syntax: "MAX(number1, [number2], ...)",
      args: [
        { n: "number1", means: "A cell, range or number.", eg: "<code>B4:B9</code>" },
        { n: "number2, ...", req: false, means: "More cells, ranges or numbers. Typing 0 here is how MAX stops a value going negative.", eg: "<code>0</code>" }
      ],
      returns: "The highest number. Blank cells and text are ignored.",
      sheet: SALES_SHEET,
      examples: [
        { f: "=MAX(B4:B9)", fmt: NUM, why: "The best month for sales." },
        { f: "=MAX(0, -120*30%)", why: "Tax on a loss of 120: 30% of −120 is −36, but tax can't be negative, so MAX with 0 gives 0." },
        { f: "=MAX(0, 310*30%)", fmt: P2, why: "Tax on a profit of 310: 93. When the number is positive, MAX(0, …) leaves it alone." }
      ],
      uses: ["Highest month, peak debt, largest customer.", "Floors at zero: tax, dividends, cash sweeps, <code>=MAX(0, value)</code>. You'll use this in the three-statement model.", "Best case in a sensitivity table."],
      mistakes: ["MAX(0, …) hides a negative number. Make sure that is what you want, not a sign error."],
      related: ["MIN", "IF"] },

    COUNT: { type: "fn", name: "COUNT", cat: "Statistics",
      does: "Counts how many cells contain <b>numbers</b>. COUNTA counts cells that are <b>not empty</b> (numbers, text, anything). COUNTBLANK counts empty cells.",
      syntax: "COUNT(value1, [value2], ...)",
      args: [
        { n: "value1", means: "A cell or range to count in.", eg: "<code>B4:B9</code>" },
        { n: "value2, ...", req: false, means: "More cells or ranges.", eg: "" }
      ],
      returns: "A whole number: how many numbers it found.",
      sheet: INV_SHEET,
      examples: [
        { f: "=COUNT(B4:B9)", why: "4 cells hold numbers (0 counts as a number). \"pending\" is text and Chui Tech's cell is empty." },
        { f: "=COUNTA(B4:B9)", why: "5 cells are not empty: the four numbers plus the text \"pending\"." },
        { f: "=COUNTBLANK(B4:B9)", why: "1 empty cell: Chui Tech." },
        { f: "=AVERAGE(B4:B9)", fmt: P2, why: "The average uses the 4 numbers only: 36,150 ÷ 4." }
      ],
      uses: ["How many months of data you have, as a check: <code>=COUNT(B4:B15)</code> should be 12.", "How many invoices have an amount entered.", "Spotting missing inputs: COUNTA minus COUNT = cells holding text where a number should be."],
      mistakes: ["COUNT ignores text, so a number typed as text is not counted. COUNTA counts it.", "A cell with a formula that returns \"\" (empty text) is counted by COUNTA."],
      related: ["COUNTIF", "AVERAGE"] },

    ROUND: { type: "fn", name: "ROUND", cat: "Maths",
      does: "Rounds a number to a set number of digits. ROUNDUP always rounds away from zero; ROUNDDOWN always rounds towards zero. Unlike a number format, these change the value that is stored.",
      syntax: "ROUND(number, num_digits)",
      args: [
        { n: "number", means: "The number to round: a typed number, a cell, or a whole formula.", eg: "<code>22715.83</code> or <code>AVERAGE(B4:B9)</code>" },
        { n: "num_digits", means: "Where to round. <b>2</b> = two decimals (cents). <b>0</b> = whole number. <b>−1</b> = nearest 10, <b>−2</b> = nearest 100, <b>−3</b> = nearest 1,000.", eg: "<code>-2</code>" }
      ],
      returns: "The rounded number. ROUND sends exactly half (…5) away from zero: 2.5 becomes 3 and −2.5 becomes −3.",
      examples: [
        { f: "=ROUND(22715.83, 1)", why: "One decimal." },
        { f: "=ROUND(22715.83, 0)", why: "Whole number." },
        { f: "=ROUND(22715.83, -2)", why: "Nearest hundred." },
        { f: "=ROUND(22715.83, -3)", why: "Nearest thousand." },
        { f: "=ROUNDUP(22715.83, -2)", why: "Always up to the next hundred." },
        { f: "=ROUNDDOWN(22715.83, -2)", why: "Always down." },
        { f: "=ROUND(1/3, 2)", why: "Two decimals: useful for money in KES and cents." }
      ],
      uses: ["Amounts that must be exact to the cent: tax, invoice totals, dividend per share.", "Matching a published figure that was rounded.", "ROUNDUP for things that come in whole units: you can't order 12.3 trucks."],
      mistakes: ["Rounding in the middle of a model adds small errors that build up. Keep full precision and round only the final number, or just use a format.", "A format (Ctrl+1) changes how a number <i>looks</i>; ROUND changes what it <i>is</i>."],
      related: ["SUM", "AVERAGE"] },

    SUMPRODUCT: { type: "fn", name: "SUMPRODUCT", cat: "Maths",
      does: "Multiplies matching cells of two (or more) ranges, row by row, then adds all the results. One cell does what would otherwise need a helper column and a SUM.",
      syntax: "SUMPRODUCT(array1, [array2], ...)",
      args: [
        { n: "array1", means: "The first range, for example units sold.", eg: "<code>B4:B7</code>" },
        { n: "array2, ...", req: false, means: "Ranges to multiply with it, for example prices. Every range must be exactly the same size.", eg: "<code>C4:C7</code>" }
      ],
      returns: "One number: (B4×C4) + (B5×C5) + (B6×C6) + (B7×C7).",
      how: ["Pairs the first cell of each range, then the second, and so on.", "Multiplies each pair.", "Adds the products. Text is treated as 0."],
      sheet: PROD_SHEET,
      examples: [
        { f: "=SUMPRODUCT(B4:B7, C4:C7)", fmt: NUM, why: "Total revenue: units × price for each product, added up. KES 9,720,000." },
        { f: "=SUMPRODUCT(B4:B7, C4:C7)/SUM(B4:B7)", fmt: P2, why: "Weighted average price: revenue ÷ units. Not the same as AVERAGE(C4:C7), which treats every product equally." },
        { f: "=AVERAGE(C4:C7)", fmt: P2, why: "Simple average price, for comparison. It ignores how many of each product were sold." }
      ],
      uses: ["Revenue = volume × price across products or regions.", "Weighted averages: portfolio return = SUMPRODUCT(weights, returns); WACC in Week 6.", "Cost of a basket: quantities × unit costs."],
      mistakes: ["Ranges of different sizes give #VALUE!.", "Weighted average needs the divide by SUM(weights) unless the weights already add up to 100%."],
      related: ["SUM", "AVERAGE"] },

    SUMIF: { type: "fn", name: "SUMIF", cat: "Maths, conditional",
      does: "Adds only the numbers that meet one condition, for example every expense in the Opex category.",
      syntax: "SUMIF(range, criteria, [sum_range])",
      args: [
        { n: "range", means: "The cells to test against the condition.", eg: "<code>B4:B11</code> (the categories)" },
        { n: "criteria", means: "The condition, in quotes or from a cell. Exact text <code>\"Opex\"</code>; a comparison <code>\"&gt;100000\"</code>; not equal <code>\"&lt;&gt;Capex\"</code>; a wildcard <code>\"*interest*\"</code> (* means any characters); or joined to a cell <code>\"&gt;\"&amp;F2</code>.", eg: "<code>\"Opex\"</code>" },
        { n: "sum_range", req: false, means: "The numbers to add, same size as range. Leave it out to add the tested cells themselves.", eg: "<code>D4:D11</code> (the amounts)" }
      ],
      returns: "The total of the numbers whose row meets the condition. Text matching ignores upper and lower case.",
      how: ["Checks each cell in <b>range</b> against the condition.", "Where it's TRUE, takes the number in the same row of <b>sum_range</b>.", "Adds those numbers."],
      sheet: LEDGER_SHEET,
      examples: [
        { f: '=SUMIF(B4:B11, "Opex", D4:D11)', fmt: NUM, why: "Total operating expenses: rent, salaries and audit fees in both months." },
        { f: '=SUMIF(D4:D11, ">100000")', fmt: NUM, why: "Only the large items. With no sum_range, it adds the tested cells themselves." },
        { f: '=SUMIF(A4:A11, "*interest*", D4:D11)', fmt: NUM, why: "Wildcard: any account name containing \"interest\"." },
        { f: '=SUMIF(B4:B11, "<>Capex", D4:D11)', fmt: NUM, why: "Everything except capital spending." }
      ],
      uses: ["Totals by category from a general ledger or trial balance: all Opex, all Finance costs.", "Sales by region, product or month from a transactions list.", "Building an income statement from mapped trial-balance lines (L13)."],
      mistakes: ["Forgetting quotes round a comparison: <code>&gt;100000</code> must be <code>\">100000\"</code>.", "range and sum_range of different sizes give wrong totals.", "Extra spaces in the data (\"Opex \" vs \"Opex\") stop a match. TRIM cleans them."],
      related: ["SUMIFS", "COUNTIF", "SUM"] },

    SUMIFS: { type: "fn", name: "SUMIFS", cat: "Maths, conditional",
      does: "Adds the numbers that meet <b>several</b> conditions at once, for example Opex <i>and</i> February.",
      syntax: "SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)",
      args: [
        { n: "sum_range", means: "The numbers to add. Note: in SUMIFS this comes <b>first</b>, unlike SUMIF.", eg: "<code>D4:D11</code>" },
        { n: "criteria_range1", means: "The first range to test.", eg: "<code>B4:B11</code>" },
        { n: "criteria1", means: "The condition for that range, written as in SUMIF.", eg: "<code>\"Opex\"</code>" },
        { n: "criteria_range2, criteria2", req: false, means: "More range-and-condition pairs. A row is added only if it passes <b>every</b> condition.", eg: "<code>C4:C11, \"Feb\"</code>" }
      ],
      returns: "The total of the rows that pass all the conditions.",
      sheet: LEDGER_SHEET,
      examples: [
        { f: '=SUMIFS(D4:D11, B4:B11, "Opex", C4:C11, "Feb")', fmt: NUM, why: "Operating expenses in February only." },
        { f: '=SUMIFS(D4:D11, B4:B11, "Opex", D4:D11, ">=120000")', fmt: NUM, why: "Opex items of at least 120,000." },
        { f: '=SUMIFS(D4:D11, B4:B11, "Opex")', fmt: NUM, why: "With one condition it does the same as SUMIF. Many analysts use SUMIFS for everything so the order is always the same." }
      ],
      uses: ["Monthly totals by category: a management accounts table built straight from the ledger.", "Sales by region and product."],
      mistakes: ["Mixing up the argument order with SUMIF: SUMIFS starts with the numbers to add.", "All ranges must be the same size."],
      related: ["SUMIF", "COUNTIF"] },

    COUNTIF: { type: "fn", name: "COUNTIF", cat: "Statistics, conditional",
      does: "Counts the cells that meet a condition. COUNTIFS does the same with several conditions.",
      syntax: "COUNTIF(range, criteria)",
      args: [
        { n: "range", means: "The cells to check.", eg: "<code>B4:B11</code>" },
        { n: "criteria", means: "The condition, written the same way as in SUMIF: <code>\"Opex\"</code>, <code>\"&gt;0\"</code>, <code>\"*fees*\"</code>, or a cell.", eg: "<code>\"Opex\"</code>" }
      ],
      returns: "A whole number: how many cells passed.",
      sheet: LEDGER_SHEET,
      examples: [
        { f: '=COUNTIF(B4:B11, "Opex")', why: "How many Opex lines." },
        { f: '=COUNTIF(D4:D11, ">100000")', why: "How many items are over 100,000." },
        { f: '=COUNTIFS(B4:B11, "Opex", C4:C11, "Feb")', why: "COUNTIFS: Opex lines in February." }
      ],
      uses: ["Checks: how many accounts are UNMAPPED (L13). The answer should be 0.", "How many months made a loss: <code>=COUNTIF(profit_row, \"&lt;0\")</code>.", "How many companies pass a covenant test."],
      mistakes: ["Quotes are needed round comparisons, as in SUMIF.", "COUNTIF counts; it doesn't add. To add, use SUMIF."],
      related: ["SUMIF", "COUNT", "IF"] },

    IF: { type: "fn", name: "IF", cat: "Logic",
      does: "Checks whether a test is TRUE or FALSE, then returns one result for TRUE and another for FALSE. It's how a model makes a decision.",
      syntax: "IF(logical_test, [value_if_true], [value_if_false])",
      args: [
        { n: "logical_test", means: "Anything that answers TRUE or FALSE: a comparison with <code>&gt; &lt; &gt;= &lt;= = &lt;&gt;</code>, or a function like AND or OR.", eg: "<code>C4&gt;0</code>" },
        { n: "value_if_true", means: "What to return when the test is TRUE: a number, a cell, a calculation, or text in quotes.", eg: "<code>\"Profit\"</code> or <code>C4*30%</code>" },
        { n: "value_if_false", req: false, means: "What to return when the test is FALSE. If you leave it out, IF shows the word FALSE.", eg: "<code>\"Loss\"</code> or <code>0</code>" }
      ],
      returns: "Either value_if_true or value_if_false, never both.",
      how: ["Works out the test, e.g. is 310 &gt; 0? → TRUE.", "If TRUE, works out and returns the second argument.", "If FALSE, works out and returns the third argument. The branch that isn't chosen is never calculated, which is why IF can avoid a divide-by-zero."],
      sheet: RATIO_SHEET,
      examples: [
        { f: '=IF(C4>0, "Profit", "Loss")', why: "Amani Foods made 310, so the test is TRUE." },
        { f: '=IF(C5>0, "Profit", "Loss")', why: "Baraka lost 120, so the test is FALSE." },
        { f: "=IF(C4>0, C4*30%, 0)", fmt: P2, why: "A calculation as the result: tax at 30% only when there is a profit." },
        { f: '=IF(B6=0, "n/a", C6/B6)', why: "Chui Tech has no revenue. The test catches it before the divide, so no #DIV/0!." },
        { f: '=IF(C5>0, "Profit")', why: "No third argument: a FALSE test shows FALSE. Always give both outcomes." },
        { f: '=IF(C7>500, "Large", IF(C7>0, "Small", "Loss"))', why: "A nested IF: an IF inside an IF gives three outcomes. IFS (L10) does this more readably." }
      ],
      uses: ["Tax only on profits; interest only when there's debt.", "Flags: covenant breached, account unmapped, balance sheet doesn't balance.", "Switches: <code>=IF(scenario=\"Base\", base_growth, low_growth)</code>."],
      mistakes: ["Text without quotes: <code>=IF(C4&gt;0, Profit, Loss)</code> gives #NAME?.", "A number in quotes, <code>\"0\"</code>, is text, not the number 0, so later sums ignore it.", "Comparing text is not case-sensitive: \"OPEX\" = \"opex\" is TRUE.", "Deeply nested IFs are hard to check. Past two levels, use IFS or a lookup table."],
      related: ["IFS", "AND", "OR", "IFERROR"] },

    IFS: { type: "fn", name: "IFS", cat: "Logic",
      does: "Checks several tests in order and returns the result for the <b>first</b> one that is TRUE. A tidier way to write nested IFs.",
      syntax: "IFS(logical_test1, value_if_true1, [logical_test2, value_if_true2], ...)",
      args: [
        { n: "logical_test1", means: "The first test.", eg: "<code>D4&lt;1</code>" },
        { n: "value_if_true1", means: "What to return if the first test is TRUE.", eg: "<code>\"Weak\"</code>" },
        { n: "logical_test2, value_if_true2, ...", req: false, means: "More test-and-result pairs, up to 127. End with <code>TRUE, \"…\"</code> to catch anything left over.", eg: "<code>D4&lt;=2, \"Adequate\", TRUE, \"Strong\"</code>" }
      ],
      returns: "The result paired with the first TRUE test. If no test is TRUE, #N/A.",
      how: ["Tries test 1. If TRUE, stops and returns result 1.", "Otherwise tries test 2, and so on.", "The order matters: put the narrowest band first."],
      sheet: RATIO_SHEET,
      examples: [
        { f: '=IFS(D5<1, "Weak", D5<=2, "Adequate", TRUE, "Strong")', why: "Baraka, current ratio 0.87: the first test is TRUE." },
        { f: '=IFS(D4<1, "Weak", D4<=2, "Adequate", TRUE, "Strong")', why: "Amani, 1.48: the first test fails, the second passes." },
        { f: '=IFS(D7<1, "Weak", D7<=2, "Adequate", TRUE, "Strong")', why: "Dafina, 2.48: only the final TRUE catches it." },
        { f: '=IFS(D5<=2, "Adequate", D5<1, "Weak", TRUE, "Strong")', why: "Wrong order: 0.87 is also ≤ 2, so it says Adequate. Narrowest test first." },
        { f: '=IFS(D7<1, "Weak", D7<=2, "Adequate")', why: "No catch-all: nothing is TRUE for 2.48, so #N/A." }
      ],
      uses: ["Ratings and bands: liquidity, credit score, size category.", "Tiered rates: commission or discount bands (a lookup table with XLOOKUP is often better)."],
      mistakes: ["Forgetting the final <code>TRUE, …</code> pair gives #N/A for anything not covered.", "Tests in the wrong order give the wrong band silently.", "IFS needs Excel 2019 or 365. Older Excel shows #NAME?: use nested IF there."],
      related: ["IF", "XLOOKUP"] },

    AND: { type: "fn", name: "AND", cat: "Logic",
      does: "Returns TRUE only if <b>every</b> test you give it is TRUE. One FALSE makes the whole answer FALSE.",
      syntax: "AND(logical1, [logical2], ...)",
      args: [
        { n: "logical1", means: "The first test.", eg: "<code>D4&gt;=1.2</code>" },
        { n: "logical2, ...", req: false, means: "More tests, up to 255.", eg: "<code>E4&lt;=2</code>" }
      ],
      returns: "TRUE or FALSE. Usually placed inside IF to turn that into words or numbers.",
      sheet: RATIO_SHEET,
      examples: [
        { f: "=AND(D4>=1.2, E4<=2)", why: "Amani: 1.48 ≥ 1.2 and 0.57 ≤ 2. Both TRUE." },
        { f: "=AND(D5>=1.2, E5<=2)", why: "Baraka: 0.87 fails the first test, so FALSE." },
        { f: '=IF(AND(C7>0, D7>=1.5), "Can pay a dividend", "Hold")', why: "Dafina is profitable and liquid: both conditions met." },
        { f: '=IF(AND(C4>0, D4>=1.5), "Can pay a dividend", "Hold")', why: "Amani is profitable but 1.48 is below 1.5." }
      ],
      uses: ["Loan or covenant tests where every condition must hold.", "Dividend policy: profitable AND enough cash.", "Data checks: value is between two limits, <code>AND(x&gt;=0, x&lt;=1)</code>."],
      mistakes: ["Writing <code>1.2&lt;=D4&lt;=2</code> doesn't work in Excel. Use <code>AND(D4&gt;=1.2, D4&lt;=2)</code>."],
      related: ["OR", "IF"] },

    OR: { type: "fn", name: "OR", cat: "Logic",
      does: "Returns TRUE if <b>any</b> of the tests is TRUE. It is FALSE only when every test is FALSE. NOT reverses a single test.",
      syntax: "OR(logical1, [logical2], ...)",
      args: [
        { n: "logical1", means: "The first test.", eg: "<code>C5&lt;0</code>" },
        { n: "logical2, ...", req: false, means: "More tests, up to 255.", eg: "<code>D5&lt;1</code>" }
      ],
      returns: "TRUE or FALSE.",
      sheet: RATIO_SHEET,
      examples: [
        { f: "=OR(C5<0, D5<1)", why: "Baraka has a loss AND a weak ratio; one would have been enough." },
        { f: '=IF(OR(C4<0, D4<1), "Review", "OK")', why: "Amani passes both checks, so OK." },
        { f: '=IF(OR(C6<0, D6<1), "Review", "OK")', why: "Chui Tech made a loss: one TRUE is enough to flag it." },
        { f: "=NOT(C4>0)", why: "NOT flips TRUE to FALSE: is Amani not profitable? No." }
      ],
      uses: ["Warning flags: loss OR weak liquidity OR high debt.", "Exceptions in data checks: missing OR negative."],
      mistakes: ["Using OR when every condition must hold. Say it aloud: \"this <i>or</i> that\" vs \"this <i>and</i> that\"."],
      related: ["AND", "IF"] },

    IFERROR: { type: "fn", name: "IFERROR", cat: "Logic, errors",
      does: "Returns the formula's result if it works, or something you choose if the formula gives any error.",
      syntax: "IFERROR(value, value_if_error)",
      args: [
        { n: "value", means: "The formula to try.", eg: "<code>C6/B6</code>" },
        { n: "value_if_error", means: "What to show instead if that formula returns #DIV/0!, #N/A, #VALUE!, #REF!, #NUM!, #NAME? or #NULL!.", eg: "<code>\"n/a\"</code> or <code>0</code>" }
      ],
      returns: "The formula's own result, or value_if_error.",
      sheet: RATIO_SHEET,
      examples: [
        { f: "=C6/B6", why: "Chui Tech: −85 ÷ 0 is an error." },
        { f: '=IFERROR(C6/B6, "n/a")', why: "Same calculation, with a readable result instead." },
        { f: '=IFERROR(C4/B4, "n/a")', fmt: "0.0%", why: "When there's no error, IFERROR just passes the result through: Amani's net margin." },
        { f: '=IFNA(XLOOKUP("Kifaru Ltd", A4:A7, B4:B7), 0)', why: "IFNA catches only #N/A (not found) and lets every other error show. Safer for lookups." }
      ],
      uses: ["Ratios where the denominator can be zero.", "Lookups where a missing item is expected.", "Clean presentation tables."],
      mistakes: ["IFERROR hides <b>every</b> error, including real mistakes such as a deleted cell (#REF!). Use it only where you expect an error, and prefer IFNA for lookups.", "Showing 0 instead of an error can make a wrong total look right. \"n/a\" is easier to spot."],
      related: ["IF", "XLOOKUP"] },

    XLOOKUP: { type: "fn", name: "XLOOKUP", cat: "Lookup",
      does: "Searches one column (or row) for a value, then returns the item in the same position from another column. In words: <b>find this, in here, bring back that.</b>",
      syntax: "XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])",
      args: [
        { n: "lookup_value", means: "What you're looking for: a cell or typed value.", eg: "<code>\"Dafina Pharma\"</code> or <code>B14</code>" },
        { n: "lookup_array", means: "Where to look: one column (or one row) that contains that value.", eg: "<code>B6:B11</code> (company names)" },
        { n: "return_array", means: "What to bring back: a column of the same height. It can be to the left or right of lookup_array.", eg: "<code>D6:D11</code> (share prices)" },
        { n: "if_not_found", req: false, means: "What to show if there's no match. Without it you get #N/A.", eg: "<code>\"Not found\"</code>" },
        { n: "match_mode", req: false, means: "<b>0</b> exact match (the default). <b>−1</b> exact, or else the next <i>smaller</i> value: for bands and brackets. <b>1</b> exact, or else the next larger. <b>2</b> wildcard, where * means any characters.", eg: "<code>-1</code>" },
        { n: "search_mode", req: false, means: "<b>1</b> search first to last (default). <b>−1</b> last to first: finds the most recent entry in a list.", eg: "<code>-1</code>" }
      ],
      returns: "The value from return_array in the position where the match was found.",
      how: ["Goes down lookup_array until it finds lookup_value (Dafina Pharma is 4th).", "Takes the 4th item of return_array.", "If nothing matches, returns if_not_found, or #N/A."],
      sheet: LOOK_SHEET,
      examples: [
        { f: '=XLOOKUP("Dafina Pharma", B6:B11, D6:D11)', fmt: P2, why: "Share price for Dafina Pharma." },
        { f: '=XLOOKUP("Dafina Pharma", B6:B11, A6:A11)', why: "The code, which is to the <b>left</b> of the names. VLOOKUP can't do this." },
        { f: '=XLOOKUP("Kifaru Ltd", B6:B11, D6:D11, "Not found")', why: "Not in the list, so the message shows." },
        { f: '=XLOOKUP("Kifaru Ltd", B6:B11, D6:D11)', why: "Same, without the fourth argument: #N/A." },
        { f: '=XLOOKUP("CHUI", A6:A11, D6:D11) * XLOOKUP("CHUI", A6:A11, E6:E11)', fmt: P2, why: "Two lookups in one formula: market value = price × shares (KES m)." },
        { f: "=XLOOKUP(320000, G6:G9, H6:H9, , -1)", fmt: "0%", why: "Bands: 320,000 isn't in the table, so match_mode −1 takes the next smaller entry, 250,000, and returns 4%. The empty argument (two commas) skips if_not_found." }
      ],
      uses: ["Pull a share price, rate or balance from a data table into your model.", "Map trial-balance accounts to statement lines (L13).", "Tax, commission or interest bands with match_mode −1.", "Find the latest price in a dated list with search_mode −1."],
      mistakes: ["lookup_array and return_array must be the same height, or you get #VALUE!.", "Lock the ranges with $ before copying down: <code>$B$6:$B$11</code>.", "Spaces or different spelling (\"Dafina Pharma \" vs \"Dafina Pharma\") give #N/A.", "Numbers stored as text don't match real numbers: 1010 ≠ \"1010\".", "XLOOKUP needs Excel 2021 or 365. In older Excel it shows #NAME?: use INDEX-MATCH."],
      tip: "Read every XLOOKUP aloud as <i>find this, in here, bring back that</i>. If the sentence makes sense, the formula usually does too.",
      related: ["INDEX", "MATCH", "VLOOKUP", "IFERROR"] },

    VLOOKUP: { type: "fn", name: "VLOOKUP", cat: "Lookup, older",
      does: "Searches the <b>first column</b> of a table for a value and returns the item from a column you name by number. Still in many existing files, so you need to read it.",
      syntax: "VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])",
      args: [
        { n: "lookup_value", means: "What to look for. It must be in the first column of table_array.", eg: "<code>\"CHUI\"</code>" },
        { n: "table_array", means: "The whole table, starting with the column you search.", eg: "<code>A6:E11</code>" },
        { n: "col_index_num", means: "Which column of the table to bring back, counting from 1 = the first column of table_array.", eg: "<code>4</code> (share price)" },
        { n: "range_lookup", req: false, means: "<b>FALSE</b> (or 0) = exact match. <b>TRUE</b> (or left out) = approximate: the largest value not above lookup_value, and the first column must be sorted smallest to largest.", eg: "<code>FALSE</code>" }
      ],
      returns: "The value from that column in the matching row.",
      sheet: LOOK_SHEET,
      examples: [
        { f: '=VLOOKUP("CHUI", A6:E11, 4, FALSE)', fmt: P2, why: "Code CHUI, 4th column of the table = share price." },
        { f: '=VLOOKUP("CHUI", A6:E11, 3, FALSE)', why: "3rd column = sector." },
        { f: '=VLOOKUP("Dafina Pharma", A6:E11, 4, FALSE)', why: "#N/A: names are in column B, but VLOOKUP only searches the first column (A)." },
        { f: "=VLOOKUP(320000, G6:H9, 2, TRUE)", fmt: "0%", why: "Approximate match on a sorted band table: the same 4% as XLOOKUP with −1." }
      ],
      uses: ["Reading and fixing existing models and reports.", "Band tables (approximate match)."],
      mistakes: ["Leaving out the last argument means <b>approximate</b> match. On unsorted data that returns a wrong value with no error. Always write FALSE for exact matches.", "The column number is typed, so inserting a column inside the table breaks it silently.", "It can't return a column to the left of the search column. HLOOKUP is the same idea for rows."],
      related: ["XLOOKUP", "INDEX", "MATCH"] },

    MATCH: { type: "fn", name: "MATCH", cat: "Lookup",
      does: "Finds a value in a list and returns its <b>position</b> (1st, 2nd, 3rd…), not the value itself.",
      syntax: "MATCH(lookup_value, lookup_array, [match_type])",
      args: [
        { n: "lookup_value", means: "What to find.", eg: "<code>\"Dafina Pharma\"</code>" },
        { n: "lookup_array", means: "One column or one row to search.", eg: "<code>B6:B11</code>" },
        { n: "match_type", req: false, means: "<b>0</b> = exact match: use this almost always. <b>1</b> (the default) = largest value not above lookup_value, list sorted ascending. <b>−1</b> = smallest value not below, list sorted descending.", eg: "<code>0</code>" }
      ],
      returns: "A number: the position within lookup_array. Position 4 in B6:B11 is row 9 of the sheet, not row 4.",
      sheet: LOOK_SHEET,
      examples: [
        { f: '=MATCH("Dafina Pharma", B6:B11, 0)', why: "4th name in the list." },
        { f: '=MATCH("DFNP", A6:A11, 0)', why: "Same company, found by code: also 4th." },
        { f: '=MATCH("Share price, KES", A5:E5, 0)', why: "MATCH works across a row too: the share price heading is the 4th column." },
        { f: "=MATCH(320000, G6:G9, 1)", why: "Approximate: 320,000 falls in the 3rd band." },
        { f: '=MATCH("Kifaru Ltd", B6:B11, 0)', why: "Not in the list: #N/A." }
      ],
      uses: ["Feeding a position into INDEX (the INDEX-MATCH lookup).", "Finding which column holds a given year, for a two-way lookup."],
      mistakes: ["Leaving out match_type means 1, approximate. On unsorted data that gives a wrong position. Always type 0.", "The answer is a position in the range, not a row number on the sheet."],
      related: ["INDEX", "XLOOKUP"] },

    INDEX: { type: "fn", name: "INDEX", cat: "Lookup",
      does: "Returns the value at a given position in a range: the n-th item of a list, or the cell at row r, column c of a table. Combined with MATCH it becomes a lookup.",
      syntax: "INDEX(array, row_num, [column_num])",
      args: [
        { n: "array", means: "The range to pick from: one column, one row, or a whole table.", eg: "<code>D6:D11</code> or <code>A6:E11</code>" },
        { n: "row_num", means: "Which row of that range, counting from 1. Often a MATCH.", eg: "<code>4</code> or <code>MATCH(…)</code>" },
        { n: "column_num", req: false, means: "Which column of the range, counting from 1. Needed only when array has several columns.", eg: "<code>3</code>" }
      ],
      returns: "The value in that position. A position outside the range gives #REF!.",
      how: ["INDEX alone: count down row_num rows (and across column_num columns) and return what's there.", "INDEX-MATCH: MATCH finds the position, INDEX uses it. <code>=INDEX(return column, MATCH(find this, search column, 0))</code>.", "Two-way: one MATCH for the row and another for the column."],
      sheet: LOOK_SHEET,
      examples: [
        { f: "=INDEX(D6:D11, 4)", fmt: P2, why: "4th share price in the list." },
        { f: "=INDEX(A6:E11, 4, 3)", why: "Row 4, column 3 of the table: Dafina Pharma's sector." },
        { f: '=INDEX(D6:D11, MATCH("Chui Tech", B6:B11, 0))', fmt: P2, why: "INDEX-MATCH: MATCH gives 3, INDEX takes the 3rd price." },
        { f: '=INDEX(A6:E11, MATCH("Elimu Books", B6:B11, 0), MATCH("Share price, KES", A5:E5, 0))', fmt: P2, why: "Two-way lookup: the row from one MATCH, the column from another." }
      ],
      uses: ["INDEX-MATCH lookups in files built before XLOOKUP, and in interviews.", "Two-way lookups: a value by company and year.", "Picking a scenario: <code>=INDEX(growth_rates, scenario_number)</code>."],
      mistakes: ["The MATCH range and the INDEX range must start on the same row and be the same height, or the positions don't line up.", "Positions count from the top of the range, not the top of the sheet."],
      related: ["MATCH", "XLOOKUP", "VLOOKUP"] }
  };

  /* ---------- Practice questions with worked solutions on the function cards ---------- */
  CARDS.SUM.practice = [
    { q: "Write one formula for total sales in March, May and June only (cells B6, B8, B9).", a: "<code>=SUM(B6, B8:B9)</code> = 64,360. Commas separate the pieces; B8:B9 is a range of two cells." },
    { q: "A colleague's SUM of 12 months shows 241,135 but the months clearly add to 272,590. What is the most likely cause?", a: "One month (31,455, December) is stored as text, so SUM skips it. Check for a left-aligned number or a green triangle, and convert it to a number." }
  ];
  CARDS.AVERAGE.practice = [
    { q: "Margins were 40% on revenue of 100 and 50% on revenue of 300. Is the overall margin 45%?", a: "No. Profit is 40 + 150 = 190 on revenue 400, so the overall margin is <b>47.5%</b>. Use total profit ÷ total revenue (or SUMPRODUCT), not the average of the two margins." },
    { q: "In the invoices example (COUNT card), why is <code>=AVERAGE(B4:B9)</code> 9,037.50 and not 36,150 ÷ 6?", a: "AVERAGE divides by the count of <b>numbers</b> (4). The text \"pending\" and the blank cell are left out." }
  ];
  CARDS.ROUND.practice = [
    { q: "Write a formula that rounds the value in B5 to the nearest thousand.", a: "<code>=ROUND(B5, -3)</code>. Negative digits round to the left of the decimal point: −1 tens, −2 hundreds, −3 thousands." },
    { q: "A loan needs 37.2 months to repay at the current instalment. How many monthly payments will there be?", a: "<code>=ROUNDUP(37.2, 0)</code> = <b>38</b>. A part-month still needs a payment, so always round up." }
  ];
  CARDS.SUMPRODUCT.practice = [
    { q: "A portfolio is 50% in a share returning 12%, 30% in one returning 8% and 20% in one returning −5%. Weights are in B2:B4, returns in C2:C4. Write the portfolio return and work out the answer.", a: "<code>=SUMPRODUCT(B2:B4, C2:C4)</code> = 0.5×12% + 0.3×8% + 0.2×(−5%) = 6% + 2.4% − 1% = <b>7.4%</b>. No divide is needed because the weights add up to 100%." }
  ];
  CARDS.SUMIF.practice = [
    { q: "Using the ledger above, write the total of all Finance costs.", a: "<code>=SUMIF(B4:B11, \"Finance\", D4:D11)</code> = 38,000 + 37,500 = <b>75,500</b>." },
    { q: "The category to total is typed in F2. Write the formula so it changes when F2 changes.", a: "<code>=SUMIF(B4:B11, F2, D4:D11)</code>. A cell can be the criteria directly. For a comparison with a cell, join with &amp;: <code>\"&gt;\"&amp;F2</code>." }
  ];
  CARDS.COUNTIF.practice = [
    { q: "Net income for six companies is in C4:C9. Count how many made a loss.", a: "<code>=COUNTIF(C4:C9, \"&lt;0\")</code>. In the L9 data that is <b>2</b> (Baraka and Chui Tech)." }
  ];
  CARDS.IF.practice = [
    { q: "Profit before tax is in C10 and the tax rate in $B$4. Tax is charged only on a profit. Write the tax formula.", a: "<code>=IF(C10&gt;0, C10*$B$4, 0)</code>. Or the short form <code>=MAX(0, C10*$B$4)</code>, which gives the same answer." },
    { q: "Check cell: assets are in C20 and liabilities plus equity in C30. Show \"Balanced\" if they agree, otherwise \"Check\".", a: "<code>=IF(ROUND(C20-C30, 0)=0, \"Balanced\", \"Check\")</code>. ROUND stops a tiny difference such as 0.0000001 (from decimals) failing the test." }
  ];
  CARDS.IFS.practice = [
    { q: "Rate a net margin in B2: below 0% \"Loss-making\", up to 10% \"Thin\", up to 20% \"Healthy\", above that \"Strong\".", a: "<code>=IFS(B2&lt;0, \"Loss-making\", B2&lt;=10%, \"Thin\", B2&lt;=20%, \"Healthy\", TRUE, \"Strong\")</code>. Tests go from the lowest band up, and TRUE catches the rest." }
  ];
  CARDS.AND.practice = [
    { q: "A covenant says interest cover (D5) must be at least 3x AND debt/EBITDA (E5) at most 2.5x. Show \"Pass\" or \"Breach\".", a: "<code>=IF(AND(D5&gt;=3, E5&lt;=2.5), \"Pass\", \"Breach\")</code>. Both conditions must hold, so AND." }
  ];
  CARDS.IFERROR.practice = [
    { q: "Why is <code>=IFNA(XLOOKUP(…), \"Not found\")</code> safer than <code>=IFERROR(XLOOKUP(…), \"Not found\")</code>?", a: "IFNA hides only #N/A (the value isn't there). If the range is broken (#REF!) or the inputs are wrong (#VALUE!), the error still shows, so a real mistake isn't hidden behind \"Not found\"." }
  ];
  CARDS.XLOOKUP.practice = [
    { q: "Using the directory above, write a formula for Elimu Books' number of shares, and give the answer.", a: "<code>=XLOOKUP(\"Elimu Books\", B6:B11, E6:E11)</code> = <b>95</b> million. Find Elimu Books in the names (B), bring back the same row from Shares (E)." },
    { q: "Commission for sales of 99,000 using the table in G6:H9?", a: "<code>=XLOOKUP(99000, G6:G9, H6:H9, , -1)</code> = <b>2%</b>. 99,000 is below the 100,000 band, so the next smaller entry is 0 → 2%." },
    { q: "You copy <code>=XLOOKUP(A7, J6:J26, K6:K26)</code> down 10 rows and the bottom results are wrong. Why, and what is the fix?", a: "The search and return ranges slid down as you copied (J7:J27, J8:J28…), so the top of the table dropped out. Lock them: <code>=XLOOKUP(A7, $J$6:$J$26, $K$6:$K$26)</code>." }
  ];
  CARDS.VLOOKUP.practice = [
    { q: "Rewrite <code>=VLOOKUP(\"ELMB\", A6:E11, 5, FALSE)</code> as an XLOOKUP. What does it return?", a: "<code>=XLOOKUP(\"ELMB\", A6:A11, E6:E11)</code> = <b>95</b>. Column 5 of A:E is column E, so return E6:E11." }
  ];
  CARDS.MATCH.practice = [
    { q: "Years FY2024A to FY2028E are in C4:G4. What does <code>=MATCH(\"FY2026E\", C4:G4, 0)</code> return?", a: "<b>3</b>: the third heading. It's a position within C4:G4, which is column E on the sheet." }
  ];
  CARDS.INDEX.practice = [
    { q: "Write an INDEX-MATCH for Faraja Energy's share price.", a: "<code>=INDEX(D6:D11, MATCH(\"Faraja Energy\", B6:B11, 0))</code>. MATCH gives 6, INDEX takes the 6th price: <b>18.40</b>." },
    { q: "What does <code>=INDEX(A6:E11, 2, 5)</code> return?", a: "Row 2, column 5 of the table: Baraka Logistics' shares, <b>650</b>." }
  ];

  /* ---------- Concept cards: one for every topic ---------- */
  var CONCEPTS = {
    cells: { type: "concept", id: "cells-ranges", title: "Workbooks, cells and ranges", cat: "Concept", icon: "table",
      does: "A <b>workbook</b> is the Excel file. It holds <b>worksheets</b> (the tabs). Each sheet is a grid of <b>cells</b>; every cell has an <b>address</b> made of its column letter and row number. A <b>range</b> is a rectangle of cells, written as its first and last cell joined by a colon.",
      args: [
        { n: "Cell address", means: "Column letter, then row number. Letters run A to XFD (16,384 columns); rows run 1 to 1,048,576.", eg: "<code>B5</code> = column B, row 5" },
        { n: "Range", means: "Top-left cell, colon, bottom-right cell. Everything in between is included.", eg: "<code>B6:B17</code> (12 cells), <code>A1:C3</code> (9 cells)" },
        { n: "Whole column / row", means: "Just the letters or the numbers.", eg: "<code>B:B</code>, <code>5:5</code>" },
        { n: "Several ranges", means: "Separated by commas inside a function.", eg: "<code>SUM(B6:B8, D6:D8)</code>" },
        { n: "Another tab", means: "Tab name, exclamation mark, address. Quotes are needed when the name has spaces.", eg: "<code>'L8 Forecast'!E20</code>" },
        { n: "Formula bar", means: "Above the grid. Shows what the selected cell really <b>holds</b>, which can differ from what it <b>shows</b>.", eg: "" },
        { n: "Name Box", means: "Left of the formula bar. Shows the selected address; type an address there to jump to it, or type a name to name the cell.", eg: "" },
        { n: "Status bar", means: "Bottom of the window. Shows the Sum, Average and Count of the cells you've selected.", eg: "" }
      ],
      how: ["Click a cell to select it; its address appears in the Name Box.", "Drag, or hold <kbd>Shift</kbd> and use the arrow keys, to select a range.", "Hold <kbd>Ctrl</kbd> while clicking to add separate ranges to the selection."],
      examplesTitle: "Reading ranges",
      examples: [
        { show: "B6:B17", out: "12 cells", why: "One column (B), rows 6 to 17: 17 − 6 + 1 = 12." },
        { show: "C5:F10", out: "24 cells", why: "4 columns (C, D, E, F) × 6 rows (5 to 10)." },
        { show: "B6:B8, D6:D8", out: "6 cells", why: "Two separate ranges of 3 cells each." },
        { show: "'L8 Forecast'!E20", out: "1 cell", why: "Cell E20 on the tab called L8 Forecast." }
      ],
      uses: ["Every formula in a model refers to cells and ranges.", "Links between tabs (inputs on one tab, statements on another) use the <code>'Tab'!A1</code> form."],
      mistakes: ["Reading the number a cell shows and assuming it's typed in. Always check the formula bar.", "Mixing up column and row: it's always letter first, <code>C7</code>, not 7C."],
      practice: [
        { q: "How many cells are in <code>A1:D20</code>?", a: "4 columns × 20 rows = <b>80</b> cells." },
        { q: "Write the range for the January to June sales in column B, rows 4 to 9.", a: "<code>B4:B9</code>." },
        { q: "A cell shows 272,590. How do you find out whether it was typed in or calculated?", a: "Click it and read the formula bar. A calculated cell shows a formula starting with =, such as <code>=SUM(B6:B17)</code>." }
      ] },

    values: { type: "concept", id: "cell-values", title: "What a cell can hold", cat: "Concept", icon: "info",
      does: "Every cell holds one of five things: a <b>number</b>, <b>text</b>, a <b>TRUE/FALSE</b> value, an <b>error</b>, or a <b>formula</b> that produces one of those. Dates and percentages are just numbers with a format.",
      args: [
        { n: "Number", means: "Right-aligned by default. Can be used in calculations.", eg: "250000, 0.12, −45230" },
        { n: "Text", means: "Left-aligned by default. Ignored by SUM and AVERAGE. A number typed with a leading apostrophe ('1010) is stored as text.", eg: "Revenue, FY2026E" },
        { n: "Percentage", means: "Stored as a decimal. 12% is the number 0.12.", eg: "Type <code>12%</code>, stored 0.12" },
        { n: "Date", means: "Stored as a serial number: days since 1 January 1900. That is why you can subtract one date from another.", eg: "4 Nov 2026 is stored as 46330" },
        { n: "TRUE / FALSE", means: "The result of a test. In arithmetic TRUE counts as 1 and FALSE as 0.", eg: "<code>=C5&gt;0</code>" },
        { n: "Error", means: "A result Excel couldn't calculate, such as #DIV/0!. It spreads to every formula that uses it.", eg: "" }
      ],
      examples: [
        { f: "=0.12*250000", fmt: "#,##0", why: "A percentage is a decimal: 12% of 250,000." },
        { f: "=DATE(2026,11,4)-DATE(2026,10,28)", why: "Dates are numbers, so the difference is the number of days between the Week 1 and Week 2 sessions." },
        { f: "=TRUE+TRUE", why: "TRUE is 1 in arithmetic." }
      ],
      mistakes: ["Numbers stored as text (often from downloads) look normal but don't add up. Excel marks them with a green triangle.", "Typing 12 into a cell formatted as % gives 1200%. Type 12% or 0.12."],
      practice: [
        { q: "You type <code>7.5%</code> into a cell. What number is stored?", a: "<b>0.075</b>. The % sign divides by 100 and applies a percentage format." }
      ] },

    formats: { type: "concept", id: "format-codes", title: "Custom number format codes", cat: "Concept", icon: "pencil",
      does: "A format code tells Excel how to <b>display</b> a number. It never changes the number stored. Open it with <kbd>Ctrl</kbd>+<kbd>1</kbd> → Number → Custom.",
      pattern: "positive<b> ; </b>negative<b> ; </b>zero<b> ; </b>text",
      args: [
        { n: "<code>0</code>", means: "A digit that always shows, even if it is 0.", eg: "<code>0.00</code> shows 5 as 5.00" },
        { n: "<code>#</code>", means: "A digit that shows only if needed.", eg: "<code>#,##0</code> shows 5 as 5" },
        { n: "<code>,</code> between digits", means: "Thousands separator.", eg: "1234567 → 1,234,567" },
        { n: "<code>,</code> at the end", means: "Divides the display by 1,000 for each comma. Two commas = millions.", eg: "<code>#,##0.0,,</code> shows 268,400,000 as 268.4" },
        { n: "<code>.</code>", means: "Decimal point. The number of 0s after it sets the decimals.", eg: "<code>0.0</code>" },
        { n: "<code>%</code>", means: "Multiplies the display by 100 and adds %.", eg: "0.4123 → 41.2%" },
        { n: "<code>\"text\"</code>", means: "Shows the text exactly as written.", eg: "<code>0.0\"x\"</code> → 8.5x" },
        { n: "<code>;</code>", means: "Separates the sections: positive ; negative ; zero ; text. With one section, negatives get a minus sign.", eg: "" },
        { n: "<code>[Red]</code>", means: "A colour for that section.", eg: "<code>#,##0;[Red](#,##0)</code>" }
      ],
      examplesTitle: "Examples (the result is calculated with the code)",
      examples: [
        { value: 1234567.891, code: "#,##0", why: "Thousands separators, no decimals. The stored value still has its decimals." },
        { value: -45230, code: "#,##0;(#,##0)", why: "Second section: negatives in brackets, the finance convention." },
        { value: 0, code: '#,##0;(#,##0);"-"', why: "Third section: zero shows as a dash, so empty lines read cleanly." },
        { value: 268400000, code: '#,##0.0,,"m"', why: "Two trailing commas show millions; \"m\" is a label." },
        { value: 0.4123, code: "0.0%", why: "Percentage with one decimal." },
        { value: 8.456, code: '0.0"x"', why: "Multiples, like 8.5x EBITDA." },
        { value: 128, code: "#,##0.00", why: "Two decimals for share prices." }
      ],
      uses: ["Every statement: <code>#,##0;(#,##0);\"-\"</code> for KES amounts.", "Ratios and margins in %; valuation multiples with x.", "Showing KES '000 or millions without dividing the actual numbers."],
      mistakes: ["Dividing the numbers by 1,000 to \"show thousands\". Use a format instead, or say the units in a label like KES '000.", "Applying % to a cell that holds 12 instead of 0.12 gives 1200%."],
      practice: [
        { q: "Write a code that shows 2,500,000 as 2.5m and negatives in brackets.", a: "<code>#,##0.0,,\"m\";(#,##0.0,,\"m\")</code>. Two trailing commas divide the display by a million; the second section handles negatives." },
        { q: "A cell holds 0.07 with the code <code>0%</code>. What shows? What is stored?", a: "Shows <b>7%</b>; stores <b>0.07</b>." },
        { q: "With <code>#,##0;(#,##0)</code>, what does −0.4 show?", a: "<b>(0)</b>. It rounds to 0 for display, but it's still negative, so the brackets stay." }
      ] },

    layout: { type: "concept", id: "model-layout", title: "Model layout and the colour code", cat: "Concept", icon: "layers",
      does: "A financial model is laid out so anyone can see at a glance what is an assumption, what is calculated, and where the answer is. Industry practice: inputs in one place, time running left to right, and colour that says what each cell holds.",
      args: [
        { n: "Inputs", means: "Numbers someone typed or copied from a report: growth rates, prices, last year's actuals. Blue font.", eg: "Growth 12%, tax rate 30%" },
        { n: "Calculations", means: "Formulas that use the inputs. Black font. Never type over them.", eg: "<code>=D12*(1+E5)</code>" },
        { n: "Links", means: "Formulas that bring a number from another tab. Green font.", eg: "<code>=Inputs!B3</code>" },
        { n: "Outputs", means: "What the reader looks at: net income, margins, valuation, charts.", eg: "" },
        { n: "Timeline", means: "One column per period, left to right. A = actual, E = estimate (forecast).", eg: "FY2024A, FY2025A, FY2026E" },
        { n: "Units label", means: "Every block says its units at the top.", eg: "KES '000" },
        { n: "Sign convention", means: "Pick one and stick to it. In these models costs are negative, so every subtotal is a plain sum.", eg: "Cost of sales −145,000" }
      ],
      how: ["Ask of any cell: was it typed in (blue), calculated here (black), or pulled from another tab (green)?", "Keep one formula per row, the same across every year, so you can check the first year and trust the rest.", "Put each assumption in its own cell once, and point to it everywhere."],
      uses: ["Every model you'll build in this course, including both portfolio projects.", "Reviewing someone else's model: you change only blue cells."],
      mistakes: ["A typed number inside a formula (a \"hard-code\"), e.g. <code>=C5*1.12</code>. The 12% is hidden and won't update.", "Different formulas in the same row for different years. A reviewer can't trust a row that changes pattern.", "Missing units: is that KES or KES '000?"],
      practice: [
        { q: "What's wrong with <code>=C12*(1+0.1)</code> in FY2027E revenue, and how do you fix it?", a: "The 10% growth is typed inside the formula, so nobody can see or change it. Put 10% in an input cell (say F5, blue) and write <code>=E12*(1+F5)</code>." },
        { q: "Which colour: <code>=SUM(E13:E15)</code>; <code>4,000</code> typed as interest; <code>='L8 Forecast'!E20</code>?", a: "Black (calculated here); blue (typed input); green (link to another tab)." }
      ] },

    formulas: { type: "concept", id: "formulas-operators", title: "Formulas, operators and order of calculation", cat: "Concept", icon: "fx",
      does: "A <b>formula</b> is a calculation that starts with <code>=</code>. It can combine cell addresses, numbers, operators and functions, and Excel recalculates it whenever an input changes.",
      pattern: "= <b>cell</b> <b>operator</b> <b>cell</b> …   e.g. <code>=B11/B5</code>",
      args: [
        { n: "<code>=</code>", means: "Tells Excel this is a formula. Without it, it's text.", eg: "" },
        { n: "<code>+ − * /</code>", means: "Add, subtract, multiply, divide.", eg: "<code>=B5-B6</code>" },
        { n: "<code>^</code>", means: "Power: a number raised to an exponent. Used for compounding.", eg: "<code>=1.1^3</code> = 1.331" },
        { n: "<code>%</code>", means: "Divides by 100.", eg: "<code>=50%*200</code> = 100" },
        { n: "<code>&amp;</code>", means: "Joins text.", eg: "<code>=\"FY\"&amp;2026</code> = FY2026" },
        { n: "<code>( )</code>", means: "Brackets: whatever is inside is worked out first.", eg: "<code>=(2+3)*4</code>" },
        { n: "Comparisons", means: "<code>= &lt;&gt; &gt; &lt; &gt;= &lt;=</code> give TRUE or FALSE (L9).", eg: "<code>=C5&gt;0</code>" }
      ],
      how: ["Brackets first.", "Then a leading minus sign (negation), then %.", "Then powers ^.", "Then × and ÷, from left to right.", "Then + and −, from left to right.", "Then &amp;, then comparisons."],
      examples: [
        { f: "=2+3*4", why: "× before +: 3×4 = 12, plus 2." },
        { f: "=(2+3)*4", why: "Brackets first: 5 × 4." },
        { f: "=10/2*5", why: "Same level, so left to right: 10/2 = 5, then × 5." },
        { f: "=-2^2", why: "Excel applies the minus sign before the power: (−2)² = 4. Write <code>=-(2^2)</code> if you mean −4." },
        { f: "=250000*(1+12%)", fmt: "#,##0", why: "Growth: next year = this year × (1 + growth)." },
        { f: "=280000/250000-1", fmt: "0.0%", why: "Growth rate between two years: new ÷ old − 1." },
        { f: "=(332640/250000)^(1/3)-1", fmt: "0.00%", why: "CAGR, the compound annual growth rate over 3 years: (end ÷ start)^(1 ÷ years) − 1." }
      ],
      uses: ["Margins: profit ÷ revenue.", "Growth: this year ÷ last year − 1.", "Compounding and discounting with ^ (Week 2)."],
      mistakes: ["Missing brackets: <code>=B5*1+B8</code> is not B5 × (1 + B8).", "Typing numbers instead of pointing at cells.", "Forgetting the = so the formula shows as text."],
      practice: [
        { q: "Revenue was 250,000 last year and is 280,000 this year (B5 and C5). Write the growth rate formula and give the answer.", a: "<code>=C5/B5-1</code> = <b>12.0%</b>." },
        { q: "What does <code>=100*(1+10%)^2</code> give, and what does it represent?", a: "<b>121</b>: KES 100 growing at 10% a year for two years. The power ^ does the compounding." },
        { q: "Revenue grew from 1,000 to 1,610.51 over 5 years. Write the CAGR.", a: "<code>=(1610.51/1000)^(1/5)-1</code> = <b>10.0%</b>." }
      ] },

    errors: { type: "concept", id: "error-values", title: "Error messages and what they mean", cat: "Concept", icon: "warn",
      does: "When Excel can't calculate a formula it shows an error value instead. Each one tells you what kind of problem it is, and every formula that uses that cell shows the error too.",
      args: [
        { n: "#DIV/0!", means: "Divided by zero or by an empty cell.", eg: "<code>=C6/B6</code> when revenue is 0. Fix: check the denominator, or IF/IFERROR." },
        { n: "#N/A", means: "Not available: a lookup didn't find the value.", eg: "A name spelt differently. Fix: check spelling and spaces, or add an if_not_found." },
        { n: "#NAME?", means: "Excel doesn't recognise a word: a misspelt function, text without quotes, or a function your Excel version doesn't have.", eg: "<code>=SUMM(B4:B9)</code>" },
        { n: "#VALUE!", means: "The wrong type of value: text where a number was needed, or ranges of different sizes.", eg: "<code>=\"abc\"*2</code>" },
        { n: "#REF!", means: "The formula points to a cell that no longer exists, usually after deleting rows or columns.", eg: "" },
        { n: "#NUM!", means: "A number can't be calculated, e.g. square root of a negative, or IRR/RATE couldn't find an answer.", eg: "<code>=SQRT(-1)</code>" },
        { n: "#####", means: "Not an error: the column is too narrow to show the number. Widen it.", eg: "" }
      ],
      examples: [
        { f: "=1/0", why: "Division by zero." },
        { f: "=SUMM(1,2)", why: "Misspelt function name." },
        { f: "=\"abc\"*2", why: "Text can't be multiplied." },
        { f: "=SQRT(-1)", why: "No real square root of a negative number." }
      ],
      how: ["Click the error cell and read its formula.", "Use Formulas → Trace Precedents to see which cells feed it. The first cell in the chain with the error is the one to fix.", "Fix the cause. Use IFERROR only when the error is expected."],
      practice: [
        { q: "A whole column of margins shows #DIV/0! for one company. What's the likely cause and the cleanest fix?", a: "That company's revenue is 0 or blank. Use <code>=IF(B6=0, \"n/a\", C6/B6)</code> or <code>=IFERROR(C6/B6, \"n/a\")</code>, and confirm the zero revenue is real." }
      ] },

    relative: { type: "concept", id: "relative-references", title: "Relative references: how copying works", cat: "Concept", icon: "copy",
      does: "A normal address like <code>B8</code> is a <b>relative reference</b>. Excel remembers it as \"the cell so many rows and columns away from me\". When you copy the formula, it keeps that distance, so the address changes.",
      how: ["C8 holds <code>=B8*(1+C5)</code>. Excel reads it as: the cell one column to my left, times (1 + the cell three rows up in my column).", "Copy C8 to D8. Excel applies the same directions from D8: one column left is C8, three rows up is D5.", "So D8 holds <code>=C8*(1+D5)</code>. Each year uses the previous year and its own growth rate."],
      args: [
        { n: "Copy right", means: "Column letters move by the number of columns moved. Row numbers stay.", eg: "<code>=B8</code> → <code>=C8</code>" },
        { n: "Copy down", means: "Row numbers move by the number of rows moved. Column letters stay.", eg: "<code>=A1+B1</code> → <code>=A2+B2</code>" },
        { n: "Fill handle", means: "The small square at the bottom-right of a selected cell. Drag it to copy.", eg: "" },
        { n: "<kbd>Ctrl</kbd>+<kbd>R</kbd> / <kbd>Ctrl</kbd>+<kbd>D</kbd>", means: "Select the source and the target cells, then fill right or fill down.", eg: "" }
      ],
      examplesTitle: "What the copy becomes",
      examples: [
        { show: "=B8*(1+C5)  copied one column right", out: "=C8*(1+D5)", why: "Every column letter moves one step." },
        { show: "=C8*C6  copied two columns right", out: "=E8*E6", why: "C → E." },
        { show: "=A1+B1  copied three rows down", out: "=A4+B4", why: "Every row number goes up by 3." },
        { show: "=C6*B4  copied one column right", out: "=D6*C4", why: "The tax rate slid to C4 too. That's the problem $ solves (L6)." }
      ],
      uses: ["Writing one formula per row in a forecast and copying it across the years.", "Filling a column of ratios for a list of companies."],
      mistakes: ["Copying a formula that refers to a single input cell without locking it."],
      practice: [
        { q: "D10 holds <code>=C10+D9</code>. You copy it to F12. What's in F12?", a: "Two columns right and two rows down: <code>=E12+F11</code>." }
      ] },

    absolute: { type: "concept", id: "absolute-references", title: "Absolute and mixed references ($)", cat: "Concept", icon: "lockFill",
      does: "A <code>$</code> in an address locks the part that follows it, so it doesn't move when you copy. <code>$B$4</code> never moves. <code>B$4</code> keeps row 4. <code>$B4</code> keeps column B.",
      args: [
        { n: "<code>B4</code> relative", means: "Both parts move.", eg: "Each year's own profit." },
        { n: "<code>$B$4</code> absolute", means: "Nothing moves. One input used by every formula.", eg: "The tax rate." },
        { n: "<code>B$4</code> mixed", means: "Row locked, column moves. For a row of headings across the top.", eg: "Discount rates along row 13." },
        { n: "<code>$B4</code> mixed", means: "Column locked, row moves. For a column of labels down the side.", eg: "Years down column B." },
        { n: "<kbd>F4</kbd>", means: "With the cursor on an address in the formula bar, cycles B4 → $B$4 → B$4 → $B4 → B4. Mac: <kbd>Cmd</kbd>+<kbd>T</kbd>.", eg: "" },
        { n: "Named cell", means: "A name such as TaxRate always points at the same cell, like $D$9, and reads more clearly.", eg: "<code>=-E18*TaxRate</code>" }
      ],
      how: ["Ask of each address in the formula: when I copy right, should this column move? When I copy down, should this row move?", "Put a $ before whatever must not move.", "Copy, then click a far cell (bottom-right) and read its formula to confirm."],
      examplesTitle: "What the copy becomes",
      examples: [
        { show: "=C6*$B$4  copied to E6", out: "=E6*$B$4", why: "Profit moves, the rate stays." },
        { show: "=1/(1+C$13)^$B14  copied to G18", out: "=1/(1+G$13)^$B18", why: "Rate stays on row 13 but follows the column; year stays in column B but follows the row." },
        { show: "=B$4*$A5  copied from B5 to D7", out: "=D$4*$A7", why: "Two columns right and two rows down: B → D on row 4, row 5 → 7 in column A." }
      ],
      uses: ["Tax rates, inflation, exchange rates: one input, many formulas.", "Sensitivity grids and discount-factor tables (one formula fills the grid).", "Lookup tables in XLOOKUP, which must not slide when copied down."],
      mistakes: ["Locking too much: <code>$C$6*$B$4</code> copied right repeats the same year's tax.", "Forgetting $ on a lookup table, so the table slides off the data as you copy down."],
      practice: [
        { q: "A price grid: quantities in A5:A10, prices in B4:F4. Write one formula in B5 for quantity × price that can be copied to the whole grid.", a: "<code>=$A5*B$4</code>. The quantity always comes from column A (lock the column); the price always comes from row 4 (lock the row)." },
        { q: "<code>=C6*$B$4</code> sits in C7. You copy it down to C8 (not right). What's in C8, and is that what you want?", a: "<code>=C7*$B$4</code>: it now multiplies the tax line, not profit. Copying in the wrong direction is a common mistake: copy along the row the formula is meant for." }
      ] },

    forecast: { type: "concept", id: "income-statement", title: "The income statement and how a forecast is built", cat: "Finance concept", icon: "chart",
      does: "The <b>income statement</b> (profit and loss) shows revenue for a period and takes away costs, step by step, to reach net income. A <b>forecast</b> projects each line from a small set of assumptions, so changing one assumption updates every year.",
      args: [
        { n: "Revenue", means: "Sales for the period. Forecast: last year × (1 + growth).", eg: "FY2026E 250,000 × 1.12 = 280,000" },
        { n: "Cost of sales", means: "Direct costs of what was sold. Forecast as a % of revenue.", eg: "−280,000 × 58% = −162,400" },
        { n: "Gross profit", means: "Revenue + cost of sales. Gross margin = gross profit ÷ revenue.", eg: "117,600 (42.0%)" },
        { n: "Operating expenses", means: "Running costs: salaries, rent, marketing. Often % of revenue.", eg: "−280,000 × 22% = −61,600" },
        { n: "Operating profit (EBIT)", means: "Gross profit + operating expenses: profit from the business before financing and tax.", eg: "56,000" },
        { n: "Interest expense", means: "Cost of debt.", eg: "−4,000" },
        { n: "Profit before tax", means: "Operating profit + interest.", eg: "52,000" },
        { n: "Tax", means: "Profit before tax × tax rate (only on a profit).", eg: "−52,000 × 30% = −15,600" },
        { n: "Net income", means: "What's left for shareholders. Net margin = net income ÷ revenue.", eg: "36,400 (13.0%)" }
      ],
      how: ["Put every assumption in the Inputs block in blue: growth, cost %, opex %, interest, tax rate.", "Write each line for the first forecast year only, pointing at the inputs and the line above.", "Lock single inputs ($ or a name), then copy the column across all years.", "Stress test: change one input and check every year moves."],
      uses: ["The core of every three-statement model and DCF (Weeks 5 and 6).", "Budgets and business plans."],
      mistakes: ["Mixing signs: if costs are negative, subtotals are sums; don't then subtract them again.", "Tax on a loss: use IF or MAX(0, …) if losses don't get a tax credit.", "Growth applied to the wrong year (pointing at the same year's revenue instead of last year's)."],
      practice: [
        { q: "In the Mavuno model, set FY2026E growth to 20% and keep everything else. Work out FY2026E revenue, operating profit and net income.", a: "Revenue 250,000 × 1.2 = <b>300,000</b>. Cost of sales −174,000 → gross profit 126,000. Opex −66,000 → operating profit <b>60,000</b>. Interest −4,000 → PBT 56,000. Tax −16,800 → net income <b>39,200</b>." },
        { q: "Why is net margin (13.0%) lower than gross margin (42.0%)?", a: "Gross margin only takes off cost of sales. Net margin also takes off operating expenses, interest and tax." }
      ] },

    logic: { type: "concept", id: "logical-tests", title: "Logical tests: TRUE and FALSE", cat: "Concept", icon: "target",
      does: "A <b>logical test</b> compares two things and answers TRUE or FALSE. Tests are the building blocks of IF, IFS, AND, OR, COUNTIF and SUMIF.",
      args: [
        { n: "<code>=</code>", means: "Equal to. Text comparisons ignore upper/lower case.", eg: "<code>B4=\"Opex\"</code>" },
        { n: "<code>&lt;&gt;</code>", means: "Not equal to.", eg: "<code>C5&lt;&gt;0</code>" },
        { n: "<code>&gt;</code> / <code>&lt;</code>", means: "More than / less than.", eg: "<code>C5&gt;0</code>" },
        { n: "<code>&gt;=</code> / <code>&lt;=</code>", means: "At least / at most.", eg: "<code>D4&gt;=1.2</code>" }
      ],
      sheet: RATIO_SHEET,
      examples: [
        { f: "=C4>0", why: "Amani's net income 310 is more than 0." },
        { f: "=C5>0", why: "Baraka's is −120." },
        { f: "=(C4>0)*C4*30%", fmt: P2, why: "TRUE counts as 1 and FALSE as 0, so this is tax only on a profit without IF." },
        { f: '=A4="amani foods"', why: "Text comparison ignores case." }
      ],
      practice: [
        { q: "Write a test that is TRUE when the current ratio in D6 is between 1 and 2, inclusive.", a: "<code>=AND(D6&gt;=1, D6&lt;=2)</code>. Excel can't read <code>1&lt;=D6&lt;=2</code>." }
      ] },

    lookupTables: { type: "concept", id: "lookup-tables", title: "Setting up a lookup table", cat: "Concept", icon: "search",
      does: "Every lookup (XLOOKUP, INDEX-MATCH, VLOOKUP) needs a table with one column of <b>keys</b>, values that identify each row, and the columns of data to bring back. Most lookup errors are table problems, not formula problems.",
      args: [
        { n: "Unique keys", means: "Each key appears once. With duplicates, the lookup returns the first match and ignores the rest.", eg: "Company codes, account codes" },
        { n: "Same data type", means: "A key typed as text (\"1010\") won't match a number (1010).", eg: "" },
        { n: "Clean text", means: "No extra spaces or different spellings.", eg: "\"Dafina Pharma\" vs \"Dafina Pharma \"" },
        { n: "Exact vs approximate", means: "Exact for names and codes. Approximate (bands) only on a column sorted smallest to largest, starting with the lowest band.", eg: "Commission from 0, 100,000, 250,000…" },
        { n: "Locked ranges", means: "Use $ when the formula is copied down, so the table doesn't slide.", eg: "<code>$J$6:$J$26</code>" }
      ],
      mistakes: ["#N/A on a value you can see in the table: usually a space, a spelling difference, or text vs number.", "A band table that doesn't start at the lowest value: values below the first band return #N/A."],
      practice: [
        { q: "XLOOKUP returns #N/A for account 1010, which you can see in the mapping table. Give two likely causes.", a: "One of the 1010s is stored as text (left-aligned, green triangle), or the range doesn't cover that row. Check with <code>=ISNUMBER(A6)</code> and click the formula to see the range." }
      ] },

    trialBalance: { type: "concept", id: "trial-balance", title: "Trial balance, debits and credits, and mapping", cat: "Finance concept", icon: "book",
      does: "Bookkeeping records every transaction twice: a <b>debit</b> in one account and an equal <b>credit</b> in another (double entry). A <b>trial balance</b> lists every account's balance at a date; total debits must equal total credits. <b>Mapping</b> assigns each account to a line in the financial statements.",
      args: [
        { n: "Debit balances", means: "Assets and expenses normally have debit balances.", eg: "Cash, receivables, inventory, salaries" },
        { n: "Credit balances", means: "Liabilities, equity and income normally have credit balances.", eg: "Payables, loans, share capital, revenue" },
        { n: "Contra accounts", means: "Reduce another account and carry the opposite balance.", eg: "Accumulated depreciation is a credit that reduces property" },
        { n: "Account codes", means: "A chart of accounts groups codes by type. In this example 1xxx assets, 2xxx liabilities, 3xxx equity, 4xxx income, 5xxx–8xxx expenses.", eg: "1010 Cash at bank" },
        { n: "Mapping table", means: "Code → statement (IS or BS) → line. A lookup applies it to every account.", eg: "4010 → IS → Revenue" }
      ],
      how: ["Total debits and total credits; the difference must be 0.", "Look up each account's statement and line in the mapping table.", "Flag and count anything unmapped (COUNTIF).", "Sum by line with SUMIF to build the income statement and balance sheet."],
      examplesTitle: "Mavuno Traders, KES '000",
      examples: [
        { show: "Total debits", out: "437,400", why: "Sum of the debit column." },
        { show: "Total credits", out: "437,400", why: "Equal, so the books balance." },
        { show: "Revenue line (4010)", out: "268,400", why: "A credit balance mapped to IS → Revenue." }
      ],
      uses: ["Preparing statements from a client's accounts.", "Audit and month-end close.", "Feeding historical years into a three-statement model (Week 5)."],
      mistakes: ["A balanced trial balance doesn't prove the books are right: an entry posted to the wrong account still balances.", "Sign: a credit balance shown as a positive number in the Credit column becomes negative when you net debits minus credits."],
      practice: [
        { q: "Map these: 1300 Prepaid insurance, 2200 Accrued wages, 4500 Interest income.", a: "1300 → BS, current assets (it's paid in advance, so the business is owed cover). 2200 → BS, current liabilities (wages owed). 4500 → IS, other income or finance income." },
        { q: "Debits total 437,400 but credits 436,900. What could cause a 500 difference?", a: "A one-sided or wrong entry of 500, or a balance put in the wrong column (a 250 debit shown as a credit gives a 500 difference). Check balances near 500 or 250." }
      ] }
  };

  /* Trial balance (matches the L13 tab) */
  var TB = [[1010, "Cash at bank", 18450, 0], [1100, "Trade receivables", 32600, 0], [1200, "Inventory", 41300, 0], [1260, "Staff advances", 600, 0],
    [1500, "Property and equipment", 118800, 0], [1590, "Accumulated depreciation", 0, 31200], [2010, "Trade payables", 0, 27400], [2060, "Customer deposits", 0, 1500],
    [2500, "Bank loan", 0, 40000], [3010, "Share capital", 0, 50000], [3100, "Retained earnings", 0, 18900], [4010, "Sales revenue", 0, 268400],
    [5010, "Cost of sales", 154300, 0], [6010, "Salaries and wages", 34500, 0], [6130, "Training", 850, 0], [6200, "Other operating expenses", 21800, 0],
    [7010, "Interest expense", 4400, 0], [8010, "Income tax expense", 9800, 0]];
  var MAP = [[1010, "BS", "Cash"], [1100, "BS", "Trade receivables"], [1200, "BS", "Inventory"], [1500, "BS", "Property and equipment"], [1590, "BS", "Property and equipment"],
    [2010, "BS", "Trade payables"], [2500, "BS", "Borrowings"], [3010, "BS", "Share capital"], [3100, "BS", "Retained earnings"], [4010, "IS", "Revenue"],
    [5010, "IS", "Cost of sales"], [6010, "IS", "Operating expenses"], [6200, "IS", "Operating expenses"], [7010, "IS", "Finance costs"], [8010, "IS", "Income tax"]];
  function tbCells() {
    var c = { A5: "Code", B5: "Account", C5: "Debit", D5: "Credit", E5: "Statement", F5: "Line", G5: "Flag", J5: "Code", K5: "Statement", L5: "Line", B24: "Total", B25: "Difference", B26: "Not mapped" };
    TB.forEach(function (t, i) { var r = 6 + i; c["A" + r] = t[0]; c["B" + r] = t[1]; c["C" + r] = t[2]; c["D" + r] = t[3]; });
    MAP.forEach(function (m, i) { var r = 6 + i; c["J" + r] = m[0]; c["K" + r] = m[1]; c["L" + r] = m[2]; });
    c.E6 = '=XLOOKUP(A6,$J$6:$J$26,$K$6:$K$26,"UNMAPPED")';
    c.F6 = '=XLOOKUP(A6,$J$6:$J$26,$L$6:$L$26,"UNMAPPED")';
    c.G6 = '=IF(E6="UNMAPPED","Map this","OK")';
    return c;
  }

  Course.addWeek(1, {
    intro: "Ten small lessons over two sessions. You start with what a cell is and finish by mapping a real-looking trial balance. Each lesson uses only what came before it.",
    duration: "3.5 hours with your tutor + 2.5 hours practice",
    objectives: [
      "Find your way around a workbook with the keyboard",
      "Format numbers the way finance reports do",
      "Write formulas that point at cells, then copy them correctly with <code>$</code>",
      "Use SUM, ROUND, SUMPRODUCT, IF, IFS, AND, OR and IFERROR",
      "Look up values with XLOOKUP and INDEX-MATCH",
      "Build a three-year forecast and map a trial balance"
    ],
    files: [{ name: "Week1_Practice.xlsx", href: "downloads/Week1_Practice.xlsx", ext: "xlsx", note: "Save a copy as Week1_<your name>.xlsx and work in that copy" }],
    slots: [
      { label: "Session 1 + 2", length: "2 hours", items: [
        { t: "0:00", lesson: "w1-start", note: "Agree how we'll work, check your Excel" },
        { t: "0:10", lesson: "w1-l1" }, { t: "0:22", lesson: "w1-l2" }, { t: "0:37", lesson: "w1-l3" },
        { t: "0:45", title: "Break", note: "5 minutes away from the screen" },
        { t: "0:50", lesson: "w1-l4" }, { t: "1:02", lesson: "w1-l5" }, { t: "1:14", lesson: "w1-l6" }, { t: "1:34", lesson: "w1-l7" }, { t: "1:46", lesson: "w1-l8", note: "Finish at home if we run short" }
      ] },
      { label: "Session 3", length: "1.5 hours", items: [
        { t: "0:00", title: "Warm-up", note: "Rebuild one discount factor from memory" },
        { t: "0:05", lesson: "w1-l9" }, { t: "0:20", lesson: "w1-l10" }, { t: "0:40", title: "Stretch", note: "3 minutes" },
        { t: "0:43", lesson: "w1-l11" }, { t: "0:55", lesson: "w1-l12" }, { t: "1:08", lesson: "w1-l13" }, { t: "1:25", lesson: "w1-homework", note: "What's due next Wednesday" }
      ] }
    ],
    functions: [
      { name: "SUM", does: "Adds numbers", syntax: "=SUM(B5:B16)", lesson: "w1-l7" },
      { name: "AVERAGE", does: "The mean of the numbers", syntax: "=AVERAGE(B5:B16)", lesson: "w1-l7" },
      { name: "MIN", does: "The smallest number", syntax: "=MIN(B5:B16)", lesson: "w1-l7" },
      { name: "MAX", does: "The largest number", syntax: "=MAX(B5:B16)", lesson: "w1-l7" },
      { name: "COUNT", does: "How many cells hold numbers", syntax: "=COUNT(B5:B16)", lesson: "w1-l7" },
      { name: "ROUND", does: "Rounds to a number of decimals; −2 rounds to hundreds", syntax: "=ROUND(number, digits)", lesson: "w1-l7" },
      { name: "SUMPRODUCT", does: "Multiplies pairs of cells, then adds the results", syntax: "=SUMPRODUCT(units, prices)", lesson: "w1-l7" },
      { name: "IF", does: "One test, two outcomes", syntax: '=IF(test, "if TRUE", "if FALSE")', lesson: "w1-l9" },
      { name: "IFS", does: "Several tests in order; the first TRUE wins", syntax: '=IFS(test1, result1, test2, result2, TRUE, "else")', lesson: "w1-l10" },
      { name: "AND", does: "TRUE only if every test is TRUE", syntax: "=AND(test1, test2)", lesson: "w1-l10" },
      { name: "OR", does: "TRUE if any test is TRUE", syntax: "=OR(test1, test2)", lesson: "w1-l10" },
      { name: "IFERROR", does: "Shows something else instead of an error", syntax: '=IFERROR(formula, "n/a")', lesson: "w1-l10" },
      { name: "XLOOKUP", does: "Find a value in one list, bring back the matching value from another", syntax: '=XLOOKUP(find, in here, bring back, "not found")', lesson: "w1-l11" },
      { name: "MATCH", does: "The position of a value in a list", syntax: "=MATCH(find, list, 0)", lesson: "w1-l12" },
      { name: "INDEX", does: "The value at a position in a list", syntax: "=INDEX(list, position)", lesson: "w1-l12" },
      { name: "VLOOKUP", does: "Older lookup that only looks right of the first column", syntax: "=VLOOKUP(find, table, column number, FALSE)", lesson: "w1-l12" },
      { name: "COUNTIF", does: "Counts cells that meet a condition", syntax: '=COUNTIF(range, "UNMAPPED")', lesson: "w1-l13" }
    ],
    groups: [
      /* ============================================================ START */
      { title: "Before you start", session: 0, lessons: [
        { id: "w1-start", num: "", title: "Start here", time: "5 min", type: "Lesson",
          lede: "How the lessons work, what we'll do today, and a 30-second check that your Excel is ready.",
          keywords: "setup version download workbook how to",
          blocks: [
            { type: "h", text: "How every lesson works" },
            { type: "list", ordered: true, items: [
              "<b>Read the idea.</b> One sentence at the top says what you're learning.",
              "<b>See an example.</b> Grey boxes show a worked example. Click any cell to see its formula.",
              "<b>Try it here.</b> Type in the <span style=\"background:var(--cell-yours);padding:0 4px;border-radius:3px\">yellow</span> cells, press Enter, then <b>Check Answer</b>.",
              "<b>Do it in Excel.</b> The same task is on the workbook tab named at the top of each lesson.",
              "<b>Test yourself.</b> A short quiz. When every activity is done, the lesson ticks itself off."
            ] },
            { type: "callout", kind: "tip", html: "Lost? The sidebar always shows where you are, and <b>Next</b> takes you to the following lesson. Your progress is saved in this browser, so use the same one each time." },
            { type: "h", text: "Today's plan" },
            { type: "timeline" },
            { type: "h", text: "Get the workbook" },
            { type: "files", items: [{ name: "Week1_Practice.xlsx", href: "downloads/Week1_Practice.xlsx", ext: "xlsx", note: "One tab per lesson (L1 to L13), plus homework" }] },
            { type: "steps", id: "w1-setup", title: "Check your Excel is ready", items: [
              { html: "Open Excel and a blank workbook." },
              { html: "Click any cell, type this and press Enter:", code: '=XLOOKUP("a","a","yes")' },
              { html: "If the cell shows <b>yes</b>, you're ready. If it shows <code>#NAME?</code>, your Excel is older than 2021: use INDEX-MATCH (Lesson 12) wherever a lesson uses XLOOKUP, and nested IF instead of IFS." },
              { html: "Open <b>Week1_Practice.xlsx</b> and save a copy as <b>Week1_&lt;your name&gt;.xlsx</b>. Work in your copy." }
            ] }
          ] }
      ] },

      /* ============================================================ SESSION 1 */
      { title: "Getting around", session: 1, sub: "Session 1, about 45 minutes", lessons: [
        { id: "w1-l1", num: "L1", title: "Cells, ranges and shortcuts", time: "20 min", sheet: "L1 Cells",
          lede: "Before any formula, you need to name a cell, select a block of cells, and move quickly.",
          keyIdea: "Every cell has an address: its column letter, then its row number. <code>B5</code> is column B, row 5.",
          objectives: ["Name any cell or range by its address", "Tell what a cell <i>shows</i> from what it <i>holds</i>", "Move and select with six shortcuts"],
          keywords: "address range formula bar shortcut ctrl arrow status bar",
          blocks: [
            { type: "h", text: "Cells and ranges" },
            { type: "p", html: "Columns are letters across the top. Rows are numbers down the side. A cell's address is the two together: <code>B5</code>. A <b>range</b> is a block of cells, written as the first cell, a colon, then the last cell: <code>B6:B17</code> means every cell from B6 down to B17." },
            { type: "example", title: "Example: what a cell shows vs what it holds", html: "Click <b>B18</b>. The cell <i>shows</i> 272,590, but the formula bar shows what it <i>holds</i>: <code>=SUM(B6:B17)</code>. Always read the formula bar.",
              sheet: { cols: "A:B", rows: [5, 18], start: "B18", cells: merge(salesCells(6, true), { A18: "Total", B18: "=SUM(B6:B17)" }), formats: { "B6:B18": NUM }, styles: { head: ["A5:B5"], input: ["B6:B17"], bold: ["A18:B18"], total: ["A18:B18"] } } },
            CONCEPTS.cells, CONCEPTS.values,
            { type: "h", text: "Six shortcuts to start with" },
            { type: "p", html: "You don't need all of them today. Learn the first two now; the rest come up in later lessons." },
            { type: "widget", name: "shortcuts", title: "Getting around", only: ["jump", "select", "home", "sheet", "edit", "format"] },
            { type: "steps", id: "w1-l1-steps", title: "Follow along in Excel", sheet: "L1 Cells", items: [
              { html: "Click <b>A6</b>, press <kbd>Ctrl</kbd>+<kbd>↓</kbd>. Type the cell you land on into <b>B22</b>." },
              { html: "Click <b>A6</b>, press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>↓</kbd>, then <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>→</kbd>. Read <b>Count</b> in the status bar at the bottom and type it into <b>B23</b>." },
              { html: "Click <b>B18</b>. Which function does the formula bar show? Type it into <b>B24</b>." },
              { html: "Press <kbd>F2</kbd> on B18 (Mac: <kbd>Ctrl</kbd>+<kbd>U</kbd>). Type the range it adds up into <b>B25</b>, then press Esc." },
              { html: "Press <kbd>Ctrl</kbd>+<kbd>PgDn</kbd> to visit the next tab, and <kbd>Ctrl</kbd>+<kbd>PgUp</kbd> to come back. Every Check cell should say ✓ Correct." }
            ] },
            { type: "quiz", id: "w1-l1-quiz", questions: [
              { q: "What is the address of the cell in column C, row 7?", options: ["7C", "C7", "C:7"], answer: 1, why: "Column letter first, then row number." },
              { q: "What does <code>B6:B17</code> mean?", options: ["Only cells B6 and B17", "Every cell from B6 down to B17", "Columns B to 17"], answer: 1, why: "A colon joins the first and last cell of a block." },
              { q: "A cell shows 272,590. Where do you see how it was calculated?", options: ["The formula bar", "The status bar", "The tab name"], answer: 0, why: "The formula bar shows what the cell really holds." },
              { q: "Which shortcut jumps to the end of a block of data?", options: ["Ctrl + arrow key", "Shift + arrow key", "Alt + arrow key"], answer: 0, why: "Ctrl + arrow jumps. Add Shift to select as you jump." }
            ] }
          ] },

        { id: "w1-l2", num: "L2", title: "Number formats", time: "25 min", sheet: "L2 Formats",
          lede: "Finance readers expect 1,234,568 and (45,230), not 1234567.891 and -45230. Formats do that without changing the numbers.",
          keyIdea: "A format changes how a number <i>looks</i>, never the number itself.",
          objectives: ["Open Format Cells with <kbd>Ctrl</kbd>+<kbd>1</kbd>", "Build a format code one part at a time", "Show percentages and multiples correctly"],
          keywords: "format custom code thousands brackets negative percent multiple ctrl 1",
          blocks: [
            { type: "h", text: "Build a code one part at a time" },
            { type: "p", html: "Press <kbd>Ctrl</kbd>+<kbd>1</kbd> (Mac: <kbd>Cmd</kbd>+<kbd>1</kbd>), choose <b>Custom</b>, and type a code. A code can have up to three parts, separated by semicolons:" },
            { type: "key", label: "Format code", html: "positive <b>;</b> negative <b>;</b> zero" },
            { type: "table", head: ["Step", "Code", "−45230 shows", "0 shows"], num: [2, 3], rows: [
              ["1. Add thousands separators", "<code>#,##0</code>", "-45,230", "0"],
              ["2. Add a negative part in brackets", "<code>#,##0;(#,##0)</code>", "(45,230)", "0"],
              ["3. Add a zero part: a dash", "<code>#,##0;(#,##0);\"-\"</code>", "(45,230)", "-"]
            ] },
            { type: "p", html: "In a code, <code>#</code> is an optional digit, <code>0</code> is a digit that always shows, and the comma adds thousands separators. Text in quotes is shown as it is." },
            { type: "widget", name: "formats", title: "Format playground", value: "-45230", code: "#,##0;(#,##0)" },
            { type: "h", text: "Percentages and multiples" },
            { type: "table", head: ["Code", "Value", "Shows", "Why"], num: [1, 2], rows: [
              ["<code>0.0%</code>", "0.4123", "41.2%", "Multiplies by 100 and adds %"],
              ["<code>0.0%;(0.0%)</code>", "−0.0375", "(3.8%)", "Same two-part idea as above"],
              ["<code>0.0\"x\"</code>", "8.456", "8.5x", "The x is text, so it's in quotes"],
              ["<code>#,##0.00</code>", "17.5", "17.50", "Two decimals for share prices"]
            ] },
            { type: "callout", kind: "warning", html: "Type percentages as <b>12%</b> or <b>0.12</b>. Typing <b>12</b> into a percentage cell shows 1200.0%." },
            CONCEPTS.formats,
            { type: "steps", id: "w1-l2-steps", title: "Follow along in Excel", sheet: "L2 Formats", items: [
              { html: "Select <b>C6</b> and press <kbd>Ctrl</kbd>+<kbd>1</kbd>. Choose <b>Custom</b>." },
              { html: "In the <b>Type</b> box, type the code from column E and press OK.", code: "#,##0" },
              { html: "Compare C6 with column D. Do the same for rows 7 to 12, one code each." },
              { html: "In rows 16 to 19 there's no code. Work out which one fits, apply it, and write it in column E." }
            ] },
            { type: "quiz", id: "w1-l2-quiz", questions: [
              { kind: "fill", q: "Complete the code so negatives show in brackets:", before: "#,##0;", answers: ["(#,##0)"], why: "The second part is for negatives. Wrap it in brackets." },
              { q: "You type 12 into a cell formatted <code>0.0%</code>. What does it show?", options: ["12.0%", "1200.0%", "0.1%"], answer: 1, why: "Excel stores 12 and shows it × 100. Type 12% instead." },
              { q: "In <code>#,##0;(#,##0);\"-\"</code>, what does the third part control?", options: ["Negative numbers", "Zero", "Text"], answer: 1, why: "Positive ; negative ; zero." },
              { q: "Formatting 1,234.56 as <code>#,##0</code> changes the stored value to 1,235.", options: ["True", "False"], answer: 1, why: "Formats change only how it looks. The cell still holds 1,234.56." }
            ] }
          ] },

        { id: "w1-l3", num: "L3", title: "Model layout and the colour code", time: "15 min", sheet: "L3 Layout",
          lede: "Models are easier to check when everyone lays them out the same way. Two habits do most of the work.",
          keyIdea: "Blue text for numbers you typed, black for formulas, green for links to other tabs.",
          objectives: ["Separate inputs, calculations and outputs", "Colour a cell by what's inside it", "Set up a timeline that runs left to right"],
          keywords: "layout inputs outputs calculations blue black green colour timeline",
          blocks: [
            { type: "h", text: "Three areas in every model" },
            { type: "table", head: ["Area", "What goes there", "Example"], rows: [
              ["<b>Inputs</b>", "Numbers you choose or copy from reports", "Growth rate 12%, last year's revenue"],
              ["<b>Calculations</b>", "Formulas that use the inputs", "Revenue = last year × (1 + growth)"],
              ["<b>Outputs</b>", "What the reader looks at", "Net income, margins, a chart"]
            ] },
            { type: "p", html: "Time runs <b>left to right</b>, one column per year: actual years first (FY2025A), then estimates (FY2026E)." },
            { type: "callout", kind: "finance", html: "Analysts open hundreds of models. The colour code tells them in a second what they may change (blue) and what they must never type over (black and green)." },
            CONCEPTS.layout,
            { type: "widget", name: "colours", id: "w1-l3-colours", title: "Which colour should each cell be?", intro: "Ask: was it typed in, calculated here, or pulled from another tab?", items: [
              { cell: "12%", note: "A growth rate you chose", answer: "Blue" },
              { cell: "=C5*(1+D4)", note: "Calculated on this tab", answer: "Black" },
              { cell: "='L8 Forecast'!E20", note: "Net income from another tab", answer: "Green" },
              { cell: "250,000", note: "Last year's actual revenue, typed in", answer: "Blue" },
              { cell: "=SUM(C6:C9)", note: "A total", answer: "Black" },
              { cell: "=Inputs!B3", note: "A rate kept on an Inputs tab", answer: "Green" }
            ] },
            { type: "steps", id: "w1-l3-steps", title: "Follow along in Excel", sheet: "L3 Layout", items: [
              { html: "Type <b>Blue</b>, <b>Black</b> or <b>Green</b> in B6 to B11. The Check column turns green when you're right." },
              { html: "Type the company name in B14 and the units in B15: <b>Mavuno Traders Ltd</b>, <b>KES '000</b>." },
              { html: "In B17 to G17, type the years: FY2023A, FY2024A, FY2025A, FY2026E, FY2027E, FY2028E." }
            ] }
          ] }
      ] },

      /* ============================================================ SESSION 2 */
      { title: "Formulas", session: 2, sub: "Session 2, about 75 minutes", lessons: [
        { id: "w1-l4", num: "L4", title: "Your first formulas", time: "25 min", sheet: "L4 Formulas",
          lede: "A formula is a calculation that Excel keeps up to date. Point it at cells, and it recalculates whenever an input changes.",
          keyIdea: "A formula starts with <code>=</code> and points at cells instead of typing numbers.",
          objectives: ["Add, subtract, multiply and divide with cell addresses", "Know why we never type numbers inside a formula", "Know the order Excel calculates in"],
          keywords: "formula equals add subtract multiply divide bodmas order of operations",
          blocks: [
            { type: "h", text: "Five signs" },
            { type: "table", head: ["Sign", "Means", "Example"], rows: [
              ["<code>+</code>", "Add", "<code>=B11+B5</code>"], ["<code>-</code>", "Subtract", "<code>=B5-B6</code>"], ["<code>*</code>", "Multiply", "<code>=B5*B8</code>"],
              ["<code>/</code>", "Divide", "<code>=B11/B5</code>"], ["<code>^</code>", "Power", "<code>=2^3</code> gives 8"]
            ] },
            { type: "p", html: "To write one: click the cell, type <code>=</code>, then <b>click</b> the cells you need instead of typing their addresses. Press Enter." },
            { type: "example", title: "Example: gross profit", html: "Gross profit is revenue minus cost of sales. Click B11 to see the formula.", code: "=B5-B6", tryIt: "w1-l4-try",
              sheet: { cols: "A:B", rows: [4, 11], start: "B11", cells: { A4: "Inputs, KES '000", A5: "Revenue", B5: 250000, A6: "Cost of sales", B6: 145000, A7: "Operating expenses", B7: 55000, A8: "Revenue growth next year", B8: 0.12, A11: "Gross profit", B11: "=B5-B6" }, formats: { "B5:B7": NUM, B8: PCT, B11: NUM }, styles: { input: ["B5:B8"], head: ["A4"], bold: ["A11:B11"] } } },
            { type: "callout", kind: "warning", title: "Never type a number inside a formula", html: "<code>=B5*1.12</code> hides the 12% growth. If the rate changes, you have to hunt for it. <code>=B5*(1+B8)</code> points at the input, so changing B8 updates everything." },
            { type: "h", text: "Which part first?" },
            { type: "p", html: "Excel follows the order you learnt at school: <b>brackets</b>, then <b>powers</b>, then <b>× and ÷</b>, then <b>+ and −</b>. So <code>=2+3*4</code> is 14, and <code>=(2+3)*4</code> is 20." },
            CONCEPTS.formulas, CONCEPTS.errors,
            { type: "sheet", id: "w1-l4-try", title: "Try it: your first formulas", cols: "A:B", rows: [4, 19], start: "B15",
              intro: "Same layout as the L4 tab. Type each formula in the yellow cell and press Enter.",
              tasks: ["B15: operating profit = gross profit − operating expenses", "B16: gross margin = gross profit ÷ revenue", "B17: next year's revenue = revenue × (1 + growth)", "B18 and B19: type <code>=2+3*4</code> and <code>=(2+3)*4</code>"],
              cells: { A4: "Inputs, KES '000", A5: "Revenue", B5: 250000, A6: "Cost of sales", B6: 145000, A7: "Operating expenses", B7: 55000, A8: "Revenue growth next year", B8: 0.12,
                A10: "Worked example", A11: "Gross profit", B11: "=B5-B6", A13: "Your turn", A15: "1. Operating profit", A16: "2. Gross margin", A17: "3. Next year's revenue", A18: "4. =2+3*4", A19: "5. =(2+3)*4" },
              formats: { "B5:B7": NUM, B8: PCT, B11: NUM, B15: NUM, B16: PCT, B17: NUM },
              styles: { input: ["B5:B8"], head: ["A4", "A10", "A13"], label: ["A15:A19"] },
              editable: ["B15:B19"],
              solution: { B15: "=B11-B7", B16: "=B11/B5", B17: "=B5*(1+B8)", B18: "=2+3*4", B19: "=(2+3)*4" },
              explain: {"B15": "Operating profit = gross profit (B11) − operating expenses (B7) = 105,000 − 55,000 = 50,000.", "B16": "Gross margin = gross profit ÷ revenue = 105,000 ÷ 250,000 = 42.0%. Format the cell as %.", "B17": "Next year's revenue = revenue × (1 + growth). The brackets make Excel add 1 + 12% first: 250,000 × 1.12 = 280,000.", "B18": "Multiplication before addition: 3 × 4 = 12, then + 2 = 14.", "B19": "Brackets first: 2 + 3 = 5, then × 4 = 20."},
              check: { cells: ["B15:B19"], success: "All five are right. Try changing B8 to 20%: B17 updates by itself. That's why we point at cells." },
              hints: ["Operating profit uses the gross profit you already have in B11. Start with <code>=B11</code>, then subtract operating expenses.", "Margin is a share of revenue: something ÷ revenue (B5). Then format as %.", "For next year's revenue, add 1 to the growth rate in brackets first: <code>(1+B8)</code>."] },
            { type: "quiz", id: "w1-l4-quiz", questions: [
              { q: "What does <code>=2+3*4</code> give?", options: ["20", "14", "24"], answer: 1, why: "Multiply first (3×4 = 12), then add 2." },
              { kind: "fill", q: "Finish the formula for next year's revenue:", before: "=B5*(1+", after: ")", answers: ["B8", "$B$8"], why: "Point at the growth rate in B8, don't type 12%." },
              { q: "Why is <code>=B5*(1+B8)</code> better than <code>=B5*1.12</code>?", options: ["It's shorter", "It updates when the growth rate changes", "Excel can't read 1.12"], answer: 1, why: "The input lives in one visible cell. Change it once and every formula follows." }
            ] }
          ] },

        { id: "w1-l5", num: "L5", title: "Copying formulas", time: "20 min", sheet: "L5 Copying",
          lede: "Forecasts repeat the same calculation every year. You write it once and copy it.",
          keyIdea: "When you copy a formula, Excel moves its addresses by the same distance you moved it.",
          objectives: ["Copy a formula with the fill handle or <kbd>Ctrl</kbd>+<kbd>R</kbd>", "Read how the addresses moved", "Build a forecast row from one formula"],
          keywords: "copy fill handle relative reference ctrl r ctrl d",
          blocks: [
            { type: "h", text: "What Excel does when you copy" },
            { type: "p", html: "C8 holds this year's revenue: last year × (1 + this year's growth). Copy it one column right and Excel moves every address one column right too:" },
            { type: "table", head: ["Cell", "Formula", "Reads as"], rows: [
              ["C8", "<code>=B8*(1+C5)</code>", "FY2025A revenue × (1 + FY2026E growth)"],
              ["D8", "<code>=C8*(1+D5)</code>", "FY2026E revenue × (1 + FY2027E growth)"],
              ["E8", "<code>=D8*(1+E5)</code>", "FY2027E revenue × (1 + FY2028E growth)"]
            ] },
            { type: "p", html: "That's exactly what we want: each year uses the year before it and its own growth rate. Addresses that move like this are called <b>relative references</b>." },
            { type: "h", text: "Two ways to copy" },
            { type: "list", items: ["Drag the <b>fill handle</b>: the small square at the bottom-right corner of the selected cell.", "Select the cell and the cells to fill, e.g. C8:E8, and press <kbd>Ctrl</kbd>+<kbd>R</kbd> (fill right) or <kbd>Ctrl</kbd>+<kbd>D</kbd> (fill down)."] },
            CONCEPTS.relative,
            { type: "sheet", id: "w1-l5-try", title: "Try it: a forecast row", cols: "A:E", rows: [4, 9], start: "C9",
              intro: "Revenue in C8 is done for you. Write cost of sales in C9, then copy both rows to FY2028E.",
              tasks: ["C9: cost of sales = revenue × cost % (C8 × C6)", "Press <b>Copy C8:C9 to E</b>, then click D8 to see how the formula moved"],
              cells: { A4: "KES '000", B4: "FY2025A", C4: "FY2026E", D4: "FY2027E", E4: "FY2028E", A5: "Revenue growth", C5: 0.12, D5: 0.10, E5: 0.08, A6: "Cost of sales %", C6: 0.58, D6: 0.58, E6: 0.58, A8: "Revenue", B8: 250000, C8: "=B8*(1+C5)", A9: "Cost of sales" },
              formats: { "C5:E6": PCT, "B8:E9": NUM }, styles: { head: ["A4:E4"], input: ["C5:E6", "B8"], bold: ["A8", "A9"] },
              editable: ["C9"], fill: { from: "C8:C9", to: "C8:E9", label: "Copy C8:C9 to E" },
              solution: { C9: "=C8*C6" },
              explain: {"C9": "Cost of sales = revenue × cost % = 280,000 × 58% = 162,400. Both addresses are relative, so they should move when copied.", "fill": "D9 becomes =D8*D6 and E9 becomes =E8*E6: each year uses its own revenue and cost %.", "result": "FY2028E: revenue 332,640, cost of sales 192,931."},
              check: { cells: ["C9", "D8:E9"], success: "FY2028E revenue is 332,640 and cost of sales 192,931. One formula per row, copied: that's how every forecast is built." },
              hints: ["Cost of sales is revenue (C8) times the cost percentage (C6).", "After C9 is right, press the Copy button. Then click D9: it should read <code>=D8*D6</code>."] },
            { type: "quiz", id: "w1-l5-quiz", questions: [
              { q: "C8 holds <code>=B8*(1+C5)</code>. You copy it to D8. What does D8 hold?", options: ["<code>=B8*(1+C5)</code>", "<code>=C8*(1+D5)</code>", "<code>=C9*(1+D6)</code>"], answer: 1, why: "One column right, so every column letter moves one step: B→C, C→D." },
              { q: "You copy <code>=A1+B1</code> from C1 down to C2. What's in C2?", options: ["<code>=A2+B2</code>", "<code>=A1+B1</code>", "<code>=B1+C1</code>"], answer: 0, why: "One row down, so every row number goes up by one." }
            ] }
          ] },

        { id: "w1-l6", num: "L6", title: "Locking references with $", time: "30 min", sheet: "L6 Locking",
          lede: "Sometimes an address must <i>not</i> move when you copy, like a single tax rate used by every year. A $ sign locks it.",
          keyIdea: "A <code>$</code> stops that part of the address moving when you copy. Press <kbd>F4</kbd> to add it.",
          objectives: ["See why some copies break", "Lock a whole address: <code>$B$4</code>", "Lock only the row or column to fill a grid with one formula"],
          keywords: "absolute mixed reference dollar f4 lock discount factor",
          blocks: [
            { type: "h", text: "When moving is wrong" },
            { type: "p", html: "Tax = profit before tax × tax rate. There's one tax rate, in B4, for every year. If you write <code>=C6*B4</code> and copy it right, D7 becomes <code>=D6*C4</code>: the rate slid to C4, an empty cell, so the tax shows 0." },
            { type: "p", html: "Fix it by locking the rate: <code>=C6*$B$4</code>. A <code>$</code> before the letter locks the column; a <code>$</code> before the number locks the row." },
            { type: "sheet", id: "w1-l6-tax", title: "Try it: one tax rate for every year", cols: "A:E", rows: [4, 7], start: "C7",
              intro: "First try <code>=C6*B4</code> and press Copy to see it break. Then fix C7 with <kbd>F4</kbd> and copy again.",
              cells: { A4: "Tax rate", B4: 0.30, A5: "KES '000", C5: "FY2026E", D5: "FY2027E", E5: "FY2028E", A6: "Profit before tax", C6: 40000, D6: 44000, E6: 48400, A7: "Tax" },
              formats: { B4: PCT, "C6:E7": NUM }, styles: { input: ["B4", "C6:E6"], head: ["A5:E5"], bold: ["A7"] },
              editable: ["C7"], fill: { from: "C7", to: "C7:E7", label: "Copy C7 to E7" },
              solution: { C7: "=C6*$B$4" },
              explain: {"C7": "Profit (C6, moves with the year) × the one tax rate ($B$4, locked). 40,000 × 30% = 12,000.", "fill": "D7 = D6*$B$4 = 13,200 and E7 = E6*$B$4 = 14,520. Without the $, D7 would read C4, an empty cell, and show 0."},
              check: { cells: ["C7:E7"], success: "Tax is 12,000, 13,200 and 14,520. The $ signs kept every year pointing at B4.", why: { D7: "D7 is pointing at C4, which is empty. Lock the rate: click on B4 inside the formula and press F4 to get $B$4." } },
              hints: ["Click C7 after copying is wrong? Look at D7: which cell does it use for the rate?", "In the formula bar, put the cursor on <code>B4</code> and press <kbd>F4</kbd> (or the <b>$ F4</b> button). It becomes <code>$B$4</code>."] },
            { type: "h", text: "The four kinds of address" },
            { type: "table", head: ["You write", "Copied down", "Copied right", "Use it when"], rows: [
              ["<code>B4</code>", "row moves", "column moves", "Each row/column needs its own cell (L5)"],
              ["<code>$B$4</code>", "fixed", "fixed", "One input used everywhere: a tax rate"],
              ["<code>B$4</code>", "fixed", "column moves", "A header row: rates across the top"],
              ["<code>$B4</code>", "row moves", "fixed", "A side column: years down the left"]
            ] },
            { type: "p", html: "Press <kbd>F4</kbd> repeatedly to cycle: <code>B4</code> → <code>$B$4</code> → <code>B$4</code> → <code>$B4</code> → back to <code>B4</code>." },
            CONCEPTS.absolute,
            { type: "h", text: "One formula, a whole grid" },
            { type: "callout", kind: "finance", html: "A <b>discount factor</b> says what KES 1 received in a future year is worth today: <code>1 / (1 + rate) ^ year</code>. At 9%, KES 1 in five years is worth about KES 0.65 today. You'll use these for NPV in Week 2." },
            { type: "p", html: "The rates run along row 13 and the years down column B. Every cell needs <i>its</i> rate from row 13 and <i>its</i> year from column B. So lock the row of the rate (<code>C$13</code>) and the column of the year (<code>$B14</code>)." },
            { type: "sheet", id: "w1-l6-grid", title: "Try it: break it, then fix it", cols: "B:G", rows: [13, 18], start: "C14",
              intro: "C14 already holds a formula with <b>no</b> $ signs. Press <b>Copy C14 to the grid</b> and look at the numbers. Then fix C14 and copy again.",
              tasks: ["Copy the formula as it is. Click D15: which cells does it use now?", "Fix C14 so the rate stays on row 13 and the year stays in column B", "Copy again and check"],
              cells: merge({ B13: "Year \\ Rate", C13: 0.05, D13: 0.06, E13: 0.07, F13: 0.08, G13: 0.09, B14: 1, B15: 2, B16: 3, B17: 4, B18: 5 }, { C14: "=1/(1+C13)^B14" }),
              formats: { "C13:G13": "0%", "C14:G18": DF }, styles: { head: ["B13:G13", "B14:B18"], input: ["C13:G13", "B14:B18"] },
              editable: ["C14"], fill: { from: "C14", to: "C14:G18", label: "Copy C14 to the grid" },
              solution: { C14: "=1/(1+C$13)^$B14" },
              explain: {"C14": "1 ÷ (1 + rate)^year. C$13: the rate always comes from row 13 but follows the column. $B14: the year always comes from column B but follows the row. 1 ÷ 1.05¹ = 0.9524.", "fill": "G18 becomes =1/(1+G$13)^$B18 = 1 ÷ 1.09⁵ = 0.6499."},
              check: { cells: ["C14:G18"], success: "All 25 discount factors are right. C$13 always reads the rate row, $B14 always reads the year column. One formula, one grid." },
              hints: ["After copying the unlocked formula, click D15. It points at D14 and C15: the rate and the year both slid.", "The rate must always come from row 13. Lock the row: <code>C$13</code>.", "The year must always come from column B. Lock the column: <code>$B14</code>."] },
            { type: "quiz", id: "w1-l6-quiz", questions: [
              { q: "You press F4 once with the cursor on <code>B4</code>. What do you get?", options: ["<code>$B$4</code>", "<code>B$4</code>", "<code>$B4</code>"], answer: 0, why: "The first press locks both. Keep pressing to cycle." },
              { kind: "fill", q: "Lock only the row of the rate:", before: "=1/(1+C", after: "13)^$B14", answers: ["$"], why: "A $ before the row number locks the row." },
              { q: "Which address stays in column A but moves down the rows when copied?", options: ["<code>A$1</code>", "<code>$A1</code>", "<code>$A$1</code>"], answer: 1, why: "The $ sits in front of the A, so only the column is locked." },
              { q: "Copying <code>=C6*B4</code> one column right gives…", options: ["<code>=D6*C4</code>", "<code>=D6*B4</code>", "<code>=C6*B4</code>"], answer: 0, why: "Both addresses move one column. That's why the rate needs $B$4." }
            ] }
          ] },

        { id: "w1-l7", num: "L7", title: "Functions", time: "35 min", sheet: "L7 Functions",
          lede: "Adding twelve months by hand is slow and easy to get wrong. Functions do common calculations on a whole range at once.",
          keyIdea: "A function is a ready-made formula: <code>=NAME(range)</code>.",
          objectives: ["Read any function: its name, its arguments, and which ones are optional", "Total, average, count, and find the smallest and largest", "Round a result, and know when not to", "Multiply pairs and add them with SUMPRODUCT, including a weighted average"],
          keywords: "sum average min max round count sumproduct function",
          blocks: [
            { type: "h", text: "Six functions" },
            { type: "table", head: ["Function", "Does", "Pattern"], rows: [
              ["<code>SUM</code>", "Adds", "<code>=SUM(B5:B16)</code>"], ["<code>AVERAGE</code>", "The mean", "<code>=AVERAGE(B5:B16)</code>"], ["<code>MIN</code> / <code>MAX</code>", "Smallest / largest", "<code>=MAX(B5:B16)</code>"],
              ["<code>COUNT</code>", "How many numbers", "<code>=COUNT(B5:B16)</code>"], ["<code>ROUND</code>", "Rounds; −2 means to the nearest hundred", "<code>=ROUND(number, -2)</code>"], ["<code>SUMPRODUCT</code>", "Multiplies pairs, then adds", "<code>=SUMPRODUCT(units, prices)</code>"]
            ] },
            { type: "callout", kind: "tip", html: "While typing a function, select the range by dragging, or click the first cell and press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>↓</kbd>. Then type <code>)</code> and press Enter." },
            { type: "p", html: "<b>ROUND vs formats:</b> a format only changes the look. ROUND changes the stored number. Use formats for presentation; use ROUND only when the rounded number itself matters." },
            { type: "h", text: "How to read any function" },
            { type: "p", html: "Every function has the same shape: <code>=NAME(argument1, argument2, …)</code>. The <b>name</b> says what it does. The <b>arguments</b> are the inputs it needs, inside brackets and separated by commas. Learn to read the parts and you can use a function you've never seen before." },
            { type: "table", head: ["Part", "What it is", "In <code>=ROUND(AVERAGE(B4:B9), -2)</code>"], rows: [
              ["Name", "The function, in capitals (Excel capitalises it for you).", "<code>ROUND</code>"],
              ["Brackets", "Hold the arguments. Every opening bracket needs a closing one.", "<code>( … )</code>"],
              ["Argument", "One input. It can be a number, a cell, a range, text in quotes, or another formula.", "<code>AVERAGE(B4:B9)</code> and <code>-2</code>"],
              ["Comma", "Separates arguments. (Some European settings use a semicolon.)", "between the two arguments"],
              ["[Optional]", "In Excel's help and in these notes, square brackets mark an argument you may leave out. Excel then uses a default.", "ROUND has none; SUM's <code>[number2]</code> is optional"],
              ["Nesting", "A function used as an argument of another. Excel works from the inside out.", "AVERAGE runs first, then ROUND"]
            ] },
            { type: "callout", kind: "tip", title: "Let Excel tell you the arguments", html: "Type <code>=XLOOKUP(</code> and pause: a tooltip shows every argument, with the one you're on in bold. Click the function name in the tooltip for help. Or press <kbd>Shift</kbd>+<kbd>F3</kbd> (the <b>fx</b> button) for a form that explains each argument and shows the result before you press OK." },
            { type: "h", text: "The functions in detail" },
            { type: "p", html: "Each card gives the definition, every argument and what it means, worked examples on the data shown (the results are calculated live), where it's used in finance, and the usual mistakes. Hover over an argument in the grey syntax line to highlight its explanation." },
            CARDS.SUM, CARDS.AVERAGE, CARDS.MIN, CARDS.MAX, CARDS.COUNT, CARDS.ROUND, CARDS.SUMPRODUCT,
            { type: "sheet", id: "w1-l7-try", title: "Try it: summarise a year of sales", cols: "A:E", rows: [4, 24], start: "E8",
              intro: "Same layout as the L7 tab. In the sandbox, click B5 while typing and Shift-click B16 to add the range.",
              tasks: ["E8 to E12: total, average, worst month, best month, average rounded to the nearest hundred", "C24: total revenue from the product table with SUMPRODUCT"],
              cells: merge(salesCells(5, true), { D4: "Worked example", D5: "Number of months", E5: "=COUNT(B5:B16)", D7: "Your turn", D8: "1. Total sales", D9: "2. Average month", D10: "3. Worst month", D11: "4. Best month", D12: "5. Average to nearest 100",
                A19: "Product", B19: "Units sold", C19: "Price, KES", A20: "Maize flour 2kg", B20: 12400, C20: 215, A21: "Cooking oil 1L", B21: 8650, C21: 340, A22: "Sugar 1kg", B22: 10200, C22: 185, A23: "Rice 2kg", B23: 5300, C23: 420, A24: "6. Total revenue, KES" }),
              formats: { "B5:B16": NUM, E8: NUM, E9: P2, "E10:E12": NUM, "B20:C23": NUM, C24: NUM }, styles: { head: ["A4:B4", "D4", "D7", "A19:C19"], input: ["B5:B16", "B20:C23"], bold: ["A24"] },
              editable: ["E8:E12", "C24"],
              solution: { E8: "=SUM(B5:B16)", E9: "=AVERAGE(B5:B16)", E10: "=MIN(B5:B16)", E11: "=MAX(B5:B16)", E12: "=ROUND(AVERAGE(B5:B16),-2)", C24: "=SUMPRODUCT(B20:B23,C20:C23)" },
              explain: {"E8": "Adds all twelve months: 272,590.", "E9": "Total ÷ number of months: 272,590 ÷ 12 = 22,715.83.", "E10": "The smallest month: February, 17,480.", "E11": "The largest month: December, 31,455.", "E12": "AVERAGE first (22,715.83), then ROUND with −2 rounds to the nearest hundred: 22,700.", "C24": "Multiplies units × price for each product and adds the four results: 2,666,000 + 2,941,000 + 1,887,000 + 2,226,000 = 9,720,000."},
              check: { cells: ["E8:E12", "C24"], require: [{ cell: "E8", has: "SUM(" }, { cell: "E9", has: "AVERAGE(" }, { cell: "E10", has: "MIN(" }, { cell: "E11", has: "MAX(" }, { cell: "E12", has: "ROUND(" }, { cell: "C24", has: "SUMPRODUCT(", msg: "Use SUMPRODUCT in C24: it multiplies units by prices and adds them in one step." }],
                success: "Total 272,590, average 22,715.83, worst 17,480, best 31,455, rounded 22,700, and revenue KES 9,720,000." },
              hints: ["Every one of E8 to E11 uses the same range: <code>B5:B16</code>.", "For E12, put AVERAGE inside ROUND: <code>=ROUND(AVERAGE(B5:B16), -2)</code>.", "SUMPRODUCT takes the two columns: units (B20:B23) and prices (C20:C23)."] },
            { type: "quiz", id: "w1-l7-quiz", questions: [
              { kind: "fill", q: "Total of B5 to B16:", before: "=", after: "(B5:B16)", answers: ["SUM"], why: "SUM adds a range." },
              { q: "What does <code>=ROUND(22715.83, -2)</code> give?", options: ["22,715.8", "22,700", "22,800"], answer: 1, why: "−2 rounds to the nearest hundred." },
              { q: "<code>=SUMPRODUCT(B20:B23, C20:C23)</code> works out…", options: ["The sum of both columns", "Each units × price, added up", "The average price"], answer: 1, why: "It multiplies row by row, then adds the results: total revenue." }
            ] }
          ] },

        { id: "w1-l8", num: "L8", title: "Build a three-year forecast", time: "25 min", sheet: "L8 Forecast", type: "Project",
          lede: "Everything so far, in one small model: formulas that point at inputs, copied across three years, with one locked tax rate.",
          keyIdea: "A forecast is the lessons so far used together: write each line once, lock what must not move, copy across.",
          objectives: ["Give a cell a name (TaxRate)", "Build an income statement from inputs", "Stress-test the model"],
          keywords: "forecast income statement model named range taxrate name box stress test",
          blocks: [
            { type: "h", text: "The plan, line by line" },
            { type: "table", head: ["Line", "How (FY2026E, column E)", "Uses"], rows: [
              ["Revenue", "<code>=D12*(1+E5)</code>", "L4, L5"], ["Cost of sales", "<code>=-E12*E6</code>", "L4 (negative: it's a cost)"], ["Gross profit", "<code>=E12+E13</code>", "Add the lines above"],
              ["Operating expenses", "<code>=-E12*E7</code>", "Same pattern as cost of sales"], ["Operating profit", "<code>=E14+E15</code>", ""], ["Interest expense", "<code>=-E8</code>", ""],
              ["Profit before tax", "<code>=E16+E17</code>", ""], ["Tax", "<code>=-E18*TaxRate</code>", "L6: a name never moves"], ["Net income", "<code>=E18+E19</code>", ""]
            ] },
            { type: "h", text: "Give the tax rate a name" },
            { type: "p", html: "Click <b>D9</b>, then click the <b>Name Box</b> (left of the formula bar, it shows D9), type <code>TaxRate</code> and press Enter. Now <code>=-E18*TaxRate</code> reads like a sentence, and a name always points at the same cell, just like <code>$D$9</code>." },
            CONCEPTS.forecast,
            { type: "sheet", id: "w1-l8-try", title: "Try it: Mavuno Traders forecast", cols: "A:G", rows: [4, 23], start: "E13", names: { TaxRate: "D9" },
              intro: "Revenue in E12 is done. Write E13 to E20 and the two margins, then copy column E to G. KES '000.",
              cells: { A4: "Inputs", D4: "FY2025A", E4: "FY2026E", F4: "FY2027E", G4: "FY2028E", A5: "Revenue growth", E5: 0.12, F5: 0.10, G5: 0.08, A6: "Cost of sales %", E6: 0.58, F6: 0.58, G6: 0.58, A7: "Operating expenses %", E7: 0.22, F7: 0.22, G7: 0.22, A8: "Interest expense", E8: 4000, F8: 4000, G8: 4000, A9: "Tax rate (TaxRate)", D9: 0.30,
                A11: "Income statement", D11: "FY2025A", E11: "FY2026E", F11: "FY2027E", G11: "FY2028E",
                A12: "Revenue", D12: 250000, E12: "=D12*(1+E5)", A13: "Cost of sales", D13: -145000, A14: "Gross profit", D14: "=D12+D13", A15: "Operating expenses", D15: -55000, A16: "Operating profit", D16: "=D14+D15",
                A17: "Interest expense", D17: -4000, A18: "Profit before tax", D18: "=D16+D17", A19: "Tax", D19: "=-D18*TaxRate", A20: "Net income", D20: "=D18+D19", A22: "Gross margin", D22: "=D14/D12", A23: "Net margin", D23: "=D20/D12" },
              formats: { "E5:G7": PCT, "E8:G8": NUM, D9: PCT, "D12:G20": NUM, "D22:G23": PCT },
              styles: { head: ["A4:G4", "A11:G11"], input: ["E5:G8", "D9", "D12", "D13", "D15", "D17"], bold: ["A14:G14", "A16:G16", "A18:G18", "A20:G20"], total: ["D20:G20"] },
              editable: ["E13:E20", "E22:E23"], fill: { from: "E12:E23", to: "E12:G23", label: "Copy column E to G" },
              solution: { E13: "=-E12*E6", E14: "=E12+E13", E15: "=-E12*E7", E16: "=E14+E15", E17: "=-E8", E18: "=E16+E17", E19: "=-E18*TaxRate", E20: "=E18+E19", E22: "=E14/E12", E23: "=E20/E12" },
              explain: {"E13": "Cost of sales is a cost, so negative: −(280,000 × 58%) = −162,400.", "E14": "Revenue plus the negative cost: 280,000 − 162,400 = 117,600.", "E15": "Same pattern with the opex %: −(280,000 × 22%) = −61,600.", "E16": "Gross profit + operating expenses = 56,000.", "E17": "Interest input (4,000) shown as a cost: −4,000.", "E18": "Operating profit + interest = 52,000.", "E19": "Tax at the named rate: −(52,000 × 30%) = −15,600. TaxRate always points at D9.", "E20": "Profit before tax + tax = 36,400.", "E22": "Gross profit ÷ revenue = 42.0%.", "E23": "Net income ÷ revenue = 13.0%.", "fill": "Copying E12:E23 to F and G applies each year's growth and cost %. Net income: 36,400, 40,320, 43,770."},
              check: { cells: ["E12:G20", "E22:G23"], success: "Net income grows from 36,400 to 40,320 to 43,770. Now try the stress test: change E5 to 20% and watch every year move." },
              hints: ["Costs are negative: cost of sales is <code>=-E12*E6</code>. Operating expenses follows the same pattern with E7.", "Subtotals just add the lines above, e.g. gross profit <code>=E12+E13</code>.", "Tax uses the name: <code>=-E18*TaxRate</code>. Then press Copy column E to G."] },
            { type: "steps", id: "w1-l8-steps", title: "Follow along in Excel", sheet: "L8 Forecast", items: [
              { html: "Name D9 <b>TaxRate</b> using the Name Box." },
              { html: "In E12, write revenue and press Enter.", code: "=D12*(1+E5)" },
              { html: "Write E13 to E20 and E22:E23 using the table above." },
              { html: "Select E12:G23 and press <kbd>Ctrl</kbd>+<kbd>R</kbd> to copy right." },
              { html: "Check row 26: net income should show ✓ for all three years." },
              { html: "Stress test: change E5 to 20%. If any forecast number doesn't change, a number is typed inside a formula. Set E5 back to 12%." }
            ] }
          ] }
      ] },

      /* ============================================================ SESSION 3 */
      { title: "Decisions and lookups", session: 3, sub: "Session 3, about 90 minutes", lessons: [
        { id: "w1-l9", num: "L9", title: "TRUE/FALSE tests and IF", time: "25 min", sheet: "L9 IF",
          lede: "Models make decisions: profit or loss, lend or not. It starts with a simple test.",
          keyIdea: "A test like <code>C5&gt;0</code> answers TRUE or FALSE. IF turns that answer into words.",
          objectives: ["Write a comparison that gives TRUE or FALSE", "Read an IF formula aloud", "Copy IF down a table"],
          keywords: "if true false test comparison greater less",
          blocks: [
            { type: "h", text: "A test gives TRUE or FALSE" },
            { type: "table", head: ["Sign", "Means", "Example", "Answer when C5 is 310"], rows: [
              ["<code>&gt;</code>", "more than", "<code>=C5&gt;0</code>", "TRUE"], ["<code>&lt;</code>", "less than", "<code>=C5&lt;0</code>", "FALSE"], ["<code>&gt;=</code>", "at least", "<code>=C5&gt;=310</code>", "TRUE"],
              ["<code>&lt;=</code>", "at most", "<code>=C5&lt;=100</code>", "FALSE"], ["<code>=</code>", "equal to", "<code>=C5=310</code>", "TRUE"], ["<code>&lt;&gt;</code>", "not equal to", "<code>=C5&lt;&gt;0</code>", "TRUE"]
            ] },
            { type: "h", text: "IF: one test, two outcomes" },
            { type: "key", label: "Pattern", html: "=IF( test , what to show if TRUE , what to show if FALSE )" },
            { type: "p", html: "Read it aloud: <i>\"IF net income is more than 0, show Profit, otherwise show Loss.\"</i> That's <code>=IF(C5&gt;0,\"Profit\",\"Loss\")</code>. Words go in quotes; numbers and addresses don't." },
            CONCEPTS.logic,
            CARDS.IF,
            { type: "sheet", id: "w1-l9-try", title: "Try it: profit or loss?", cols: ["A", "B", "C", "I", "J"], rows: [4, 10], start: "I6",
              intro: "Columns D to H are hidden here, as in the workbook they hold data you don't need yet. Row 5 is the worked example.",
              tasks: ["I6: a test, is net income more than 0?", "J6: IF it is, show Profit, otherwise Loss", "Press <b>Copy row 6 down</b>"],
              cells: merge(companyCells(4), { I4: "1. Made a profit?", J4: "2. Profit or loss", I5: "=C5>0", J5: '=IF(C5>0,"Profit","Loss")' }),
              formats: { "B5:C10": NUM }, styles: { head: ["A4:J4"], input: ["B5:C10"] },
              editable: ["I6:J6"], fill: { from: "I6:J6", to: "I6:J10", label: "Copy row 6 down" },
              solution: { I6: "=C6>0", J6: '=IF(C6>0,"Profit","Loss")' },
              explain: {"I6": "A test: is Baraka's net income (C6, −120) more than 0? FALSE.", "J6": "IF turns the test into words: FALSE → \"Loss\".", "fill": "Copying down moves C6 to C7, C8…, so each row tests its own company."},
              check: { cells: ["I6:J10"], success: "Four companies made a profit, two made a loss. Click J7 to read its copied formula." },
              hints: ["Click I5 to see the worked example: <code>=C5&gt;0</code>. Row 6 is the same, one row down.", "Words in IF need quotes: <code>\"Profit\"</code>."] },
            { type: "quiz", id: "w1-l9-quiz", questions: [
              { q: "C6 is −120. What does <code>=C6&gt;0</code> show?", options: ["TRUE", "FALSE", "−120"], answer: 1, why: "−120 isn't more than 0." },
              { kind: "fill", q: "Finish the IF:", before: '=IF(C5>0,"Profit",', after: ")", answers: ['"Loss"'], why: "The third part is what to show when the test is FALSE. Words need quotes." },
              { q: "Which sign means <i>not equal to</i>?", options: ["<code>!=</code>", "<code>&lt;&gt;</code>", "<code>=/=</code>"], answer: 1, why: "Excel uses less-than and greater-than together." }
            ] }
          ] },

        { id: "w1-l10", num: "L10", title: "IFS, AND, OR and IFERROR", time: "35 min", sheet: "L10 More logic",
          lede: "Four small additions to IF: more than two outcomes, tests that must all pass, tests where any one is enough, and a tidy way to handle errors.",
          keyIdea: "IFS picks one of several outcomes. AND needs every test TRUE, OR needs any one. IFERROR replaces an error with something readable.",
          objectives: ["Classify with IFS", "Combine tests with AND and OR", "Handle a divide-by-zero with IFERROR"],
          keywords: "ifs and or iferror nested if current ratio debt equity loan",
          blocks: [
            { type: "widget", name: "logic", toc: "Be the lender", title: "Be the lender", intro: "A bank rates a company's liquidity and decides whether to lend. Move the sliders and watch each test." },
            { type: "h", text: "The four functions" },
            { type: "table", head: ["Function", "Use it to…", "Pattern (row 10)"], rows: [
              ["<code>IFS</code>", "Pick one of several outcomes. Tests run in order; the first TRUE wins.", '<code>=IFS(I10&lt;$C$4,"Weak", I10&lt;=$C$5,"Adequate", TRUE,"Strong")</code>'],
              ["<code>AND</code>", "Require every test to pass", '<code>=IF(AND(I10&gt;=$C$6, J10&lt;=$C$7),"Yes","No")</code>'],
              ["<code>OR</code>", "Flag if any test passes", '<code>=IF(OR(H10&lt;0, I10&lt;1),"Review","OK")</code>'],
              ["<code>IFERROR</code>", "Show something readable instead of an error", '<code>=IFERROR(C10/B10,"n/a")</code>']
            ] },
            { type: "callout", kind: "note", html: "The final <code>TRUE,\"Strong\"</code> in IFS catches everything left over. The thresholds sit in C4:C7 and are locked with $, so the rules can change without touching a formula." },
            { type: "callout", kind: "warning", html: "IFERROR hides <i>every</i> error, including your own mistakes. Use it only where an error is expected, like Chui Tech's zero revenue." },
            { type: "h", text: "The functions in detail" },
            CARDS.IFS, CARDS.AND, CARDS.OR, CARDS.IFERROR,
            { type: "sheet", id: "w1-l10-try", title: "Try it: the lender's table", cols: ["A", "B", "C", "H", "I", "J", "K", "L", "M", "N"], rows: [3, 15], start: "K10",
              intro: "Current ratio (I) and debt/equity (J) are already calculated. Write K10 to N10 using the patterns above, then copy down.",
              tasks: ["K10 liquidity with IFS", "L10 loan with IF + AND", "M10 review flag with IF + OR", "N10 net margin with IFERROR", "Press <b>Copy row 10 down</b>"],
              cells: merge(companyCells(9), { A3: "Rules", A4: "Weak if below", C4: 1.0, A5: "Strong if above", C5: 2.0, A6: "Loan: ratio at least", C6: 1.2, A7: "Loan: debt/equity at most", C7: 2.0,
                I9: "Current ratio", J9: "Debt / equity", K9: "1. Liquidity", L9: "2. Loan?", M9: "3. Review?", N9: "4. Net margin",
                I10: "=D10/E10", I11: "=D11/E11", I12: "=D12/E12", I13: "=D13/E13", I14: "=D14/E14", I15: "=D15/E15", J10: "=F10/G10", J11: "=F11/G11", J12: "=F12/G12", J13: "=F13/G13", J14: "=F14/G14", J15: "=F15/G15" }),
              formats: { "C4:C7": X, "B10:C15": NUM, "H10:H15": PCT, "I10:J15": X, "N10:N15": PCT }, styles: { head: ["A9:N9", "A3"], input: ["C4:C7", "B10:C15", "H10:H15"] },
              editable: ["K10:N10"], fill: { from: "K10:N10", to: "K10:N15", label: "Copy row 10 down" },
              solution: { K10: '=IFS(I10<$C$4,"Weak",I10<=$C$5,"Adequate",TRUE,"Strong")', L10: '=IF(AND(I10>=$C$6,J10<=$C$7),"Yes","No")', M10: '=IF(OR(H10<0,I10<1),"Review","OK")', N10: '=IFERROR(C10/B10,"n/a")' },
              explain: {"K10": "Tests in order: current ratio below 1 → Weak; else up to 2 → Adequate; anything else (TRUE) → Strong. Amani's 1.48 → Adequate. The thresholds are locked with $ so they don't move when copied down.", "L10": "AND needs both: ratio ≥ 1.2 AND debt/equity ≤ 2. Amani 1.48 and 0.57 → Yes.", "M10": "OR needs only one: sales growth below 0 OR ratio below 1. Amani has neither → OK.", "N10": "Net margin = net income ÷ revenue. IFERROR shows n/a for Chui Tech, whose revenue is 0.", "result": "Copied down: Amani, Chui Tech, Dafina and Elimu get the loan; Baraka and Faraja need review (current ratio below 1)."},
              check: { cells: ["K10:N15"], success: "Four companies qualify for the loan, two need review, and Chui Tech's margin shows n/a instead of #DIV/0!." },
              hints: ["The thresholds need $ signs (C4 → $C$4) so they don't slide when you copy down.", "For N10, first try <code>=C10/B10</code> and copy down: Chui Tech shows #DIV/0!. Then wrap it in IFERROR.", "AND and OR go inside IF: <code>=IF(AND(test1, test2), \"Yes\", \"No\")</code>."] },
            { type: "quiz", id: "w1-l10-quiz", questions: [
              { q: "<code>=AND(TRUE, FALSE)</code> gives…", options: ["TRUE", "FALSE"], answer: 1, why: "AND needs every test to be TRUE." },
              { q: "<code>=OR(TRUE, FALSE)</code> gives…", options: ["TRUE", "FALSE"], answer: 0, why: "OR needs only one TRUE." },
              { kind: "fill", q: "Finish IFS so anything left over shows Strong:", before: '=IFS(I10<1,"Weak",I10<=2,"Adequate",', after: ',"Strong")', answers: ["TRUE"], why: "TRUE is always true, so it catches everything the earlier tests didn't." },
              { q: "Revenue is 0. What does <code>=IFERROR(C12/B12,\"n/a\")</code> show?", options: ["#DIV/0!", "0", "n/a"], answer: 2, why: "Dividing by 0 is an error, so IFERROR shows the alternative." }
            ] }
          ] },

        { id: "w1-l11", num: "L11", title: "Looking things up with XLOOKUP", time: "30 min", sheet: "L11 XLOOKUP",
          lede: "Finance data lives in tables. A lookup finds the row you need and brings back one value from it.",
          keyIdea: "Find this, in here, bring back that: <code>=XLOOKUP(find, in here, bring back, \"if not found\")</code>.",
          objectives: ["Explain each of XLOOKUP's six arguments", "Look up a value and bring back any column, even to the left", "Show a message when nothing matches", "Look up a band (commission, tax) with an approximate match"],
          keywords: "xlookup lookup find not found",
          blocks: [
            { type: "widget", name: "lookup", toc: "Lookup explorer", title: "Lookup explorer", pick: "Dafina Pharma", firstRow: 6, look: 1,
              cols: [{ col: "A", label: "Code" }, { col: "B", label: "Company" }, { col: "C", label: "Sector" }, { col: "D", label: "Share price", num: true, dp: 2 }, { col: "E", label: "Shares, m", num: true }],
              rows: DIR },
            { type: "p", html: "The four parts: <b>find this</b> (B14, the company you picked), <b>in here</b> (the names, B6:B11), <b>bring back that</b> (any column of the same height), and an optional message <b>if not found</b>." },
            CARDS.XLOOKUP, CONCEPTS.lookupTables,
            { type: "sheet", id: "w1-l11-try", title: "Try it: look up a company", cols: "A:E", rows: [5, 27], start: "B21",
              intro: "Pick a company in B14 (it's a dropdown). B17 is the worked example.",
              tasks: ["B21 share price, B22 shares (XLOOKUP)", "B23 market value = B21 × B22", "B24 the code (it's to the left of the names)", "B27 look up A27, which isn't in the list, with \"Not found\""],
              cells: merge(dirCells(), { A14: "Company to find", B14: "Dafina Pharma", A16: "Worked example", A17: "Sector", B17: "=XLOOKUP(B14,B6:B11,C6:C11)", A19: "Your turn", A21: "1. Share price", A22: "2. Shares, millions", A23: "3. Market value, KES m", A24: "4. Code", A26: "5. Not in the list", A27: "Kifaru Ltd" }),
              choices: { B14: NAMES },
              formats: { "D6:D11": P2, "E6:E11": NUM, B21: P2, B22: NUM, B23: NUM }, styles: { head: ["A5:E5", "A16", "A19"], input: ["D6:E11", "B14", "A27"] },
              editable: ["B21:B24", "B27"],
              solution: { B21: "=XLOOKUP(B14,B6:B11,D6:D11)", B22: "=XLOOKUP(B14,B6:B11,E6:E11)", B23: "=B21*B22", B24: "=XLOOKUP(B14,B6:B11,A6:A11)", B27: '=XLOOKUP(A27,B6:B11,C6:C11,"Not found")' },
              explain: {"B21": "Find the company in B14, in the names B6:B11, bring back the share price column D6:D11.", "B22": "Same lookup, bring back shares (E6:E11).", "B23": "Market value = price × shares (KES m).", "B24": "Bring back the code column A6:A11, which is to the left of the names.", "B27": "Kifaru Ltd isn't in the list, so the fourth argument shows \"Not found\" instead of #N/A."},
              check: { cells: ["B21:B24", "B27"], require: [{ cell: "B21", has: "LOOKUP" }, { cell: "B24", has: "LOOKUP" }, { cell: "B27", has: "LOOKUP" }], success: "Dafina Pharma: 128.00, 210 million shares, market value KES 26,880 m, code DFNP. Now pick another company in B14 and watch every answer change." },
              hints: ["Copy the worked example in B17 and change only the last part: C6:C11 → D6:D11.", "For the code, bring back A6:A11. XLOOKUP doesn't mind that it's to the left.", "The fourth part is the message: <code>\"Not found\"</code>."] },
            { type: "quiz", id: "w1-l11-quiz", questions: [
              { q: "In <code>=XLOOKUP(B14, B6:B11, D6:D11)</code>, what is B6:B11?", options: ["What to find", "Where to look", "What to bring back"], answer: 1, why: "Find this (B14), in here (B6:B11), bring back that (D6:D11)." },
              { q: "What does XLOOKUP show if it can't find the value and you gave no fourth part?", options: ["0", "#N/A", "Blank"], answer: 1, why: "#N/A means not available. Add a fourth part, like \"Not found\", to show a message instead." }
            ] }
          ] },

        { id: "w1-l12", num: "L12", title: "INDEX and MATCH", time: "30 min", sheet: "L12 INDEX MATCH",
          lede: "Older files and many interviews use INDEX-MATCH. Build it in two small steps and it stops looking scary.",
          keyIdea: "MATCH finds the <b>position</b> of a value in a list. INDEX brings back the value at that position.",
          objectives: ["Find a position with MATCH", "Bring back a value with INDEX", "Combine them, and recognise VLOOKUP"],
          keywords: "index match vlookup position data validation dropdown",
          blocks: [
            { type: "h", text: "Two steps, then together" },
            { type: "table", head: ["Step", "Formula", "Gives", "Because"], rows: [
              ["1. MATCH", "<code>=MATCH(B14,B6:B11,0)</code>", "4", "Dafina Pharma is 4th in the list. The 0 means exact match."],
              ["2. INDEX", "<code>=INDEX(D6:D11,4)</code>", "128.00", "The 4th share price."],
              ["3. Together", "<code>=INDEX(D6:D11,MATCH(B14,B6:B11,0))</code>", "128.00", "MATCH supplies the 4."]
            ] },
            CARDS.MATCH, CARDS.INDEX,
            { type: "sheet", id: "w1-l12-try", title: "Try it: build INDEX-MATCH", cols: "A:E", rows: [5, 23], start: "B17",
              intro: "Same table as L11. Each step uses the one before.",
              tasks: ["B17 MATCH: the position of B14", "B18 INDEX: the 4th share price (type the 4)", "B19 replace the 4 with your MATCH", "B20 same idea, bring back the sector", "B23 recognise VLOOKUP: price of code CHUI"],
              cells: merge(dirCells(), { A14: "Company to find", B14: "Dafina Pharma", A16: "Build it", A17: "1. MATCH: position", A18: "2. INDEX: 4th price", A19: "3. Together", A20: "4. Sector", A22: "VLOOKUP", A23: "5. Price of CHUI" }),
              choices: { B14: NAMES },
              formats: { "D6:D11": P2, "E6:E11": NUM, "B18:B19": P2, B23: P2 }, styles: { head: ["A5:E5", "A16", "A22"], input: ["D6:E11", "B14"] },
              editable: ["B17:B20", "B23"],
              solution: { B17: "=MATCH(B14,B6:B11,0)", B18: "=INDEX(D6:D11,4)", B19: "=INDEX(D6:D11,MATCH(B14,B6:B11,0))", B20: "=INDEX(C6:C11,MATCH(B14,B6:B11,0))", B23: '=VLOOKUP("CHUI",A6:E11,4,FALSE)' },
              explain: {"B17": "MATCH gives the position of B14 in the names. 0 = exact. Dafina Pharma → 4.", "B18": "INDEX takes the 4th item of the share prices: 128.00.", "B19": "MATCH replaces the typed 4, so the formula works for any company in B14.", "B20": "Same pair, returning the sector column instead.", "B23": "VLOOKUP searches the first column (codes, A) and returns the 4th column of A:E, share price: 6.85. FALSE = exact match."},
              check: { cells: ["B17:B20", "B23"], require: [{ cell: "B17", has: "MATCH(" }, { cell: "B19", has: "MATCH(" }, { cell: "B20", has: "INDEX(" }], success: "MATCH found position 4, INDEX brought back 128.00 and Healthcare, and VLOOKUP found 6.85 for CHUI." },
              hints: ["MATCH needs three parts: what to find, the list, and 0 for an exact match.", "For B19, copy B18 and replace the 4 with the MATCH from B17 (without its = sign).", "VLOOKUP: <code>=VLOOKUP(\"CHUI\", A6:E11, 4, FALSE)</code>. The 4 means the 4th column of the table."] },
            { type: "callout", kind: "note", title: "Why prefer XLOOKUP over VLOOKUP", html: "VLOOKUP only looks to the right of the first column, and its column number (the 4) breaks silently if someone inserts a column. Read it in other people's files; write XLOOKUP in yours." },
            CARDS.VLOOKUP,
            { type: "steps", id: "w1-l12-steps", title: "In Excel: make B14 a dropdown", sheet: "L12 INDEX MATCH", items: [
              { html: "Click <b>B14</b>." }, { html: "Go to <b>Data → Data Validation</b>, and under Allow choose <b>List</b>." },
              { html: "In Source, type the range of names and press OK.", code: "=$B$6:$B$11" },
              { html: "Pick a company from the arrow. Every answer on the tab updates." }
            ] },
            { type: "quiz", id: "w1-l12-quiz", questions: [
              { q: "What does <code>=MATCH(\"Chui Tech\", B6:B11, 0)</code> give, if Chui Tech is the 3rd name?", options: ["Chui Tech", "3", "6.85"], answer: 1, why: "MATCH gives a position, not a value." },
              { kind: "fill", q: "Complete the exact-match MATCH:", before: "=MATCH(B14,B6:B11,", after: ")", answers: ["0"], why: "0 means exact match. Always include it." }
            ] }
          ] },

        { id: "w1-l13", num: "L13", title: "Map a trial balance", time: "30 min", sheet: "L13 Trial balance", type: "Project",
          lede: "A real analyst task that uses everything from Session 3: look up each account's line, flag the gaps, and prove the totals balance.",
          keyIdea: "Look up each account code in a mapping table, flag what's missing with IF, then count the gaps with COUNTIF.",
          objectives: ["Map accounts to the statements with XLOOKUP", "Flag and count unmapped accounts", "Check that debits equal credits"],
          keywords: "trial balance mapping countif debit credit accounts unmapped",
          blocks: [
            { type: "callout", kind: "finance", title: "What's a trial balance?", html: "A list of every account in the books with its balance at one date. Debits must equal credits. To build financial statements, each account is <b>mapped</b> to a line, e.g. account 1010 Cash at bank → Balance sheet, Cash." },
            CONCEPTS.trialBalance,
            { type: "h", text: "The plan" },
            { type: "list", ordered: true, items: [
              "E: look up the statement (IS or BS) for the code in column A, from the mapping table in J:L.",
              "F: the same, but bring back the line from column L.",
              "G: flag gaps with IF.",
              "Totals: SUM the debits and credits; their difference must be 0.",
              "Count the gaps with <code>=COUNTIF(E6:E23,\"UNMAPPED\")</code>."
            ] },
            { type: "h", text: "Conditional totals and counts" },
            { type: "p", html: "Once every account has a line, SUMIF adds them up by line: that is how a trial balance becomes an income statement. COUNTIF counts what's left to fix." },
            CARDS.SUMIF, CARDS.SUMIFS, CARDS.COUNTIF,
            { type: "callout", kind: "tip", html: "The mapping table must not slide when you copy down, so lock it: <code>$J$6:$J$26</code>. Rows 21 to 26 are empty on purpose: that's where homework mappings go." },
            { type: "sheet", id: "w1-l13-try", title: "Try it: map Mavuno Traders' trial balance", cols: ["A", "B", "C", "D", "E", "F", "G", "J", "K", "L"], rows: [5, 26], start: "E7",
              intro: "Row 6 is done for you. KES '000. In the workbook, row 6 uses INDEX-MATCH, which gives the same answer.",
              tasks: ["E7:G7 copy the pattern from row 6", "Press <b>Copy row 7 down</b>", "C24 and D24: total debits and credits; C25 the difference", "C26: count the UNMAPPED accounts"],
              cells: tbCells(),
              formats: { "C6:D24": NUM, C25: NUM, C26: NUM }, styles: { head: ["A5:G5", "J5:L5"], input: ["A6:D23", "J6:L20"], bold: ["B24:D24"], total: ["C24:D24"] },
              editable: ["E7:G7", "C24:D24", "C25", "C26"], fill: { from: "E7:G7", to: "E7:G23", label: "Copy row 7 down" },
              solution: { E7: '=XLOOKUP(A7,$J$6:$J$26,$K$6:$K$26,"UNMAPPED")', F7: '=XLOOKUP(A7,$J$6:$J$26,$L$6:$L$26,"UNMAPPED")', G7: '=IF(E7="UNMAPPED","Map this","OK")', C24: "=SUM(C6:C23)", D24: "=SUM(D6:D23)", C25: "=C24-D24", C26: '=COUNTIF(E6:E23,"UNMAPPED")' },
              explain: {"E7": "Look up the account code in the mapping codes ($J$6:$J$26) and bring back the statement ($K). Locked so it doesn't slide when copied down; \"UNMAPPED\" if the code isn't there.", "F7": "Same lookup, bringing back the line ($L).", "G7": "Flags the row if the lookup came back UNMAPPED.", "C24": "Total debits.", "D24": "Total credits.", "C25": "Debits − credits: must be 0.", "C26": "Counts the unmapped accounts: 3."},
              check: { cells: ["E7:G23", "C24:D24", "C25:C26"], success: "Debits and credits both total 437,400, and 3 accounts aren't mapped: Staff advances, Customer deposits and Training. Mapping them is homework task 6." },
              hints: ["Click E6 and copy its formula into E7, changing A6 to A7. Do the same for F7 and G7.", "Totals: <code>=SUM(C6:C23)</code> and <code>=SUM(D6:D23)</code>.", "COUNTIF counts cells that match: <code>=COUNTIF(E6:E23,\"UNMAPPED\")</code>."] }
          ] }
      ] },

      /* ============================================================ WRAP-UP */
      { title: "Wrap-up", session: 4, sub: "End of Session 3", lessons: [
        { id: "w1-review", num: "", title: "Week 1 review quiz", time: "10 min", type: "Quiz",
          lede: "Ten questions across the whole week. Next Wednesday opens with a 15-minute checkpoint on the same ideas, so this is good practice.",
          keywords: "review quiz checkpoint revision",
          blocks: [
            { type: "quiz", id: "w1-review-quiz", title: "Week 1 review", questions: [
              { q: "A cell shows (45,230). What is stored in it?", options: ["(45,230)", "−45230", "45230"], answer: 1, why: "The brackets come from the format. The value is −45,230." },
              { q: "Which code shows 0 as a dash?", options: ["<code>#,##0</code>", "<code>#,##0;(#,##0)</code>", "<code>#,##0;(#,##0);\"-\"</code>"], answer: 2, why: "The third part is for zero." },
              { q: "What colour should a typed-in growth assumption be?", options: ["Blue", "Black", "Green"], answer: 0, why: "Blue means an input someone typed." },
              { q: "<code>=(2+3)^2</code> gives…", options: ["11", "25", "13"], answer: 1, why: "Brackets first: 5, then squared." },
              { q: "You copy <code>=C6*$B$4</code> from C7 to E7. What's in E7?", options: ["<code>=E6*$B$4</code>", "<code>=E6*$D$4</code>", "<code>=C6*$B$4</code>"], answer: 0, why: "C6 moves to E6; $B$4 is locked." },
              { kind: "fill", q: "Lock only the column of the year:", before: "=1/(1+C$13)^", after: "B14", answers: ["$"], why: "A $ before the letter locks the column." },
              { q: "Which function multiplies pairs of cells and adds the results?", options: ["PRODUCT", "SUMPRODUCT", "SUMIF"], answer: 1, why: "SUMPRODUCT: units × price for each row, then a total." },
              { q: "<code>=IF(AND(1.5&gt;=1.2, 2.7&lt;=2),\"Yes\",\"No\")</code> gives…", options: ["Yes", "No"], answer: 1, why: "2.7 isn't at most 2, so AND is FALSE." },
              { q: "Which lookup can bring back a column to the LEFT of the one it searches?", options: ["VLOOKUP", "XLOOKUP", "Neither"], answer: 1, why: "XLOOKUP and INDEX-MATCH can; VLOOKUP can't." },
              { q: "<code>=COUNTIF(E6:E23,\"UNMAPPED\")</code> counts…", options: ["All accounts", "Cells that say UNMAPPED", "Mapped accounts"], answer: 1, why: "COUNTIF counts cells that meet the condition." }
            ] }
          ] },
        { id: "w1-homework", num: "", title: "Homework for Week 2", time: "2.5 hours", type: "Homework", sheet: "HW",
          lede: "Each task repeats one lesson with new numbers, so you practise rather than copy. Due before <b>Wednesday 4 November</b>.",
          keywords: "homework due tasks elimu checkpoint",
          blocks: [
            { type: "checklist", id: "w1-hw", title: "Tasks on the HW tab", items: [
              { title: "Formulas", tag: "Task 1, L4", sub: "Gross profit and margin for Elimu Books. Check: margin 45.0%", time: "10 min" },
              { title: "Copying", tag: "Task 2, L5", sub: "Five-year revenue from one formula. Check: FY2030E 1,387.2", time: "15 min" },
              { title: "Locking", tag: "Task 3, L6", sub: "Discount factors, 10 years × 5 rates. Check: 12% for 10 years = 0.3220", time: "20 min" },
              { title: "Forecast", tag: "Task 4, L8", sub: "Three-year income statement for Elimu Books. Check: FY2028E net income 117.6", time: "45 min" },
              { title: "Logic", tag: "Task 5, L10", sub: "Who can pay a dividend? Net income > 0 AND current ratio ≥ 1.5. Check: one company", time: "15 min" },
              { title: "Trial balance", tag: "Task 6, L13", sub: "Map the 3 missing accounts and explain each choice. Check: 0 unmapped", time: "20 min" },
              { title: "Reflect", tag: "Task 7", sub: "Three sentences: what clicked, what's still unclear", time: "5 min" },
              { title: "Send your file", sub: "Save as Week1_HW_&lt;your name&gt;.xlsx and send it before Wednesday", time: "" }
            ] },
            { type: "callout", kind: "note", title: "Next Wednesday", html: "We start with <b>Checkpoint 1</b>: 15 minutes, no notes, covering formats, references, a small forecast and a lookup. The pass mark is 80%. Then we move on to time value of money." },
            { type: "callout", kind: "tip", html: "Stuck on a task? Reopen its lesson: the Try-it sheets keep your work. If you're still stuck, send your tutor a screenshot that shows the formula bar." }
          ] }
      ] }
    ]
  });
})();
