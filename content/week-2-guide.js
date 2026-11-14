/* Week 2 · Plain-language guides. Each lesson opens with "Read this first": the idea in plain words,
   a worked example by hand, and a walkthrough of the Try-it (same cells as the workbook tab).
   Loaded after week-2.js; it adds these blocks to the start of each lesson. */
(function () {
  var W = window.Course && Course.content && Course.content[2];
  if (!W) return;

  function H(t) { return { type: "h", text: t }; }
  function H3(t) { return { type: "h3", text: t }; }
  function P(h) { return { type: "p", html: h }; }
  function K(h, label) { return { type: "key", label: label || "Remember", html: h }; }
  function T(head, rows, num) { return { type: "table", head: head, rows: rows, num: num || [] }; }
  function L(items, ordered) { return { type: "list", items: items, ordered: !!ordered }; }
  function C(kind, title, h) { return { type: "callout", kind: kind, title: title, html: h }; }
  /* One walkthrough step: cell, what to type, what you see, why */
  function S(cell, code, see, why) {
    return "<b>" + cell + "</b>: type <code>" + code + "</code> and press Enter. You should see <b>" + see + "</b>." + (why ? " " + why : "");
  }
  function walk(tab, intro, steps) {
    return [H("Walkthrough: what to type and what you should see"),
      P(intro + " Do it in the Try-it below, or on the <b>" + tab + "</b> tab of your workbook: the cells are the same."),
      L(steps, true)];
  }

  var G = {};

  /* ------------------------------------------------------------ START */
  G["w2-start"] = [
    H("Week 2 in one page"),
    P("Week 2 answers three money questions that come up in every finance job:"),
    T(["Question", "Lessons", "What you'll be able to do"], [
      ["<b>What is money at one date worth at another date?</b>", "L1, L2", "Grow money forward (compounding) and bring future money back to today (discounting)"],
      ["<b>What does a loan really cost?</b>", "L3, L4, L5", "Work out the instalment, how long a loan takes, its real interest rate, and a month-by-month repayment table"],
      ["<b>Is an investment worth making?</b>", "L6 to L11", "Add up its future cash in today's money (NPV), find its return (IRR), how fast it pays back, and choose between two projects"]
    ]),
    K("A shilling today is worth more than a shilling next year, because today's shilling can be put in the bank and earn interest. Everything this week is a way of moving money through time so that amounts from different dates can be compared fairly.", "The one idea"),
    H("The words you'll need"),
    P("Learn these first. Every lesson uses them."),
    T(["Word", "Plain meaning", "Example"], [
      ["<b>Interest rate</b>", "The percentage money grows by in one period", "A bank pays 10% a year"],
      ["<b>Period</b>", "One step of time: a year or a month", "A car loan is paid monthly, so its period is a month"],
      ["<b>Compounding</b>", "Earning interest on your interest", "100,000 earns 10,000 in year 1; in year 2 interest is paid on 110,000, so it earns 11,000"],
      ["<b>Discounting</b>", "Compounding backwards: what is future money worth today?", "110,000 promised next year is worth 100,000 today, at 10%"],
      ["<b>Present value (PV)</b>", "What money is worth <i>today</i>", "The 100,000 above"],
      ["<b>Future value (FV)</b>", "What money will be worth <i>later</i>", "The 110,000 above"],
      ["<b>Payment (PMT)</b>", "The same amount paid every period", "A loan instalment of 55,844 every month"],
      ["<b>Cash flow</b>", "Money coming in (+) or going out (−) in a period", "Building a warehouse: −1,000,000 today, +250,000 next year"],
      ["<b>Discount rate</b>", "The return an investment must beat to be worth it", "\"We could earn 10% elsewhere, so this must beat 10%\""],
      ["<b>NPV</b>", "Net present value: all the cash flows added up in today's money", "Positive NPV means the investment beats the discount rate"],
      ["<b>IRR</b>", "Internal rate of return: the investment's own yearly return", "The warehouse earns 13.75% a year"],
      ["<b>Payback</b>", "How many years until you get your money back", "The warehouse pays back in 3.3 years"],
      ["<b>Nominal rate</b>", "The headline rate a lender advertises", "\"12% a year, paid monthly\""],
      ["<b>Effective rate</b>", "What you really pay in a year once monthly compounding is counted", "That 12% is really 12.68%"]
    ]),
    H("The sign rule: the most important rule of the week"),
    P("Excel's finance functions need to know which way money is moving. <b>Money you receive is positive. Money you pay out is negative.</b> Always look at it from your own pocket."),
    T(["Situation", "Positive (+)", "Negative (−)"], [
      ["Taking a loan", "The loan you receive", "Each repayment you make"],
      ["Saving", "The final balance you get back", "Each deposit you make"],
      ["Investing", "The cash the project brings in", "The money you put in today"]
    ]),
    C("tip", "Picture a wallet", "Money coming into the wallet is plus. Money leaving the wallet is minus. A finance function needs to see both directions, otherwise it can't solve the problem and returns #NUM!.")
  ];

  /* ------------------------------------------------------------ L1 */
  G["w2-l1"] = [
    H("Read this first: compounding in plain words"),
    P("Put KES 100,000 in a bank that pays 10% a year, and leave it there for 5 years. Each year the bank adds 10% of whatever is in the account <i>at that time</i>."),
    T(["Year", "Start of year", "Interest (10%)", "End of year"], [
      ["1", "100,000", "10,000", "110,000"], ["2", "110,000", "11,000", "121,000"], ["3", "121,000", "12,100", "133,100"],
      ["4", "133,100", "13,310", "146,410"], ["5", "146,410", "14,641", "161,051"]
    ], [1, 2, 3]),
    P("The interest grows every year (10,000, then 11,000, then 12,100) because each year's interest is paid on a bigger balance. That is <b>compounding</b>: interest on interest."),
    P("Each year you multiply by 1.10. Five years is 1.10 × 1.10 × 1.10 × 1.10 × 1.10, which Excel writes as <code>1.1^5</code> (the <code>^</code> means \"to the power of\"). So there's a shortcut: <b>future value = amount × (1 + rate)^years</b>. Check it: <code>=100000*1.1^5</code> gives 161,051."),
    H3("Discounting: the same thing backwards"),
    P("If someone promises you 161,051 in 5 years, what is that worth today? Undo the compounding: divide by 1.1 five times. <code>=161051/1.1^5</code> gives 100,000. That is <b>discounting</b>, and 100,000 is the <b>present value</b>."),
    P("The <b>discount factor</b> is what one future shilling is worth today: <b>1 ÷ (1 + rate)^years</b>. For year 5 at 10% it is 0.6209, so a shilling in five years is worth about 62 cents today. Multiply any year-5 amount by 0.6209 to get its value today."),
    K("Forward in time: multiply by (1 + rate)^years. Back to today: divide by (1 + rate)^years."),
    H3("Nominal and effective rates"),
    P("Banks often advertise \"12% a year\" but charge 1% every month. Each month's interest is added to what you owe, so next month you pay interest on it too. Over a year that comes to 12.68%, not 12%. The advertised 12% is the <b>nominal</b> rate; the 12.68% you really pay is the <b>effective</b> rate. Excel works it out with <code>=EFFECT(12%,12)</code>, where 12 is the number of times a year interest is charged."),
    C("finance", "Why this matters", "Always compare loans and savings accounts on the effective rate. 13% charged monthly (13.80% effective) is more expensive than 13.5% charged once a year.")
  ].concat(walk("L1 TVM", "The amount is in B4 (100,000) and the rate in B5 (10%). Row 7 has the years, and year 0 (column C) is filled in.", [
    S("D8", "=C8*(1+$B$5)", "110,000", "Last year's value times (1 + rate). The <code>$</code> signs lock B5, so the copy keeps using the same rate."),
    S("D9", "=$B$4*(1+$B$5)^D7", "110,000", "The same answer in one step: the starting amount times 1.1 to the power of the year. D7 isn't locked, because every column has its own year."),
    S("D10", "=1/(1+$B$5)^D7", "0.9091", "The discount factor: a shilling next year is worth about 91 cents today."),
    "Copy D8:D10 across to column H (the <b>Copy</b> button in the Try-it; in Excel, drag the small square at the corner of the selection). Year 5 shows <b>161,051</b> in rows 8 and 9, and <b>0.6209</b> in row 10. Both rows agree: compounding is just multiplying again and again.",
    S("B13", "=B12/(1+B5)^5", "100,000", "Discounting undoes compounding: 161,051 in five years is worth exactly 100,000 today."),
    "Change B5 to 12% and watch every number update. Then put it back to 10%."
  ])).concat([
    C("warning", "If your numbers look wrong", "<b>Wrong numbers from year 2 onwards:</b> the <code>$</code> is missing on B5. <b>Every year shows 161,051:</b> you typed <code>^5</code> instead of <code>^D7</code>. <b>The rate shows 1000%:</b> you typed 10 instead of 10%.")
  ]);

  /* ------------------------------------------------------------ L2 */
  G["w2-l2"] = [
    H("Read this first: five ingredients and one sign rule"),
    P("Every money-over-time problem has the same five ingredients. Excel's five finance functions (FV, PV, PMT, NPER and RATE) each <b>find one ingredient when you give them the other four</b>."),
    T(["Ingredient", "Excel's name", "The question it answers", "Example"], [
      ["Rate", "<code>rate</code>", "What % per period?", "9% a year ÷ 12 = 0.75% a month"],
      ["Number of periods", "<code>nper</code>", "How many periods in total?", "3 years × 12 = 36 months"],
      ["Payment", "<code>pmt</code>", "How much is paid every period?", "5,000 a month (0 if none)"],
      ["Present value", "<code>pv</code>", "How much at the start?", "50,000 put in today"],
      ["Future value", "<code>fv</code>", "How much at the end?", "The balance after 3 years"]
    ]),
    P("Two rules make all five functions work:"),
    L(["<b>Match the periods.</b> Monthly payments need a monthly rate (annual rate ÷ 12) and the number of months (years × 12). Mixing a yearly rate with months is the most common mistake in finance.",
       "<b>Use the sign rule.</b> Money you pay out is negative; money you get back is positive. When you save, your deposits leave your pocket (negative) and the final balance comes back to you (positive)."], true),
    H3("Reading FV and PV aloud"),
    P("<code>=FV(rate, nper, pmt, pv)</code>: \"What will I have at the end, at this rate, after this many periods, if I pay in this much each period and start with this much?\""),
    P("<code>=PV(rate, nper, pmt, fv)</code>: \"What do I need to put in today to end up with this amount?\""),
    P("Try <code>=FV(10%,5,0,-100000)</code> in any empty cell. It gives <b>161,051</b>: exactly L1's answer, in one cell. The 100,000 is negative because it leaves your pocket; the answer is positive because it comes back to you. Now remove the minus: <code>=FV(10%,5,0,100000)</code> gives <b>(161,051)</b>. Same size, opposite direction, because Excel now thinks you <i>received</i> 100,000."),
    K("Negative answer = money you pay. Positive answer = money you receive. To show a cost as a positive number in a report, put a minus in front of the function: <code>=-PV(...)</code>.")
  ].concat(walk("L2 FV PV", "Block 1 is a savings plan: 9% a year (B4), 3 years (B5), 5,000 saved every month (B6) and 50,000 put in today (B7).", [
    S("B9", "=B4/12", "0.75%", "The deposits are monthly, so you need the monthly rate."),
    S("B10", "=B5*12", "36", "And the number of months. Now the rate and the periods match."),
    S("B11", "=FV(B9,B10,-B6,-B7)", "271,195.85", "Both the 5,000 a month and the 50,000 today leave your pocket, so each gets a minus. The balance you get back is positive. You paid in 50,000 + 36 × 5,000 = 230,000; the other 41,195.85 is interest."),
    "Block 2 is a target: you want 1,000,000 (B14) in 4 years (B15) at 11% a year (B16). How much must you invest today?",
    S("B17", "=PV(B16,B15,0,B14)", "(658,730.97)", "No monthly payments, so pmt is 0. The million comes to you, so it's positive. The answer is negative because that is what you must pay in today.")
  ])).concat([
    C("warning", "If your numbers look wrong", "<b>A huge number in B11:</b> you used B4 (the yearly 9%) with 36 months. Use the monthly rate in B9. <b>B11 is negative:</b> the deposits went in as positive; put a minus in front of B6 and B7. <b>#NUM! from any finance function:</b> every amount has the same sign, so nothing balances.")
  ]);

  /* ------------------------------------------------------------ L3 */
  G["w2-l3"] = [
    H("Read this first: what an instalment does"),
    P("When a bank lends you money, each monthly instalment does two jobs: it pays that month's interest, and it repays a little of the loan. The bank sets the instalment so that after the last payment you owe exactly nothing."),
    P("You could find that instalment by trial and error. PMT does it in one step:"),
    P("<code>=PMT(rate per period, number of payments, loan amount)</code>"),
    L(["<b>Rate per period:</b> the yearly rate ÷ 12 for monthly payments.", "<b>Number of payments:</b> years × 12.", "<b>Loan amount:</b> what you receive, so it's positive."]),
    P("The answer comes out <b>negative</b>, because the instalment leaves your pocket. Put a minus in front, <code>=-PMT(...)</code>, to show it as a positive cost."),
    H3("What the loan really costs"),
    P("Once you have the instalment, the total cost is simple arithmetic: <b>total repaid = instalment × number of payments</b>, and <b>total interest = total repaid − the loan</b>."),
    T(["Van loan: 2,400,000 at 14% for 5 years", "Working", "Answer"], [
      ["Monthly rate", "14% ÷ 12", "1.17%"], ["Number of payments", "5 × 12", "60"], ["Instalment", "<code>=-PMT(14%/12,60,2400000)</code>", "55,843.80"],
      ["Total repaid", "55,843.80 × 60", "3,350,628"], ["Total interest", "3,350,628 − 2,400,000", "950,628"]
    ], [2]),
    P("Nearly a million shillings of interest: about 40% on top of the price of the van."),
    C("tip", "Why not just divide the loan by 60?", "2,400,000 ÷ 60 = 40,000 only repays the loan. It leaves out the interest. The instalment is 55,843.80 because every month also pays the interest owed that month.")
  ].concat(walk("L3 PMT", "Mavuno Traders is borrowing 2,400,000 (B3) at 14% a year (B4) over 5 years (B5) to buy a delivery van.", [
    S("B8", "=B4/12", "1.17%", "Monthly payments, so the monthly rate."),
    S("B9", "=B5*12", "60", "Five years of monthly payments."),
    S("B10", "=-PMT(B8,B9,B3)", "55,843.80", "The minus in front turns the payment positive so it reads as a cost."),
    S("B11", "=B10*B9", "3,350,628", "Sixty payments: what the van really costs."),
    S("B12", "=B11-B3", "950,628", "Everything you pay above the loan is interest."),
    S("B13", "=EFFECT(B4,12)", "14.93%", "The bank says 14%, but because interest is charged monthly you really pay 14.93% a year."),
    S("B15", "=-PMT(B4,B5,B3)", "699,080.51", "Paid once a year instead: yearly rate, 5 payments. Five of these come to 3,495,403, more than paying monthly, because the balance comes down more slowly.")
  ])).concat([
    C("warning", "If your numbers look wrong", "<b>About 336,000 a month:</b> you used the yearly 14% with 60 monthly payments; use B8. <b>About 497,000 a month:</b> you used 5 (years) instead of 60 (payments). <b>The answer is in brackets:</b> add the minus in front of PMT.")
  ]);

  /* ------------------------------------------------------------ L4 */
  G["w2-l4"] = [
    H("Read this first: the same ingredients, a different question"),
    P("NPER and RATE use the same five ingredients as L2, solved for a different one:"),
    T(["You know", "You want", "Function"], [
      ["Rate, number of payments, loan", "The instalment", "PMT (L3)"],
      ["Rate, instalment, loan", "<b>How many payments</b>", "<b>NPER</b>"],
      ["Number of payments, instalment, loan", "<b>The interest rate</b>", "<b>RATE</b>"]
    ]),
    P("<code>=NPER(rate, payment, loan)</code> answers: \"If I pay this much each month, how many months until the loan is gone?\""),
    P("<code>=RATE(number of payments, payment, loan)</code> answers: \"What interest rate am I really paying?\" It gives the rate <b>per period</b>. For monthly payments that's a monthly rate: multiply by 12 for the nominal yearly rate, or use EFFECT for the true yearly cost."),
    K("The loan you receive is positive; the payment you make is negative. If both have the same sign, Excel returns #NUM!, because a loan that is never repaid can't be solved."),
    H3("A \"cheap\" loan, worked out"),
    P("A lender gives you 100,000 and you repay 9,500 a month for 12 months. You repay 114,000 in total, which sounds like 14%. But you're paying it back as you go, so for most of the year you owe much less than 100,000, and the real rate is far higher:"),
    T(["Step", "Formula", "Answer"], [
      ["Monthly rate", "<code>=RATE(12,-9500,100000)</code>", "2.08%"], ["Nominal yearly rate", "2.08% × 12", "24.9%"], ["Effective yearly rate", "<code>=EFFECT(24.9%,12)</code>", "27.96%"]
    ], [2]),
    H3("RATE as a growth rate"),
    P("RATE also finds growth. Revenue grew from 250,000 to 332,640 in 3 years. <code>=RATE(3,0,-250000,332640)</code> gives <b>9.99%</b> a year. Analysts call this the <b>CAGR</b>, the compound annual growth rate.")
  ].concat(walk("L4 NPER RATE", "Offer 1 is a business loan of 500,000 (B4) at 15% a year (B5), repaid at 20,000 a month (B6). Offer 2 is the quick loan above (B12 and B13).", [
    S("B8", "=NPER(B5/12,-B6,B4)", "30.16", "Monthly rate, the 20,000 going out (negative), the 500,000 coming in (positive)."),
    S("B9", "=ROUNDUP(B8,0)", "31", "You can't make 0.16 of a payment, so round up. The last payment is smaller."),
    S("B14", "=RATE(12,-B13,B12)", "2.08%", "A monthly rate, because the payments are monthly."),
    S("B15", "=B14*12", "24.9%", "The nominal yearly rate."),
    S("B16", "=EFFECT(B15,12)", "27.96%", "The true yearly cost once monthly compounding is counted."),
    S("B17", "=RATE(3,0,-250000,332640)", "9.99%", "No payments in between, so pmt is 0. The start value is negative and the end value positive.")
  ])).concat([
    C("warning", "If your numbers look wrong", "<b>#NUM!:</b> the payment and the loan have the same sign; the payment needs a minus. <b>#NUM! with NPER even with the right signs:</b> you used the yearly 15%, so a year's interest (75,000) is more than the 20,000 payment and the loan never ends. <b>RATE gives 2.08% and you call it yearly:</b> it's monthly.")
  ]);

  /* ------------------------------------------------------------ L5 */
  G["w2-l5"] = [
    H("Read this first: one row, four steps"),
    P("A loan schedule shows, month by month, how much of each payment is interest and how much repays the loan. Every row follows the same four steps:"),
    L(["<b>Opening balance:</b> what you owe at the start of the month.",
       "<b>Interest:</b> the bank charges this month's interest on what you owe: opening balance × monthly rate.",
       "<b>Principal:</b> whatever is left of your payment after the interest reduces the loan: payment − interest.",
       "<b>Closing balance:</b> what you still owe: opening balance − principal. <b>Next month opens with this number.</b>"], true),
    P("Month 1, worked by hand: a loan of 600,000 at 1% a month (12% a year), payment 53,309.27."),
    T(["Step", "Working", "Answer"], [
      ["Opening", "", "600,000.00"], ["Interest", "600,000 × 1%", "6,000.00"], ["Principal", "53,309.27 − 6,000.00", "47,309.27"], ["Closing", "600,000 − 47,309.27", "552,690.73"]
    ], [2]),
    P("Month 2 opens at 552,690.73. Its interest is 5,526.91, smaller because you owe less, so more of the same payment goes to the loan: 47,782.37. This carries on every month until the balance reaches zero in month 12. By month 12 the interest is only 527.81."),
    K("Two checks prove a schedule is right: the last closing balance is 0, and the principal column adds up to exactly the loan.")
  ].concat(walk("L5 Schedule", "The inputs are in C3:C6 (loan 600,000, 12% a year, 1% a month, 12 months). Column B, the opening balance, is already linked: each month picks up the closing balance from the row above. You only need to write row 10.", [
    S("C10", "=-PMT($C$5,$C$6,$C$3)", "53,309.27", "The same PMT as L3. The <code>$</code> signs lock the inputs so every row uses the same loan."),
    S("D10", "=B10*$C$5", "6,000.00", "This month's opening balance × the monthly rate. B10 isn't locked, because each row has its own balance."),
    S("E10", "=C10-D10", "47,309.27", "The part of the payment left after interest repays the loan."),
    S("F10", "=B10-E10", "552,690.73", "What you still owe. Look at B11: it already shows 552,690.73."),
    "Optional check, <b>G10</b>: <code>=-IPMT($C$5,A10,$C$6,$C$3)</code> gives month 1's interest straight from Excel (6,000.00). It should match column D every month.",
    "Copy row 10 down to row 21 (the <b>Copy</b> button; in Excel, select C10:G10 and double-click the small square at the corner). Month 12 closes at <b>0.00</b>.",
    S("D22", "=SUM(D10:D21)", "39,711.28", "Total interest."),
    S("E22", "=SUM(E10:E21)", "600,000.00", "Total principal: exactly the loan.")
  ])).concat([
    C("warning", "If your numbers look wrong", "<b>The payment changes down the column:</b> the <code>$</code> signs are missing in C10. <b>Interest is 6,000 every month:</b> D10 points at the loan (C3) instead of the opening balance (B10). <b>Month 12 shows (0.00):</b> that's a fraction of a cent of rounding. It is zero.")
  ]);

  /* ------------------------------------------------------------ L6 */
  G["w2-l6"] = [
    H("Read this first: the warehouse decision"),
    P("Lessons L6 to L9 all use one story. Mavuno Traders can build a warehouse for <b>1,000,000 today</b>. It will save the business money for 5 years: 250,000, 300,000, 350,000, 300,000 and 250,000. Mavuno could earn <b>10%</b> a year by using the money elsewhere, so the warehouse has to beat 10%."),
    P("Add up the savings and you get 1,450,000: it looks like a 450,000 profit. <b>But that's wrong</b>, because it adds shillings from different years as if they were worth the same. A shilling in year 5 is worth less than a shilling today (L1)."),
    P("The fix: bring every year back to today with L1's discount factor, then add them up."),
    T(["Year", "0", "1", "2", "3", "4", "5"], [
      ["Cash flow", "(1,000,000)", "250,000", "300,000", "350,000", "300,000", "250,000"],
      ["Discount factor at 10%", "1.0000", "0.9091", "0.8264", "0.7513", "0.6830", "0.6209"],
      ["Value today (present value)", "(1,000,000)", "227,273", "247,934", "262,960", "204,904", "155,230"]
    ], [1, 2, 3, 4, 5, 6]),
    P("Add the bottom row: <b>NPV = 98,301</b>."),
    K("After paying back the 1,000,000 <i>and</i> earning the 10% Mavuno needs, the warehouse still adds about 98,000 of value in today's money. Positive NPV: accept. Negative NPV: reject.", "What NPV means"),
    C("tip", "Questions people ask", "<b>Where does the 10% come from?</b> It's the return Mavuno could get elsewhere for the same risk, called the hurdle rate or cost of capital. In Week 6 you'll calculate it (WACC). <b>Why isn't year 0 discounted?</b> It happens today, so it's already in today's money. <b>Profit or cash?</b> Always cash: depreciation, for example, isn't money leaving the bank.")
  ].concat(walk("L6 DCF", "The discount rate is in B3 (10%). Row 7 has the years and row 8 the cash flows.", [
    S("C9", "=1/(1+$B$3)^C7", "1.0000", "The discount factor from L1. Year 0 is today, so it's 1. The rate is locked; the year isn't."),
    S("C10", "=C8*C9", "(1,000,000)", "Cash flow × its discount factor = its value today."),
    "Copy C9:C10 across to year 5. Year 5's 250,000 is worth only <b>155,230</b> today.",
    S("B12", "=SUM(C10:H10)", "98,301", "The NPV: all the cash flows added up in today's money."),
    S("B13", "=IF(B12>0,\"Accept\",\"Reject\")", "Accept", "Week 1's IF makes the decision."),
    "Change B3 to 14%: NPV turns negative and the decision becomes Reject. If Mavuno needed 14%, the warehouse wouldn't be good enough. Put B3 back to 10%."
  ])).concat([
    C("warning", "If your numbers look wrong", "<b>Every discount factor is the same:</b> the year is locked; use <code>^C7</code>, not <code>^$C$7</code>. <b>Wrong factors from year 1:</b> the <code>$</code> is missing on B3. <b>NPV of 450,000:</b> you added row 8 (cash flows) instead of row 10 (values today).")
  ]);

  /* ------------------------------------------------------------ L7 */
  G["w2-l7"] = [
    H("Read this first: why year 0 goes outside"),
    P("<code>=NPV(rate, cash flows)</code> does all of L6 in one cell: it discounts a list of cash flows and adds them up. The catch: <b>Excel treats the first cash flow in the list as year 1.</b> It divides the first one by 1.1, the second by 1.1², and so on."),
    P("That's right for years 1 to 5. But the 1,000,000 is spent today (year 0) and must not be discounted. So the correct pattern is:"),
    K("<code>=NPV(rate, year 1 to the last year) + year 0</code>", "The pattern"),
    P("If you put year 0 inside the brackets by mistake, Excel pushes every cash flow one year further away and the answer is wrong. This is the <b>year-0 trap</b>, and experienced analysts make it all the time."),
    T(["Formula", "Result", "What happened"], [
      ["<code>=NPV(10%, years 1 to 5) + year 0</code>", "98,301", "Correct: matches L6 by hand"],
      ["<code>=NPV(10%, years 0 to 5)</code>", "89,365", "The trap: everything discounted one year too much, 8,936 out"]
    ], [1]),
    H3("NPV at different rates"),
    P("What if Mavuno needed a different return? Working out NPV at several rates is called a <b>sensitivity</b> analysis:"),
    T(["Discount rate", "6%", "8%", "10%", "12%", "14%"], [["NPV, KES", "221,157", "157,179", "98,301", "44,008", "(6,155)"]], [1, 2, 3, 4, 5]),
    P("The higher the return you need, the lower the NPV, because future cash is worth less. Somewhere between 12% and 14% the NPV crosses zero. That crossing point is the IRR, the next lesson."),
    C("tip", "A year with no cash flow?", "Type 0 in that cell. If it's left blank, NPV skips it and every later year is discounted one year too little.")
  ].concat(walk("L7 NPV", "Same warehouse: the rate is in B3, year 0 in C8, and years 1 to 5 in D8:H8.", [
    S("B10", "=NPV(B3,D8:H8)+C8", "98,301", "Years 1 to 5 inside, year 0 added outside. The same as L6."),
    S("B11", "=NPV(B3,C8:H8)", "89,365", "The trap, on purpose, so you can see it: year 0 inside gives the wrong answer."),
    S("C13", "=NPV(C12,$D$8:$H$8)+$C$8", "221,157", "The rate comes from row 12 and isn't locked, so it moves as you copy. The cash flows are locked."),
    "Copy C13 across to G13. You should see the five NPVs in the table above, ending with <b>(6,155)</b> at 14%."
  ])).concat([
    C("warning", "If your numbers look wrong", "<b>89,365:</b> year 0 is inside NPV. <b>1,098,301:</b> you forgot to add year 0. <b>The same number five times in row 13:</b> the rate is locked; use <code>C12</code>, not <code>$C$12</code>.")
  ]);

  /* ------------------------------------------------------------ L8 */
  G["w2-l8"] = [
    H("Read this first: the project's own return"),
    P("In L7, the warehouse's NPV is +44,008 at 12% and −6,155 at 14%. Somewhere in between it is exactly zero. That rate is <b>13.75%</b>, and it's the warehouse's <b>IRR</b> (internal rate of return)."),
    P("What does it mean? Discount the warehouse's cash flows at 13.75% and they exactly pay back the 1,000,000. So the warehouse is <b>earning 13.75% a year</b> on the money put in, like an interest rate the warehouse pays Mavuno."),
    K("Accept a project if its IRR is above the return you need (the hurdle rate). 13.75% beats 10%: accept. For a single, normal project this always agrees with NPV.", "The decision rule"),
    T(["", "NPV", "IRR"], [
      ["What it tells you", "How many shillings of value the project adds", "What percentage the project earns"],
      ["Warehouse", "98,301", "13.75%"],
      ["Year 0 in the range?", "No: add it outside", "Yes: include it"],
      ["Accept if", "Above 0", "Above the hurdle rate"]
    ]),
    H3("IRR's weak spot"),
    P("If the cash flows change from minus to plus and back to minus (say, a big clean-up bill at the end), there can be two IRRs. Take −100 today, +230 next year, −132 the year after: both 10% and 20% make the NPV zero. Which is \"the\" return? Neither tells you much. When that happens, trust NPV."),
    C("tip", "How does Excel find the IRR?", "By trial and error: it tries a rate, checks the NPV, and adjusts up or down until the NPV is zero. The optional second argument, the guess, is where it starts looking.")
  ].concat(walk("L8 IRR", "Same warehouse; the hurdle rate is in B3 (10%).", [
    S("B10", "=IRR(C8:H8)", "13.75%", "All the cash flows, year 0 included."),
    S("B11", "=NPV(B10,D8:H8)+C8", "0 (it may show as a dash)", "Proof: discount at the IRR and the NPV is zero. That's what IRR means."),
    S("B12", "=IF(B10>B3,\"Accept\",\"Reject\")", "Accept", "13.75% beats the 10% hurdle."),
    S("B14", "=IRR(C14:E14,5%)", "10%", "The clean-up project, starting the search at 5%."),
    "Now change the guess to 30%: <code>=IRR(C14:E14,30%)</code> gives <b>20%</b>. One project, two IRRs. Use NPV for projects like this."
  ])).concat([
    C("warning", "If your numbers look wrong", "<b>#NUM!:</b> all cash flows have the same sign, or Excel couldn't find an answer from its guess; check that year 0 is negative, or try another guess. <b>A strange IRR:</b> year 0 was left out of the range. <b>B11 shows 0.0000001:</b> that's rounding. It is zero.")
  ]);

  /* ------------------------------------------------------------ L9 */
  G["w2-l9"] = [
    H("Read this first: how soon do we get our money back?"),
    P("Managers often ask a simpler question than NPV: \"How soon do we get our 1,000,000 back?\" Keep a <b>running total</b> of the warehouse's cash, year by year:"),
    T(["Year", "0", "1", "2", "3", "4", "5"], [
      ["Cash flow", "(1,000,000)", "250,000", "300,000", "350,000", "300,000", "250,000"],
      ["Running total", "(1,000,000)", "(750,000)", "(450,000)", "<b>(100,000)</b>", "200,000", "450,000"]
    ], [1, 2, 3, 4, 5, 6]),
    P("After 3 years Mavuno is still 100,000 short. During year 4 the warehouse brings in 300,000, so the missing 100,000 arrives a third of the way through year 4."),
    K("Payback = full years still negative + (amount still missing ÷ next year's cash flow) = 3 + 100,000 ÷ 300,000 = <b>3.33 years</b>.", "The recipe"),
    P("<b>Discounted payback</b> uses the same recipe with the values-today from L6 (227,273, 247,934, 262,960, 204,904 and 155,230). Their running total is still −56,929 after year 4, so discounted payback = 4 + 56,929 ÷ 155,230 = <b>4.37 years</b>. It's longer, because future cash is worth less today."),
    C("finance", "What payback ignores", "Everything after the payback year. A project that pays back fast and then stops can look better than one that pays back slowly but earns far more. Companies use payback as a quick screen (\"only projects that pay back within 3 years\") and then check NPV."),
    H3("How the payback formula works"),
    P("In Excel you need the three numbers from the recipe: the full years (3), the amount missing (100,000) and next year's cash flow (300,000). The formula finds each one with a Week 1 function:"),
    T(["Piece of the formula", "What it finds", "Value"], [
      ["<code>COUNTIF(D9:H9,\"<0\")</code>", "How many years the running total is still negative", "3"],
      ["<code>-INDEX(D9:H9,3)</code>", "The 3rd running total (year 3), with its minus sign flipped", "100,000"],
      ["<code>INDEX(D8:H8,3+1)</code>", "The 4th cash flow (year 4)", "300,000"]
    ], [2]),
    P("Put together: 3 + 100,000 ÷ 300,000 = 3.33. INDEX picks an item from a row by its position, exactly as in Week 1.")
  ].concat(walk("L9 Payback", "Row 9 is the running total, row 10 the values today, row 11 the running total of values today. Year 0 (column C) is done.", [
    S("D9", "=C9+D8", "(750,000)", "Last year's running total + this year's cash flow."),
    S("D10", "=D8/(1+$B$3)^D7", "227,273", "This year's cash flow in today's money, as in L6."),
    S("D11", "=C11+D10", "(772,727)", "The running total of the values today."),
    "Copy D9:D11 across to year 5. Row 9 turns positive in year 4; row 11 only in year 5.",
    S("B13", "=COUNTIF(D9:H9,\"<0\")", "3", "Full years still negative. Start at D9 (year 1), not C9."),
    S("B14", "=B13+(-INDEX(D9:H9,B13))/INDEX(D8:H8,B13+1)", "3.33", "The recipe: full years + amount missing ÷ next year's cash flow."),
    S("B16", "=B15+(-INDEX(D11:H11,B15))/INDEX(D10:H10,B15+1)", "4.37", "The same with the values-today rows. B15 already counts their negative years (4).")
  ])).concat([
    C("warning", "If your numbers look wrong", "<b>A negative payback:</b> the minus before INDEX is missing. <b>4.33 instead of 3.33:</b> COUNTIF started at C9 (year 0). <b>3.29:</b> the second INDEX used B13 instead of B13+1, so it picked year 3's cash flow instead of year 4's.")
  ]);

  /* ------------------------------------------------------------ L10 */
  G["w2-l10"] = [
    H("Read this first: real cash doesn't arrive once a year"),
    P("NPV and IRR assume every cash flow is exactly one year after the last. Real life isn't like that: a customer pays in March, another in September, the last one in May the year after."),
    P("Excel stores every date as a number (the count of days since 1900), so it can work out the exact number of days between two dates. XNPV and XIRR use those days: each cash flow is discounted by <b>days since the first date ÷ 365</b> years."),
    T(["Date", "Cash flow", "Days after the start", "Years after the start"], [
      ["1 Dec 2026", "(500,000)", "0", "0.00"], ["15 Mar 2027", "120,000", "104", "0.28"], ["30 Sep 2027", "180,000", "303", "0.83"], ["31 May 2028", "300,000", "547", "1.50"]
    ], [1, 2, 3]),
    P("Ordinary NPV would pretend these payments arrive in years 1, 2 and 3, much later than they really do, so it would undervalue them."),
    T(["Function", "Pattern", "First cash flow"], [
      ["XNPV", "<code>=XNPV(rate, all cash flows, all dates)</code>", "Inside the range"],
      ["XIRR", "<code>=XIRR(all cash flows, all dates)</code>", "Inside the range"],
      ["NPV (for comparison)", "<code>=NPV(rate, year 1 onwards) + year 0</code>", "Added outside"]
    ]),
    C("tip", "Typing dates safely", "Use <code>=DATE(year, month, day)</code>, for example <code>=DATE(2027,3,15)</code>. Typing 03/04 can mean 3 April or March 4 depending on the computer's settings; DATE always means what you say.")
  ].concat(walk("L10 XNPV", "Mavuno invests 500,000 on 1 Dec 2026 and gets three payments back. The rate is in B3 (12%), dates in A6:A9 and cash flows in B6:B9.", [
    S("B10", "=XNPV(B3,B6:B9,A6:A9)", "33,166", "Every cash flow with its date. Positive: accept."),
    S("B11", "=XIRR(B6:B9,A6:A9)", "19.27%", "The yearly return using the real dates, well above 12%."),
    S("B12", "=NPV(B3,B7:B9)+B6", "(35,828)", "Ordinary NPV treats the payments as a year apart and says reject. With the real dates the answer is accept: using the wrong tool changes the decision."),
    "Try it: change A9 to <code>=DATE(2029,5,31)</code>, a year later. XNPV falls to about <b>6,043</b>, because the biggest payment now arrives a year later. Change it back."
  ])).concat([
    C("warning", "If your numbers look wrong", "<b>#VALUE!:</b> a date was typed as text; use DATE. <b>A number far too low:</b> you added B6 again after XNPV, but XNPV already includes it. <b>#NUM! from XIRR:</b> all cash flows have the same sign.")
  ]);

  /* ------------------------------------------------------------ L11 */
  G["w2-l11"] = [
    H("Read this first: when NPV and IRR disagree"),
    P("Mavuno has one site and two choices, and can do <b>one, not both</b>. It needs a 10% return."),
    T(["", "Project A: refurbish a small shop", "Project B: open a new branch"], [
      ["Cost today", "(100,000)", "(1,000,000)"], ["Year 1", "60,000", "580,000"], ["Year 2", "60,000", "580,000"],
      ["<b>NPV at 10%</b>", "<b>4,132</b>", "<b>6,612</b>"], ["<b>IRR</b>", "<b>13.1%</b>", "<b>10.5%</b>"]
    ], [1, 2]),
    P("The two measures disagree. A earns the higher <b>percentage</b>; B adds more <b>shillings</b> of value. The shillings are what matter: Mavuno's owners are 6,612 richer with B and only 4,132 richer with A. A's high percentage is earned on a small amount of money."),
    K("Would you rather earn 50% on 100 shillings, or 10% on 10,000 shillings? 50% sounds better, but it's 50 shillings against 1,000. IRR ignores the size of a project; NPV doesn't.", "An everyday way to see it"),
    T(["Situation", "Rule"], [
      ["<b>Independent projects:</b> you can do several", "Accept every project with NPV above 0"],
      ["<b>Mutually exclusive projects:</b> only one is possible", "Choose the higher NPV"],
      ["<b>Money is limited</b> and small projects can be repeated", "Compare NPV per shilling invested (NPV ÷ cost)"],
      ["Both NPVs negative", "Do neither"]
    ]),
    C("finance", "Explaining it to a manager", "\"Project A earns a higher percentage, but B adds more value: 6,612 against 4,132. We can only build one, so B makes us richer.\" IRR is still useful as a quick comparison with the hurdle rate, but when choosing between projects NPV has the final say.")
  ].concat(walk("L11 Compare", "The rate is in B3 (10%). Project A is in column B and Project B in column C; rows 6 to 8 are years 0, 1 and 2.", [
    S("B9", "=NPV($B$3,B7:B8)+B6", "4,132", "The L7 pattern: years 1 and 2 inside, year 0 outside."),
    S("C9", "=NPV($B$3,C7:C8)+C6", "6,612", "B adds more value."),
    S("B10", "=IRR(B6:B8)", "13.07%", "A has the higher return."),
    S("C10", "=IRR(C6:C8)", "10.49%", "So NPV and IRR disagree."),
    S("B11", "=B9/-B6", "0.041", "NPV per shilling invested. The minus turns the negative cost positive."),
    S("C11", "=C9/-C6", "0.007", "A uses each shilling better, which matters only if money is short."),
    S("B13", "=IF(B9>C9,\"Project A\",\"Project B\")", "Project B", "One site, one project: choose the higher NPV.")
  ])).concat([
    C("warning", "If your numbers look wrong", "<b>NPVs about 10% too low:</b> year 0 is inside NPV (the year-0 trap). <b>A negative NPV per shilling:</b> the minus before B6 is missing. <b>IF picks A:</b> you compared IRRs instead of NPVs.")
  ]);

  /* ------------------------------------------------------------ HOMEWORK */
  G["w2-homework"] = [
    H("How to approach the homework"),
    P("Every task repeats a lesson with new numbers. If you're stuck, open that lesson's tab, find the cell that does the same job, and copy its pattern. Each task has a check value, so you'll know when you've got it."),
    T(["Task", "Same as", "The pattern to use"], [
      ["1 Compounding", "L1", "<code>=amount*(1+rate)^years</code>"],
      ["2 Savings goal", "L2, L3", "<code>=-PMT(rate/12, years*12, -start, target)</code>"],
      ["3 Mortgage", "L3", "<code>=-PMT(rate/12, years*12, loan)</code>; interest = instalment × payments − loan"],
      ["4 Offer comparison", "L4", "<code>=RATE(12, -payment, amount received)</code>, then × 12 and EFFECT"],
      ["5 Schedule", "L5", "Opening, interest, principal, closing; next month opens with last month's closing"],
      ["6 Project appraisal", "L6 to L9", "<code>=NPV(rate, years 1 on)+year 0</code>; <code>=IRR(all years)</code>; the L9 payback formula"],
      ["7 Dated cash flows", "L10", "<code>=XNPV(rate, flows, dates)</code>; <code>=XIRR(flows, dates)</code>"],
      ["8 Reflect", "L8, L11", "Three sentences in your own words"]
    ]),
    C("tip", "Before you send it", "Check four things: every answer is a formula (starts with =); monthly tasks use rate ÷ 12 and months; loans received are positive and payments negative; year 0 is outside NPV but inside IRR and XNPV.")
  ];

  /* Insert each guide at the start of its lesson, ahead of the reference cards and Try-its. */
  (W.groups || []).forEach(function (g) {
    (g.lessons || []).forEach(function (l) {
      var add = G[l.id];
      if (!add) return;
      if (l.id === "w2-start" || l.id === "w2-homework") l.blocks = add.concat(l.blocks || []);
      else l.blocks = add.concat([{ type: "h", text: "Reference: the full definitions and functions" }], l.blocks || []);
    });
  });
})();
