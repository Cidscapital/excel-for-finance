/* Course settings. Edit text here. To open a week, create content/week-N.js (copy _template-week.js) and add its <script> tag to index.html. */
window.Course = {
  storageKey: "excel-for-finance",
  name: "Excel for Finance",
  tagline: "One-to-one tutoring, six Wednesdays",
  description: "From your first formula to a valued company in your portfolio. Each lesson adds one idea to the last.",
  workbookName: "Week1_Practice.xlsx",
  sessionsNote: "Two sessions every Wednesday: 2 hours, then 1.5 hours",

  /* Links back to the site this course sits in (optional). Paths are relative to index.html. */
  homeHref: null,
  homeLabel: "About this course",
  siteHref: null,
  siteLabel: "All courses",

  /* Weeks. A week opens on the site when its content file is loaded; until then its plan shows. */
  weeks: [
    { n: 1, date: "2026-10-28", title: "Excel foundations", summary: "Cells, formulas, $ signs, IF and lookups" },
    { n: 2, date: "2026-11-04", title: "Finance functions", summary: "Time value of money, loans, NPV and IRR" },
    { n: 3, date: "2026-11-11", title: "Analysis tools", summary: "Tables, PivotTables, charts and what-if",
      plan: [
        { title: "Session 1: Working with data", lessons: ["Checkpoint 2", "Excel Tables and structured references", "SUMIFS and COUNTIFS", "Financial ratios from a company's accounts"] },
        { title: "Session 2: What-if analysis", lessons: ["PivotTables and slicers", "Charts that explain numbers", "Data Tables for sensitivity", "Goal Seek and break-even"] }
      ] },
    { n: 4, date: "2026-11-18", title: "Risk and model quality", summary: "Returns, beta and models people trust",
      plan: [
        { title: "Session 1: Risk and return", lessons: ["Returns and volatility", "Beta with SLOPE", "Two-asset portfolio", "The efficient frontier with Solver"] },
        { title: "Session 2: Building models people trust", lessons: ["Model layout rules", "Error checks and a master check", "Auditing: trace precedents and dependents", "Find and fix 8 errors (Checkpoint 3)"] }
      ] },
    { n: 5, date: "2026-11-25", title: "Three-statement model", summary: "Linking the statements, then Portfolio project 1",
      plan: [
        { title: "Session 1: How the statements connect", lessons: ["Income statement to cash flow", "Working capital and capex schedules", "Debt and interest", "Balancing the balance sheet"] },
        { title: "Session 2: Portfolio project 1", portfolio: true, lessons: ["Choose a listed company and collect 3 years of accounts", "Set up the inputs tab", "Build the five-year forecast", "Balance check equals 0 every year"] }
      ] },
    { n: 6, date: "2026-12-02", title: "Valuation and portfolio", summary: "DCF, sensitivity, and a model you can show",
      plan: [
        { title: "Session 1: Portfolio project 2, DCF", portfolio: true, lessons: ["Free cash flow from your forecast", "WACC with CAPM", "Terminal value, two ways", "Share price and a sensitivity table"] },
        { title: "Session 2: Present and publish", portfolio: true, lessons: ["Cover sheet and assumption sources", "One-page valuation summary", "5-minute pitch with questions", "Add both projects to your portfolio"] }
      ] }
  ],

  downloads: [
    { name: "Week1_Practice.xlsx", href: "downloads/Week1_Practice.xlsx", note: "Week 1 practice workbook" },
    { name: "Week2_Practice.xlsx", href: "downloads/Week2_Practice.xlsx", note: "Week 2 practice workbook" }
  ],

  shortcuts: [
    { id: "jump", action: "Jump to the end of the data", why: "Lands on the last filled cell in that direction.", win: "Ctrl+↓", mac: "Cmd+↓" },
    { id: "select", action: "Select to the end of the data", why: "Add Shift to any jump to select as you go.", win: "Ctrl+Shift+↓", mac: "Cmd+Shift+↓" },
    { id: "home", action: "Go to cell A1", win: "Ctrl+Home", mac: "Fn+Ctrl+←" },
    { id: "sheet", action: "Next or previous tab", win: "Ctrl+PgDn / Ctrl+PgUp", mac: "Option+→ / Option+←" },
    { id: "edit", action: "Edit the selected cell", why: "Shows the formula with coloured borders around each cell it uses.", win: "F2", mac: "Ctrl+U" },
    { id: "format", action: "Open Format Cells", win: "Ctrl+1", mac: "Cmd+1" },
    { id: "f4", action: "Add or cycle $ signs in a reference", why: "Put the cursor on an address in the formula first.", win: "F4", mac: "Cmd+T" },
    { id: "fillr", action: "Copy the left cell across the selection", win: "Ctrl+R", mac: "Cmd+R" },
    { id: "filld", action: "Copy the top cell down the selection", win: "Ctrl+D", mac: "Cmd+D" },
    { id: "sum", action: "AutoSum", win: "Alt+=", mac: "Cmd+Shift+T" },
    { id: "showf", action: "Show formulas instead of results", win: "Ctrl+`", mac: "Ctrl+`" },
    { id: "undo", action: "Undo, then Save", win: "Ctrl+Z / Ctrl+S", mac: "Cmd+Z / Cmd+S" }
  ],

  content: {},
  reference: [],
  addWeek: function (n, data) { this.content[n] = data; },
  addReference: function (page) { this.reference.push(page); }
};
