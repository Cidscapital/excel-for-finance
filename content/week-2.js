/* Week 2 · Finance functions. Lesson numbers (L1-L11) match the Week 2 workbook tabs, the notes and the lesson plan. */
(function () {
  var NUM = '#,##0;(#,##0);"-"', PCT = '0.0%;(0.0%);"-"', PCT2 = "0.00%", P2 = "#,##0.00;(#,##0.00)", DF = "0.0000", DATEF = "d mmm yyyy", YRS = '0.00" yrs"';
  function merge() { var o = {}; for (var i = 0; i < arguments.length; i++) for (var k in arguments[i]) o[k] = arguments[i][k]; return o; }

  /* One project used through Session 2 (matches the L6-L9 tabs) */
  var CF = [-1000000, 250000, 300000, 350000, 300000, 250000];
  function projectCells(row) {
    var c = {}; c["A" + (row - 1)] = "Year"; c["A" + row] = "Cash flow, KES";
    "CDEFGH".split("").forEach(function (col, i) { c[col + (row - 1)] = i; c[col + row] = CF[i]; });
    return c;
  }
  var PROJ_SHEET = { title: "Example data: the warehouse project, KES", cols: "A:H", rows: [3, 5],
    cells: merge({ A3: "Discount rate", B3: 0.10 }, projectCells(5)), formats: { B3: PCT, "C5:H5": NUM }, styles: { head: ["A4:H4"], input: ["B3", "C5:H5"] } };
  var LOAN_SHEET = { title: "Example data: a car loan", cols: "A:B", rows: [3, 6],
    cells: { A3: "Loan amount, KES", B3: 2400000, A4: "Annual rate", B4: 0.14, A5: "Years", B5: 5, A6: "Payments a year", B6: 12 },
    formats: { B3: NUM, B4: PCT }, styles: { input: ["B3:B6"] } };
  var DATED_SHEET = { title: "Example data: dated cash flows, KES", cols: "A:B", rows: [3, 7],
    cells: { A3: "Date", B3: "Cash flow", A4: "=DATE(2026,12,1)", B4: -500000, A5: "=DATE(2027,3,15)", B5: 120000, A6: "=DATE(2027,9,30)", B6: 180000, A7: "=DATE(2028,5,31)", B7: 300000 },
    formats: { "A4:A7": DATEF, "B4:B7": NUM }, styles: { head: ["A3:B3"], input: ["B4:B7"] } };

  /* ---------- Concept cards ---------- */
  var C = {
    tvm: { type: "concept", id: "time-value", title: "Time value of money", cat: "Finance concept", icon: "clock",
      does: "KES 1 today is worth more than KES 1 next year, because today's shilling can be invested and earn a return in the meantime. Time value of money (TVM) is the set of tools for moving money through time so amounts at different dates can be compared fairly.",
      args: [
        { n: "Present value (PV)", means: "What a future amount is worth today.", eg: "KES 161,051 in 5 years at 10% is worth KES 100,000 today." },
        { n: "Future value (FV)", means: "What an amount today grows to by a later date.", eg: "KES 100,000 today at 10% grows to KES 161,051 in 5 years." },
        { n: "Rate (r)", means: "The return per period: interest rate, required return or discount rate.", eg: "10% a year" },
        { n: "Periods (n)", means: "How many periods (years, months) between the two dates.", eg: "5 years" },
        { n: "Compounding", means: "Earning interest on interest. Each period's growth is applied to the new, larger balance.", eg: "" },
        { n: "Discounting", means: "Compounding backwards: dividing by (1 + r) once for every period, to bring a future amount to today.", eg: "" }
      ],
      pattern: "FV = PV × (1 + r)<sup>n</sup>        PV = FV ÷ (1 + r)<sup>n</sup>",
      how: ["Choose the period (year or month) and use the rate for that period.", "To move money forward, multiply by (1 + r) once per period: × (1 + r)^n.", "To move money back to today, divide by (1 + r)^n. The number 1 ÷ (1 + r)^n is the <b>discount factor</b>."],
      examples: [
        { f: "=100000*(1+10%)^5", fmt: NUM, why: "Future value: KES 100,000 compounded at 10% for 5 years." },
        { f: "=100000*(1+10%*5)", fmt: NUM, why: "Simple interest for comparison: 10% of the original amount each year, no interest on interest. Compounding gives 11,051 more." },
        { f: "=161051/(1+10%)^5", fmt: NUM, why: "Present value: the same amount brought back to today." },
        { f: "=1/(1+10%)^5", fmt: DF, why: "Discount factor for year 5 at 10%: every shilling in year 5 is worth 62 cents today." }
      ],
      uses: ["Pricing loans and savings plans.", "Valuing investments: every NPV and DCF is a sum of present values.", "Comparing offers paid at different times (a lump sum now vs instalments)."],
      mistakes: ["Mixing periods: a monthly payment needs a monthly rate (annual ÷ 12) and the number of months.", "Using simple interest where interest compounds."],
      practice: [
        { q: "What does KES 50,000 grow to in 3 years at 8% a year?", a: "<code>=50000*(1+8%)^3</code> = <b>KES 62,985.60</b>." },
        { q: "You'll receive KES 1,000,000 in 4 years. At 11% a year, what is it worth today?", a: "<code>=1000000/(1+11%)^4</code> = <b>KES 658,730.97</b>." },
        { q: "Which is worth more today at 10%: KES 100,000 now or KES 115,000 in two years?", a: "PV of 115,000 = 115,000 ÷ 1.21 = 95,041. KES 100,000 now is worth more." }
      ] },

    rates: { type: "concept", id: "nominal-effective", title: "Nominal and effective rates", cat: "Finance concept", icon: "chart",
      does: "Lenders quote a <b>nominal</b> annual rate (often called APR), for example 12% a year paid monthly. The <b>effective</b> annual rate is what you really pay over a year once monthly compounding is included. It is always higher than the nominal rate when compounding happens more than once a year.",
      pattern: "Effective = (1 + nominal ÷ m)<sup>m</sup> − 1     where m = periods a year",
      args: [
        { n: "Nominal rate", means: "The headline annual rate. Divide it by the number of periods to get the rate per period.", eg: "12% a year → 1% a month" },
        { n: "Periods a year (m)", means: "12 for monthly, 4 for quarterly, 2 for half-yearly.", eg: "12" },
        { n: "Effective annual rate", means: "The true yearly cost or return, used to compare offers with different compounding.", eg: "12.68%" }
      ],
      examples: [
        { f: "=EFFECT(12%,12)", fmt: PCT2, why: "12% nominal, compounded monthly." },
        { f: "=(1+12%/12)^12-1", fmt: PCT2, why: "The same, from the formula." },
        { f: "=EFFECT(14%,12)", fmt: PCT2, why: "The car loan's 14% costs 14.93% a year in reality." },
        { f: "=NOMINAL(12.6825%,12)", fmt: PCT2, why: "Back the other way: the nominal rate for an effective 12.68%." }
      ],
      mistakes: ["Comparing a monthly-compounded rate with an annual one without converting.", "Using an annual rate with monthly periods in PMT."],
      practice: [
        { q: "Bank A charges 13% compounded monthly. Bank B charges 13.5% compounded annually. Which is cheaper?", a: "A's effective rate: <code>=EFFECT(13%,12)</code> = 13.80%. B is 13.50%. <b>Bank B is cheaper</b>, even though its headline rate is higher." }
      ] },

    sign: { type: "concept", id: "tvm-signs", title: "Excel's five TVM inputs and the sign convention", cat: "Concept", icon: "info",
      does: "PV, FV, PMT, NPER and RATE are one equation seen from five sides. Give any four and Excel finds the fifth. Each uses the same inputs, and each needs the same sign rule: <b>money you pay out is negative, money you receive is positive</b>.",
      args: [
        { n: "rate", means: "Interest rate <b>per period</b>. Monthly payments → annual rate ÷ 12.", eg: "<code>14%/12</code>" },
        { n: "nper", means: "Total number of periods. Monthly for 5 years → 60.", eg: "<code>5*12</code>" },
        { n: "pmt", means: "The same payment every period (an annuity). 0 if there are none.", eg: "<code>-5000</code> deposited each month" },
        { n: "pv", means: "The amount at the start (today).", eg: "<code>2400000</code> borrowed (you receive it, so positive)" },
        { n: "fv", means: "The amount left at the end. 0 for a loan paid off in full; your target for savings.", eg: "<code>0</code>" },
        { n: "type", means: "When payments happen: <b>0</b> end of each period (default, most loans), <b>1</b> start (rent, leases, some savings plans).", eg: "<code>0</code>" }
      ],
      how: ["Draw the cash flows from <b>your</b> point of view: what comes in, what goes out.", "Borrowing: the loan comes in (+), repayments go out (−).", "Saving: deposits go out (−), the final balance comes back to you (+).", "If an answer comes out negative, that is Excel saying \"you pay this\". Put a minus in front of the function to show it as a positive cost."],
      examples: [
        { f: "=PMT(14%/12, 60, 2400000)", fmt: P2, why: "You receive 2.4m (+), so the payment is negative: you pay 55,843.80 a month." },
        { f: "=-PMT(14%/12, 60, 2400000)", fmt: P2, why: "A minus in front shows the payment as a positive cost in a report." },
        { f: "=FV(10%, 5, 0, -100000)", fmt: P2, why: "You put in 100,000 (−) and get back 161,051 (+)." },
        { f: "=FV(10%, 5, 0, 100000)", fmt: P2, why: "Wrong sign on pv flips the answer's sign. The size is right, the direction isn't." }
      ],
      mistakes: ["#NUM! from RATE or NPER usually means every cash flow has the same sign: nothing can balance. Make the payments the opposite sign to the loan.", "Annual rate with monthly periods: the single most common TVM error."],
      practice: [
        { q: "You borrow KES 500,000 and repay KES 20,000 a month at 15% a year. Which signs do pv and pmt get in NPER?", a: "pv = <b>+500,000</b> (you receive it), pmt = <b>−20,000</b> (you pay it). <code>=NPER(15%/12, -20000, 500000)</code> = 30.16 months." }
      ] },

    annuity: { type: "concept", id: "annuities-loans", title: "Annuities and loan repayments", cat: "Finance concept", icon: "calendar",
      does: "An <b>annuity</b> is a series of equal payments at regular intervals: loan instalments, rent, a pension, a savings plan. A normal loan is an annuity: each instalment is the same, but the split changes over time: early payments are mostly interest, later ones mostly repay the loan (principal).",
      pattern: "Payment = PV × r ÷ (1 − (1 + r)<sup>−n</sup>)",
      args: [
        { n: "Instalment", means: "The fixed amount paid each period (PMT).", eg: "55,843.80 a month" },
        { n: "Interest part", means: "Rate × the balance still owed at the start of the period. Falls as the balance falls.", eg: "Month 1: 2,400,000 × 14%/12 = 28,000" },
        { n: "Principal part", means: "Instalment − interest. Reduces the balance. Rises over time.", eg: "Month 1: 55,843.80 − 28,000 = 27,843.80" },
        { n: "Total interest", means: "All instalments added up, minus the amount borrowed.", eg: "60 × 55,843.80 − 2,400,000 = 950,628" },
        { n: "Annuity due", means: "Payments at the start of each period (type = 1), e.g. rent paid in advance.", eg: "" }
      ],
      sheet: LOAN_SHEET,
      examples: [
        { f: "=PMT(B4/B6, B5*B6, B3)", fmt: P2, why: "Monthly instalment on the car loan." },
        { f: "=-PMT(B4/B6, B5*B6, B3)*B5*B6", fmt: NUM, why: "Total paid over 5 years." },
        { f: "=-PMT(B4/B6, B5*B6, B3)*B5*B6-B3", fmt: NUM, why: "Total interest: the cost of borrowing." },
        { f: "=B3*(B4/B6)", fmt: P2, why: "Interest in month 1: the rate per month on the full balance." }
      ],
      uses: ["Loan affordability: can the business or person pay the instalment?", "Leases and hire purchase.", "Debt schedules in the three-statement model (Week 5)."],
      practice: [
        { q: "An 8,000,000 mortgage at 13% a year over 20 years, monthly. What is the instalment?", a: "<code>=PMT(13%/12, 20*12, 8000000)</code> = <b>−93,726.06</b>. You pay KES 93,726.06 a month." },
        { q: "Same loan: how much interest is paid in total?", a: "240 × 93,726.06 − 8,000,000 = <b>KES 14,494,254</b>. More than the amount borrowed, because the loan runs 20 years." }
      ] },

    amort: { type: "concept", id: "amortisation", title: "The amortisation schedule", cat: "Finance concept", icon: "table",
      does: "An <b>amortisation schedule</b> is a table with one row per payment showing how each instalment splits into interest and principal, and how the balance falls to zero. It is the standard way to show a loan in a model.",
      args: [
        { n: "Opening balance", means: "What's owed at the start of the period. The first one is the loan; after that, last period's closing balance.", eg: "<code>=F10</code>" },
        { n: "Payment", means: "The fixed instalment, shown positive.", eg: "<code>=-PMT($C$6,$C$7,$C$4)</code>" },
        { n: "Interest", means: "Opening balance × rate per period.", eg: "<code>=B10*$C$6</code>" },
        { n: "Principal", means: "Payment − interest.", eg: "<code>=C10-D10</code>" },
        { n: "Closing balance", means: "Opening balance − principal.", eg: "<code>=B10-E10</code>" }
      ],
      how: ["Write the first row; lock the loan inputs with $.", "Each later opening balance = the closing balance above it.", "Copy the row down for every period.", "Check: the last closing balance is 0 (to the cent), and total principal = the loan."],
      uses: ["Loan and bond schedules in models; the interest line feeds the income statement, the balance feeds the balance sheet.", "Showing a client how fast a loan is paid down."],
      mistakes: ["Forgetting to lock the rate and loan cells, so they slide as you copy.", "A closing balance that isn't exactly 0 at the end: usually the wrong number of periods or a rate that isn't per period."],
      practice: [
        { q: "Loan 600,000 at 12% a year, 12 monthly payments. What are month 1's interest and principal?", a: "Payment <code>=-PMT(1%,12,600000)</code> = 53,309.27. Interest = 600,000 × 1% = <b>6,000.00</b>. Principal = 53,309.27 − 6,000 = <b>47,309.27</b>." }
      ] },

    dcf: { type: "concept", id: "discounted-cash-flow", title: "Cash flows, the discount rate and NPV", cat: "Finance concept", icon: "chart",
      does: "To judge an investment, list its <b>cash flows</b> by year (money out is negative, money in positive), discount each one to today at the <b>discount rate</b>, and add them up. The total is the <b>net present value (NPV)</b>: how much value the project adds today, after paying back the investment and the return investors require.",
      pattern: "NPV = CF<sub>0</sub> + CF<sub>1</sub>/(1+r) + CF<sub>2</sub>/(1+r)<sup>2</sup> + … + CF<sub>n</sub>/(1+r)<sup>n</sup>",
      args: [
        { n: "Year 0", means: "Today. The initial investment, usually negative and not discounted.", eg: "−1,000,000" },
        { n: "Cash flows", means: "Cash in minus cash out for each later year. Use cash, not accounting profit.", eg: "250,000 in year 1" },
        { n: "Discount rate", means: "The return investors require for this level of risk: the hurdle rate or cost of capital (WACC, Week 6).", eg: "10%" },
        { n: "Discount factor", means: "1 ÷ (1 + r)^year. Multiply a cash flow by it to get its present value.", eg: "Year 3: 0.7513" },
        { n: "Decision rule", means: "NPV &gt; 0: accept, it earns more than the required return. NPV &lt; 0: reject. Between projects, prefer the higher NPV.", eg: "" }
      ],
      sheet: PROJ_SHEET,
      examples: [
        { f: "=D5/(1+B3)^D4", fmt: NUM, why: "Present value of year 1's 250,000." },
        { f: "=H5/(1+B3)^H4", fmt: NUM, why: "Year 5's 250,000 is worth less today: it's further away." },
        { f: "=C5+D5/(1+B3)+E5/(1+B3)^2+F5/(1+B3)^3+G5/(1+B3)^4+H5/(1+B3)^5", fmt: NUM, why: "NPV written out in full. L7 shows the one-function version." }
      ],
      uses: ["Capital budgeting: should we build the warehouse, buy the machine, open the branch?", "Valuing a company: a DCF is an NPV of all future free cash flows (Week 6)."],
      mistakes: ["Discounting year 0.", "Using profit instead of cash (depreciation is not a cash flow).", "Adding cash flows from different years without discounting them."],
      practice: [
        { q: "A project costs 400,000 today and pays 150,000 a year for 3 years. At 8%, what is the NPV? Accept or reject?", a: "PVs: 138,889 + 128,601 + 119,075 = 386,565. NPV = 386,565 − 400,000 = <b>−13,435</b>. <b>Reject</b>: it returns less than 8%." }
      ] },

    irr: { type: "concept", id: "irr-meaning", title: "IRR: what it means and when it misleads", cat: "Finance concept", icon: "target",
      does: "The <b>internal rate of return (IRR)</b> is the discount rate that makes NPV exactly zero. It's the project's own annual return. Accept if IRR is above the required return; that gives the same answer as NPV for a single, normal project.",
      args: [
        { n: "Conventional project", means: "Money out first, then money in. One sign change, one IRR.", eg: "−, +, +, +" },
        { n: "Hurdle rate", means: "The required return. IRR above it → NPV positive.", eg: "10%" },
        { n: "Multiple IRRs", means: "When cash flows change sign more than once (e.g. a big clean-up cost at the end), there can be two or more IRRs. Use NPV.", eg: "−100, +230, −132 → 10% and 20%" },
        { n: "Scale problem", means: "IRR is a percentage, so it ignores size. A small project with a high IRR can add less value than a large one with a lower IRR.", eg: "See L11" },
        { n: "Reinvestment", means: "IRR assumes the cash coming in can be reinvested at the IRR itself, which is often unrealistic for very high IRRs.", eg: "" }
      ],
      examples: [
        { show: "Cash flows −100, +230, −132 at 10%", out: "NPV 0", why: "10% is an IRR…" },
        { show: "Same cash flows at 20%", out: "NPV 0", why: "…and so is 20%. Which is \"the\" return? Neither tells you much; NPV at your hurdle rate does." }
      ],
      practice: [
        { q: "Project IRR is 13.7% and the hurdle rate is 10%. Is NPV at 10% positive or negative?", a: "<b>Positive</b>. NPV falls as the discount rate rises and reaches 0 at 13.7%, so at any lower rate, like 10%, it's above 0." }
      ] },

    payback: { type: "concept", id: "payback", title: "Payback and discounted payback", cat: "Finance concept", icon: "clock",
      does: "The <b>payback period</b> is how long it takes for cumulative cash flows to repay the initial investment. <b>Discounted payback</b> does the same with present values, so it accounts for the time value of money. Both measure how quickly money comes back (liquidity and risk), not how much value is created.",
      how: ["Add up the cash flows year by year (cumulative).", "Find the last year the cumulative total is still negative.", "Payback = that year + the amount still missing ÷ the next year's cash flow (assumes cash arrives evenly through the year)."],
      examplesTitle: "The warehouse project",
      examples: [
        { show: "Cumulative: −1,000,000 → −750,000 → −450,000 → −100,000 → +200,000", out: "3.33 yrs", why: "After year 3, 100,000 is still missing; year 4 brings 300,000: 3 + 100,000 ÷ 300,000." },
        { show: "Cumulative PVs: … → −261,833 → −56,929 → +98,301", out: "4.37 yrs", why: "Discounted: 4 + 56,929 ÷ 155,230 (year 5's PV)." }
      ],
      uses: ["A quick screen: many firms require payback within, say, 3 years.", "Risky or fast-changing markets, where distant cash flows are uncertain."],
      mistakes: ["Payback ignores everything after the payback year: a project that pays back fast and then stops can look better than a far more valuable one.", "Simple payback ignores the time value of money."],
      practice: [
        { q: "Cost 500,000; cash flows 150,000, 200,000, 250,000. What is the payback period?", a: "Cumulative: −350,000, −150,000, +100,000. Payback = 2 + 150,000 ÷ 250,000 = <b>2.6 years</b>." }
      ] },

    dates: { type: "concept", id: "dates-in-excel", title: "Dates in Excel", cat: "Concept", icon: "calendar",
      does: "Excel stores a date as a whole number: the count of days since 1 January 1900. 1 December 2026 is 46,357. The date format only changes how it looks. Because dates are numbers, you can subtract them to get days, and XNPV and XIRR use them to measure exact time between cash flows.",
      args: [
        { n: "Typing a date", means: "Type it in a form Excel recognises; it converts it to a number. Safest in formulas: the DATE function.", eg: "<code>=DATE(2026,12,1)</code>" },
        { n: "Format", means: "<code>d mmm yyyy</code> shows 1 Dec 2026; <code>dd/mm/yyyy</code> shows 01/12/2026.", eg: "" },
        { n: "Days between", means: "Later date − earlier date.", eg: "<code>=A5-A4</code>" },
        { n: "Years between", means: "Days ÷ 365 (the convention XNPV and XIRR use).", eg: "" }
      ],
      sheet: DATED_SHEET,
      examples: [
        { f: "=A5-A4", why: "Days from 1 Dec 2026 to 15 Mar 2027." },
        { f: "=(A7-A4)/365", fmt: "0.00", why: "Years from the first to the last cash flow." },
        { f: "=EDATE(A4, 6)", fmt: DATEF, why: "EDATE moves a date by whole months: 6 months after 1 Dec 2026." }
      ],
      mistakes: ["Dates typed as text (left-aligned) can't be used in calculations.", "Day and month swapped: 03/04 is 3 April in Kenya but March 4 in US settings. DATE(year, month, day) avoids the confusion."] },

    compare: { type: "concept", id: "mutually-exclusive", title: "Choosing between projects", cat: "Finance concept", icon: "layers",
      does: "<b>Independent</b> projects can all be done, so accept every one with NPV &gt; 0. <b>Mutually exclusive</b> projects compete (one site, one machine), so choose the one with the <b>highest NPV</b>. IRR can point the wrong way because it ignores size and timing.",
      args: [
        { n: "Independent", means: "Doing one doesn't stop another.", eg: "Two different product lines" },
        { n: "Mutually exclusive", means: "Only one can be chosen.", eg: "Two designs for the same warehouse" },
        { n: "NPV rule", means: "Highest positive NPV wins: it adds the most value in shillings.", eg: "" },
        { n: "Capital rationing", means: "When money is limited, rank by NPV per shilling invested (the profitability index).", eg: "NPV ÷ investment" }
      ],
      examplesTitle: "Two projects at a 10% discount rate",
      examples: [
        { show: "Project A: −100,000, +60,000, +60,000", out: "NPV 4,132  IRR 13.1%", why: "Small, high return." },
        { show: "Project B: −1,000,000, +580,000, +580,000", out: "NPV 6,612  IRR 10.5%", why: "Large, lower return, but more value added. If only one can be done: B." }
      ],
      practice: [
        { q: "Using the two projects above, what is each one's NPV per shilling invested?", a: "A: 4,132 ÷ 100,000 = <b>0.041</b>. B: 6,612 ÷ 1,000,000 = <b>0.007</b>. If money is limited and A can be repeated many times, A uses capital better; if only one project can be done, B adds more value." }
      ] }
  };

  /* ---------- Function cards ---------- */
  var F = {
    FV: { type: "fn", name: "FV", cat: "Finance",
      does: "Future value: what a lump sum and/or a series of equal payments will be worth at the end, at a fixed rate.",
      syntax: "FV(rate, nper, pmt, [pv], [type])",
      args: [
        { n: "rate", means: "Interest rate per period.", eg: "<code>9%/12</code> for monthly" },
        { n: "nper", means: "Number of periods.", eg: "<code>3*12</code>" },
        { n: "pmt", means: "The equal payment each period. 0 if none. Negative if you pay it in.", eg: "<code>-5000</code>" },
        { n: "pv", req: false, means: "Amount at the start. Leave out or 0 if none. Negative if you pay it in.", eg: "<code>-50000</code>" },
        { n: "type", req: false, means: "0 = payments at the end of each period (default); 1 = at the start.", eg: "<code>0</code>" }
      ],
      returns: "The balance at the end. Positive when your deposits were entered as negative (it comes back to you).",
      examples: [
        { f: "=FV(10%, 5, 0, -100000)", fmt: P2, why: "A lump sum of 100,000 for 5 years at 10%." },
        { f: "=FV(9%/12, 36, -5000, -50000)", fmt: P2, why: "50,000 today plus 5,000 at the end of every month for 3 years, at 9% a year compounded monthly." },
        { f: "=FV(9%/12, 36, -5000, -50000, 1)", fmt: P2, why: "Same, with deposits at the start of each month: each one earns one more month of interest." },
        { f: "=FV(10%/12, 60, -15000)", fmt: P2, why: "15,000 a month for 5 years at 10%, no starting amount." }
      ],
      uses: ["Savings and pension projections.", "Sinking funds: setting money aside to repay a bond.", "The balance left on a loan after some payments: <code>=FV(rate, payments_made, pmt, loan)</code>."],
      mistakes: ["Deposits entered as positive give a negative result.", "Annual rate with monthly periods."],
      related: ["PV", "PMT", "RATE", "NPER"] },

    PV: { type: "fn", name: "PV", cat: "Finance",
      does: "Present value: what a future lump sum and/or a series of equal payments is worth today, at a fixed rate.",
      syntax: "PV(rate, nper, pmt, [fv], [type])",
      args: [
        { n: "rate", means: "Discount rate per period.", eg: "<code>11%</code>" },
        { n: "nper", means: "Number of periods.", eg: "<code>4</code>" },
        { n: "pmt", means: "The equal payment each period. 0 if none.", eg: "<code>20000</code>" },
        { n: "fv", req: false, means: "A lump sum at the end.", eg: "<code>1000000</code>" },
        { n: "type", req: false, means: "0 end of period (default), 1 start.", eg: "" }
      ],
      returns: "The value today, with the opposite sign to the future amounts: what you would pay now to get them.",
      examples: [
        { f: "=PV(11%, 4, 0, 1000000)", fmt: P2, why: "You need to invest 658,730.97 today to have 1,000,000 in 4 years at 11%." },
        { f: "=PV(8%/12, 120, 20000)", fmt: P2, why: "A pension of 20,000 a month for 10 years is worth 1.65m today at 8%." },
        { f: "=PV(12%, 3, 0, 500000)", fmt: P2, why: "A payment of 500,000 in 3 years, discounted at 12%." },
        { f: "=-PV(14%/12, 60, 55843.80)", fmt: P2, why: "The car loan the bank would lend for that instalment: about 2.4m." }
      ],
      uses: ["How much to set aside today for a target.", "Value of a stream of payments: a lease, a pension, a bond's coupons.", "How much you can borrow for a given instalment."],
      mistakes: ["PV assumes equal payments. For unequal cash flows use NPV.", "Remember the result's sign is opposite to the future amounts."],
      related: ["FV", "NPV", "PMT"] },

    PMT: { type: "fn", name: "PMT", cat: "Finance",
      does: "The equal payment per period that repays a loan (or builds up a target) at a fixed rate over a fixed number of periods. Each payment includes interest and principal.",
      syntax: "PMT(rate, nper, pv, [fv], [type])",
      args: [
        { n: "rate", means: "Interest rate per period. Annual ÷ 12 for monthly payments.", eg: "<code>14%/12</code>" },
        { n: "nper", means: "Total number of payments.", eg: "<code>5*12</code>" },
        { n: "pv", means: "The loan amount (positive: you receive it).", eg: "<code>2400000</code>" },
        { n: "fv", req: false, means: "Balance left at the end; 0 (default) for a loan repaid in full. For a savings target, put the target here and pv as 0.", eg: "<code>0</code>" },
        { n: "type", req: false, means: "0 end of period (default), 1 start.", eg: "" }
      ],
      returns: "The payment per period, negative because you pay it.",
      sheet: LOAN_SHEET,
      examples: [
        { f: "=PMT(B4/B6, B5*B6, B3)", fmt: P2, why: "Monthly instalment on the car loan." },
        { f: "=PMT(B4, B5, B3)", fmt: P2, why: "If paid once a year instead." },
        { f: "=PMT(12%/12, 24, 1500000)", fmt: P2, why: "A 1.5m business loan over 2 years at 12%." },
        { f: "=PMT(10%/12, 60, 0, 1000000)", fmt: P2, why: "Savings: how much to put away each month to reach 1,000,000 in 5 years at 10%." }
      ],
      uses: ["Loan instalments and affordability.", "Lease payments.", "Monthly saving needed for a goal."],
      mistakes: ["rate and nper must use the same period.", "pv positive and result negative is correct; put a minus in front of PMT for a positive figure."],
      related: ["IPMT", "PPMT", "PV", "NPER", "RATE"] },

    NPER: { type: "fn", name: "NPER", cat: "Finance",
      does: "The number of periods needed to repay a loan, or to reach a target, at a fixed rate and payment.",
      syntax: "NPER(rate, pmt, pv, [fv], [type])",
      args: [
        { n: "rate", means: "Rate per period.", eg: "<code>15%/12</code>" },
        { n: "pmt", means: "Payment each period, opposite sign to pv.", eg: "<code>-20000</code>" },
        { n: "pv", means: "The amount at the start.", eg: "<code>500000</code>" },
        { n: "fv", req: false, means: "Target at the end; 0 for a loan.", eg: "" },
        { n: "type", req: false, means: "0 end (default), 1 start.", eg: "" }
      ],
      returns: "Number of periods, usually with decimals. Round up for the number of payments.",
      examples: [
        { f: "=NPER(15%/12, -20000, 500000)", fmt: "0.00", why: "Months to repay 500,000 at 20,000 a month." },
        { f: "=ROUNDUP(NPER(15%/12, -20000, 500000), 0)", why: "So 31 payments (the last one smaller)." },
        { f: "=NPER(10%, 0, -100000, 200000)", fmt: "0.00", why: "Years to double money at 10%. (The rule of 72 says about 72 ÷ 10 = 7.2.)" }
      ],
      uses: ["How long until a loan is paid off with a given instalment.", "How long to reach a savings target."],
      mistakes: ["#NUM! when the payment is too small to cover even the interest: the loan never gets repaid.", "pmt and pv with the same sign also give #NUM!."],
      related: ["PMT", "RATE"] },

    RATE: { type: "fn", name: "RATE", cat: "Finance",
      does: "The interest rate per period implied by a loan or investment: the rate that makes the payments and amounts balance. Excel finds it by trial and error.",
      syntax: "RATE(nper, pmt, pv, [fv], [type], [guess])",
      args: [
        { n: "nper", means: "Number of periods.", eg: "<code>12</code>" },
        { n: "pmt", means: "Payment each period (opposite sign to pv). 0 if none.", eg: "<code>-9500</code>" },
        { n: "pv", means: "Amount at the start.", eg: "<code>100000</code>" },
        { n: "fv", req: false, means: "Amount at the end.", eg: "" },
        { n: "type", req: false, means: "0 end (default), 1 start.", eg: "" },
        { n: "guess", req: false, means: "A starting guess, default 10%. Try a different one if RATE returns #NUM!.", eg: "" }
      ],
      returns: "The rate <b>per period</b>. For monthly payments, × 12 gives the nominal annual rate; EFFECT gives the true annual rate.",
      examples: [
        { f: "=RATE(12, -9500, 100000)", fmt: PCT2, why: "A lender gives 100,000 and wants 9,500 a month for 12 months: 2.08% a month." },
        { f: "=RATE(12, -9500, 100000)*12", fmt: PCT2, why: "Nominal annual rate: 24.9%." },
        { f: "=EFFECT(RATE(12, -9500, 100000)*12, 12)", fmt: PCT2, why: "True annual cost: 27.96%. Much more than the \"14% flat\" (114,000 repaid on 100,000) it might be advertised as." },
        { f: "=RATE(3, 0, -250000, 332640)", fmt: PCT2, why: "Growth rate (CAGR) from 250,000 to 332,640 in 3 years." }
      ],
      uses: ["The real cost of a loan offer, hire purchase or a mobile loan.", "The return on an investment with fixed payments.", "Compound annual growth rate (CAGR)."],
      mistakes: ["Forgetting it's per period: a monthly RATE of 2% is not 2% a year.", "Same sign on pmt and pv gives #NUM!."],
      related: ["IRR", "NPER", "EFFECT"] },

    EFFECT: { type: "fn", name: "EFFECT", cat: "Finance",
      does: "Converts a nominal annual rate into the effective annual rate, given how many times a year interest compounds. NOMINAL does the reverse.",
      syntax: "EFFECT(nominal_rate, npery)",
      args: [
        { n: "nominal_rate", means: "The quoted annual rate.", eg: "<code>14%</code>" },
        { n: "npery", means: "Compounding periods a year.", eg: "<code>12</code>" }
      ],
      returns: "The effective annual rate.",
      examples: [
        { f: "=EFFECT(14%, 12)", fmt: PCT2, why: "Monthly compounding." },
        { f: "=EFFECT(14%, 4)", fmt: PCT2, why: "Quarterly compounding." },
        { f: "=NOMINAL(14.93%, 12)", fmt: PCT2, why: "Back to the nominal rate." }
      ],
      uses: ["Comparing loan or deposit offers with different compounding."],
      related: ["RATE"] },

    IPMT: { type: "fn", name: "IPMT", cat: "Finance",
      does: "The <b>interest</b> part of one particular payment on a loan with equal payments.",
      syntax: "IPMT(rate, per, nper, pv, [fv], [type])",
      args: [
        { n: "rate", means: "Rate per period.", eg: "<code>1%</code>" },
        { n: "per", means: "Which payment: 1 for the first, up to nper.", eg: "<code>1</code>" },
        { n: "nper", means: "Total number of payments.", eg: "<code>12</code>" },
        { n: "pv", means: "Loan amount.", eg: "<code>600000</code>" },
        { n: "fv", req: false, means: "Balance at the end; default 0.", eg: "" },
        { n: "type", req: false, means: "0 end (default), 1 start.", eg: "" }
      ],
      returns: "The interest in that payment, negative (you pay it).",
      examples: [
        { f: "=IPMT(1%, 1, 12, 600000)", fmt: P2, why: "Month 1: 1% of the full 600,000." },
        { f: "=IPMT(1%, 12, 12, 600000)", fmt: P2, why: "Month 12: the balance is small, so the interest is small." },
        { f: "=PPMT(1%, 1, 12, 600000)", fmt: P2, why: "PPMT gives the principal part of month 1." },
        { f: "=IPMT(1%,1,12,600000)+PPMT(1%,1,12,600000)", fmt: P2, why: "Interest + principal = the full payment, every month." }
      ],
      uses: ["Interest expense for the income statement in a given year.", "Checking an amortisation schedule built by hand."],
      mistakes: ["per must be between 1 and nper, or #NUM!."],
      related: ["PPMT", "PMT"] },

    PPMT: { type: "fn", name: "PPMT", cat: "Finance",
      does: "The <b>principal</b> part of one particular payment: the amount that reduces the loan balance.",
      syntax: "PPMT(rate, per, nper, pv, [fv], [type])",
      args: [
        { n: "rate", means: "Rate per period.", eg: "<code>1%</code>" },
        { n: "per", means: "Which payment.", eg: "<code>1</code>" },
        { n: "nper", means: "Total number of payments.", eg: "<code>12</code>" },
        { n: "pv", means: "Loan amount.", eg: "<code>600000</code>" },
        { n: "fv", req: false, means: "Default 0.", eg: "" },
        { n: "type", req: false, means: "Default 0.", eg: "" }
      ],
      returns: "The principal repaid in that payment, negative.",
      examples: [
        { f: "=PPMT(1%, 1, 12, 600000)", fmt: P2, why: "Month 1 principal." },
        { f: "=PPMT(1%, 12, 12, 600000)", fmt: P2, why: "Month 12 principal: most of the payment." }
      ],
      uses: ["The loan repayment line in a cash flow statement."],
      related: ["IPMT", "PMT"] },

    NPV: { type: "fn", name: "NPV", cat: "Finance",
      does: "Discounts a series of cash flows to today and adds them up. Important: Excel's NPV assumes the <b>first value is one period from now</b>. So the year-0 investment must be added <b>outside</b> the function.",
      syntax: "NPV(rate, value1, [value2], ...)",
      args: [
        { n: "rate", means: "Discount rate per period.", eg: "<code>10%</code>" },
        { n: "value1", means: "The cash flows from period 1 onwards: a range or separate values, in time order.", eg: "<code>D5:H5</code> (years 1 to 5)" },
        { n: "value2, ...", req: false, means: "More cash flows. Blanks and text are ignored, which shifts the timing, so fill empty years with 0.", eg: "" }
      ],
      returns: "The present value of value1… at the start of period 1, i.e. today.",
      how: ["Divides the first value by (1 + rate), the second by (1 + rate)², and so on.", "Adds them up.", "You then add the year-0 cash flow (not discounted): <code>=NPV(rate, years1to5) + year0</code>."],
      sheet: PROJ_SHEET,
      examples: [
        { f: "=NPV(B3, D5:H5) + C5", fmt: NUM, why: "Correct: discount years 1 to 5, then add the year-0 investment." },
        { f: "=NPV(B3, C5:H5)", fmt: NUM, why: "The year-0 trap: including C5 inside NPV discounts the investment by a year and everything else by one year too many. The answer is wrong by 8,936." },
        { f: "=NPV(B3, D5:H5)", fmt: NUM, why: "Just the present value of the inflows." },
        { f: "=NPV(14%, D5:H5) + C5", fmt: NUM, why: "At a higher discount rate the NPV turns negative." }
      ],
      uses: ["Project appraisal (capital budgeting).", "DCF valuation of a company (Week 6).", "Value of any uneven series of cash flows."],
      mistakes: ["The year-0 trap above: the most common NPV error in finance interviews and real models.", "Mixing an annual rate with monthly cash flows.", "Empty cells in the range: NPV skips them, so later cash flows are discounted too little."],
      related: ["IRR", "XNPV", "PV"] },

    IRR: { type: "fn", name: "IRR", cat: "Finance",
      does: "Internal rate of return: the discount rate at which the NPV of a series of cash flows is exactly zero. Unlike NPV, the range <b>includes</b> the year-0 cash flow.",
      syntax: "IRR(values, [guess])",
      args: [
        { n: "values", means: "All cash flows from year 0, in time order, equally spaced. Must contain at least one negative and one positive.", eg: "<code>C5:H5</code>" },
        { n: "guess", req: false, means: "Where to start searching; default 10%. Change it to find a different IRR when there are several, or if you get #NUM!.", eg: "<code>0.3</code>" }
      ],
      returns: "The rate per period (per year for annual cash flows).",
      how: ["Excel tries a rate, works out the NPV, and adjusts the rate up or down.", "It repeats until the NPV is (almost exactly) 0.", "If it can't find one within 20 tries, it returns #NUM!."],
      sheet: PROJ_SHEET,
      examples: [
        { f: "=IRR(C5:H5)", fmt: PCT2, why: "The warehouse project returns 13.75% a year." },
        { f: "=ROUND(NPV(IRR(C5:H5), D5:H5) + C5, 2)", why: "Proof: discounting at the IRR gives an NPV of 0 (rounded to cents, as the raw answer has tiny decimals)." },
        { f: '=IF(IRR(C5:H5) > B3, "Accept", "Reject")', why: "IRR above the 10% hurdle." }
      ],
      uses: ["Return on a project or investment, compared with the hurdle rate.", "Private equity and property: IRR is the headline return measure."],
      mistakes: ["Cash flows that change sign more than once can have several IRRs. Check with NPV.", "Using IRR to choose between projects of different size (see L11).", "Unequal time gaps between cash flows: use XIRR."],
      related: ["NPV", "XIRR", "RATE"] },

    XNPV: { type: "fn", name: "XNPV", cat: "Finance",
      does: "NPV for cash flows on specific dates, which need not be a year apart. It discounts each cash flow by the exact time from the <b>first date</b>, in days ÷ 365. The first cash flow is not discounted, so year 0 goes <b>inside</b> the range here.",
      syntax: "XNPV(rate, values, dates)",
      args: [
        { n: "rate", means: "Annual discount rate.", eg: "<code>12%</code>" },
        { n: "values", means: "All cash flows, including the first one.", eg: "<code>B4:B7</code>" },
        { n: "dates", means: "The date of each cash flow, same size as values. The first date is \"today\" for the calculation.", eg: "<code>A4:A7</code>" }
      ],
      returns: "The present value at the first date.",
      sheet: DATED_SHEET,
      examples: [
        { f: "=XNPV(12%, B4:B7, A4:A7)", fmt: NUM, why: "Each cash flow discounted by its exact time from 1 Dec 2026." },
        { f: "=NPV(12%, B5:B7) + B4", fmt: NUM, why: "Ordinary NPV treats them as exactly a year apart. The real gaps are shorter, so it understates the value." }
      ],
      uses: ["Real deals and investments where cash arrives on actual dates.", "Valuation at a date that isn't a year-end."],
      mistakes: ["Dates stored as text give #VALUE!.", "XNPV includes the first cash flow; NPV doesn't. Don't add year 0 twice."],
      related: ["NPV", "XIRR"] },

    XIRR: { type: "fn", name: "XIRR", cat: "Finance",
      does: "IRR for cash flows on specific dates: the annual rate at which XNPV equals zero.",
      syntax: "XIRR(values, dates, [guess])",
      args: [
        { n: "values", means: "All cash flows, with at least one negative and one positive.", eg: "<code>B4:B7</code>" },
        { n: "dates", means: "The matching dates.", eg: "<code>A4:A7</code>" },
        { n: "guess", req: false, means: "Starting guess, default 10%.", eg: "" }
      ],
      returns: "An annual rate.",
      sheet: DATED_SHEET,
      examples: [
        { f: "=XIRR(B4:B7, A4:A7)", fmt: PCT2, why: "The annual return on the dated cash flows." },
        { f: "=ROUND(XNPV(XIRR(B4:B7, A4:A7), B4:B7, A4:A7), 2)", why: "Proof: XNPV at the XIRR is 0." }
      ],
      uses: ["Investment returns with irregular contributions and withdrawals (a unit trust, a SACCO, private equity)."],
      related: ["IRR", "XNPV"] },

    DATE: { type: "fn", name: "DATE", cat: "Date",
      does: "Builds a date from a year, a month and a day, and returns Excel's date number. The safest way to put a date into a formula.",
      syntax: "DATE(year, month, day)",
      args: [
        { n: "year", means: "Four-digit year.", eg: "<code>2026</code>" },
        { n: "month", means: "1 to 12. Larger numbers roll into the next year: month 13 = January of the next year.", eg: "<code>12</code>" },
        { n: "day", means: "Day of the month.", eg: "<code>1</code>" }
      ],
      returns: "A date number, shown as a date once formatted.",
      examples: [
        { f: "=DATE(2026, 12, 1)", fmt: DATEF, why: "Formatted as a date." },
        { f: "=DATE(2026, 12, 1)", why: "The number Excel actually stores." },
        { f: "=DATE(2026, 12+3, 1)", fmt: DATEF, why: "Month 15 rolls into March of the next year." },
        { f: "=DATE(2027,3,15)-DATE(2026,12,1)", why: "Days between two dates." }
      ],
      related: ["XNPV", "XIRR"] }
  };

  /* ---------- Lessons ---------- */
  Course.addWeek(2, {
    intro: "Money has a time value. This week you learn to move money through time with Excel's finance functions, price a loan and build its repayment schedule, then judge an investment with NPV, IRR and payback.",
    duration: "3.5 hours with your tutor + 3 hours practice",
    objectives: [
      "Explain why KES 1 today is worth more than KES 1 next year, and compound and discount by hand",
      "Use PV, FV, PMT, NPER and RATE with the right periods and signs",
      "Build a loan amortisation schedule and check it with IPMT and PPMT",
      "Value a project with NPV (and avoid the year-0 trap), IRR, payback and discounted payback",
      "Handle real dates with XNPV and XIRR, and choose between competing projects"
    ],
    files: [{ name: "Week2_Practice.xlsx", href: "downloads/Week2_Practice.xlsx", ext: "xlsx", note: "Save a copy as Week2_<your name>.xlsx and work in that copy" }],
    slots: [
      { label: "Session 1", length: "2 hours", items: [
        { t: "0:00", lesson: "w2-start", note: "Plan for today, open the workbook" },
        { t: "0:05", lesson: "w2-check", note: "15 minutes, no notes" },
        { t: "0:20", lesson: "w2-l1" }, { t: "0:40", lesson: "w2-l2" },
        { t: "1:05", title: "Break", note: "5 minutes away from the screen" },
        { t: "1:10", lesson: "w2-l3" }, { t: "1:30", lesson: "w2-l4" }, { t: "1:45", lesson: "w2-l5", note: "Finish the schedule at home if needed" }
      ] },
      { label: "Session 2", length: "1.5 hours", items: [
        { t: "0:00", lesson: "w2-l6" }, { t: "0:15", lesson: "w2-l7" }, { t: "0:30", lesson: "w2-l8" },
        { t: "0:50", lesson: "w2-l9" }, { t: "1:05", lesson: "w2-l10" }, { t: "1:15", lesson: "w2-l11" }, { t: "1:27", lesson: "w2-homework", note: "What's due next Wednesday" }
      ] }
    ],
    functions: [],
    groups: [
      /* ============================================================ BEFORE YOU START */
      { title: "Before you start", session: 0, lessons: [
        { id: "w2-start", num: "", title: "Start here: Week 2", time: "5 min", type: "Overview",
          lede: "Week 1 taught you to build a model. This week the model starts answering finance questions: what is this loan really costing, and is this investment worth it?",
          keywords: "week 2 plan workbook overview time value of money",
          blocks: [
            { type: "h", text: "What you'll be able to do by the end" },
            { type: "list", items: ["Move any amount of money forward (compound) or back (discount) in time.", "Work out a loan's instalment, how long it takes, or its true interest rate.", "Build a repayment schedule that ends at exactly zero.", "Decide whether to invest using NPV, IRR and payback, and explain why."] },
            { type: "callout", kind: "finance", title: "Why this matters", html: "Every valuation, loan, lease, bond and investment decision you meet in finance is built on the ideas in this week. A DCF valuation (your Week 6 portfolio project) is just a large NPV." },
            { type: "h", text: "Today's plan" },
            { type: "timeline" },
            { type: "h", text: "Get the workbook" },
            { type: "files", items: [{ name: "Week2_Practice.xlsx", href: "downloads/Week2_Practice.xlsx", note: "Week 2 practice workbook: one tab per lesson, with self-checks" }] },
            { type: "steps", id: "w2-start-steps", title: "Before the session", items: [
              { html: "Download <b>Week2_Practice.xlsx</b> and save a copy as <b>Week2_&lt;your name&gt;.xlsx</b>." },
              { html: "Open the <b>Start</b> tab and read how the tabs work. Each tab matches a lesson here (L1 to L11)." },
              { html: "Check Week 1's homework file has been sent." }
            ] }
          ] },
        { id: "w2-check", num: "", title: "Checkpoint 1: Week 1", time: "15 min", type: "Quiz",
          lede: "Twelve questions on Week 1, no notes. Aim for 10 or more. Anything you miss is worth re-reading before we build on it.",
          keywords: "checkpoint test week 1 review formats references lookup",
          blocks: [
            { type: "quiz", id: "w2-check-quiz", title: "Checkpoint 1", questions: [
              { q: "A cell holds −1250.5 and is formatted <code>#,##0;(#,##0);\"-\"</code>. What shows?", options: ["-1,251", "(1,251)", "(1,250.5)"], answer: 1, why: "Second section for negatives: brackets, no decimals, so it rounds to 1,251 for display." },
              { q: "Which code shows 0.0825 as 8.3%?", options: ["<code>0.0</code>", "<code>0.0%</code>", "<code>0%</code>"], answer: 1, why: "% multiplies by 100; one decimal place." },
              { q: "<code>=C5*$B$2</code> in C6 is copied to E8. What does E8 hold?", options: ["<code>=E7*$B$2</code>", "<code>=E7*$D$4</code>", "<code>=C5*$B$2</code>"], answer: 0, why: "Two columns right, two rows down: C5 → E7; $B$2 is locked." },
              { kind: "fill", q: "Fill the gap so the row of B4 is locked when copied:", before: "=A5*B", after: "4", answers: ["$"], why: "A $ before the row number locks the row." },
              { q: "<code>=ROUND(18745.6, -2)</code> gives…", options: ["18,745.60", "18,700", "18,800"], answer: 1, why: "−2 rounds to the nearest hundred; 45.6 rounds down." },
              { q: "Units in B2:B4 and prices in C2:C4. Total revenue in one cell?", options: ["<code>=SUM(B2:C4)</code>", "<code>=SUMPRODUCT(B2:B4,C2:C4)</code>", "<code>=PRODUCT(B2:B4,C2:C4)</code>"], answer: 1, why: "Units × price row by row, then added." },
              { q: "<code>=IF(AND(C5&gt;0, D5&gt;=1.5), \"Yes\", \"No\")</code> with C5 = 200 and D5 = 1.4 gives…", options: ["Yes", "No"], answer: 1, why: "AND needs both; 1.4 is below 1.5." },
              { q: "Which formula finds the share price for the company named in B14?", options: ["<code>=XLOOKUP(B14, D6:D11, B6:B11)</code>", "<code>=XLOOKUP(B14, B6:B11, D6:D11)</code>", "<code>=XLOOKUP(B6:B11, B14, D6:D11)</code>"], answer: 1, why: "Find this (B14), in here (names), bring back that (prices)." },
              { q: "<code>=MATCH(\"Chui Tech\", B6:B11, 0)</code> returns…", options: ["The share price", "The position in the list", "The row number on the sheet"], answer: 1, why: "MATCH gives a position within the range." },
              { q: "Why is <code>=VLOOKUP(x, A6:E11, 4)</code> risky?", options: ["It can't return numbers", "Without FALSE it does an approximate match", "It only works on sorted text"], answer: 1, why: "The missing fourth argument means approximate match, which can return a wrong value silently." },
              { q: "<code>=SUMIF(B4:B11, \"Opex\", D4:D11)</code> adds…", options: ["All of D4:D11", "Amounts in D where B says Opex", "How many Opex rows there are"], answer: 1, why: "Test B, add matching rows of D." },
              { q: "Revenue grows from 250,000 to 280,000. Which formula gives the growth rate?", options: ["<code>=280000-250000</code>", "<code>=280000/250000-1</code>", "<code>=250000/280000</code>"], answer: 1, why: "New ÷ old − 1 = 12%." }
            ] }
          ] }
      ] },

      /* ============================================================ SESSION 1 */
      { title: "Time value of money", session: 1, sub: "Session 1, about 2 hours", lessons: [
        { id: "w2-l1", num: "L1", title: "Compounding and discounting", time: "20 min", sheet: "L1 TVM",
          lede: "Money grows when it's invested. Compounding moves an amount forward in time; discounting brings a future amount back to today.",
          keyIdea: "Forward: × (1 + r)<sup>n</sup>. Back to today: ÷ (1 + r)<sup>n</sup>.",
          objectives: ["Explain the time value of money in one sentence", "Compound year by year and with one formula", "Work out discount factors and present values", "Tell nominal from effective rates"],
          keywords: "time value of money compound interest discount factor present value future value effective rate",
          blocks: [
            C.tvm,
            { type: "sheet", id: "w2-l1-try", title: "Try it: KES 100,000 at 10%", cols: "A:H", rows: [4, 13], start: "D8",
              intro: "Year 0 is filled in. Write the year 1 column (D8:D10), copy it to year 5, then answer B13.",
              tasks: ["D8: last year's value × (1 + rate)", "D9: the same, with one formula: amount × (1 + rate)^year", "D10: the discount factor, 1 ÷ (1 + rate)^year", "Press <b>Copy D8:D10 to year 5</b>", "B13: what is 161,051 in 5 years worth today?"],
              cells: { A4: "Amount invested today", B4: 100000, A5: "Interest rate a year", B5: 0.10, A7: "Year", C7: 0, D7: 1, E7: 2, F7: 3, G7: 4, H7: 5,
                A8: "Value, year by year", C8: "=B4", A9: "Value, one formula", C9: "=$B$4*(1+$B$5)^C7", A10: "Discount factor", C10: "=1/(1+$B$5)^C7",
                A12: "Received in 5 years", B12: 161051, A13: "Worth today" },
              formats: { B4: NUM, B5: PCT, "C8:H9": NUM, "C10:H10": DF, B12: NUM, B13: NUM }, styles: { input: ["B4:B5", "B12"], head: ["A7:H7"], bold: ["A13"] },
              editable: ["D8:D10", "B13"], fill: { from: "D8:D10", to: "D8:H10", label: "Copy D8:D10 to year 5" },
              solution: { D8: "=C8*(1+$B$5)", D9: "=$B$4*(1+$B$5)^D7", D10: "=1/(1+$B$5)^D7", B13: "=B12/(1+B5)^5" },
              explain: { D8: "Year 0's 100,000 grows by 10%: 110,000. The rate is locked so it stays on B5 when copied.", D9: "Straight to any year: 100,000 × 1.1<sup>1</sup>. Both rows agree, which proves compounding is just repeated multiplying.", D10: "1 ÷ 1.1 = 0.9091: a shilling next year is worth about 91 cents today.", B13: "161,051 ÷ 1.1<sup>5</sup> = 100,000. Discounting undoes compounding. Or: <code>=B12*H10</code>.", fill: "Year 5: 161,051 in both rows, discount factor 0.6209.", result: "Change B5 to 12% and watch every year update." },
              check: { cells: ["D8:H10", "B13"], success: "Year 5: KES 161,051, and its value today is KES 100,000. Compounding and discounting are the same calculation in opposite directions." },
              hints: ["Point at the year before (C8) and the locked rate ($B$5).", "For D9 and D10 the year comes from row 7: D7.", "B13: divide by (1 + rate) to the power 5."] },
            C.rates,
            { type: "steps", id: "w2-l1-steps", title: "Follow along in Excel", sheet: "L1 TVM", items: [
              { html: "On the <b>L1 TVM</b> tab, build rows 8 to 10 as above and copy them to year 5." },
              { html: "In B16, work out the effective rate of 12% compounded monthly.", code: "=EFFECT(12%,12)" },
              { html: "In B17, check it with the formula.", code: "=(1+12%/12)^12-1" },
              { html: "All Check cells should say ✓ Correct." }
            ] },
            { type: "quiz", id: "w2-l1-quiz", questions: [
              { q: "KES 200,000 at 9% for 2 years grows to…", options: ["236,000", "237,620", "218,000"], answer: 1, why: "200,000 × 1.09² = 237,620. Simple interest would give 236,000." },
              { q: "The discount factor for year 3 at 10% is…", options: ["0.7513", "0.7000", "1.3310"], answer: 0, why: "1 ÷ 1.1³ = 0.7513." },
              { q: "12% a year compounded monthly is effectively…", options: ["12.00%", "12.68%", "13.00%"], answer: 1, why: "(1.01)^12 − 1 = 12.68%." }
            ] }
          ] },

        { id: "w2-l2", num: "L2", title: "FV and PV: Excel's TVM functions", time: "25 min", sheet: "L2 FV PV",
          lede: "Five functions solve every equal-payment problem. They share the same inputs and the same sign rule, so learn the rule once.",
          keyIdea: "Money out is negative, money in is positive. Rate and periods must match: monthly with monthly.",
          objectives: ["Name the five TVM inputs: rate, nper, pmt, pv, fv (and type)", "Apply the sign convention", "Use FV for savings and PV for targets and pensions"],
          keywords: "fv pv future value present value sign convention rate nper pmt type annuity",
          blocks: [
            C.sign, F.FV, F.PV,
            { type: "sheet", id: "w2-l2-try", title: "Try it: a savings plan and a target", cols: "A:B", rows: [3, 18], start: "B9",
              intro: "Block 1: a savings plan. Block 2: how much to invest today for a target. Watch the signs.",
              tasks: ["B9: rate per month", "B10: number of months", "B11: FV of the plan (deposits are money out, so negative)", "B17: PV needed today for B14 in B15 years at B16"],
              cells: { A3: "1. Savings plan", A4: "Annual rate", B4: 0.09, A5: "Years", B5: 3, A6: "Monthly deposit", B6: 5000, A7: "Deposit today", B7: 50000, A9: "Rate per month", A10: "Months", A11: "Balance at the end",
                A13: "2. Target", A14: "Target amount", B14: 1000000, A15: "Years", B15: 4, A16: "Annual rate", B16: 0.11, A17: "Invest today" },
              formats: { B4: PCT, B6: NUM, B7: NUM, B9: "0.000%", B11: P2, B14: NUM, B16: PCT, B17: P2 }, styles: { head: ["A3", "A13"], input: ["B4:B7", "B14:B16"], bold: ["A11", "A17"] },
              editable: ["B9:B11", "B17"],
              solution: { B9: "=B4/12", B10: "=B5*12", B11: "=FV(B9,B10,-B6,-B7)", B17: "=PV(B16,B15,0,B14)" },
              explain: { B9: "9% ÷ 12 = 0.75% a month.", B10: "3 × 12 = 36 months. Rate and periods now match.", B11: "Deposits go out (−5,000 a month, −50,000 today), so the balance coming back is positive: 271,195.85.", B17: "The target comes to you (+1,000,000), so the amount to invest today comes out negative: −658,730.97. That minus means \"you pay this\"." },
              check: { cells: ["B9:B11", "B17"], require: [{ cell: "B11", has: "FV(" }, { cell: "B17", has: "PV(" }], success: "The plan grows to 271,195.85, of which 230,000 is deposits and 41,195.85 interest. To have 1,000,000 in 4 years at 11%, invest 658,730.97 today (shown negative: money out)." },
              hints: ["Monthly rate = annual rate ÷ 12; months = years × 12.", "FV(rate, nper, pmt, pv): <code>=FV(B9, B10, -B6, -B7)</code>.", "PV(rate, nper, pmt, fv): there's no regular payment, so pmt is 0."] },
            { type: "quiz", id: "w2-l2-quiz", questions: [
              { q: "In <code>=FV(9%/12, 36, -5000, -50000)</code>, why are the deposits negative?", options: ["Excel needs all inputs negative", "They are money you pay out", "To make the rate monthly"], answer: 1, why: "Out is negative, in is positive. The FV is positive: it comes back to you." },
              { q: "You want 500,000 in 3 years at 12%. Which formula gives what to invest today?", options: ["<code>=PV(12%,3,0,500000)</code>", "<code>=FV(12%,3,0,500000)</code>", "<code>=PV(12%/12,3,0,500000)</code>"], answer: 0, why: "PV of a single future amount. Annual rate, 3 years: the periods match." },
              { q: "A monthly plan over 5 years at 10%: nper is…", options: ["5", "60", "10"], answer: 1, why: "5 years × 12 months." }
            ] }
          ] },

        { id: "w2-l3", num: "L3", title: "Loan repayments with PMT", time: "20 min", sheet: "L3 PMT",
          lede: "Every loan quote comes down to one number: the instalment. PMT finds it, and from it the true cost of borrowing.",
          keyIdea: "<code>=PMT(rate per period, number of payments, loan)</code>. Total interest = all payments − the loan.",
          objectives: ["Work out a loan instalment with PMT", "Work out total repaid and total interest", "Compare monthly and annual payments, and nominal and effective rates"],
          keywords: "pmt loan instalment payment interest mortgage car loan effective rate",
          blocks: [
            C.annuity, F.PMT, F.EFFECT,
            { type: "sheet", id: "w2-l3-try", title: "Try it: the car loan", cols: "A:B", rows: [3, 15], start: "B8",
              intro: "Mavuno Traders is buying a delivery van with a bank loan. Work out what it really costs.",
              tasks: ["B8: monthly rate", "B9: number of payments", "B10: monthly instalment, shown positive", "B11: total repaid", "B12: total interest", "B13: effective annual rate", "B15: instalment if paid once a year, shown positive"],
              cells: { A3: "Loan amount, KES", B3: 2400000, A4: "Annual rate", B4: 0.14, A5: "Years", B5: 5, A8: "Monthly rate", A9: "Number of payments", A10: "Monthly instalment", A11: "Total repaid", A12: "Total interest", A13: "Effective annual rate", A15: "Annual instalment instead" },
              formats: { B3: NUM, B4: PCT, B8: "0.000%", B10: P2, B11: NUM, B12: NUM, B13: PCT2, B15: P2 }, styles: { input: ["B3:B5"], bold: ["A10", "A12"] },
              editable: ["B8:B13", "B15"],
              solution: { B8: "=B4/12", B9: "=B5*12", B10: "=-PMT(B8,B9,B3)", B11: "=B10*B9", B12: "=B11-B3", B13: "=EFFECT(B4,12)", B15: "=-PMT(B4,B5,B3)" },
              explain: { B8: "14% ÷ 12 = 1.167% a month.", B9: "5 years × 12 = 60 payments.", B10: "PMT is negative (you pay it); the minus in front shows 55,843.80 as a positive cost.", B11: "60 × 55,843.80 = 3,350,628.", B12: "3,350,628 − 2,400,000 = 950,628 of interest: 40% on top of the price of the van.", B13: "Monthly compounding makes 14% cost 14.93% a year.", B15: "One payment a year: 699,080.51. Five of those total 3,495,403, more than monthly, because the balance falls more slowly." },
              check: { cells: ["B8:B13", "B15"], require: [{ cell: "B10", has: "PMT(" }, { cell: "B13", has: "EFFECT(" }], success: "Instalment KES 55,843.80 a month; the van costs 950,628 in interest over 5 years, an effective 14.93% a year." },
              hints: ["Instalment: <code>=-PMT(B8, B9, B3)</code>. The minus turns it positive.", "Total interest = total repaid − the loan.", "Annual instalment uses the annual rate and years: <code>=-PMT(B4, B5, B3)</code>."] },
            { type: "quiz", id: "w2-l3-quiz", questions: [
              { q: "<code>=PMT(14%, 60, 2400000)</code> is wrong because…", options: ["The rate is annual but the periods are months", "PMT needs a negative loan", "60 is too many payments"], answer: 0, why: "Use 14%/12 with 60 months." },
              { q: "Total interest on a loan equals…", options: ["Rate × loan", "Instalment × number of payments − loan", "The first month's interest × 60"], answer: 1, why: "Everything you pay, minus what you borrowed." },
              { q: "Early instalments on a loan are mostly…", options: ["Interest", "Principal", "Half and half"], answer: 0, why: "Interest is charged on the balance, which is highest at the start." }
            ] }
          ] },

        { id: "w2-l4", num: "L4", title: "How long and what rate: NPER and RATE", time: "15 min", sheet: "L4 NPER RATE",
          lede: "The same equation answers two more questions: how many payments until a loan is cleared, and what interest rate an offer really charges.",
          keyIdea: "NPER finds the number of periods. RATE finds the rate per period; × 12 for nominal, EFFECT for the true annual rate.",
          objectives: ["Find how long a loan takes with NPER", "Find the true rate of an offer with RATE", "Use RATE to find a growth rate (CAGR)"],
          keywords: "nper rate number of periods interest rate cagr mobile loan true cost",
          blocks: [
            F.NPER, F.RATE,
            { type: "sheet", id: "w2-l4-try", title: "Try it: two loan offers", cols: "A:B", rows: [3, 17], start: "B8",
              intro: "Offer 1: a business loan where you choose the instalment. Offer 2: a quick loan quoted as a fixed monthly repayment.",
              tasks: ["B8: months to repay offer 1", "B9: number of payments (round up)", "B14: monthly rate of offer 2", "B15: nominal annual rate", "B16: effective annual rate", "B17: revenue growth rate (CAGR) from 250,000 to 332,640 over 3 years, using RATE"],
              cells: { A3: "Offer 1", A4: "Loan", B4: 500000, A5: "Annual rate", B5: 0.15, A6: "Monthly instalment", B6: 20000, A8: "Months to repay", A9: "Number of payments",
                A11: "Offer 2", A12: "You receive", B12: 100000, A13: "You repay each month for 12 months", B13: 9500, A14: "Monthly rate", A15: "Nominal annual rate", A16: "Effective annual rate", A17: "CAGR 250,000 → 332,640, 3 years" },
              formats: { B4: NUM, B5: PCT, B6: NUM, B8: "0.00", B12: NUM, B13: NUM, "B14:B17": PCT2 }, styles: { head: ["A3", "A11"], input: ["B4:B6", "B12:B13"] },
              editable: ["B8:B9", "B14:B17"],
              solution: { B8: "=NPER(B5/12,-B6,B4)", B9: "=ROUNDUP(B8,0)", B14: "=RATE(12,-B13,B12)", B15: "=B14*12", B16: "=EFFECT(B15,12)", B17: "=RATE(3,0,-250000,332640)" },
              explain: { B8: "Monthly rate, the instalment going out (−20,000), the loan coming in (+500,000): 30.16 months.", B9: "A part-month still needs a payment: 31.", B14: "12 payments of 9,500 going out against 100,000 received: 2.08% a month.", B15: "× 12 = 24.9% nominal.", B16: "Compounded monthly that is 27.96% a year: the true cost.", B17: "No payments, 250,000 out, 332,640 back after 3 years: 9.99% a year." },
              check: { cells: ["B8:B9", "B14:B17"], require: [{ cell: "B8", has: "NPER(" }, { cell: "B14", has: "RATE(" }, { cell: "B17", has: "RATE(" }], success: "Offer 1 takes 31 payments. Offer 2 looks like \"9.5% a month\" but really costs 27.96% a year. CAGR: 9.99%." },
              hints: ["NPER(rate, pmt, pv): the instalment is money out, so −B6.", "RATE(nper, pmt, pv): <code>=RATE(12, -B13, B12)</code>.", "For CAGR there's no payment: <code>=RATE(3, 0, -250000, 332640)</code>."] },
            { type: "quiz", id: "w2-l4-quiz", questions: [
              { q: "NPER returns #NUM! for a loan. The most likely cause is…", options: ["The instalment doesn't even cover the interest", "The rate is too low", "The loan is too small"], answer: 0, why: "If interest is more than the instalment, the balance never falls. Or pmt and pv have the same sign." },
              { q: "RATE with monthly payments returns 1.5%. The nominal annual rate is…", options: ["1.5%", "18%", "19.56%"], answer: 1, why: "1.5% × 12 = 18% nominal. The effective rate is 19.56%." }
            ] }
          ] },

        { id: "w2-l5", num: "L5", title: "Build a loan schedule", time: "25 min", sheet: "L5 Schedule", type: "Project",
          lede: "A schedule shows every payment split into interest and principal, with the balance falling to zero. It's how loans appear in every model.",
          keyIdea: "Interest = opening balance × rate. Principal = payment − interest. Closing = opening − principal. Last closing balance = 0.",
          objectives: ["Build a 12-month amortisation schedule from one row", "Check it with IPMT and PPMT", "Prove it with totals and a zero balance"],
          keywords: "amortisation schedule loan interest principal balance ipmt ppmt debt schedule",
          blocks: [
            C.amort, F.IPMT, F.PPMT,
            { type: "sheet", id: "w2-l5-try", title: "Try it: a 12-month loan schedule", cols: "A:G", rows: [3, 22], start: "C10",
              intro: "Loan of 600,000 at 12% a year, 12 monthly payments. The opening balances in column B are already linked. Write row 10, copy it down, then total.",
              tasks: ["C10: the payment, shown positive (lock the inputs)", "D10: interest = opening balance × monthly rate", "E10: principal = payment − interest", "F10: closing balance = opening − principal", "G10: check D10 with IPMT (shown positive)", "Press <b>Copy row 10 down</b>", "D22 and E22: total interest and total principal"],
              cells: merge({ A3: "Loan", C3: 600000, A4: "Annual rate", C4: 0.12, A5: "Monthly rate", C5: "=C4/12", A6: "Months", C6: 12,
                A9: "Month", B9: "Opening", C9: "Payment", D9: "Interest", E9: "Principal", F9: "Closing", G9: "IPMT check", A22: "Total", B10: "=C3" },
                (function () { var c = {}; for (var m = 1; m <= 12; m++) { c["A" + (9 + m)] = m; if (m > 1) c["B" + (9 + m)] = "=F" + (8 + m); } return c; })()),
              formats: { C3: NUM, C4: PCT, C5: "0.00%", "B10:G21": P2, "D22:E22": P2 }, styles: { input: ["C3:C4", "C6"], head: ["A9:G9"], bold: ["A22"], total: ["D22:E22"] },
              editable: ["C10:G10", "D22:E22"], fill: { from: "C10:G10", to: "C10:G21", label: "Copy row 10 down" },
              solution: { C10: "=-PMT($C$5,$C$6,$C$3)", D10: "=B10*$C$5", E10: "=C10-D10", F10: "=B10-E10", G10: "=-IPMT($C$5,A10,$C$6,$C$3)", D22: "=SUM(D10:D21)", E22: "=SUM(E10:E21)" },
              explain: { C10: "53,309.27 every month. Locked so every row uses the same loan inputs.", D10: "600,000 × 1% = 6,000.00.", E10: "53,309.27 − 6,000 = 47,309.27 repays the loan.", F10: "600,000 − 47,309.27 = 552,690.73, which becomes month 2's opening balance (B11).", G10: "IPMT for period A10 (month 1) agrees: 6,000.00. A10 is not locked, so each row checks its own month.", D22: "Total interest: 39,711.28.", E22: "Total principal: exactly 600,000, the loan.", fill: "Month 12 closes at 0.00. If it shows (0.00), that is a tiny rounding remainder of a fraction of a cent: still zero." },
              check: { cells: ["C10:G21", "D22:E22"], require: [{ cell: "C10", has: "PMT(" }, { cell: "G10", has: "IPMT(" }], success: "The balance reaches exactly 0 in month 12. Interest totals 39,711.28 and principal 600,000. Column G matches column D every month." },
              hints: ["Lock every input: <code>$C$5</code>, <code>$C$6</code>, <code>$C$3</code>. The balance in B10 must NOT be locked.", "Principal is what's left of the payment after interest.", "IPMT(rate, per, nper, pv): per is the month in A10. Put a minus in front."] },
            { type: "steps", id: "w2-l5-steps", title: "Follow along in Excel", sheet: "L5 Schedule", items: [
              { html: "Build row 10 on the <b>L5 Schedule</b> tab as above." },
              { html: "Select C10:G21 and press <kbd>Ctrl</kbd>+<kbd>D</kbd> to fill down." },
              { html: "Check: F21 should be 0.00 and E22 should equal the loan in C3." },
              { html: "Change the rate to 18%: the schedule still ends at 0. Set it back to 12%." }
            ] },
            { type: "quiz", id: "w2-l5-quiz", questions: [
              { q: "Month 2's opening balance is…", options: ["The loan amount", "Month 1's closing balance", "Month 1's payment"], answer: 1, why: "Each opening balance links to the closing balance above it." },
              { q: "If the last closing balance isn't 0, check first that…", options: ["The rate and periods are both monthly", "The font is black", "The total row uses AVERAGE"], answer: 0, why: "A rate that isn't per period, or the wrong number of periods, leaves a balance." }
            ] }
          ] }
      ] },

      /* ============================================================ SESSION 2 */
      { title: "Investment decisions", session: 2, sub: "Session 2, about 90 minutes", lessons: [
        { id: "w2-l6", num: "L6", title: "Discounted cash flows by hand", time: "15 min", sheet: "L6 DCF",
          lede: "Is the warehouse worth building? List its cash flows, bring each one back to today, and add them up.",
          keyIdea: "NPV = the sum of every cash flow × its discount factor. Positive: it earns more than the required return.",
          objectives: ["Lay out a cash flow timeline", "Discount each year by hand", "State the NPV decision rule"],
          keywords: "dcf discounted cash flow npv discount factor hurdle rate capital budgeting",
          blocks: [
            C.dcf,
            { type: "sheet", id: "w2-l6-try", title: "Try it: the warehouse, by hand", cols: "A:H", rows: [3, 13], start: "C9",
              intro: "Mavuno Traders can build a warehouse for KES 1,000,000. It saves 250,000 to 350,000 a year for 5 years. The required return is 10%.",
              tasks: ["C9: discount factor for year 0 (lock the rate's cell, not the year)", "C10: present value = cash flow × discount factor", "Press <b>Copy C9:C10 to year 5</b>", "B12: NPV = the sum of the present values", "B13: Accept or Reject with IF"],
              cells: merge({ A3: "Discount rate", B3: 0.10 }, { A7: "Year", A8: "Cash flow" }, (function () { var c = {}; "CDEFGH".split("").forEach(function (col, i) { c[col + 7] = i; c[col + 8] = CF[i]; }); return c; })(),
                { A9: "Discount factor", A10: "Present value", A12: "NPV", A13: "Decision" }),
              formats: { B3: PCT, "C8:H8": NUM, "C9:H9": DF, "C10:H10": NUM, B12: NUM }, styles: { input: ["B3", "C8:H8"], head: ["A7:H7"], bold: ["A12", "A13"], total: ["B12"] },
              editable: ["C9:C10", "B12:B13"], fill: { from: "C9:C10", to: "C9:H10", label: "Copy C9:C10 to year 5" },
              solution: { C9: "=1/(1+$B$3)^C7", C10: "=C8*C9", B12: "=SUM(C10:H10)", B13: '=IF(B12>0,"Accept","Reject")' },
              explain: { C9: "Year 0: 1 ÷ 1.1⁰ = 1. Today's money isn't discounted.", C10: "−1,000,000 × 1 = −1,000,000.", B12: "−1,000,000 + 227,273 + 247,934 + 262,960 + 204,904 + 155,230 = 98,301.", B13: "NPV above 0, so the project earns more than 10%: Accept.", fill: "Year 5: factor 0.6209, PV 155,230." },
              check: { cells: ["C9:H10", "B12:B13"], success: "NPV = KES 98,301. The warehouse returns more than the 10% required, adding about 98,000 of value today: accept it." },
              hints: ["Discount factor: <code>=1/(1+$B$3)^C7</code>. The year is in row 7.", "Present value: cash flow × factor.", "NPV is the SUM of row 10."] },
            { type: "quiz", id: "w2-l6-quiz", questions: [
              { q: "NPV is −15,000 at a 12% required return. This means…", options: ["The project loses 15,000 in cash", "It returns less than 12%", "It returns exactly 12%"], answer: 1, why: "A negative NPV means it doesn't earn the required return. It may still make an accounting profit." },
              { q: "Which year's cash flow is NOT discounted?", options: ["Year 0", "Year 1", "Year 5"], answer: 0, why: "Year 0 is today." }
            ] }
          ] },

        { id: "w2-l7", num: "L7", title: "NPV in Excel, and the year-0 trap", time: "15 min", sheet: "L7 NPV",
          lede: "The NPV function does the discounting in one step, with one catch that trips up professionals.",
          keyIdea: "<code>=NPV(rate, year1 to yearN) + year0</code>. Year 0 goes outside.",
          objectives: ["Use the NPV function correctly", "Spot and fix the year-0 trap", "Build an NPV sensitivity row for several discount rates"],
          keywords: "npv function year 0 trap sensitivity discount rate",
          blocks: [
            F.NPV,
            { type: "sheet", id: "w2-l7-try", title: "Try it: NPV in one cell, and a sensitivity row", cols: "A:H", rows: [3, 13], start: "B10",
              intro: "Same warehouse. First the correct NPV, then the trap, then NPV at five different discount rates.",
              tasks: ["B10: NPV with the function (year 0 outside)", "B11: the trap, year 0 inside, to see the difference", "C13: NPV at the rate in C12 (lock the cash flows)", "Press <b>Copy C13 across</b>"],
              cells: merge({ A3: "Discount rate", B3: 0.10, A7: "Year", A8: "Cash flow" }, (function () { var c = {}; "CDEFGH".split("").forEach(function (col, i) { c[col + 7] = i; c[col + 8] = CF[i]; }); return c; })(),
                { A10: "NPV, correct", A11: "NPV, year-0 trap", A12: "Discount rate", C12: 0.06, D12: 0.08, E12: 0.10, F12: 0.12, G12: 0.14, A13: "NPV" }),
              formats: { B3: PCT, "C8:H8": NUM, "B10:B11": NUM, "C12:G12": "0%", "C13:G13": NUM }, styles: { input: ["B3", "C8:H8", "C12:G12"], head: ["A7:H7", "A12:G12"], bold: ["A10"] },
              editable: ["B10:B11", "C13"], fill: { from: "C13", to: "C13:G13", label: "Copy C13 across" },
              solution: { B10: "=NPV(B3,D8:H8)+C8", B11: "=NPV(B3,C8:H8)", C13: "=NPV(C12,$D$8:$H$8)+$C$8" },
              explain: { B10: "Discount years 1 to 5 (D8:H8), then add year 0 (C8) as it is: 98,301.", B11: "Year 0 inside NPV is treated as year 1, so every cash flow is discounted one year too many: 89,365. Wrong.", C13: "The rate comes from row 12 (moves as you copy); the cash flows are locked.", fill: "NPV falls as the rate rises: 221,157 at 6% down to −6,155 at 14%. It crosses 0 between 12% and 14%: the IRR (L8)." },
              check: { cells: ["B10", "C13:G13"], require: [{ cell: "B10", has: "NPV(" }], success: "Correct NPV 98,301; the trap gives 89,365. The sensitivity row shows NPV turning negative between 12% and 14%." },
              hints: ["<code>=NPV(B3, D8:H8) + C8</code>", "For the row, lock the cash flows: <code>$D$8:$H$8</code> and <code>$C$8</code>."] },
            { type: "quiz", id: "w2-l7-quiz", questions: [
              { kind: "fill", q: "Complete the correct NPV:", before: "=NPV(B3, D8:H8)", after: "", answers: ["+C8", "+ C8"], why: "Add the year-0 cash flow outside the function." },
              { q: "As the discount rate rises, NPV…", options: ["Rises", "Falls", "Stays the same"], answer: 1, why: "Future cash flows are worth less today at a higher rate." }
            ] }
          ] },

        { id: "w2-l8", num: "L8", title: "IRR, and when it misleads", time: "20 min", sheet: "L8 IRR",
          lede: "IRR turns a project into one percentage: its own annual return. Easy to communicate, but it has blind spots.",
          keyIdea: "IRR is the rate where NPV = 0. Accept if IRR &gt; the required return. For choosing between projects, trust NPV.",
          objectives: ["Calculate IRR and prove it with NPV = 0", "Apply the IRR decision rule", "Recognise multiple IRRs and the scale problem"],
          keywords: "irr internal rate of return hurdle rate multiple irr scale reinvestment",
          blocks: [
            C.irr, F.IRR,
            { type: "sheet", id: "w2-l8-try", title: "Try it: the warehouse's IRR", cols: "A:H", rows: [3, 14], start: "B10",
              intro: "Same cash flows. Find the IRR, prove it, decide, then try a project with two IRRs.",
              tasks: ["B10: IRR of the warehouse (year 0 included)", "B11: NPV at the IRR: it should be 0", "B12: Accept if IRR is above the hurdle in B3", "B14: IRR of the clean-up project in C14:E14 with a guess of 5%"],
              cells: merge({ A3: "Hurdle rate", B3: 0.10, A7: "Year", A8: "Cash flow" }, (function () { var c = {}; "CDEFGH".split("").forEach(function (col, i) { c[col + 7] = i; c[col + 8] = CF[i]; }); return c; })(),
                { A10: "IRR", A11: "NPV at the IRR", A12: "Decision", A13: "Clean-up project", C13: "Year 0", D13: "Year 1", E13: "Year 2", A14: "IRR, guess 5%", C14: -100, D14: 230, E14: -132 }),
              formats: { B3: PCT, "C8:H8": NUM, B10: PCT2, B11: NUM, B14: PCT2 }, styles: { input: ["B3", "C8:H8", "C14:E14"], head: ["A7:H7", "C13:E13"], bold: ["A10"] },
              editable: ["B10:B12", "B14"],
              solution: { B10: "=IRR(C8:H8)", B11: "=NPV(B10,D8:H8)+C8", B12: '=IF(B10>B3,"Accept","Reject")', B14: "=IRR(C14:E14,5%)" },
              explain: { B10: "Unlike NPV, IRR takes every cash flow including year 0: 13.75%.", B11: "Discounting at 13.75% makes the NPV 0 (it may show as - or 0 because of tiny decimals). That is what IRR means.", B12: "13.75% beats the 10% hurdle: Accept. Same answer as NPV &gt; 0.", B14: "Guess 5% finds 10%. Try a guess of 30% in Excel and you'll get 20%: two IRRs, because the cash flows change sign twice. Use NPV." },
              check: { cells: ["B10:B12", "B14"], require: [{ cell: "B10", has: "IRR(" }], success: "IRR 13.75%, NPV at the IRR is 0, so accept. The clean-up project has IRRs of 10% and 20%: when signs change more than once, IRR is unreliable." },
              hints: ["<code>=IRR(C8:H8)</code>: include year 0.", "Prove it: <code>=NPV(B10, D8:H8) + C8</code>.", "IRR(values, guess): <code>=IRR(C14:E14, 5%)</code>."] },
            { type: "quiz", id: "w2-l8-quiz", questions: [
              { q: "Which range does IRR need?", options: ["Years 1 to 5 only", "All cash flows including year 0", "Only the positive cash flows"], answer: 1, why: "IRR needs the investment (negative) and the returns (positive)." },
              { q: "IRR is 9% and the required return is 10%. NPV at 10% is…", options: ["Positive", "Negative", "Zero"], answer: 1, why: "The project returns less than required." }
            ] }
          ] },

        { id: "w2-l9", num: "L9", title: "Payback and discounted payback", time: "15 min", sheet: "L9 Payback",
          lede: "Managers also ask: how soon do we get our money back? Payback answers that, using the Week 1 functions you already know.",
          keyIdea: "Payback = years before the cumulative cash flow turns positive + the part of the next year needed.",
          objectives: ["Build cumulative cash flows", "Work out payback and discounted payback with COUNTIF and INDEX", "Explain what payback ignores"],
          keywords: "payback discounted payback cumulative cash flow countif index",
          blocks: [
            C.payback,
            { type: "sheet", id: "w2-l9-try", title: "Try it: payback for the warehouse", cols: "A:H", rows: [3, 16], start: "D9",
              intro: "Row 9 is the running total. Then a formula finds where it turns positive. Rows 10 and 11 repeat it with present values.",
              tasks: ["D9: cumulative cash flow (C9 is done)", "D10: present value of this year's cash flow (C10 is done)", "D11: cumulative present value (C11 is done)", "Press <b>Copy D9:D11 to year 5</b>", "B13: years with a negative cumulative total, after year 0", "B14: payback in years", "B16: discounted payback in years"],
              cells: merge({ A3: "Discount rate", B3: 0.10, A7: "Year", A8: "Cash flow" }, (function () { var c = {}; "CDEFGH".split("").forEach(function (col, i) { c[col + 7] = i; c[col + 8] = CF[i]; }); return c; })(),
                { A9: "Cumulative", C9: "=C8", A10: "Present value", C10: "=C8/(1+$B$3)^C7", A11: "Cumulative PV", C11: "=C10", A13: "Full years still negative", A14: "Payback", A15: "Discounted: years still negative", B15: '=COUNTIF(D11:H11,"<0")', A16: "Discounted payback" }),
              formats: { B3: PCT, "C8:H11": NUM, B14: YRS, B16: YRS }, styles: { input: ["B3", "C8:H8"], head: ["A7:H7"], bold: ["A14", "A16"] },
              editable: ["D9:D11", "B13:B14", "B16"], fill: { from: "D9:D11", to: "D9:H11", label: "Copy D9:D11 to year 5" },
              solution: { D9: "=C9+D8", D10: "=D8/(1+$B$3)^D7", D11: "=C11+D10", B13: '=COUNTIF(D9:H9,"<0")', B14: "=B13+(-INDEX(D9:H9,B13))/INDEX(D8:H8,B13+1)", B16: "=B15+(-INDEX(D11:H11,B15))/INDEX(D10:H10,B15+1)" },
              explain: { D9: "Last year's running total + this year's cash flow: −750,000.", D10: "Year 1's 250,000 ÷ 1.1 = 227,273.", D11: "Running total of present values: −772,727.", B13: "Years 1, 2 and 3 are still negative: 3.", B14: "3 full years, plus the 100,000 still missing (INDEX picks year 3's cumulative) ÷ year 4's cash flow of 300,000 (the next one): 3.33 years.", B16: "Same idea with present values: 4 + 56,929 ÷ 155,230 = 4.37 years.", fill: "Cumulative turns positive in year 4 (200,000); cumulative PV only in year 5 (98,301)." },
              check: { cells: ["D9:H11", "B13:B14", "B16"], success: "Payback 3.33 years; discounted payback 4.37 years. Discounting delays payback because later cash is worth less." },
              hints: ["Cumulative: <code>=C9+D8</code>.", "COUNTIF counts the negatives: <code>=COUNTIF(D9:H9,\"&lt;0\")</code>.", "INDEX(D9:H9, B13) is the last negative cumulative total; INDEX(D8:H8, B13+1) is the next year's cash flow."] },
            { type: "quiz", id: "w2-l9-quiz", questions: [
              { q: "Cost 300,000; cash flows 100,000, 100,000, 150,000. Payback is…", options: ["2.67 years", "3 years", "2.5 years"], answer: 0, why: "After 2 years 100,000 is still missing; 100,000 ÷ 150,000 = 0.67." },
              { q: "Payback's biggest weakness is that it…", options: ["Uses discounting", "Ignores cash flows after the payback year", "Needs IRR"], answer: 1, why: "A project could stop right after paying back, or earn much more later. Payback doesn't see it." }
            ] }
          ] },

        { id: "w2-l10", num: "L10", title: "Real dates: XNPV and XIRR", time: "10 min", sheet: "L10 XNPV",
          lede: "Real cash flows don't arrive exactly a year apart. XNPV and XIRR use the actual dates.",
          keyIdea: "XNPV and XIRR take the cash flows and their dates. Unlike NPV, the first cash flow goes inside.",
          objectives: ["Enter dates safely with DATE", "Value dated cash flows with XNPV", "Find their return with XIRR"],
          keywords: "xnpv xirr dates date irregular cash flows",
          blocks: [
            C.dates, F.DATE, F.XNPV, F.XIRR,
            { type: "sheet", id: "w2-l10-try", title: "Try it: an investment with uneven dates", cols: "A:C", rows: [3, 12], start: "B10",
              intro: "Mavuno invests 500,000 on 1 Dec 2026 and gets three payments back on the dates shown. The required return is 12%.",
              tasks: ["B10: XNPV at the rate in B3", "B11: XIRR", "B12: ordinary NPV, treating the payments as one year apart, for comparison"],
              cells: { A3: "Discount rate", B3: 0.12, A5: "Date", B5: "Cash flow", A6: "=DATE(2026,12,1)", B6: -500000, A7: "=DATE(2027,3,15)", B7: 120000, A8: "=DATE(2027,9,30)", B8: 180000, A9: "=DATE(2028,5,31)", B9: 300000, A10: "XNPV", A11: "XIRR", A12: "NPV, yearly assumption" },
              formats: { B3: PCT, "A6:A9": DATEF, "B6:B9": NUM, B10: NUM, B11: PCT2, B12: NUM }, styles: { input: ["B3", "B6:B9"], head: ["A5:B5"], bold: ["A10:A11"] },
              editable: ["B10:B12"],
              solution: { B10: "=XNPV(B3,B6:B9,A6:A9)", B11: "=XIRR(B6:B9,A6:A9)", B12: "=NPV(B3,B7:B9)+B6" },
              explain: { B10: "Each cash flow is discounted by its exact days from 1 Dec 2026 ÷ 365. The first is included and not discounted.", B11: "The annual return that makes XNPV 0.", B12: "NPV assumes years 1, 2 and 3. The real payments come sooner, so this understates the value." },
              check: { cells: ["B10:B12"], require: [{ cell: "B10", has: "XNPV(" }, { cell: "B11", has: "XIRR(" }], success: "With the real dates, XNPV is +33,166 and XIRR 19.27%: accept. The yearly NPV says −35,828: reject. The dates change the decision. Use XNPV and XIRR whenever dates are uneven." },
              hints: ["XNPV(rate, values, dates): <code>=XNPV(B3, B6:B9, A6:A9)</code>.", "XIRR(values, dates).", "NPV: years 1 to 3 inside, year 0 outside."] },
            { type: "quiz", id: "w2-l10-quiz", questions: [
              { q: "In XNPV, the first cash flow is…", options: ["Left out and added afterwards", "Included in the values range", "Discounted by one year"], answer: 1, why: "XNPV measures time from the first date, so the first cash flow is included undiscounted." }
            ] }
          ] },

        { id: "w2-l11", num: "L11", title: "Choosing between projects", time: "12 min", sheet: "L11 Compare", type: "Project",
          lede: "Two projects, one site. NPV and IRR disagree. Which do you pick, and how do you explain it?",
          keyIdea: "For mutually exclusive projects, choose the higher NPV. IRR ignores size.",
          objectives: ["Calculate NPV and IRR for two projects", "Explain why they can disagree", "Make and justify the decision in one cell"],
          keywords: "mutually exclusive projects npv irr conflict scale profitability index",
          blocks: [
            C.compare,
            { type: "sheet", id: "w2-l11-try", title: "Try it: Project A or Project B?", cols: "A:E", rows: [3, 13], start: "B9",
              intro: "Mavuno can either refurbish a small shop (A) or open a new branch (B), not both. Required return 10%.",
              tasks: ["B9 and C9: NPV of each project", "B10 and C10: IRR of each", "B11 and C11: NPV per shilling invested", "B13: choose with IF, on NPV"],
              cells: { A3: "Discount rate", B3: 0.10, A5: "Year", B4: "Project A", C4: "Project B", A6: "0", A7: "1", A8: "2", B6: -100000, B7: 60000, B8: 60000, C6: -1000000, C7: 580000, C8: 580000, A9: "NPV", A10: "IRR", A11: "NPV per shilling", A13: "Choose" },
              formats: { B3: PCT, "B6:C9": NUM, "B10:C10": PCT2, "B11:C11": "0.000" }, styles: { input: ["B3", "B6:C8"], head: ["B4:C4", "A5"], bold: ["A9", "A13"] },
              editable: ["B9:C11", "B13"],
              solution: { B9: "=NPV($B$3,B7:B8)+B6", C9: "=NPV($B$3,C7:C8)+C6", B10: "=IRR(B6:B8)", C10: "=IRR(C6:C8)", B11: "=B9/-B6", C11: "=C9/-C6", B13: '=IF(B9>C9,"Project A","Project B")' },
              explain: { B9: "4,132.", C9: "6,612: B adds more value in shillings.", B10: "13.07%.", C10: "10.49%: A looks better on IRR.", B11: "0.041: A earns more per shilling.", C11: "0.007.", B13: "Mutually exclusive, so choose the higher NPV: Project B. IRR favours A only because A is small." },
              check: { cells: ["B9:C11", "B13"], success: "A has the higher IRR (13.1% vs 10.5%), but B adds more value (NPV 6,612 vs 4,132). One site, so choose B. If capital were limited and A could be repeated, NPV per shilling would favour A." },
              hints: ["NPV: <code>=NPV($B$3, B7:B8) + B6</code>.", "NPV per shilling: NPV ÷ the investment (made positive).", "<code>=IF(B9&gt;C9, \"Project A\", \"Project B\")</code>"] },
            { type: "quiz", id: "w2-l11-quiz", questions: [
              { q: "Two mutually exclusive projects: A has NPV 50,000, IRR 25%; B has NPV 80,000, IRR 15%. Choose…", options: ["A, higher IRR", "B, higher NPV", "Either"], answer: 1, why: "NPV measures value added in shillings." }
            ] }
          ] }
      ] },

      /* ============================================================ WRAP-UP */
      { title: "Wrap-up", session: 4, sub: "End of Session 2", lessons: [
        { id: "w2-review", num: "", title: "Week 2 review quiz", time: "10 min", type: "Quiz",
          lede: "Ten questions on the whole week. Week 3 opens with Checkpoint 2 on this material.",
          keywords: "review quiz checkpoint 2 revision",
          blocks: [
            { type: "quiz", id: "w2-review-quiz", title: "Week 2 review", questions: [
              { q: "KES 100,000 at 10% for 3 years grows to…", options: ["130,000", "133,100", "131,000"], answer: 1, why: "100,000 × 1.1³." },
              { q: "PV of 121,000 received in 2 years at 10%…", options: ["100,000", "110,000", "96,800"], answer: 0, why: "121,000 ÷ 1.21." },
              { q: "Monthly payments for 4 years at 12% a year: rate and nper are…", options: ["12%, 4", "1%, 48", "12%, 48"], answer: 1, why: "Both monthly: 12%/12 and 4 × 12." },
              { q: "<code>=PMT(1%, 12, 600000)</code> returns a negative number because…", options: ["It's an error", "It's money you pay out", "The rate is too low"], answer: 1, why: "Sign convention: you receive the loan (+), you pay instalments (−)." },
              { q: "In an amortisation schedule, interest each month =", options: ["Payment × rate", "Opening balance × rate", "Loan × rate every month"], answer: 1, why: "Interest is on what's still owed." },
              { q: "Correct NPV with year 0 in C8 and years 1–5 in D8:H8:", options: ["<code>=NPV(r,C8:H8)</code>", "<code>=NPV(r,D8:H8)+C8</code>", "<code>=NPV(r,D8:H8)-C8</code>"], answer: 1, why: "Year 0 outside, added as it is (it's already negative)." },
              { q: "IRR is the discount rate at which…", options: ["NPV is highest", "NPV is zero", "Payback is reached"], answer: 1, why: "Definition of IRR." },
              { q: "Cash flows −100, +230, −132 can have…", options: ["No IRR", "Exactly one IRR", "Two IRRs"], answer: 2, why: "Two sign changes: 10% and 20%." },
              { q: "Which ignores cash flows after a point?", options: ["NPV", "IRR", "Payback"], answer: 2, why: "Payback stops counting once the money is back." },
              { q: "For cash flows on uneven dates, use…", options: ["NPV and IRR", "XNPV and XIRR", "PV and RATE"], answer: 1, why: "They use the actual dates." }
            ] }
          ] },
        { id: "w2-homework", num: "", title: "Homework for Week 3", time: "3 hours", type: "Homework", sheet: "HW",
          lede: "Each task repeats one lesson with new numbers. Due before <b>Wednesday 11 November</b>.",
          keywords: "homework due tasks week 2",
          blocks: [
            { type: "checklist", id: "w2-hw", title: "Tasks on the HW tab", items: [
              { title: "Compounding", tag: "Task 1, L1", sub: "KES 75,000 at 8.5% for 6 years, year by year and in one formula. Check: 122,360.06", time: "10 min" },
              { title: "Savings goal", tag: "Task 2, L2", sub: "Monthly saving needed to reach 2,000,000 in 6 years at 9%, starting with 100,000. Check: 19,248.52 a month", time: "15 min" },
              { title: "Mortgage", tag: "Task 3, L3", sub: "KES 6,500,000 over 15 years at 12.5%, monthly. Instalment and total interest. Check: 80,113.94 a month, 7,920,508 interest", time: "15 min" },
              { title: "Offer comparison", tag: "Task 4, L4", sub: "True annual cost of a 50,000 loan repaid at 5,000 a month for 12 months. Check: 41.3% effective", time: "15 min" },
              { title: "Schedule", tag: "Task 5, L5", sub: "24-month schedule for 1,500,000 at 12%. Check: month 24 closes at 0; total interest 194,645", time: "40 min" },
              { title: "Project appraisal", tag: "Task 6, L6–L9", sub: "NPV, IRR, payback and discounted payback for a solar plant at 11%. Check: NPV 101,591, IRR 12.38%", time: "40 min" },
              { title: "Dated cash flows", tag: "Task 7, L10", sub: "XNPV and XIRR at 10% for an investment with four dated flows. Check: XIRR 13.99%", time: "15 min" },
              { title: "Reflect", tag: "Task 8", sub: "Three sentences: which is better for choosing projects, NPV or IRR, and why?", time: "10 min" },
              { title: "Send your file", sub: "Save as Week2_HW_&lt;your name&gt;.xlsx and send it before Wednesday", time: "" }
            ] },
            { type: "callout", kind: "note", title: "Next Wednesday", html: "We start with <b>Checkpoint 2</b> on this week, then move to Excel Tables, SUMIFS, PivotTables and what-if analysis." },
            { type: "callout", kind: "tip", html: "Stuck? Reopen the lesson: each Try-it has a worked solution that explains every cell. If you're still stuck, send your tutor a screenshot that shows the formula bar." }
          ] }
      ] }
    ]
  });
})();
