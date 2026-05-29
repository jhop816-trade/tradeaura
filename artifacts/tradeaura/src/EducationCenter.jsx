import React, { useState, useEffect, useRef } from "react";
import { LESSON_VISUALS } from "./TradingVisuals";

const C = {
  bg:"#0f1117", surf:"#161b27", surf2:"#1c2333", bord:"#232d40",
  blue:"#4f8ef7", green:"#34d399", red:"#f87171", gold:"#fbbf24", purp:"#a78bfa",
  txt:"#e2e8f0", muted:"#64748b", dim:"#94a3b8"
};

const COURSES = [
  {
    id: 1,
    title: "Stocks 101",
    icon: "📈",
    color: C.blue,
    desc: "Learn the fundamentals of stock trading and how equity markets work.",
    plan: "free",
    lessons: [
      {
        id: "s1l1",
        title: "What Is a Stock?",
        content: `A stock represents ownership in a company. When you buy a share of Apple, you own a tiny piece of Apple Inc.\n\n**Key Points:**\n• Companies sell stock to raise money to grow their business\n• Stockholders can profit if the company grows (stock price goes up)\n• Stockholders can lose if the company struggles (stock price goes down)\n• Public companies trade on exchanges like NYSE and NASDAQ\n\n**Example:** If Apple has 1 billion shares and you own 100 shares, you own 0.00001% of Apple. Small? Yes. But the principle is the same as owning a whole business — you benefit when it does well.`,
        keyTerms: ["Stock", "Share", "NYSE", "NASDAQ", "Shareholder"]
      },
      {
        id: "s1l2",
        title: "How Stock Markets Work",
        content: `Stock markets are places where buyers and sellers meet to trade shares.\n\n**The Basics:**\n• NYSE (New York Stock Exchange) — largest in the world\n• NASDAQ — home to tech companies like Apple, Google, Amazon\n• Markets open 9:30 AM and close 4:00 PM Eastern Time\n• Pre-market trading runs 4 AM - 9:30 AM\n• After-hours trading runs 4 PM - 8 PM\n\n**How prices move:**\nIf more people want to BUY a stock than sell it, the price goes UP.\nIf more people want to SELL than buy, the price goes DOWN.\n\nIt's pure supply and demand — just like anything else.`,
        keyTerms: ["NYSE", "NASDAQ", "Market Hours", "Pre-market", "Supply and Demand"]
      },
      {
        id: "s1l3",
        title: "Reading a Stock Quote",
        content: `When you look up a stock you'll see numbers that tell you everything about its current state.\n\n**Reading AAPL (Apple):**\n• Price: $185.50 — current trading price\n• Open: $183.20 — price when market opened today\n• High: $186.80 — highest price today\n• Low: $182.90 — lowest price today\n• Volume: 52M — how many shares traded today\n• Market Cap: $2.8T — total value of all shares\n• P/E Ratio: 28.5 — price compared to earnings\n\n**Why it matters:**\nHigh volume means lots of interest. Low volume means nobody cares. Always check volume when analyzing a stock.`,
        keyTerms: ["Price", "Volume", "Market Cap", "P/E Ratio", "52-Week High/Low"]
      },
      {
        id: "s1l4",
        title: "Bull vs Bear Markets",
        content: `These two terms describe the overall direction of the market.\n\n**Bull Market 🐂**\n• Prices are rising over time\n• Economy is growing\n• Investors are optimistic\n• Example: 2009-2020 was one of the longest bull markets in history\n\n**Bear Market 🐻**\n• Prices are falling — typically 20% or more from recent highs\n• Economy may be slowing\n• Investors are fearful\n• Example: 2022 was a bear market as the Fed raised rates\n\n**Pro Tip:**\nMost people make money in bull markets. The pros make money in BOTH directions — they short in bear markets. That's the edge you're building by learning to trade both long and short.`,
        keyTerms: ["Bull Market", "Bear Market", "Correction", "Recession", "Short Selling"]
      }
    ],
    quiz: [
      { q: "What does owning a stock mean?", options: ["You own a piece of the company", "You lent money to the company", "You work for the company", "You control the company"], answer: 0 },
      { q: "What time does the US stock market open?", options: ["8:00 AM ET", "9:30 AM ET", "10:00 AM ET", "9:00 AM ET"], answer: 1 },
      { q: "If more people want to BUY than SELL, what happens to price?", options: ["Price goes down", "Price stays the same", "Price goes up", "Volume drops"], answer: 2 },
      { q: "A bear market means prices have fallen at least:", options: ["5%", "10%", "20%", "50%"], answer: 2 }
    ]
  },
  {
    id: 2,
    title: "Futures 101",
    icon: "⚡",
    color: C.green,
    desc: "Master futures contracts, margin, leverage, and the instruments you trade every day.",
    plan: "free",
    lessons: [
      {
        id: "s2l1",
        title: "What Are Futures Contracts?",
        content: `A futures contract is an agreement to buy or sell an asset at a specific price on a specific date in the future.\n\n**Simple Example:**\nImagine a farmer grows corn. He agrees today to sell his corn for $5/bushel in 3 months — even if the price changes. That's a futures contract.\n\n**For Traders:**\nYou don't actually want the corn. You just want to profit from the PRICE MOVEMENT.\n\n**Popular Futures Markets:**\n• ES1! — S&P 500 Index futures\n• NQ1! — NASDAQ 100 futures\n• CL — Crude Oil futures\n• GC — Gold futures\n• XAU/USD — Gold vs Dollar\n\n**Key Advantage:**\nFutures trade nearly 24 hours a day, 5 days a week. Way more opportunity than stocks.`,
        keyTerms: ["Futures Contract", "ES1!", "NQ1!", "Expiration", "Settlement"]
      },
      {
        id: "s2l2",
        title: "Understanding ES1! and NQ1!",
        content: `These are the two most popular futures contracts for day traders.\n\n**ES1! — E-mini S&P 500:**\n• Tracks the S&P 500 index (500 largest US companies)\n• Each point = $50\n• Each tick = 0.25 points = $12.50\n• Margin required: ~$12,000-15,000\n• Most liquid futures contract in the world\n\n**NQ1! — E-mini NASDAQ 100:**\n• Tracks the top 100 NASDAQ companies (mostly tech)\n• Each point = $20\n• Each tick = 0.25 points = $5.00\n• Moves faster and bigger than ES\n• Higher risk, higher reward\n\n**MES and MNQ — Micro Contracts:**\n• Same as ES and NQ but 1/10th the size\n• Perfect for beginners — lower risk\n• MES: each tick = $1.25\n• MNQ: each tick = $0.50`,
        keyTerms: ["ES1!", "NQ1!", "MES", "MNQ", "Tick Value", "Point Value"]
      },
      {
        id: "s2l3",
        title: "Margin and Leverage Explained",
        content: `This is where futures get powerful — and dangerous if you don't understand it.\n\n**What is Margin?**\nMargin is the deposit you put up to control a larger position.\n\n**Example:**\nES1! contract controls $250,000+ worth of value.\nBut you only need ~$12,500 margin to trade it.\nThat's 20:1 leverage.\n\n**The Double-Edged Sword:**\n✅ A 1% move in the market = 20% gain on your margin\n❌ A 1% move against you = 20% loss on your margin\n\n**Margin Call:**\nIf your account drops below minimum margin, your broker forces you to add money or close your position.\n\n**Rule:**\nNever use max leverage. Just because you CAN control $250k doesn't mean you SHOULD with a $12,500 account.`,
        keyTerms: ["Margin", "Leverage", "Margin Call", "Maintenance Margin", "Initial Margin"]
      },
      {
        id: "s2l4",
        title: "Trading Hours and Sessions",
        content: `Futures trade almost 24/5 but not all hours are equal.\n\n**Futures Trading Hours (ET):**\n• Sunday 6 PM — Friday 5 PM (nearly 24 hours)\n• Daily break: 5:00 PM - 6:00 PM ET\n\n**The 4 Sessions:**\n\n🌏 **Asia Session** (6 PM - 2 AM ET)\n• Quieter, lower volume\n• Sets the tone for the day\n• Watch for key levels being set\n\n🌍 **London Session** (2 AM - 8 AM ET)\n• Europe wakes up — volume increases\n• Major moves often start here\n• Smart money gets active\n\n🌎 **New York Session** (8 AM - 5 PM ET)\n• Highest volume and volatility\n• Best time for most traders\n• 9:30 AM open is the most volatile\n\n**Best Time to Trade:** New York session, especially 9:30-11:30 AM and 1:30-3:30 PM`,
        keyTerms: ["Trading Sessions", "Asia Session", "London Session", "NY Session", "Liquidity"]
      }
    ],
    quiz: [
      { q: "What does each tick in ES1! equal in dollars?", options: ["$5.00", "$10.00", "$12.50", "$25.00"], answer: 2 },
      { q: "MES is what fraction of the full ES contract?", options: ["1/5th", "1/10th", "1/20th", "1/2"], answer: 1 },
      { q: "What happens during a margin call?", options: ["You get a bonus", "Broker forces you to add funds or close position", "You get extra leverage", "Your trade auto-profits"], answer: 1 },
      { q: "Which session has the highest volume and volatility?", options: ["Asia", "London", "New York", "Sydney"], answer: 2 }
    ]
  },
  {
    id: 3,
    title: "Options 101",
    icon: "🎯",
    color: C.gold,
    desc: "Understand calls, puts, and how options work as a trading tool.",
    plan: "pro",
    lessons: [
      {
        id: "s3l1",
        title: "What Are Options?",
        content: `An option gives you the RIGHT but not the OBLIGATION to buy or sell an asset at a specific price before a certain date.\n\n**Simple Example:**\nYou see a house worth $300,000. You pay $5,000 for the OPTION to buy it for $300,000 within 6 months.\n\nIf the house goes to $400,000 — you exercise your option and profit $95,000.\nIf the house stays at $300,000 — you let the option expire and only lose $5,000.\n\n**Two Types:**\n📞 **Call Option** — right to BUY at a set price\n🔙 **Put Option** — right to SELL at a set price\n\n**Why traders use options:**\n• Leverage — control large positions with small capital\n• Defined risk — max loss is what you paid\n• Flexibility — profit in any direction`,
        keyTerms: ["Call Option", "Put Option", "Strike Price", "Expiration", "Premium"]
      },
      {
        id: "s3l2",
        title: "Calls vs Puts",
        content: `**CALL OPTIONS 📞**\nYou buy a call when you think price will go UP.\n\nExample: AAPL is at $180. You buy a $185 call for $3.\n• If AAPL goes to $195, your call is worth ~$13 (profit!)\n• If AAPL stays at $180, your call expires worthless (lose $3)\n\n**PUT OPTIONS 🔙**\nYou buy a put when you think price will go DOWN.\n\nExample: SPY is at $450. You buy a $440 put for $5.\n• If SPY drops to $420, your put is worth ~$25 (profit!)\n• If SPY stays at $450, put expires worthless (lose $5)\n\n**Memory Trick:**\n• CALL = you CALL someone to come up = price goes UP\n• PUT = you PUT something down = price goes DOWN`,
        keyTerms: ["Call", "Put", "In the Money", "Out of the Money", "At the Money"]
      },
      {
        id: "s3l3",
        title: "Key Options Terms",
        content: `**Strike Price**\nThe price at which you can buy or sell the underlying asset. You choose this when you buy the option.\n\n**Expiration Date**\nThe date the option expires. After this date, it's worthless if not exercised. Weekly options expire every Friday.\n\n**Premium**\nThe price you pay for the option contract. This is your max risk.\n\n**In The Money (ITM)**\nCall: stock price is ABOVE the strike\nPut: stock price is BELOW the strike\n\n**Out of The Money (OTM)**\nCall: stock price is BELOW the strike\nPut: stock price is ABOVE the strike\n\n**The Greeks (simplified):**\n• Delta — how much option moves per $1 move in stock\n• Theta — how much value you lose per day (time decay)\n• Vega — how much value changes with volatility`,
        keyTerms: ["Strike", "Expiration", "Premium", "ITM", "OTM", "Greeks", "Theta Decay"]
      }
    ],
    quiz: [
      { q: "A call option gives you the right to:", options: ["Sell at the strike price", "Buy at the strike price", "Short the stock", "Nothing — it's just insurance"], answer: 1 },
      { q: "You buy a put option when you think price will:", options: ["Go up", "Stay the same", "Go down", "Be very volatile"], answer: 2 },
      { q: "What is the maximum loss when buying an option?", options: ["Unlimited", "The strike price", "The premium paid", "50% of the stock price"], answer: 2 },
      { q: "Theta decay means:", options: ["Options gain value over time", "Options lose value over time", "Options stay the same over time", "Options double every week"], answer: 1 }
    ]
  },
  {
    id: 4,
    title: "Technical Analysis",
    icon: "📐",
    color: C.purp,
    desc: "Learn to read charts, find support and resistance, and understand price action.",
    plan: "pro",
    lessons: [
      {
        id: "s4l1",
        title: "Support and Resistance",
        content: `Support and resistance are the foundation of technical analysis. Master these and everything else makes sense.\n\n**Support 🟢**\nA price level where buyers consistently step in and push price back up.\nThink of it as a FLOOR — price bounces off it.\n\n**Resistance 🔴**\nA price level where sellers consistently push price back down.\nThink of it as a CEILING — price gets rejected.\n\n**Key Rules:**\n• The more times price touches a level, the stronger it is\n• Old resistance becomes new support after a breakout\n• Round numbers (5000, 5100, 5200) often act as S/R\n• Previous day's high and low are critical levels\n\n**How to use it:**\nBuy near support with a stop below it.\nSell/short near resistance with a stop above it.\nThat's basic trading in a nutshell.`,
        keyTerms: ["Support", "Resistance", "Breakout", "Breakdown", "Level", "Zone"]
      },
      {
        id: "s4l2",
        title: "Trend Lines",
        content: `Trends are your best friend in trading. "The trend is your friend" is the oldest rule in trading — and it's true.\n\n**Uptrend 📈**\n• Price makes higher highs AND higher lows\n• Draw a line connecting the higher lows\n• Buy pullbacks to the trend line\n\n**Downtrend 📉**\n• Price makes lower highs AND lower lows\n• Draw a line connecting the lower highs\n• Short rallies to the trend line\n\n**Sideways/Ranging**\n• Price bounces between support and resistance\n• Buy support, sell resistance\n• Wait for breakout before taking direction\n\n**The Golden Rule:**\nDON'T fight the trend. If the market is going up, look for longs. If it's going down, look for shorts. Simple as that.`,
        keyTerms: ["Uptrend", "Downtrend", "Higher High", "Higher Low", "Lower High", "Lower Low"]
      },
      {
        id: "s4l3",
        title: "Moving Averages",
        content: `Moving averages smooth out price action and help you see the trend clearly.\n\n**Simple Moving Average (SMA)**\nAverage price over X number of candles.\n20 SMA = average of last 20 candle closes.\n\n**Exponential Moving Average (EMA)**\nSame idea but gives more weight to recent prices. Reacts faster.\n\n**Key Moving Averages Traders Watch:**\n• 9 EMA — short term momentum\n• 20 EMA — short term trend\n• 50 SMA — medium term trend\n• 200 SMA — long term trend (THE big one)\n\n**Golden Cross 🟡**\n50 SMA crosses ABOVE 200 SMA = bullish signal\n\n**Death Cross ☠️**\n50 SMA crosses BELOW 200 SMA = bearish signal\n\n**Simple Rule:**\nPrice above 200 SMA = bullish bias. Look for longs.\nPrice below 200 SMA = bearish bias. Look for shorts.`,
        keyTerms: ["SMA", "EMA", "Golden Cross", "Death Cross", "200 SMA", "Crossover"]
      },
      {
        id: "s4l4",
        title: "Chart Patterns",
        content: `Certain patterns repeat over and over in the markets. Learn to spot them.\n\n**Continuation Patterns (trend keeps going):**\n\n📊 **Bull Flag**\nStrong move up, then small pullback in a tight range, then breakout higher.\nEntry: breakout above the flag.\n\n📊 **Bear Flag**\nStrong move down, then small bounce in a tight range, then breakdown.\nEntry: breakdown below the flag.\n\n**Reversal Patterns (trend changes):**\n\n🔄 **Double Top**\nPrice hits the same resistance twice and fails = bearish reversal.\n\n🔄 **Double Bottom**\nPrice hits the same support twice and holds = bullish reversal.\n\n🔄 **Head and Shoulders**\nThree peaks — middle one highest. Classic top reversal pattern.\n\n**Remember:**\nPatterns are MORE reliable on higher timeframes (1H, 4H, Daily).`,
        keyTerms: ["Bull Flag", "Bear Flag", "Double Top", "Double Bottom", "Head and Shoulders", "Breakout"]
      }
    ],
    quiz: [
      { q: "Support is best described as:", options: ["A ceiling where price gets rejected", "A floor where buyers step in", "A trend line going down", "A moving average"], answer: 1 },
      { q: "In an uptrend, price makes:", options: ["Lower highs and lower lows", "Higher highs and higher lows", "Equal highs and equal lows", "Random moves"], answer: 1 },
      { q: "The 200 SMA is used to identify:", options: ["Short term momentum", "Long term trend direction", "Daily trading range", "Volume patterns"], answer: 1 },
      { q: "A Golden Cross occurs when:", options: ["50 SMA crosses above 200 SMA", "200 SMA crosses above 50 SMA", "Price crosses above 200 SMA", "9 EMA crosses 20 EMA"], answer: 0 }
    ]
  },
  {
    id: 5,
    title: "Candle Patterns",
    icon: "🕯️",
    color: "#f472b6",
    desc: "Master the candlestick patterns that signal reversals and continuations.",
    plan: "pro",
    lessons: [
      {
        id: "s5l1",
        title: "Reading Candlesticks",
        content: `Every candle tells a story about the battle between buyers and sellers.\n\n**Anatomy of a Candle:**\n• Body — distance between open and close\n• Wick/Shadow — price moved here but rejected\n• Green/White candle — closed HIGHER than it opened (buyers won)\n• Red/Black candle — closed LOWER than it opened (sellers won)\n\n**What the wicks tell you:**\n\nLong upper wick = sellers pushed price back down from the high. Bearish sign.\n\nLong lower wick = buyers pushed price back up from the low. Bullish sign.\n\nSmall wicks = price didn't move much outside the body. Indecision.\n\n**The bigger the body, the stronger the move.**\nA big green body = strong buying pressure.\nA big red body = strong selling pressure.`,
        keyTerms: ["Body", "Wick", "Shadow", "Bullish Candle", "Bearish Candle", "Open", "Close"]
      },
      {
        id: "s5l2",
        title: "Reversal Candles",
        content: `These patterns signal the current trend may be ending.\n\n**Hammer 🔨 (Bullish)**\nSmall body at top, long lower wick.\nMeans: sellers pushed price down but buyers fought back strongly.\nSignal: potential bullish reversal. Look for this at support levels.\n\n**Shooting Star ⭐ (Bearish)**\nSmall body at bottom, long upper wick.\nMeans: buyers pushed price up but sellers pushed it back down.\nSignal: potential bearish reversal. Look for this at resistance levels.\n\n**Doji ✚ (Indecision)**\nOpen and close are nearly equal. Cross shape.\nMeans: neither buyers nor sellers in control.\nSignal: watch for the NEXT candle to determine direction.\n\n**Engulfing Patterns:**\nBullish Engulfing — big green candle completely swallows the previous red candle. Strong buy signal.\nBearish Engulfing — big red candle completely swallows the previous green candle. Strong sell signal.`,
        keyTerms: ["Hammer", "Shooting Star", "Doji", "Engulfing", "Pin Bar", "Reversal"]
      },
      {
        id: "s5l3",
        title: "Multi-Candle Patterns",
        content: `These patterns use 2-3 candles to signal strong moves.\n\n**Three White Soldiers 🟢🟢🟢 (Very Bullish)**\nThree consecutive green candles, each closing higher.\nSignals strong bullish momentum — buyers in full control.\n\n**Three Black Crows 🔴🔴🔴 (Very Bearish)**\nThree consecutive red candles, each closing lower.\nSignals strong bearish momentum — sellers in full control.\n\n**Morning Star ⭐ (Bullish Reversal)**\n1. Big red candle (sellers in control)\n2. Small doji or spinning top (indecision)\n3. Big green candle (buyers take over)\nLook for this at major support levels.\n\n**Evening Star ⭐ (Bearish Reversal)**\n1. Big green candle (buyers in control)\n2. Small doji or spinning top (indecision)\n3. Big red candle (sellers take over)\nLook for this at major resistance levels.`,
        keyTerms: ["Three White Soldiers", "Three Black Crows", "Morning Star", "Evening Star", "Spinning Top"]
      }
    ],
    quiz: [
      { q: "A long lower wick on a candle indicates:", options: ["Strong selling pressure", "Buyers pushed price back up from lows", "Indecision in the market", "A trend continuation"], answer: 1 },
      { q: "A Hammer pattern is:", options: ["Bearish reversal signal", "Continuation pattern", "Bullish reversal signal", "Indecision pattern"], answer: 2 },
      { q: "Three White Soldiers means:", options: ["Three red candles in a row", "Three green candles each closing higher", "Three doji candles", "Three hammers"], answer: 1 },
      { q: "A Doji candle signals:", options: ["Strong buying", "Strong selling", "Indecision between buyers and sellers", "A guaranteed reversal"], answer: 2 }
    ]
  },
  {
    id: 6,
    title: "Smart Money",
    icon: "🏦",
    color: C.green,
    desc: "Learn how institutions move markets using BOS, order blocks, and liquidity concepts.",
    plan: "elite",
    lessons: [
      {
        id: "s6l1",
        title: "What Is Smart Money?",
        content: `Smart money refers to institutional traders — banks, hedge funds, market makers — who move markets with billions of dollars.\n\n**Retail Traders (you and me):**\n• Trade with small accounts\n• React to price\n• Often trapped by patterns that don't work\n• Lose money consistently\n\n**Smart Money (institutions):**\n• Trade with billions\n• MOVE price intentionally\n• Hunt retail traders' stop losses\n• Create the patterns retail traders follow\n\n**The Truth:**\nThe market is not random. Smart money has a plan. Your job is to figure out what that plan is and trade WITH them — not against them.\n\n**Key Insight:**\nRetail traders buy breakouts. Smart money SELLS into those breakouts after creating them. This is why most breakout trades fail.`,
        keyTerms: ["Smart Money", "Institutional Trading", "Market Makers", "Retail Traders", "Liquidity"]
      },
      {
        id: "s6l2",
        title: "Break of Structure (BOS)",
        content: `BOS is the foundation of Smart Money Concepts. It tells you which direction the market wants to go.\n\n**Bullish BOS:**\nPrice breaks above a previous swing high.\nThis confirms the uptrend is continuing.\nSmart money is accumulating — they want price higher.\n\n**Bearish BOS:**\nPrice breaks below a previous swing low.\nThis confirms the downtrend is continuing.\nSmart money is distributing — they want price lower.\n\n**Change of Character (ChoCH):**\nWhen a BOS happens in the OPPOSITE direction of the current trend.\nThis is the first sign the trend may be reversing.\n\n**How to use BOS:**\n1. Identify the trend using BOS\n2. Wait for price to pull back\n3. Enter in the direction of the BOS\n4. Target the next swing high/low\n\nBOS tells you WHERE the market is going. Order blocks tell you WHERE to enter.`,
        keyTerms: ["BOS", "Break of Structure", "ChoCH", "Swing High", "Swing Low", "Market Structure"]
      },
      {
        id: "s6l3",
        title: "Order Blocks",
        content: `Order blocks are the areas where smart money placed their large orders. These become powerful support and resistance zones.\n\n**Bullish Order Block:**\nThe last red (bearish) candle BEFORE a strong bullish move.\nInstitutions placed buy orders here.\nWhen price returns to this zone — buy.\n\n**Bearish Order Block:**\nThe last green (bullish) candle BEFORE a strong bearish move.\nInstitutions placed sell orders here.\nWhen price returns to this zone — sell/short.\n\n**Why it works:**\nInstitutions can't fill all their orders at once. They fill partially, price moves, then they need price to return to fill the rest of their orders.\n\n**Identifying a Valid Order Block:**\n✅ Preceded by a BOS\n✅ Strong impulsive move away from it\n✅ Hasn't been tested too many times\n✅ Aligns with higher timeframe structure`,
        keyTerms: ["Order Block", "Bullish OB", "Bearish OB", "Mitigation", "Institutional Order Flow"]
      },
      {
        id: "s6l4",
        title: "Liquidity and Stop Hunts",
        content: `Liquidity is where orders are sitting in the market. Smart money goes WHERE the orders are.\n\n**Where liquidity lives:**\n• Above swing highs (retail buy stops)\n• Below swing lows (retail sell stops)\n• Equal highs and equal lows\n• Round numbers (5000, 5100)\n\n**Stop Hunt (Liquidity Grab):**\nPrice spikes above a swing high, triggers all the stop losses sitting there, then reverses hard.\nRetail traders got stopped out.\nSmart money just filled their orders.\n\n**How to avoid being hunted:**\n• Don't put stops right at obvious swing highs/lows\n• Give your stops room beyond the obvious level\n• Wait for the liquidity grab to happen THEN enter\n\n**The Play:**\n1. Identify obvious liquidity above/below\n2. Wait for price to sweep that liquidity\n3. Look for rejection at that level\n4. Enter in the opposite direction\n5. This is the smart money trap — and you're on the right side of it`,
        keyTerms: ["Liquidity", "Stop Hunt", "Liquidity Grab", "Equal Highs", "Equal Lows", "Sweep"]
      }
    ],
    quiz: [
      { q: "Smart money refers to:", options: ["Successful retail traders", "Banks and institutional traders", "Beginner traders", "Algorithmic trading systems"], answer: 1 },
      { q: "A Bullish BOS occurs when:", options: ["Price breaks below a swing low", "Price breaks above a previous swing high", "Price consolidates", "A doji forms"], answer: 1 },
      { q: "An order block is:", options: ["A chart pattern", "The last candle before a strong move where institutions placed orders", "A moving average cross", "A support zone from years ago"], answer: 1 },
      { q: "A stop hunt or liquidity grab happens when:", options: ["Price moves smoothly in one direction", "Price spikes to grab stops then reverses", "Volume drops suddenly", "A news event occurs"], answer: 1 }
    ]
  },
  {
    id: 7,
    title: "Reading the News",
    icon: "📰",
    color: C.blue,
    desc: "Master the economic calendar and understand how news moves the markets.",
    plan: "pro",
    lessons: [
      {
        id: "s7l1",
        title: "Why News Moves Markets",
        content: `Economic news is the fuel that creates big moves. Understanding it separates amateur traders from professionals.\n\n**The Relationship:**\nMarkets move on EXPECTATIONS vs REALITY.\n\nIf investors expect good news and get bad news — markets DROP sharply.\nIf investors expect bad news and get good news — markets RALLY hard.\n\n**News Impact Levels:**\n🔴 HIGH IMPACT — can move markets 1-3%+ instantly\n🟡 MEDIUM IMPACT — moderate moves possible\n🟢 LOW IMPACT — usually ignored by markets\n\n**Where to track news:**\n• ForexFactory.com — free economic calendar\n• Investing.com — calendar + live news\n• Bloomberg Terminal (pro traders)\n• CNBC / Bloomberg TV for context\n\n**Golden Rule for new traders:**\nDO NOT trade 30 minutes before and after a high-impact news event until you understand how to handle the volatility.`,
        keyTerms: ["Economic Calendar", "High Impact News", "Volatility", "Expectations", "ForexFactory"]
      },
      {
        id: "s7l2",
        title: "The Most Important Reports",
        content: `These are the news events every futures trader MUST know.\n\n**CPI — Consumer Price Index 🔥**\nMeasures inflation. Released monthly.\nHigh CPI = Fed may raise rates = bad for stocks\nLow CPI = Fed may cut rates = good for stocks\nMarket impact: EXTREME\n\n**FOMC — Federal Reserve Meeting 🔥**\nFed announces interest rate decisions.\n8 times per year.\nRate HIKE = bad for stocks short term\nRate CUT = good for stocks\nMarket impact: EXTREME\n\n**NFP — Non-Farm Payrolls 🔥**\nJob numbers. Released first Friday of each month.\nStrong jobs = economy healthy\nWeak jobs = economy struggling\nMarket impact: VERY HIGH\n\n**GDP — Gross Domestic Product**\nMeasures total economic output.\nPositive growth = bullish\nNegative growth = bearish\nMarket impact: HIGH\n\n**PMI — Purchasing Managers Index**\nMeasures business activity.\nAbove 50 = expansion\nBelow 50 = contraction`,
        keyTerms: ["CPI", "FOMC", "NFP", "GDP", "PMI", "Interest Rates", "Inflation"]
      },
      {
        id: "s7l3",
        title: "Trading Around News",
        content: `There are two strategies for news events — and one is much safer than the other.\n\n**Strategy 1: Avoid News (Recommended for beginners)**\n• Mark all high-impact events on your calendar\n• Don't enter new trades 30 min before\n• Don't hold trades through news if you're a day trader\n• Wait 15-30 min after news for volatility to settle\n• Then trade the new direction\n\n**Strategy 2: Trade the News (Advanced)**\n• The initial move is often a FAKE move (stop hunt)\n• Price spikes one way to grab liquidity THEN reverses\n• Wait for the fake move, then trade the real move\n• This requires experience and fast execution\n\n**News Trading Rule:**\nThe first 60 seconds after a major report is manipulation time. Don't react — observe.\n\n**Practical Setup:**\nCheck ForexFactory every morning.\nMark the high impact events in red on your calendar.\nPlan your trading day AROUND them.`,
        keyTerms: ["News Trading", "Fake Move", "Volatility", "Pre-News", "Post-News", "Stop Hunt"]
      }
    ],
    quiz: [
      { q: "Markets primarily move based on:", options: ["Random price action", "Expectations vs actual results", "Technical patterns only", "Volume alone"], answer: 1 },
      { q: "CPI measures:", options: ["Employment levels", "Economic growth", "Inflation", "Federal Reserve decisions"], answer: 2 },
      { q: "FOMC meets approximately how many times per year?", options: ["4", "6", "8", "12"], answer: 2 },
      { q: "For beginners, the safest approach to high-impact news is:", options: ["Trade aggressively before news", "Avoid trading 30 min before and after", "Always hold trades through news", "Ignore economic calendar"], answer: 1 }
    ]
  },
  {
    id: 8,
    title: "Risk Management",
    icon: "🛡️",
    color: C.green,
    desc: "The most important skill in trading. Protect your capital and survive long enough to win.",
    plan: "free",
    lessons: [
      {
        id: "s8l1",
        title: "Why Risk Management Is Everything",
        content: `Most traders focus on finding good trades. The best traders focus on NOT LOSING.\n\n**The Math of Losses:**\nLose 10% → need 11% to recover ✅\nLose 25% → need 33% to recover ⚠️\nLose 50% → need 100% to recover ❌\nLose 75% → need 300% to recover 💀\n\n**The brutal truth:**\nYou can be right only 40% of the time and still be profitable — IF your winners are bigger than your losers.\n\nYou can be right 70% of the time and still blow your account — IF your losers are bigger than your winners.\n\n**Example of a professional trader:**\n• Win rate: 45%\n• Average win: $500\n• Average loss: $200\n• After 100 trades: 45 × $500 - 55 × $200 = $22,500 - $11,000 = **+$11,500 profit**\n\nRisk management is what makes a losing win rate profitable.`,
        keyTerms: ["Risk Management", "Win Rate", "Risk/Reward", "Drawdown", "Capital Preservation"]
      },
      {
        id: "s8l2",
        title: "Position Sizing",
        content: `Position sizing is deciding HOW MUCH to trade. This single skill separates professionals from amateurs.\n\n**The 1-2% Rule:**\nNever risk more than 1-2% of your account on a single trade.\n\n$25,000 account → max risk per trade = $250-$500\n$10,000 account → max risk per trade = $100-$200\n$50,000 account → max risk per trade = $500-$1,000\n\n**Why this works:**\nEven 10 losing trades in a row only costs you 10-20% of your account.\nYou stay in the game long enough to recover.\n\n**Calculating Position Size:**\n1. Decide your max dollar risk (e.g., $200)\n2. Find your stop loss distance in ticks\n3. Divide: $200 ÷ (ticks × tick value) = number of contracts\n\nExample: Stop is 8 ticks on ES ($12.50/tick)\n$200 ÷ (8 × $12.50) = $200 ÷ $100 = 2 contracts\n\n**Start with 1 contract. Always.**`,
        keyTerms: ["Position Sizing", "1% Rule", "2% Rule", "Contracts", "Account Risk"]
      },
      {
        id: "s8l3",
        title: "Stop Losses",
        content: `A stop loss is a predetermined price where you exit if you're wrong. It's your seatbelt.\n\n**Why traders avoid stop losses (and why they're wrong):**\n• "It'll come back" — sometimes it does, often it doesn't\n• "I'll manual exit" — emotions take over, you freeze\n• Result: small losses become account-destroying losses\n\n**Types of Stops:**\n\n📍 **Hard Stop** — set at your broker, executes automatically\nBest for most traders. No emotions involved.\n\n📍 **Mental Stop** — you plan to exit at a level\nRisky — emotions often prevent execution\n\n**Where to place your stop:**\n• Below the most recent swing low (for longs)\n• Above the most recent swing high (for shorts)\n• BELOW an order block, not inside it\n• Give it room — not too tight, not too wide\n\n**The golden rule:**\nIf your stop is hit, your analysis was WRONG. Accept it and move on.`,
        keyTerms: ["Stop Loss", "Hard Stop", "Mental Stop", "Stop Placement", "Risk per Trade"]
      },
      {
        id: "s8l4",
        title: "Risk/Reward Ratio",
        content: `Risk/Reward ratio compares how much you risk to how much you can make.\n\n**The Math:**\nRisk $100 to make $200 = 1:2 R/R\nRisk $100 to make $300 = 1:3 R/R\nRisk $100 to make $100 = 1:1 R/R (break even territory)\n\n**Minimum standard: 1:2 R/R**\nWith 1:2 R/R you only need to win 34% of trades to break even.\nWith 1:3 R/R you only need to win 25% of trades to break even.\n\n**How to calculate:**\n1. Entry: 5,250\n2. Stop: 5,240 (10 points risk)\n3. Target: 5,270 (20 points reward)\n4. R/R = 20/10 = 2:1 ✅\n\n**Max Daily Loss:**\nSet a max daily loss (2-3% of account) and STOP trading when you hit it.\nBad days happen. Protecting capital IS the trade.\n\n**Weekly drawdown rule:**\nIf you lose 5% in a week, take 2 days off. Your mind needs a reset.`,
        keyTerms: ["Risk/Reward", "R/R Ratio", "Target", "Max Daily Loss", "Drawdown Rule"]
      }
    ],
    quiz: [
      { q: "If you lose 50% of your account, you need what % gain to recover?", options: ["50%", "75%", "100%", "150%"], answer: 2 },
      { q: "The 1-2% rule means:", options: ["Only win 1-2% of trades", "Risk only 1-2% of account per trade", "Take 1-2 trades per day", "Use 1-2 contracts only"], answer: 1 },
      { q: "What is the minimum recommended Risk/Reward ratio?", options: ["1:0.5", "1:1", "1:2", "1:5"], answer: 2 },
      { q: "When should you stop trading for the day?", options: ["After 10 trades", "When you hit your max daily loss", "At 2 PM", "Only when profitable"], answer: 1 }
    ]
  },
  {
    id: 9,
    title: "Trading Psychology",
    icon: "🧠",
    color: C.purp,
    desc: "Control your emotions, build discipline, and develop the mindset of a professional trader.",
    plan: "elite",
    lessons: [
      {
        id: "s9l1",
        title: "The Mental Game of Trading",
        content: `Trading is 80% psychology and 20% strategy. You can have the best setup in the world and still lose if your mind isn't right.\n\n**The 3 Emotions That Destroy Traders:**\n\n😰 **Fear**\n• Afraid to enter even when setup is perfect\n• Exit winners too early\n• Can't pull the trigger after a loss\n\n🤑 **Greed**\n• Hold trades too long hoping for more\n• Risk too much on one trade\n• Chase trades you missed\n• Revenge trade after losses\n\n🤞 **Hope**\n• Holding losers hoping they come back\n• Moving your stop loss\n• "It'll turn around"\n\n**The Professional Mindset:**\nA professional trader doesn't HOPE. They PLAN.\nEvery trade has a defined entry, stop, and target BEFORE entering.\nIf price goes to stop = wrong. Take the loss. Move on.\nNo emotions. Just execution.`,
        keyTerms: ["Fear", "Greed", "Hope", "Discipline", "Execution", "Emotional Trading"]
      },
      {
        id: "s9l2",
        title: "Revenge Trading",
        content: `Revenge trading is the #1 account killer. It's when you trade emotionally to "win back" money you just lost.\n\n**How it happens:**\n1. You take a loss on a good setup ✅ Normal\n2. You feel frustrated and want to get the money back\n3. You take a trade with no setup — just to trade\n4. You lose again\n5. You trade bigger to recover faster\n6. You blow the account\n\n**Signs you're revenge trading:**\n• You're trading out of anger\n• You're increasing position size after losses\n• You're taking setups that don't match your rules\n• You're staring at the screen refusing to walk away\n\n**The Solution:**\nWhen you lose, WALK AWAY. 15 minutes minimum.\nCome back with a clear head.\nIf you lost 2 trades in a row — done for the day.\nProtect the capital. Tomorrow is another day.\n\n**Mantra:** The market will be here tomorrow. My capital might not be if I keep revenge trading.`,
        keyTerms: ["Revenge Trading", "Emotional Trading", "Tilt", "Discipline", "Walk Away Rule"]
      },
      {
        id: "s9l3",
        title: "Building a Trading Routine",
        content: `The best traders are the most boring traders. Same routine every single day.\n\n**Pre-Market Routine (before 9 AM):**\n• Check economic calendar — any high impact news?\n• Mark key levels on chart — support, resistance, order blocks\n• Check overnight session — what happened in Asia/London?\n• Write your game plan — what setups are you looking for?\n• Set alerts at key levels\n\n**During Market:**\n• Stick to your plan. Only take setups you planned for.\n• If no setup = don't trade. Cash is a position.\n• Log every thought in your journal\n• Step away after every trade win or loss\n\n**Post-Market Routine:**\n• Review every trade — was it in your plan?\n• Grade yourself on EXECUTION not just profit\n• Update your trading journal\n• What did you do well? What needs work?\n\n**Weekly Review:**\n• Total P&L\n• Win rate\n• Were losses from bad setups or bad execution?\n• One thing to improve next week`,
        keyTerms: ["Trading Routine", "Pre-Market", "Game Plan", "Post-Market Review", "Journaling"]
      },
      {
        id: "s9l4",
        title: "Mindset of a Professional Trader",
        content: `This is the difference between someone who trades and someone who IS a trader.\n\n**Amateur Mindset:**\n• Focuses on money\n• Measures success by P&L\n• Gets emotional with every trade\n• Blames the market when wrong\n• Looks for shortcuts\n• Quits after a losing streak\n\n**Professional Mindset:**\n• Focuses on process and execution\n• Measures success by following their rules\n• Emotionally neutral — wins and losses are just data\n• Takes full responsibility for every trade\n• Knows there are no shortcuts — puts in the work\n• Sees a losing streak as data, not failure\n\n**The Truth About Consistency:**\nYou cannot be consistently profitable until you are consistently disciplined.\n\nConsistency isn't about winning every day.\nIt's about executing YOUR plan every day.\n\n**Daily Affirmation for Traders:**\n"I am not in control of the market. I am only in control of my entries, exits, and position size. I accept both wins and losses as part of the process."`,
        keyTerms: ["Professional Mindset", "Process Over Outcome", "Consistency", "Discipline", "Accountability"]
      }
    ],
    quiz: [
      { q: "Trading is primarily:", options: ["10% psychology, 90% strategy", "50% psychology, 50% strategy", "80% psychology, 20% strategy", "100% strategy"], answer: 2 },
      { q: "Revenge trading is triggered by:", options: ["A winning trade", "Wanting to recover losses emotionally", "Following your trading plan", "Low volatility"], answer: 1 },
      { q: "What should you do after 2 consecutive losses?", options: ["Trade bigger to recover", "Keep trading normally", "Stop trading for the day", "Switch to a different strategy"], answer: 2 },
      { q: "A professional trader measures success by:", options: ["Daily P&L only", "Win rate only", "Following their rules and process", "How many trades they took"], answer: 2 }
    ]
  },
  {
    id: 10,
    title: "Trading Library",
    icon: "📚",
    color: C.gold,
    desc: "Essential books every serious trader should read. Curated by professionals.",
    plan: "elite",
    lessons: [
      {
        id: "s10l1",
        title: "Trading Psychology Books",
        content: `These books will change how you think about trading more than any strategy book ever will.\n\n**1. Trading in the Zone — Mark Douglas** ⭐⭐⭐⭐⭐\nThe bible of trading psychology. Teaches you to think in probabilities and remove emotion from trading. Required reading for EVERY trader. Read it twice.\n\n**2. The Disciplined Trader — Mark Douglas** ⭐⭐⭐⭐⭐\nMark Douglas's first book. Goes deep on why traders self-sabotage and how to fix it.\n\n**3. Market Wizards — Jack Schwager** ⭐⭐⭐⭐⭐\nInterviews with the world's greatest traders. Legends like Paul Tudor Jones, Bruce Kovner, Ed Seykota. Learn how the best think about markets.\n\n**4. Reminiscences of a Stock Operator — Edwin Lefèvre** ⭐⭐⭐⭐⭐\nFictionalized biography of Jesse Livermore — one of the greatest traders ever. Written in 1923 but more relevant today than ever.\n\n**5. The Psychology of Money — Morgan Housel** ⭐⭐⭐⭐\nNot specifically about trading but essential for understanding your relationship with money.`,
        keyTerms: ["Trading in the Zone", "Market Wizards", "Mark Douglas", "Jesse Livermore", "Psychology"]
      },
      {
        id: "s10l2",
        title: "Technical Analysis Books",
        content: `These books teach the technical skills that professionals use.\n\n**1. Technical Analysis of the Financial Markets — John Murphy** ⭐⭐⭐⭐⭐\nThe definitive textbook on technical analysis. Covers everything — charts, patterns, indicators, intermarket analysis. The complete reference guide.\n\n**2. Japanese Candlestick Charting Techniques — Steve Nison** ⭐⭐⭐⭐⭐\nThe book that introduced candlestick charts to Western traders. The original source for everything about candle patterns.\n\n**3. How to Make Money in Stocks — William O'Neil** ⭐⭐⭐⭐\nCUPS pattern, fundamental + technical analysis combined. Great for stock traders.\n\n**4. The Art and Science of Technical Analysis — Adam Grimes** ⭐⭐⭐⭐\nData-driven approach to technical analysis. Cuts through the noise and shows what actually works.\n\n**5. Encyclopedia of Chart Patterns — Thomas Bulkowski** ⭐⭐⭐⭐\nThe most comprehensive reference for chart patterns. Has data on success rates for every pattern.`,
        keyTerms: ["Technical Analysis", "John Murphy", "Steve Nison", "Candlestick Charts", "Chart Patterns"]
      },
      {
        id: "s10l3",
        title: "Trading Strategy and Mindset",
        content: `Books that cover the complete picture — strategy, mindset, and the business of trading.\n\n**1. The New Trading for a Living — Dr. Alexander Elder** ⭐⭐⭐⭐⭐\nCovers psychology, tactics, and risk management together. One of the most complete trading books ever written.\n\n**2. One Good Trade — Mike Bellafiore** ⭐⭐⭐⭐\nWritten by a prop firm trainer. Great insights into what it actually takes to trade professionally.\n\n**3. Thinking, Fast and Slow — Daniel Kahneman** ⭐⭐⭐⭐⭐\nNobel Prize winner explains how humans make decisions. Understanding cognitive biases makes you a better trader.\n\n**4. The Black Swan — Nassim Taleb** ⭐⭐⭐⭐\nAbout rare, unpredictable events and how they dominate markets. Changes how you think about risk.\n\n**5. Atomic Habits — James Clear** ⭐⭐⭐⭐⭐\nNot a trading book but essential. Building the habits and systems that lead to consistent execution is what trading mastery is really about.\n\n**Reading Order Recommendation:**\n1. Trading in the Zone\n2. Market Wizards\n3. Technical Analysis of Financial Markets\n4. The New Trading for a Living\n5. Atomic Habits`,
        keyTerms: ["Alexander Elder", "Prop Trading", "Cognitive Bias", "Risk", "Habits", "Systems"]
      }
    ],
    quiz: [
      { q: "Which book is considered the bible of trading psychology?", options: ["Market Wizards", "Trading in the Zone", "Reminiscences of a Stock Operator", "The Black Swan"], answer: 1 },
      { q: "Steve Nison is famous for introducing what to Western traders?", options: ["Moving averages", "Fibonacci levels", "Japanese candlestick charts", "Bollinger Bands"], answer: 2 },
      { q: "Thinking Fast and Slow by Daniel Kahneman is about:", options: ["Day trading strategies", "How humans make decisions and cognitive biases", "Futures markets", "Chart patterns"], answer: 1 },
      { q: "What is the recommended FIRST book to read?", options: ["Technical Analysis of the Financial Markets", "Atomic Habits", "Trading in the Zone", "Market Wizards"], answer: 2 }
    ]
  },

  {
    id: 11,
    title: "Market Structure",
    icon: "🏗️",
    color: "#4f8ef7",
    desc: "Understand how markets are built, how they move in phases, and how to read what price is telling you.",
    plan: "pro",
    lessons: [
      {
        id: "s11l1",
        title: "What Is Market Structure?",
        content: `Market structure is the blueprint of how price moves. Every single market — futures, stocks, forex — moves in the same predictable way if you know what to look for.\n\n**The Three Phases of Every Market:**\n\n📈 **Accumulation**\nSmart money quietly buys at low prices.\nPrice moves sideways — looks boring.\nRetail traders ignore it.\nThis is where the next big move is loading.\n\n🚀 **Markup**\nSmart money stops buying and price starts moving up.\nRetail traders finally notice and start buying.\nThis is the trend phase — where most profits are made.\n\n📉 **Distribution**\nSmart money quietly sells to late retail buyers.\nPrice moves sideways again at the top.\nLooks like consolidation but it's actually a top.\n\n💥 **Markdown**\nSmart money has sold everything.\nPrice falls hard — retail traders are left holding bags.\nWeak hands sell at the bottom into the next accumulation.\n\n**Why This Matters:**\nMost retail traders buy during markup (late) and sell during markdown (at the bottom).\nUnderstanding market structure lets you buy accumulation and sell distribution.\n\n**Reading Structure on a Chart:**\nUptrend: Higher Highs + Higher Lows\nDowntrend: Lower Highs + Lower Lows\nRanging: Equal Highs + Equal Lows (accumulation or distribution)`,
        keyTerms: ["Accumulation", "Markup", "Distribution", "Markdown", "Market Cycle", "Phases"]
      },
      {
        id: "s11l2",
        title: "Swing Highs and Swing Lows",
        content: `Swing highs and swing lows are the building blocks of market structure. Master these and you can read any chart.\n\n**Swing High:**\nA candle with a higher high than the candles on both sides.\nThis is where price turned and moved lower.\nThink of it as a peak.\n\n**Swing Low:**\nA candle with a lower low than the candles on both sides.\nThis is where price turned and moved higher.\nThink of it as a valley.\n\n**Why they matter:**\nSwing highs and lows tell you:\n• The direction of the trend\n• Where to place stop losses\n• Where targets should be\n• Where the market is likely to reverse\n\n**Uptrend Structure:**\nEach swing high is HIGHER than the last (Higher High)\nEach swing low is HIGHER than the last (Higher Low)\nAs long as this pattern holds — trend is intact.\n\n**Downtrend Structure:**\nEach swing high is LOWER than the last (Lower High)\nEach swing low is LOWER than the last (Lower Low)\nAs long as this pattern holds — trend is intact.\n\n**The Key Rule:**\nWhen a swing low breaks in an uptrend — the trend may be over.\nWhen a swing high breaks in a downtrend — the trend may be over.\nThis is called a Break of Structure (BOS).`,
        keyTerms: ["Swing High", "Swing Low", "Peak", "Valley", "Timeframe", "Trend Direction"]
      },
      {
        id: "s11l3",
        title: "Ranges and Consolidation",
        content: `The market spends about 70% of its time in consolidation — not trending. Learning to identify and trade ranges is a massive edge.\n\n**What is a Range?**\nPrice bouncing between two levels — a ceiling (resistance) and a floor (support).\nNeither buyers nor sellers are winning decisively.\nThis is a balance zone.\n\n**Types of Consolidation:**\n\n📦 **Tight Range (Coiling)**\nSmall price movement, compressing.\nBig move coming — direction unknown yet.\nWait for the breakout.\n\n📊 **Wide Range (Choppy)**\nPrice swinging between clear levels.\nCan trade the bounces — buy support, sell resistance.\nStop just outside the range.\n\n📐 **Ascending Channel**\nRange slanting upward — bullish bias.\nBuy the lower channel line, target upper.\n\n📐 **Descending Channel**\nRange slanting downward — bearish bias.\nSell the upper channel line, target lower.\n\n**Range Trading Rules:**\n1. Only trade ranges with at least 2 clear touches on each side\n2. Enter near the edge — not in the middle\n3. Stop just outside the range\n4. Exit before the other side — don't be greedy\n5. If range breaks — switch to breakout mode\n\n**The Breakout:**\nWhen price finally leaves the range — it often moves the full height of the range.\nThis is called measuring the move.`,
        keyTerms: ["Range", "Consolidation", "Breakout", "Channel", "Coiling", "Balance Zone"]
      },
      {
        id: "s11l4",
        title: "Premium and Discount Zones",
        content: `This is a Smart Money concept that changes how you think about entries. Instead of buying whenever price looks good, you buy at a discount and sell at a premium.\n\n**The Simple Concept:**\nEvery price move has a range — a high point and a low point.\nThe top 50% of that range = Premium (expensive)\nThe bottom 50% of that range = Discount (cheap)\n\n**The Rule:**\n• Buy in the DISCOUNT zone (lower 50% of a range)\n• Sell/short in the PREMIUM zone (upper 50% of a range)\n• Never buy at the top or sell at the bottom of a move\n\n**How to Find the Zone:**\n1. Identify the most recent swing high and swing low\n2. Find the 50% midpoint (equilibrium)\n3. Below the midpoint = Discount (look for longs)\n4. Above the midpoint = Premium (look for shorts)\n\n**Combining With Other Concepts:**\nDiscount zone + Order Block = High probability long\nPremium zone + Order Block = High probability short\nDiscount zone + Support level = Strong buy zone\nPremium zone + Resistance level = Strong sell zone\n\n**Why Institutions Use This:**\nInstitutions need to buy HUGE amounts of contracts.\nThey cannot buy at random prices — they need value.\nDiscount zones are where they accumulate long positions.\nPremium zones are where they accumulate short positions.\nYou are simply trading with them.`,
        keyTerms: ["Premium", "Discount", "Equilibrium", "50% Level", "Buy Zone", "Sell Zone"]
      }
    ],
    quiz: [
      { q: "Which phase do smart money institutions quietly buy at low prices?", options: ["Markup", "Distribution", "Accumulation", "Markdown"], answer: 2 },
      { q: "An uptrend consists of:", options: ["Lower highs and lower lows", "Higher highs and higher lows", "Equal highs and equal lows", "Random price movement"], answer: 1 },
      { q: "The market spends approximately what percentage of time in consolidation?", options: ["30%", "50%", "70%", "90%"], answer: 2 },
      { q: "In Smart Money concepts, you should buy in the:", options: ["Premium zone", "Equilibrium zone", "Discount zone", "Distribution zone"], answer: 2 }
    ]
  },

  {
    id: 12,
    title: "Price Action",
    icon: "📊",
    color: "#a78bfa",
    desc: "Learn to read raw price movement without indicators — the purest form of market analysis.",
    plan: "pro",
    lessons: [
      {
        id: "s12l1",
        title: "What Is Price Action?",
        content: `Price action trading means reading the market using only price — no indicators, no moving averages, no RSI. Just you and the candles.\n\n**Why Price Action Works:**\nEvery indicator is derived FROM price.\nSo price itself is the most direct information you can have.\nIndicators lag. Price doesn't.\n\n**The Core Belief:**\nAll information — earnings, news, sentiment, fear, greed — is reflected in price.\nIf you can read price, you can read the market.\n\n**What to Look For:**\n\n🕯️ **Candle Size**\nLarge candles = strong momentum, conviction\nSmall candles = indecision, low interest\n\n🕯️ **Candle Position**\nClose near the high = buyers in control\nClose near the low = sellers in control\nClose in the middle = neither side winning\n\n🕯️ **Wick Length**\nLong wicks = rejection of that price\nPrice tried to go there but got pushed back\nWick direction shows you who is losing\n\n**Strong vs Weak Moves:**\nStrong move: Large candles, little overlap, closing at extremes\nWeak move: Small candles, lots of overlap, mixed closes\n\n**The Price Action Process:**\n1. Identify the trend direction\n2. Find key support and resistance\n3. Wait for price to reach a key level\n4. Look for a rejection candle signal\n5. Enter with defined risk`,
        keyTerms: ["Price Action", "Raw Price", "No Indicators", "Strong Move", "Weak Move", "Candle Strength"]
      },
      {
        id: "s12l2",
        title: "Pin Bars and Rejection",
        content: `Pin bars are one of the most powerful price action signals. They show you exactly where the market rejected a price level.\n\n**What Is a Pin Bar?**\nA candle with a very long wick on one side and a small body on the other.\nThe long wick shows where price was REJECTED.\nAlso called a hammer, shooting star, or spike.\n\n**Bullish Pin Bar:**\nLong lower wick — price went down but buyers rejected it strongly.\nClose is near the top of the candle.\nSignal: look for longs if at support.\n\n**Bearish Pin Bar:**\nLong upper wick — price went up but sellers rejected it strongly.\nClose is near the bottom of the candle.\nSignal: look for shorts if at resistance.\n\n**Quality Criteria:**\nWick should be at least 2/3 of the total candle length.\nShould form at a key level (not in the middle of nowhere).\nThe longer and cleaner the wick — the stronger the signal.\n\n**Entry Methods:**\nAggressive: Enter at the close of the pin bar.\nConservative: Wait for price to retrace 50% into the pin bar then enter.\n\n**Stop Placement:**\nBullish pin: Stop below the low of the wick.\nBearish pin: Stop above the high of the wick.\nKeep stop tight — the wick is your invalidation point.`,
        keyTerms: ["Pin Bar", "Wick", "Rejection", "Bullish Pin", "Bearish Pin", "Wick to Body Ratio"]
      },
      {
        id: "s12l3",
        title: "Inside Bars and Consolidation",
        content: `Inside bars are a powerful price action pattern that shows consolidation and often precedes a big breakout move.\n\n**What Is an Inside Bar?**\nA candle that is completely contained within the range of the previous candle.\nThe high is lower than the previous high.\nThe low is higher than the previous low.\nIt fits entirely inside the prior candle.\n\n**What It Means:**\nThe market is pausing — neither buyers nor sellers pushing hard.\nLike a coiled spring — energy building for the next move.\nThe bigger the prior candle — the more powerful the inside bar signal.\n\n**Trading the Inside Bar:**\n\n**With the Trend:**\nIn an uptrend — inside bar breakout above the high = long entry.\nIn a downtrend — inside bar breakout below the low = short entry.\nThis is the highest probability inside bar trade.\n\n**As a Reversal:**\nInside bar at a major support or resistance = potential reversal.\nWait for the break of the inside bar in the reversal direction.\n\n**Stop Placement:**\nLong: Stop below the low of the inside bar.\nShort: Stop above the high of the inside bar.\nTight stops make these high R:R trades.\n\n**Multiple Inside Bars:**\nTwo or three inside bars in a row = even more compressed energy.\nThe eventual breakout is typically very strong.`,
        keyTerms: ["Inside Bar", "Consolidation", "Coiled Spring", "Breakout", "Mother Candle", "Volume"]
      },
      {
        id: "s12l4",
        title: "Reading Momentum and Exhaustion",
        content: `Learning to read momentum tells you when a move is strong and when it is running out of steam. This prevents you from entering too late.\n\n**Signs of STRONG Momentum:**\n• Large candle bodies\n• Candles closing near their highs or lows\n• Each successive candle extends further\n• Little to no overlap between candles\n• Volume increasing with the move\n\n**Signs of WEAKENING Momentum (Exhaustion):**\n• Candles getting smaller as move continues\n• Upper/lower wicks appearing on trend candles\n• Candles closing away from their extremes\n• Overlap between successive candles increasing\n• Volume declining as price extends\n\n**Momentum Divergence:**\nPrice makes a new high but the move is weaker than the last one.\nSmaller candles, more overlap, shorter range.\nThis tells you the buyers are running out of steam.\nLook for a reversal or pullback soon.\n\n**Practical Application:**\nStrong momentum after a breakout = trust the move, hold longer.\nWeak momentum at a key level = take profit, tighten stop.\nExhaustion at resistance = look for short setup.\nExhaustion at support = look for long setup.\n\n**The Golden Rule:**\nNever enter in the direction of an exhausted move.\nWait for it to reset (pullback or consolidation) before entering.`,
        keyTerms: ["Momentum", "Exhaustion", "Velocity", "Candle Size", "Volume", "Distribution", "Accumulation"]
      }
    ],
    quiz: [
      { q: "Price action trading uses:", options: ["RSI and MACD", "Moving averages only", "Raw price and candles only", "News and fundamentals"], answer: 2 },
      { q: "A bullish pin bar has:", options: ["Long upper wick", "Long lower wick", "No wicks", "Equal wicks both sides"], answer: 1 },
      { q: "An inside bar forms when:", options: ["Price makes a new high", "A candle is contained within the previous candle's range", "Volume spikes suddenly", "Two candles have the same close"], answer: 1 },
      { q: "Candles getting smaller as a move continues signals:", options: ["Stronger momentum", "Exhaustion and potential reversal", "A breakout coming", "Higher volume"], answer: 1 }
    ]
  },

  {
    id: 13,
    title: "Trade Management",
    icon: "⚙️",
    color: "#34d399",
    desc: "Learn what to do AFTER you enter a trade — how to manage risk, lock in profits, and maximize winners.",
    plan: "pro",
    lessons: [
      {
        id: "s13l1",
        title: "Managing a Trade After Entry",
        content: `Most traders focus on entries. The pros focus on management. What you do AFTER you enter often matters more than where you entered.\n\n**The Three Things That Happen After Entry:**\n\n✅ **Trade goes in your favor immediately**\nThis is the best case.\nPrice moves toward your target quickly.\nSign of a high quality entry.\n\n⚠️ **Trade consolidates before moving**\nPrice moves sideways after entry.\nThis is normal — be patient.\nOnly concern is if it breaks your stop.\n\n❌ **Trade goes against you**\nPrice moves toward your stop.\nDo NOT move your stop further away.\nLet the stop do its job.\n\n**The Golden Rules of Trade Management:**\n\n🚫 **Never move your stop loss further away**\nYour original stop is based on your analysis.\nMoving it away is letting emotion override logic.\nThis turns small losses into account-destroying losses.\n\n✅ **Move your stop to breakeven when possible**\nOnce trade reaches 1:1 reward — move stop to entry.\nNow you cannot lose on this trade.\nThis is risk management at its finest.\n\n✅ **Take partial profits at targets**\nClose half at first target, let rest run.\nLocks in real money while giving room for bigger gains.\n\n**The One Rule:**\nOnly exit a trade when your thesis is invalidated — not when you are scared.`,
        keyTerms: ["Trade Management", "Stop Loss", "Target", "Holding", "Early Exit", "Invalidation"]
      },
      {
        id: "s13l2",
        title: "Trailing Stops",
        content: `A trailing stop locks in profit as price moves in your favor. It's one of the most powerful tools for letting winners run while protecting gains.\n\n**How a Trailing Stop Works:**\nYou enter long at 5,250.\nInitial stop at 5,240 (10 points risk).\nPrice moves to 5,270.\nYou trail your stop up to 5,260.\nNow you're guaranteed at least +10 points profit.\nIf price keeps going — stop keeps moving up.\nIf price reverses — you exit with profit.\n\n**Types of Trailing Stops:**\n\n📏 **Fixed Point Trail**\nMove stop up by the same amount price moves up.\nSimple and systematic.\nExample: Trail 10 points behind price at all times.\n\n📊 **Structure Trail**\nMove stop behind each new swing low (for longs).\nMore sophisticated — gives trade more room to breathe.\nBest method for trending markets.\n\n📈 **Moving Average Trail**\nMove stop to below the 9 EMA or 20 EMA.\nGreat for strong trending moves.\nStop moves automatically as MA rises.\n\n**When to Start Trailing:**\nNot too early — give the trade room to develop.\nTypically start trailing after 1:1 reward is hit.\nOr when price clearly breaks above resistance.\n\n**The Psychology of Trailing:**\nTrailing stops remove the impossible question: "When do I exit?"\nThe market tells you when to exit — when it reverses enough to hit your trail.`,
        keyTerms: ["Trailing Stop", "Lock In Profit", "Structure Trail", "Moving Average Trail", "Breakeven", "Let Winners Run"]
      },
      {
        id: "s13l3",
        title: "Scaling In and Out",
        content: `Scaling means adding to or removing from your position in pieces rather than all at once. Done correctly it maximizes profits and reduces risk.\n\n**Scaling OUT (Taking Partial Profits):**\nInstead of closing your entire position at one target — you close pieces at different levels.\n\nExample with 3 contracts long:\n• At +10 points — close 1 contract (lock in some profit)\n• At +20 points — close 1 contract (more profit secured)\n• Let last contract run with trailing stop\n\n**Why Scaling Out Works:**\nYou guarantee some profit even if the full target isn't hit.\nYou still participate in big moves with the remaining contracts.\nPsychologically easier — reduces pressure on the remaining position.\n\n**Scaling IN (Adding to Winners):**\nAdding more contracts as the trade proves itself correct.\n\nExample:\n• Enter 1 contract at the order block\n• Price moves, breaks structure — add 1 more contract\n• Price continues, breaks next level — add 1 more\n\n**Rules for Scaling In:**\nOnly scale into WINNING trades — never add to losers.\nMove original stop to breakeven before adding.\nEach add has its own stop defined.\n\n**NEVER Average Down:**\nAdding to a losing position to get a better average price.\nThis is how traders blow accounts.\nIf your thesis was wrong — exit, don't double down.`,
        keyTerms: ["Scaling Out", "Scaling In", "Partial Profits", "Breakeven Stop", "Averaging Down", "Position Management"]
      },
      {
        id: "s13l4",
        title: "Funded Account Rules",
        content: `If you trade a funded account through a prop firm like FTMO, TopStep, or Apex — the rules of trade management become even more critical. Breaking the rules means losing your funding.\n\n**What Is a Funded Account?**\nA prop firm gives you their money to trade.\nYou keep 80-90% of profits.\nYou must follow strict risk rules or you lose the account.\n\n**Common Funded Account Rules:**\n\n📏 **Max Daily Loss**\nTypically 4-5% of account.\nHit this limit and trading is locked for the day.\nThis is the most important rule — respect it always.\n\n📏 **Max Total Drawdown**\nTypically 8-10% of account.\nHit this and you lose the funded account entirely.\nMust be restarted from scratch.\n\n📏 **Profit Target (Evaluation Phase)**\nMust hit a profit target (usually 8-10%) to get funded.\nMust do this within the drawdown rules.\n\n**Strategies for Protecting a Funded Account:**\n• Set a personal daily loss limit at 50-60% of the firm's limit\n• Stop trading for the day after 2 losing trades\n• Reduce size after any losing streak\n• Never trade during high impact news events\n• Keep a trading journal — review every trade\n\n**The Mental Shift:**\nWith a funded account — capital preservation comes FIRST.\nProfits come from staying in the game consistently.\nOne bad day can erase weeks of work.`,
        keyTerms: ["Funded Account", "Prop Firm", "Max Daily Loss", "Drawdown Limit", "FTMO", "TopStep", "Evaluation"]
      }
    ],
    quiz: [
      { q: "What should you NEVER do with your stop loss after entering a trade?", options: ["Move it to breakeven", "Move it in your favor", "Move it further away from entry", "Remove it entirely"], answer: 2 },
      { q: "A trailing stop is used to:", options: ["Enter trades at better prices", "Lock in profits as price moves in your favor", "Set a fixed exit point", "Reduce your position size"], answer: 1 },
      { q: "Scaling out means:", options: ["Adding more contracts as price moves against you", "Closing your entire position at once", "Closing portions of your position at different profit levels", "Moving your stop further away"], answer: 2 },
      { q: "When should you move your stop to breakeven?", options: ["Immediately after entry", "When the trade reaches 1:1 risk/reward", "Only when price hits your target", "Never — keep the original stop"], answer: 1 }
    ]
  },

  {
    id: 14,
    title: "Trading Tools",
    icon: "🛠️",
    color: "#fbbf24",
    desc: "Master TradingView, the DOM, order flow, and the tools professional traders use every day.",
    plan: "pro",
    lessons: [
      {
        id: "s14l1",
        title: "TradingView — Your Command Center",
        content: `TradingView is the most popular charting platform in the world. Every serious trader uses it. Here is how to get the most out of it.\n\n**Getting Started:**\nGo to tradingview.com — free account works fine to start.\nPro plan ($15/month) gives more indicators and alerts.\nConnect your broker for live trading (optional).\n\n**Essential TradingView Features:**\n\n📊 **Chart Types**\nCandlestick — standard, use this always.\nHeikin Ashi — smoothed candles, good for trend following.\n\n⏱️ **Timeframes**\nDaily/4H — bias and key levels\n1H/15M — entry setups\n5M/1M — precise entry timing\n\n✏️ **Drawing Tools**\nHorizontal lines — support and resistance\nTrend lines — channels and diagonals\nFib retracement — pullback levels\nRectangles — zones and order blocks\n\n🔔 **Alerts**\nSet price alerts at key levels.\nGet notified on your phone when price reaches your level.\nThis lets you step away from the screen without missing setups.\n\n**The Top-Down Analysis Workflow:**\n1. Start on the Daily chart — what is the big picture trend?\n2. Drop to 4H — where are the key levels?\n3. Drop to 1H — what setup is forming?\n4. Drop to 15M/5M — fine tune the entry\n\n**Pro Tips:**\nSave your chart layouts — one for each market you trade.\nUse the replay function to practice reading price action on historical data.\nPin your most used indicators to the toolbar.`,
        keyTerms: ["TradingView", "Timeframes", "Drawing Tools", "Alerts", "Multi-Chart", "Top-Down Analysis"]
      },
      {
        id: "s14l2",
        title: "The DOM — Depth of Market",
        content: `The DOM (Depth of Market) shows you all the pending buy and sell orders at every price level. It is like an x-ray of the order book.\n\n**What the DOM Shows:**\n• All limit buy orders below current price (bids)\n• All limit sell orders above current price (asks)\n• The current bid/ask spread\n• How many contracts are at each level\n\n**Reading the DOM:**\nBig number of contracts at a price level = strong support or resistance there.\nSmart money uses large orders to protect their positions.\n\n**Key DOM Concepts:**\n\n🟢 **Bid Stack**\nAll the buy orders waiting below price.\nLarge bid at a level = price likely to bounce there.\n\n🔴 **Ask Stack**\nAll the sell orders waiting above price.\nLarge ask at a level = price likely to reject there.\n\n⚡ **Absorption**\nWhen a large order gets completely filled and price still does not move much.\nSign that even bigger orders are on the other side.\nVery important signal.\n\n**Market Orders vs Limit Orders:**\nMarket order — fills immediately at current price. Moves price.\nLimit order — sits in the book waiting. Does not move price until filled.\n\n**Using the DOM for Entries:**\nWatch for large orders appearing near your key levels.\nIf a big bid appears at your support — confidence increases to go long.\nIf price slams through large bids — bearish sign, do not buy.`,
        keyTerms: ["DOM", "Depth of Market", "Bid", "Ask", "Order Book", "Absorption", "Limit Orders"]
      },
      {
        id: "s14l3",
        title: "Order Flow Basics",
        content: `Order flow is the most advanced tool in trading. It shows you exactly who is buying and selling and at what price in real time.\n\n**What Is Order Flow?**\nTraditional charts show you where price went.\nOrder flow shows you HOW price got there — the actual buying and selling.\n\n**Footprint Charts:**\nEvery candle is broken down to show:\n• How many contracts bought vs sold at each price\n• Where the most volume occurred\n• Delta — difference between buys and sells\n\n**Key Order Flow Concepts:**\n\n📊 **Delta**\nBuy volume minus sell volume.\nPositive delta = more buying than selling.\nNegative delta = more selling than buying.\nDivergence: price goes up but delta is negative = weakness.\n\n📊 **Volume Profile**\nShows how much volume traded at each price level.\nHigh Volume Node (HVN) = price spent a lot of time here = strong support/resistance.\nLow Volume Node (LVN) = price moved quickly through here = thin area, can move fast.\nPoint of Control (POC) = price level with the most volume traded.\n\n📊 **VWAP — Volume Weighted Average Price**\nThe average price weighted by volume.\nInstitutions use VWAP as their benchmark.\nPrice above VWAP = bullish.\nPrice below VWAP = bearish.\nVWAP often acts as support or resistance intraday.\n\n**Best Tools for Order Flow:**\n• Bookmap — visual DOM and order flow\n• Sierra Chart — professional grade\n• Tradovate — decent built in tools\n• NinjaTrader — popular with futures traders`,
        keyTerms: ["Order Flow", "Footprint Chart", "Delta", "Volume Profile", "VWAP", "Point of Control", "HVN", "LVN"]
      },
      {
        id: "s14l4",
        title: "Building Your Trading Setup",
        content: `Your trading environment matters more than most traders realize. A clean professional setup reduces mistakes and improves focus.\n\n**Essential Software:**\n\n📱 **TradingView** — charting and analysis\nFree plan works. Pro plan for more features.\nUse on computer AND phone for alerts on the go.\n\n💹 **Your Broker Platform** — execution\nFor futures: NinjaTrader, Tradovate, Sierra Chart, Rithmic.\nFor stocks: Thinkorswim (TDA/Schwab), Interactive Brokers.\nFor crypto: Binance, Coinbase Pro.\n\n📰 **Economic Calendar** — ForexFactory.com\nCheck this every single morning.\nMark the high impact events.\nPlan your trading day around them.\n\n📓 **Trading Journal** — TradeAura (you are already here!)\nLog every trade.\nReview every week.\nThis is your most important tool for growth.\n\n**Your Morning Routine Setup:**\n1. Check economic calendar — any news today?\n2. Review higher timeframe charts (daily/4H) — what is the bias?\n3. Identify key levels for the day\n4. Set price alerts on TradingView\n5. Write your game plan in TradeAura\n6. Only then — open your execution platform\n\n**Hardware Tips:**\nTwo monitors help but are not required.\nFast reliable internet is essential — cable over WiFi if possible.\nBackup internet (phone hotspot) for important trading days.\nQuiet distraction-free environment — treat it like a job.`,
        keyTerms: ["TradingView", "Broker Platform", "Economic Calendar", "Trading Journal", "Morning Routine", "Setup"]
      }
    ],
    quiz: [
      { q: "What is TradingView primarily used for?", options: ["Executing trades", "Charting and technical analysis", "News and fundamentals", "Tax reporting"], answer: 1 },
      { q: "The DOM (Depth of Market) shows you:", options: ["Historical price data", "Pending buy and sell orders at each price level", "Economic calendar events", "Your account P&L"], answer: 1 },
      { q: "VWAP stands for:", options: ["Very Wide Average Price", "Volume Weighted Average Price", "Volatile Wave Action Pattern", "Volume With Average Peaks"], answer: 1 },
      { q: "What should you check FIRST in your morning routine?", options: ["Your P&L from yesterday", "Social media for trading tips", "The economic calendar for high impact news", "Your email"], answer: 2 }
    ]
  },

  {
    id: 15,
    title: "Setups & Strategies",
    icon: "🎯",
    color: "#f87171",
    desc: "Learn specific high-probability trade setups that professional traders use every single day.",
    plan: "elite",
    lessons: [
      {
        id: "s15l1",
        title: "The BOS + Retest Setup",
        content: `This is one of the highest probability setups in trading. It combines market structure with a precise entry technique.\n\n**The Setup Step by Step:**\n\n**Step 1 — Identify the trend**\nLook at the higher timeframe (1H or 4H).\nIs price making higher highs and higher lows? Bullish.\nIs price making lower highs and lower lows? Bearish.\n\n**Step 2 — Wait for BOS**\nPrice breaks a significant swing high (bullish BOS).\nThis confirms the direction you want to trade.\n\n**Step 3 — Wait for the Retest**\nAfter the BOS, price pulls back.\nIt returns to test the level it just broke through.\nThe old resistance becomes new support.\n\n**Step 4 — Look for Confirmation**\nAt the retest level, look for a bullish candle pattern.\nHammer, bullish engulfing, pin bar — any rejection signal.\nThis confirms buyers are holding the level.\n\n**Step 5 — Enter**\nEnter long as the confirmation candle closes.\nStop loss just below the retest level.\nTarget the next significant swing high.\n\n**Why This Works:**\nThe BOS tells you direction.\nThe retest gives you a low risk entry.\nConfirmation reduces false signals.\nRisk is clearly defined and small.\n\n**Best Timeframes:** 15m entries with 1H/4H for bias.\n**Best Markets:** ES1!, NQ1!, any trending market.`,
        keyTerms: ["BOS Retest", "Old Resistance New Support", "Confirmation", "Entry Signal", "Trend Following"]
      },
      {
        id: "s15l2",
        title: "The Order Block Entry",
        content: `The order block entry is a Smart Money strategy that puts you in trades where institutions are entering. When done correctly it offers exceptional risk to reward.\n\n**The Full Setup:**\n\n**Step 1 — Find a valid order block**\nLook for the last bearish candle before a strong bullish move.\nOr the last bullish candle before a strong bearish move.\nThe move away from it must be impulsive and strong.\n\n**Step 2 — Confirm with BOS**\nThe move away from the order block should cause a BOS.\nThis validates that institutions caused the move.\n\n**Step 3 — Wait for price to return**\nPrice will often come back to test the order block.\nThis is institutions refilling their orders.\nBe patient — this can take minutes, hours, or days.\n\n**Step 4 — Enter at the order block**\nPlace a limit order at the top of the bullish order block (for longs).\nOr at the bottom of the bearish order block (for shorts).\n\n**Step 5 — Stop and Target**\nStop: below the order block (a few ticks below the low).\nTarget: the next significant swing high or liquidity pool.\nAim for minimum 1:3 risk to reward on OB entries.\n\n**Signs of a High Quality Order Block:**\n✅ In a discount zone (for bullish OB)\n✅ Aligns with higher timeframe support\n✅ Has not been tested too many times\n✅ Strong impulsive move away from it\n✅ BOS was created after it`,
        keyTerms: ["Order Block Entry", "Limit Order", "Institutional Entry", "Discount Zone", "Stop Placement", "Target"]
      },
      {
        id: "s15l3",
        title: "The Opening Range Breakout",
        content: `The Opening Range Breakout (ORB) is one of the most reliable intraday setups. It works because the first 30 minutes of the New York session sets the tone for the entire day.\n\n**What Is the Opening Range?**\nThe high and low of the first 30 minutes after the NY open (9:30 - 10:00 AM ET).\nThis range is marked on the chart.\nBreakout above or below this range signals direction for the day.\n\n**The Setup:**\n\n**Step 1 — Mark the opening range**\nAt exactly 10:00 AM ET — mark the high and low of the first 30 min.\nDraw horizontal lines at both levels.\n\n**Step 2 — Wait for the breakout**\nPrice must close ABOVE the range high for a long.\nPrice must close BELOW the range low for a short.\nDo not act on a wick through — wait for a close.\n\n**Step 3 — Enter on confirmation**\nThe candle that closes above/below the range is your signal.\nEnter at the open of the next candle.\nOr wait for a retest of the broken level.\n\n**Step 4 — Stop and Target**\nStop: inside the opening range (below the high for longs).\nTarget: 1.5x to 2x the opening range height.\n\n**Why ORB Works:**\nThe open is when institutional traders start their day.\nThe first 30 minutes is price discovery.\nOnce direction is established — institutions follow through.\nThe ORB captures this institutional follow-through.\n\n**Best Days for ORB:**\nDays with economic news before or at the open.\nHigh volume days.\nAvoid low volume days like holidays.`,
        keyTerms: ["Opening Range Breakout", "ORB", "NY Open", "Price Discovery", "Follow Through", "Range High", "Range Low"]
      },
      {
        id: "s15l4",
        title: "Liquidity Sweep Setup",
        content: `The liquidity sweep setup is a Smart Money strategy that profits from stop hunts — one of the most reliable and profitable patterns in the market.\n\n**The Concept:**\nRetail traders place their stop losses in obvious locations.\nSmart money knows exactly where these stops are.\nThey push price to those stops to trigger them.\nThen price reverses sharply in the opposite direction.\n\n**Common Liquidity Locations:**\n• Above obvious swing highs (buy stops)\n• Below obvious swing lows (sell stops)\n• Above round numbers (5,000, 5,100, 5,200)\n• Equal highs or equal lows (double tops/bottoms)\n• Previous day high and low\n\n**The Setup Step by Step:**\n\n**Step 1 — Identify the liquidity**\nFind equal highs or obvious swing highs.\nThis is where retail buy stops are sitting.\n\n**Step 2 — Wait for the sweep**\nPrice spikes above those highs — triggering all the stops.\nThis often happens quickly and violently.\nDo NOT enter during the spike.\n\n**Step 3 — Watch for rejection**\nAfter sweeping liquidity, price should reject and reverse.\nA bearish candle forming after sweeping highs = short signal.\nA bullish candle forming after sweeping lows = long signal.\n\n**Step 4 — Enter on the reversal**\nEnter as the reversal candle closes.\nStop above the high of the sweep.\nTarget the next key level below.\n\n**Why This Is Powerful:**\nYou are entering exactly where smart money entered.\nRisk is very small — stop is just above the sweep.\nTarget is the new direction — often a large move.\nR:R of 1:3 to 1:5 is common on sweep setups.`,
        keyTerms: ["Liquidity Sweep", "Stop Hunt", "Equal Highs", "Equal Lows", "Reversal Entry", "Smart Money Trap"]
      }
    ],
    quiz: [
      { q: "In the BOS + Retest setup, what does the retest confirm?", options: ["The trend has reversed", "Old resistance has become new support", "Volume is increasing", "The setup has failed"], answer: 1 },
      { q: "For an order block entry, where do you place your stop loss?", options: ["Above the order block", "Inside the order block", "Below the order block", "At your target price"], answer: 2 },
      { q: "The Opening Range Breakout uses the price action from:", options: ["The entire previous day", "The first 30 minutes after the NY open", "The London session open", "The Asian session"], answer: 1 },
      { q: "In a liquidity sweep setup, when do you enter the trade?", options: ["During the spike through liquidity", "Before price reaches the liquidity", "After price sweeps liquidity and shows reversal", "At the end of the trading day"], answer: 2 }
    ]
  }
];

export default function EducationCenter({ userPlan = "free" }) {
  const [activeModule, setActiveModule] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [progress, setProgress] = useState({});
  const [showTutor, setShowTutor] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Hey! I'm your AI trading tutor. Ask me anything about trading — futures, stocks, options, smart money, risk management, psychology. I'm here to help you level up. What do you want to learn?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const isElite = userPlan === "elite";

  useEffect(() => {
    const saved = localStorage.getItem("ta_edu_progress");
    if (saved) setProgress(JSON.parse(saved));
  }, []);

  function saveProgress(newProgress) {
    setProgress(newProgress);
    localStorage.setItem("ta_edu_progress", JSON.stringify(newProgress));
  }

  function markLessonComplete(courseId, lessonId) {
    const key = `${courseId}_${lessonId}`;
    saveProgress({ ...progress, [key]: true });
  }

  function getCourseProgress(course) {
    const completed = course.lessons.filter(l => progress[`${course.id}_${l.id}`]).length;
    return { completed, total: course.lessons.length, pct: Math.round((completed / course.lessons.length) * 100) };
  }

  function canAccess(plan) {
    if (plan === "free") return true;
    if (plan === "pro") return userPlan === "pro" || userPlan === "elite";
    if (plan === "elite") return userPlan === "elite";
    return false;
  }

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    const updatedMessages = [...chatMessages, { role: "user", content: userMsg }];
    setChatMessages(updatedMessages);
    setChatLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages.map(m => ({ role: m.role, content: m.content })) })
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = {}; }
      if (!res.ok || !data.reply) {
        setChatMessages(prev => [...prev, { role: "assistant", content: `Error ${res.status}: ${data.error || text.slice(0, 300)}` }]);
      } else {
        setChatMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch(e) {
      setChatMessages(prev => [...prev, { role: "assistant", content: `Network error: ${e?.message || String(e)}` }]);
    }
    setChatLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  if (!activeModule) {
    const totalLessons = COURSES.reduce((s, c) => s + c.lessons.length, 0);
    const completedLessons = COURSES.reduce((s, c) => s + c.lessons.filter(l => progress[`${c.id}_${l.id}`]).length, 0);
    const overallPct = Math.round((completedLessons / totalLessons) * 100);

    return (
      <div style={{ padding: "16px 16px 20px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, color: C.blue, letterSpacing: "0.2em", marginBottom: 6 }}>TRADEAURA</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Education Center</div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>Master trading from the ground up.</div>
        </div>

        <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: C.txt, fontWeight: 600 }}>Overall Progress</div>
            <div style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>{completedLessons}/{totalLessons} lessons</div>
          </div>
          <div style={{ height: 8, background: C.bg, borderRadius: 4 }}>
            <div style={{ height: "100%", width: `${overallPct}%`, background: `linear-gradient(90deg, ${C.green}, ${C.blue})`, borderRadius: 4, transition: "width 0.5s" }} />
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>{overallPct}% complete</div>
        </div>

        <button onClick={() => setShowTutor(true)}
          style={{ width: "100%", padding: 14, background: `linear-gradient(135deg, ${C.purp}30, ${C.blue}30)`, border: `1px solid ${C.purp}50`, borderRadius: 12, cursor: "pointer", fontFamily: "inherit", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, background: C.purp + "30", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🤖</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>AI Trading Tutor</div>
            <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{isElite ? "Ask me anything about trading" : "Elite plan required"}</div>
          </div>
          <div style={{ marginLeft: "auto", color: C.purp, fontSize: 16 }}>→</div>
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {COURSES.map(course => {
            const { completed, total, pct } = getCourseProgress(course);
            const accessible = canAccess(course.plan);
            return (
              <div key={course.id}
                onClick={() => accessible && setActiveModule(course)}
                style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 14, cursor: accessible ? "pointer" : "default", opacity: accessible ? 1 : 0.6, position: "relative", overflow: "hidden" }}>
                {!accessible && (
                  <div style={{ position: "absolute", top: 8, right: 8, fontSize: 9, padding: "2px 7px", borderRadius: 20, background: C.gold + "22", color: C.gold, fontWeight: 700 }}>
                    {course.plan.toUpperCase()}
                  </div>
                )}
                <div style={{ fontSize: 26, marginBottom: 8 }}>{course.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 4, lineHeight: 1.3 }}>{course.title}</div>
                <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.5, marginBottom: 10 }}>{course.desc}</div>
                {accessible && (
                  <>
                    <div style={{ height: 4, background: C.bg, borderRadius: 2, marginBottom: 4 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: course.color, borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 9, color: C.muted }}>{completed}/{total} lessons</div>
                  </>
                )}
                {!accessible && <div style={{ fontSize: 10, color: C.muted }}>Upgrade to unlock</div>}
              </div>
            );
          })}
        </div>

        {showTutor && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", flexDirection: "column" }}>
            <div style={{ background: C.surf, borderBottom: `1px solid ${C.bord}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setShowTutor(false)} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 22 }}>←</button>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>🤖 AI Trading Tutor</div>
              <span style={{ marginLeft: "auto", fontSize: 9, padding: "3px 9px", borderRadius: 20, background: C.purp + "22", color: C.purp, fontWeight: 700, border: `1px solid ${C.purp}44` }}>ELITE</span>
            </div>

            {!isElite ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Elite Plan Required</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 24, maxWidth: 320 }}>
                  The AI Trading Tutor is exclusively for Elite members — your personal AI coach available 24/7 to answer any trading question.
                </div>
                <div style={{ background: C.purp + "18", border: `1px solid ${C.purp}40`, borderRadius: 12, padding: "16px 20px", marginBottom: 24, width: "100%", maxWidth: 320, textAlign: "left" }}>
                  <div style={{ fontSize: 12, color: C.purp, fontWeight: 700, marginBottom: 8 }}>✨ Elite Plan Includes</div>
                  <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.9 }}>
                    • Unlimited AI Trading Tutor<br/>
                    • Smart Money & Psychology courses<br/>
                    • Advanced AI trade grading<br/>
                    • Priority support & early features
                  </div>
                </div>
                <button style={{ width: "100%", maxWidth: 320, padding: 14, background: `linear-gradient(135deg, ${C.purp}, ${C.blue})`, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  Upgrade to Elite — Coming Soon
                </button>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
                      <div style={{ maxWidth: "85%", padding: "10px 14px", borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", background: msg.role === "user" ? C.blue : C.surf2, border: `1px solid ${C.bord}`, fontSize: 13, color: C.txt, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
                      <div style={{ padding: "10px 14px", borderRadius: "12px 12px 12px 4px", background: C.surf2, border: `1px solid ${C.bord}` }}>
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.muted, display: "inline-block" }} />)}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div style={{ background: C.surf, borderTop: `1px solid ${C.bord}`, padding: "12px 16px 32px", display: "flex", gap: 8 }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask about trading..." onKeyDown={e => e.key === "Enter" && sendChat()}
                    style={{ flex: 1, background: C.bg, border: `1px solid ${C.bord}`, color: C.txt, padding: "11px 14px", borderRadius: 10, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                  <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()}
                    style={{ padding: "11px 18px", background: chatLoading || !chatInput.trim() ? C.muted : C.purp, color: "#fff", border: "none", borderRadius: 10, cursor: chatLoading || !chatInput.trim() ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13 }}>
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  if (activeLesson && !quizMode) {
    const lessonIndex = activeModule.lessons.findIndex(l => l.id === activeLesson.id);
    const isLast = lessonIndex === activeModule.lessons.length - 1;
    const isCompleted = progress[`${activeModule.id}_${activeLesson.id}`];

    return (
      <div style={{ padding: "16px 16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <button onClick={() => setActiveLesson(null)} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 22 }}>←</button>
          <div>
            <div style={{ fontSize: 10, color: activeModule.color, letterSpacing: "0.1em" }}>{activeModule.title.toUpperCase()}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{activeLesson.title}</div>
          </div>
        </div>

        {LESSON_VISUALS[activeLesson.id]}

        <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          {activeLesson.content.split("\n\n").map((block, i) => {
            if (block.startsWith("**") && block.endsWith("**") && !block.includes("\n")) {
              return <div key={i} style={{ fontSize: 14, fontWeight: 700, color: activeModule.color, marginBottom: 10, marginTop: i > 0 ? 16 : 0 }}>{block.replace(/\*\*/g, "")}</div>;
            }
            return (
              <div key={i} style={{ fontSize: 13, color: C.dim, lineHeight: 1.8, marginBottom: 12 }}>
                {block.split("\n").map((line, j) => {
                  if (line.startsWith("**") && line.endsWith("**")) return <div key={j} style={{ fontWeight: 700, color: C.txt, marginBottom: 4 }}>{line.replace(/\*\*/g, "")}</div>;
                  if (line.startsWith("• ")) return <div key={j} style={{ paddingLeft: 12, marginBottom: 4 }}>• {line.slice(2)}</div>;
                  if (line.startsWith("✅") || line.startsWith("❌") || line.startsWith("📍") || line.startsWith("📊") || line.startsWith("🔄") || line.startsWith("📞") || line.startsWith("🔙")) return <div key={j} style={{ marginBottom: 6 }}>{line}</div>;
                  return <span key={j}>{line}{j < block.split("\n").length - 1 ? " " : ""}</span>;
                })}
              </div>
            );
          })}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 8 }}>KEY TERMS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {activeLesson.keyTerms.map(term => (
              <span key={term} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: activeModule.color + "15", color: activeModule.color, border: `1px solid ${activeModule.color}30` }}>{term}</span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {lessonIndex > 0 && (
            <button onClick={() => setActiveLesson(activeModule.lessons[lessonIndex - 1])}
              style={{ flex: 1, padding: 12, background: "transparent", border: `1px solid ${C.bord}`, color: C.dim, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>
              ← Previous
            </button>
          )}
          <button onClick={() => {
            markLessonComplete(activeModule.id, activeLesson.id);
            if (isLast) { setQuizMode(true); setActiveLesson(null); }
            else setActiveLesson(activeModule.lessons[lessonIndex + 1]);
          }}
            style={{ flex: 2, padding: 12, background: isCompleted ? C.green + "20" : activeModule.color, color: isCompleted ? C.green : "#fff", border: isCompleted ? `1px solid ${C.green}40` : "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>
            {isCompleted ? "✓ Completed" : isLast ? "Complete & Take Quiz →" : "Next Lesson →"}
          </button>
        </div>
      </div>
    );
  }

  if (quizMode) {
    return <QuizView course={activeModule} onComplete={(score) => {
      setQuizMode(false);
      saveProgress({ ...progress, [`quiz_${activeModule.id}`]: score });
    }} onBack={() => setQuizMode(false)} />;
  }

  const { completed, total, pct } = getCourseProgress(activeModule);
  const quizScore = progress[`quiz_${activeModule.id}`];

  return (
    <div style={{ padding: "16px 16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setActiveModule(null)} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 22 }}>←</button>
        <div style={{ fontSize: 26 }}>{activeModule.icon}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{activeModule.title}</div>
          <div style={{ fontSize: 11, color: C.muted }}>{completed}/{total} lessons complete</div>
        </div>
      </div>

      <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: C.txt }}>Module Progress</span>
          <span style={{ fontSize: 12, color: activeModule.color, fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ height: 8, background: C.bg, borderRadius: 4 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: activeModule.color, borderRadius: 4, transition: "width 0.5s" }} />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 10 }}>LESSONS</div>
        {activeModule.lessons.map((lesson, i) => {
          const done = progress[`${activeModule.id}_${lesson.id}`];
          return (
            <div key={lesson.id} onClick={() => setActiveLesson(lesson)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", background: C.surf, border: `1px solid ${done ? activeModule.color + "40" : C.bord}`, borderRadius: 10, marginBottom: 8, cursor: "pointer" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? activeModule.color + "20" : C.bg, border: `1px solid ${done ? activeModule.color : C.bord}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {done ? <span style={{ color: activeModule.color, fontSize: 14 }}>✓</span> : <span style={{ color: C.muted, fontSize: 12 }}>{i + 1}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.txt }}>{lesson.title}</div>
              </div>
              <span style={{ color: C.muted, fontSize: 14 }}>→</span>
            </div>
          );
        })}
      </div>

      <div onClick={() => pct > 0 && setQuizMode(true)}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: quizScore ? C.gold + "15" : C.bg, border: `1px solid ${quizScore ? C.gold + "50" : C.bord}`, borderRadius: 12, cursor: pct > 0 ? "pointer" : "default", opacity: pct > 0 ? 1 : 0.5 }}>
        <div style={{ fontSize: 24 }}>🎯</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Module Quiz</div>
          <div style={{ fontSize: 11, color: C.muted }}>{quizScore ? `Last score: ${quizScore}%` : pct > 0 ? "Ready to test your knowledge?" : "Complete lessons first"}</div>
        </div>
        {quizScore && <span style={{ fontSize: 12, color: C.gold, fontWeight: 700 }}>{quizScore}%</span>}
      </div>
    </div>
  );
}

function QuizView({ course, onComplete, onBack }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  function selectAnswer(i) {
    if (submitted) return;
    setSelected(i);
  }

  function next() {
    const isCorrect = selected === course.quiz[current].answer;
    const newAnswers = [...answers, { selected, correct: isCorrect }];
    setAnswers(newAnswers);
    if (current < course.quiz.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      const score = Math.round((newAnswers.filter(a => a.correct).length / course.quiz.length) * 100);
      setShowResult(true);
      onComplete(score);
    }
  }

  function submit() {
    if (selected === null) return;
    setSubmitted(true);
  }

  if (showResult) {
    const correct = answers.filter(a => a.correct).length;
    const score = Math.round((correct / course.quiz.length) * 100);
    const passed = score >= 70;
    return (
      <div style={{ padding: "16px 16px 20px" }}>
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>{passed ? "🏆" : "📚"}</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: passed ? C.green : C.gold, marginBottom: 8 }}>{score}%</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{passed ? "Module Complete!" : "Keep Studying!"}</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>{correct} out of {course.quiz.length} correct</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onBack} style={{ flex: 1, padding: 14, background: "transparent", border: `1px solid ${C.bord}`, color: C.txt, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
              Back to Module
            </button>
            <button onClick={() => { setCurrent(0); setSelected(null); setAnswers([]); setSubmitted(false); setShowResult(false); }}
              style={{ flex: 1, padding: 14, background: course.color, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = course.quiz[current];
  const isCorrect = submitted && selected === q.answer;

  return (
    <div style={{ padding: "16px 16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 22 }}>←</button>
        <div>
          <div style={{ fontSize: 10, color: course.color, letterSpacing: "0.1em" }}>{course.title.toUpperCase()} QUIZ</div>
          <div style={{ fontSize: 12, color: C.muted }}>Question {current + 1} of {course.quiz.length}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {course.quiz.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < current ? course.color : i === current ? course.color + "60" : C.bord }} />
        ))}
      </div>

      <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", lineHeight: 1.5 }}>{q.q}</div>
      </div>

      {q.options.map((opt, i) => {
        let bg = C.bg, border = C.bord, color = C.txt;
        if (selected === i && !submitted) { bg = course.color + "20"; border = course.color + "60"; color = "#fff"; }
        if (submitted && i === q.answer) { bg = C.green + "20"; border = C.green + "60"; color = C.green; }
        if (submitted && selected === i && i !== q.answer) { bg = C.red + "20"; border = C.red + "60"; color = C.red; }
        return (
          <div key={i} onClick={() => selectAnswer(i)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", background: bg, border: `1px solid ${border}`, borderRadius: 10, marginBottom: 8, cursor: submitted ? "default" : "pointer", transition: "all 0.15s" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "transparent", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color, flexShrink: 0 }}>
              {submitted && i === q.answer ? "✓" : submitted && selected === i ? "✗" : ["A","B","C","D"][i]}
            </div>
            <span style={{ fontSize: 13, color }}>{opt}</span>
          </div>
        );
      })}

      {submitted && (
        <div style={{ padding: "12px 14px", borderRadius: 10, background: isCorrect ? C.green + "15" : C.red + "15", border: `1px solid ${isCorrect ? C.green + "40" : C.red + "40"}`, marginBottom: 12, fontSize: 12, color: isCorrect ? C.green : C.red, fontWeight: 600 }}>
          {isCorrect ? "✓ Correct! Great job." : `✗ Not quite. The correct answer is: "${q.options[q.answer]}"`}
        </div>
      )}

      <button onClick={submitted ? next : submit} disabled={selected === null}
        style={{ width: "100%", padding: 14, background: selected === null ? C.muted : submitted ? course.color : C.blue, color: "#fff", border: "none", borderRadius: 10, cursor: selected === null ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700 }}>
        {submitted ? (current < course.quiz.length - 1 ? "Next Question →" : "See Results →") : "Submit Answer"}
      </button>
    </div>
  );
}
