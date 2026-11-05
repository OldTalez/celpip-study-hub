// CELPIP Listening — original practice content modeled on the official task types.
// Each passage is read aloud via the browser's speech synthesis (Web Speech API).
// LEARNING NOTE (for beginners): this file is DATA, not logic. It lists practice content as plain objects
// (passages, questions, prompts). To add content, copy an existing entry, give it a new unique id, and edit the text.
// app.js loads these lists through index.html and picks from them at random.
const LISTENING_DATA = {
  skillId: "listening",
  skillName: "Listening",
  overview: {
    format: "The Listening test has six scored parts plus a short unscored practice part, totalling about 47-55 minutes. You hear each recording once (Part 6 twice) and answer multiple-choice questions as you listen or right after.",
    parts: [
      { name: "Part 1: Listening to Problem Solving", desc: "A conversation about a personal problem and how to resolve it." },
      { name: "Part 2: Listening to a Daily Life Conversation", desc: "An everyday conversation between two people (friends, coworkers, family)." },
      { name: "Part 3: Listening for Information", desc: "A longer informational conversation, e.g. discussing plans or services." },
      { name: "Part 4: Listening to a News Item", desc: "A short radio-style news report." },
      { name: "Part 5: Listening to a Discussion", exact: true, desc: "An academic-style discussion between two or more speakers." },
      { name: "Part 6: Listening to Viewpoints", desc: "Two speakers give opposing opinions; played twice." }
    ],
    tips: [
      "Read the answer choices before the audio starts (use the preview time) — you'll know what to listen for.",
      "Don't freeze on one missed detail. Keep listening; the next answer is coming.",
      "Listen for signal words (however, on the other hand, first, finally) — they mark structure and opinion shifts.",
      "For viewpoint questions, track who said what — examiners test whether you can separate two speakers' opinions.",
      "Predict answers from context (who / what / when / why) rather than waiting to hear an exact word match."
    ]
  },
  passages: [
    {
      id: "L1",
      partNum: 1,
      part: "Part 1: Listening to Problem Solving",
      title: "A Late Delivery",
      script: "Man: Hi, I ordered a desk online last week and it still hasn't arrived. The tracking page hasn't updated in four days. Woman: I'm sorry to hear that. Let me pull up your order. Okay, I see it left the warehouse on time, but it looks like it's stuck at a regional depot. Man: That's frustrating, I need it before the weekend for a home office setup. Is there anything you can do? Woman: I can either request an expedited re-route, which usually adds a day, or I can issue a full refund and you can order a different desk that's already in stock nearby. Man: How much faster would the in-stock option be? Woman: It could arrive in two days since it ships from a closer warehouse. Man: Let's do that then — refund the original order and I'll place a new one for the in-stock desk. Woman: Great, I've processed the refund, you should see it in three to five business days, and I've flagged your new order for priority shipping at no extra cost.",
      questions: [
        { q: "What is the man's main problem?", options: ["He received a damaged desk", "His order has not arrived and tracking is stuck", "He was charged twice", "He cannot find the tracking page"], answer: 1 },
        { q: "What solution does the man choose?", options: ["Wait for the original order", "Expedited re-route of the original desk", "A refund and a new in-stock order", "Cancel the order entirely with no refund"], answer: 2 },
        { q: "How long will the refund take to appear?", options: ["Immediately", "Three to five business days", "Two days", "One week"], answer: 1 },
        { q: "What extra benefit does the woman offer on the new order?", options: ["A discount", "Free priority shipping", "A gift card", "Store credit"], answer: 1 }
      ]
    },
    {
      id: "L2",
      partNum: 2,
      part: "Part 2: Listening to a Daily Life Conversation",
      title: "Planning a Weekend Trip",
      script: "Priya: So, are we still on for the cabin this weekend? Jordan: I think so, but the forecast says rain on Saturday. Priya: Ugh, really? I was hoping to hike the ridge trail. Jordan: We could still go — the rain's supposed to clear up by Sunday morning, so we could hike then instead and just relax at the cabin Saturday. Priya: That works. Should we still leave Friday evening like planned? Jordan: Yeah, let's stick with that so we get a full day either way. Oh, and I picked up a board game in case we're stuck inside. Priya: Nice. Did you also grab firewood? Jordan: Not yet, I'll get some on the way, there's a shop right before the turnoff. Priya: Perfect. I'll handle groceries then, anything you specifically want? Jordan: Just coffee, we always forget coffee.",
      questions: [
        { q: "Why might their plans change?", options: ["Jordan is sick", "The forecast predicts rain on Saturday", "The cabin is booked", "Priya has to work"], answer: 1 },
        { q: "When do they now plan to hike?", options: ["Friday night", "Saturday morning", "Sunday morning", "They cancel the hike"], answer: 2 },
        { q: "What did Jordan bring in case they're stuck inside?", options: ["A movie", "A board game", "Books", "Cards"], answer: 1 },
        { q: "Who is responsible for firewood?", options: ["Priya", "Jordan", "Both of them", "Neither, the cabin provides it"], answer: 1 },
        { q: "What does Jordan specifically ask Priya to buy?", options: ["Snacks", "Coffee", "Firewood", "Batteries"], answer: 1 }
      ]
    },
    {
      id: "L3",
      partNum: 3,
      part: "Part 3: Listening for Information",
      title: "Choosing a Gym Membership",
      script: "Receptionist: Welcome in! Are you looking to sign up for a membership today? Customer: Maybe — can you walk me through the options? Receptionist: Sure. We have three plans. The Basic plan is forty dollars a month, gym floor access only, no classes. The Standard plan is sixty dollars a month and includes unlimited group classes plus the gym floor. The Premium plan is ninety dollars a month, includes everything in Standard plus two personal training sessions each month and access to our second location downtown. Customer: I mostly want classes, spinning and yoga mainly, but I don't need personal training. Receptionist: Then Standard sounds right for you. It also includes a free fitness assessment when you sign up. Customer: Is there a contract? Receptionist: All plans are month to month, no long-term contract, but if you pay for a full year upfront on Standard, you get two months free. Customer: That's a good deal. Let's do the annual Standard plan then. Receptionist: Great choice, I'll get the paperwork started.",
      questions: [
        { q: "What does the customer mainly want?", options: ["Personal training", "Access to two locations", "Group classes", "A month-to-month contract only"], answer: 2 },
        { q: "Which plan does the receptionist recommend?", options: ["Basic", "Standard", "Premium", "A custom plan"], answer: 1 },
        { q: "What free perk comes with signing up?", options: ["A free personal training session", "A free fitness assessment", "A free gym bag", "A free guest pass"], answer: 1 },
        { q: "What is the benefit of paying annually?", options: ["A discount on Premium", "Two months free", "Free personal training", "Access to the downtown location"], answer: 1 }
      ]
    },
    {
      id: "L4",
      partNum: 4,
      part: "Part 4: Listening to a News Item",
      title: "City Announces New Bike Lane Network",
      script: "In local news, the city council approved funding yesterday for a new network of protected bike lanes connecting the downtown core to three residential neighborhoods. Construction is set to begin next spring and is expected to take approximately eight months. Officials say the project aims to reduce car congestion and improve safety for cyclists, following a twenty percent increase in bicycle commuting over the past two years. The plan includes physical barriers separating bike lanes from vehicle traffic, updated traffic signals at twelve intersections, and new secure bike parking near the downtown transit station. Some local business owners have raised concerns about reduced street parking during construction, and the city has promised to publish a detailed construction schedule next month so residents can plan accordingly. The total project cost is estimated at 4.2 million dollars, funded partly through a provincial infrastructure grant.",
      questions: [
        { q: "What did the city council approve?", options: ["A new parking garage", "A network of protected bike lanes", "A new bus route", "A pedestrian bridge"], answer: 1 },
        { q: "When is construction expected to begin?", options: ["This fall", "Next spring", "Next winter", "Immediately"], answer: 1 },
        { q: "What concern have business owners raised?", options: ["Increased noise", "Reduced street parking during construction", "Higher taxes", "Delayed deliveries"], answer: 1 },
        { q: "How is the project being funded?", options: ["Entirely by the city", "Entirely by a private donor", "Partly through a provincial grant", "Through a new toll"], answer: 2 }
      ]
    },
    {
      id: "L5",
      partNum: 5,
      part: "Part 5: Listening to a Discussion",
      title: "Remote Work Policy Debate",
      script: "Host: Today we're discussing whether companies should keep remote work options permanent. I'm joined by two workplace consultants. Alex, what's your take? Alex: I think flexibility boosts productivity and helps retain talent — people save commute time and report better focus. Companies that resisted this shift are struggling to hire. Host: Sam, you disagree? Sam: Partly. I think hybrid, not fully remote, is the sweet spot. In-person time still matters for mentorship, spontaneous collaboration, and building trust among new hires who've never met their team. Alex: That's fair, but mandating specific in-office days often backfires — employees just commute in to sit on video calls anyway. Sam: True, but without any structure, junior employees especially can feel isolated and their development suffers. Host: So is there common ground? Sam: I'd say let teams decide their own rhythm rather than a single company-wide mandate. Alex: Agreed — flexibility in how remote work is implemented matters as much as whether it's offered at all.",
      questions: [
        { q: "What is Alex's main argument?", options: ["Remote work hurts productivity", "Flexibility boosts productivity and retention", "In-office work is always better", "Companies should ban remote work"], answer: 1 },
        { q: "What is Sam's main concern about full remote work?", options: ["Higher costs", "Loss of mentorship and spontaneous collaboration", "Security risks", "Lower pay"], answer: 1 },
        { q: "What do Alex and Sam agree on by the end?", options: ["Remote work should be banned", "Teams should decide their own rhythm instead of a single mandate", "Everyone should return to the office full time", "Junior employees don't need mentorship"], answer: 1 },
        { q: "According to Alex, what often backfires?", options: ["Fully remote policies", "Mandating specific in-office days", "Hiring junior staff", "Video calls"], answer: 1 }
      ]
    },
    {
      id: "L6",
      partNum: 6,
      part: "Part 6: Listening to Viewpoints",
      title: "Should School Uniforms Be Mandatory?",
      script: "Speaker A: I support mandatory school uniforms. They reduce peer pressure around clothing and cut down on bullying related to appearance or family income. They also save parents money compared to buying trendy outfits, and they make mornings simpler for families. Schools that adopted uniforms have reported fewer discipline issues tied to dress code violations. Speaker B: I disagree. Uniforms limit self-expression at an age when students are developing their identity. Enforcing a dress code can also create new conflicts, like disputes over fit or minor variations, and some families struggle with the upfront cost of purchasing uniforms even if it's cheaper long-term. I think schools should set reasonable guidelines instead of a strict uniform requirement.",
      questions: [
        { q: "What is Speaker A's main reason for supporting uniforms?", options: ["They look professional", "They reduce peer pressure and bullying related to appearance", "They are required by law", "Teachers prefer them"], answer: 1 },
        { q: "What is Speaker B's main concern?", options: ["Uniforms are too expensive to make", "Uniforms limit self-expression and identity development", "Uniforms are uncomfortable", "Uniforms take too long to order"], answer: 1 },
        { q: "What alternative does Speaker B propose?", options: ["No dress code at all", "Reasonable guidelines instead of strict uniforms", "Uniforms only on special days", "Let each teacher decide"], answer: 1 },
        { q: "Which claim does Speaker A make about schools that adopted uniforms?", options: ["Fewer discipline issues tied to dress code", "Higher test scores", "More extracurricular participation", "Lower enrollment"], answer: 0 }
      ]
    }
  ].concat(
    typeof LISTENING_PART1 !== "undefined" ? LISTENING_PART1 : [],
    typeof LISTENING_PART2 !== "undefined" ? LISTENING_PART2 : [],
    typeof LISTENING_PART3 !== "undefined" ? LISTENING_PART3 : [],
    typeof LISTENING_PART4 !== "undefined" ? LISTENING_PART4 : [],
    typeof LISTENING_PART5 !== "undefined" ? LISTENING_PART5 : [],
    typeof LISTENING_PART6 !== "undefined" ? LISTENING_PART6 : []
  )
};
