// LEARNING NOTE (for beginners): this file is DATA, not logic. It lists practice content as plain objects
// (passages, questions, prompts). To add content, copy an existing entry, give it a new unique id, and edit the text.
// app.js loads these lists through index.html and picks from them at random.
const LISTENING_PART1 = [
  {
    id: "L1-01",
    partNum: 1,
    part: "Part 1: Listening to Problem Solving",
    title: "No Heat in the Apartment",
    script: "Marco: Hi, this is Marco in unit 4B. My heat has been out for two days now and it's getting really cold in here. Ms. Chen: I'm sorry to hear that, Marco. Let me check our maintenance log... I see a request came in yesterday morning, but it looks like it wasn't assigned to a technician yet. Marco: That's concerning, especially since the forecast says temperatures will drop below freezing tonight. Ms. Chen: Understood, I'll treat this as urgent. I can send someone out first thing tomorrow morning, between eight and ten. In the meantime, would you like me to drop off a portable space heater? Marco: Yes, that would help a lot, thank you. Will I be charged for using it? Ms. Chen: No, we provide loaner heaters free of charge for situations like this. Just return it once your heat is fixed. Marco: Okay. Do you know what might be causing the issue? Ms. Chen: Based on your description, it sounds like the furnace pilot light may have gone out, which is usually a quick fix, but the technician will confirm once he's there. Marco: That's good to know. Should I be home for the appointment? Ms. Chen: It's best if you are, in case he needs access to the thermostat inside your unit, but if you can't make it, just let the front desk know and we'll coordinate a time that works. Marco: I'll plan to be home tomorrow morning then. Thanks for your help. Ms. Chen: Of course, and I'll call you personally once the technician confirms the appointment time.",
    questions: [
      { q: "What is Marco's main problem?", options: ["His rent increased unexpectedly", "His heat has been out for two days", "His apartment flooded", "His neighbor is too loud"], answer: 1 },
      { q: "What does Ms. Chen discover when checking the log?", options: ["No request was ever filed", "The request was assigned but cancelled", "The request came in but wasn't assigned yet", "The technician already visited"], answer: 2 },
      { q: "When will the technician arrive?", options: ["Later today", "Tomorrow morning between eight and ten", "This weekend", "In two days"], answer: 1 },
      { q: "What does Ms. Chen offer to help in the meantime?", options: ["A discount on rent", "A loaner space heater", "A hotel voucher", "Extra blankets"], answer: 1 },
      { q: "Will Marco be charged for the heater?", options: ["Yes, a small daily fee", "Yes, a flat rate", "No, it's free", "Only if he keeps it more than a week"], answer: 2 },
      { q: "What does Ms. Chen suspect is causing the problem?", options: ["A broken thermostat", "The pilot light going out", "A frozen pipe", "A power outage"], answer: 1 },
      { q: "Why should Marco try to be home during the appointment?", options: ["To pay the technician directly", "In case the technician needs access to the thermostat inside", "To sign a repair contract", "Because the building requires tenant supervision"], answer: 1 },
      { q: "What will Ms. Chen do once the technician confirms the appointment?", options: ["Send an email", "Call Marco personally", "Leave a note on his door", "Text the front desk"], answer: 1 }
    ]
  },
  {
    id: "L1-02",
    partNum: 1,
    part: "Part 1: Listening to Problem Solving",
    title: "A Defective Blender",
    script: "Dana: Hi, I bought this blender here two and a half weeks ago and it stopped working yesterday, it just won't turn on at all. Clerk: I'm sorry about that. Do you happen to have your receipt with you? Dana: Yes, right here. Clerk: Thanks. Let me look this up... Our standard return window is fourteen days, so this is just outside that, but since the item is defective, not just something you changed your mind about, we can still help. Dana: Oh, that's a relief. What are my options? Clerk: I can offer you a straight exchange for the same model, or since the item includes a one-year manufacturer's warranty, I could send it directly to the manufacturer for a repair or replacement, though that usually takes about two weeks. Dana: Two weeks is a long time without a blender. I'd rather just exchange it now if that's possible. Clerk: That works. Let me grab a new one from the shelf... Here you go, same model, sealed box. Dana: Perfect. Is there anything I need to do to register the warranty on this new one? Clerk: I'd recommend registering it online using the serial number inside the box, just in case something similar happens again. Dana: I'll do that today. Thanks for sorting this out so quickly. Clerk: No problem at all, and here's a copy of today's exchange receipt in case you need it later.",
    questions: [
      { q: "What is Dana's problem?", options: ["The blender is too small", "The blender stopped working and won't turn on", "She lost the receipt", "The blender arrived damaged in shipping"], answer: 1 },
      { q: "How long ago did Dana buy the blender?", options: ["Two days ago", "One week ago", "Two and a half weeks ago", "Two months ago"], answer: 2 },
      { q: "Why can the clerk still help even though the return window has passed?", options: ["The store has no return window", "The item is defective, not a change of mind", "Dana is a loyal customer", "The receipt has no date"], answer: 1 },
      { q: "What warranty comes with the blender?", options: ["A six-month store warranty", "A one-year manufacturer's warranty", "A lifetime warranty", "No warranty"], answer: 1 },
      { q: "Why does Dana prefer an exchange over sending it for repair?", options: ["The repair costs extra money", "Repair takes about two weeks, too long to be without one", "She doesn't trust the manufacturer", "The store doesn't allow repairs"], answer: 1 },
      { q: "What does the clerk give Dana?", options: ["A refund in cash", "A different, upgraded model", "A new sealed box of the same model", "Store credit only"], answer: 2 },
      { q: "What does the clerk recommend Dana do next?", options: ["Return again in a year", "Register the warranty online using the serial number", "Call the manufacturer immediately", "Keep the receipt in the box"], answer: 1 },
      { q: "What does Dana receive at the end of the conversation?", options: ["A discount coupon", "A copy of today's exchange receipt", "A free accessory", "A membership card"], answer: 1 }
    ]
  },
  {
    id: "L1-03",
    partNum: 1,
    part: "Part 1: Listening to Problem Solving",
    title: "A Laptop That Won't Turn On",
    script: "Ray: Thank you for calling Tech Support, this is Ray, how can I help? Customer: Hi Ray, my laptop won't turn on at all. I press the power button and nothing happens, not even a light. Ray: Okay, let's try a few things first. Is the laptop plugged in, and is the charging light on the cable lit? Customer: It's plugged in, but I don't see any light on the charger either. Ray: That could point to the power adapter itself. Do you have another compatible charger you could test with, maybe from a friend or family member? Customer: I don't, unfortunately. Ray: That's alright. Given the model and that it's still under your two-year warranty, I'd recommend sending it in for a diagnostic. If it turns out to be the adapter, that's a quick fix, but if it's the internal battery or motherboard, that takes longer. Customer: How long would that take? Ray: Typically five to seven business days once we receive it. Customer: I really need a laptop for work in the meantime. Ray: We do offer loaner laptops for warranty repairs, I can arrange for one to be shipped to you before your unit even leaves your hands, so there's minimal downtime. Customer: That would be great. Should I be worried about losing my files? Ray: Since the laptop won't power on, we can't access the files directly, but if you've been syncing to cloud storage, those should be safe. I'd still recommend not attempting to force it open yourself. Customer: Okay, I'll wait for the loaner and ship this one out.",
    questions: [
      { q: "What is the customer's problem?", options: ["The laptop overheats constantly", "The laptop won't turn on at all", "The screen is cracked", "The laptop runs very slowly"], answer: 1 },
      { q: "What does Ray first suspect might be the issue?", options: ["A software virus", "The power adapter", "A cracked screen", "Overheating"], answer: 1 },
      { q: "Why does Ray recommend sending it for diagnostic?", options: ["The customer already tried everything possible", "It's under warranty and could be several possible parts", "The store requires all repairs be diagnosed in person", "The customer requested it"], answer: 1 },
      { q: "How long does a typical repair take once received?", options: ["One to two days", "Five to seven business days", "Two to three weeks", "One month"], answer: 1 },
      { q: "What does Ray offer to reduce downtime?", options: ["A refund", "A loaner laptop shipped before the customer sends theirs", "A discount on a new laptop", "Free software"], answer: 1 },
      { q: "Why can't Ray access the customer's files directly?", options: ["The files are encrypted", "The laptop won't power on", "The customer deleted them", "The hard drive is full"], answer: 1 },
      { q: "What does Ray say could keep the files safe?", options: ["A local backup drive", "Cloud storage syncing", "Printing documents", "Emailing files to himself"], answer: 1 },
      { q: "What does Ray advise the customer not to do?", options: ["Contact the manufacturer separately", "Attempt to force the laptop open himself", "Use the loaner laptop", "Cancel the warranty"], answer: 1 }
    ]
  },
  {
    id: "L1-04",
    partNum: 1,
    part: "Part 1: Listening to Problem Solving",
    title: "Rescheduling a Missed Appointment",
    script: "Receptionist: Riverside Medical Clinic, how can I help you? Elena: Hi, this is Elena Alvarez. I had a nine o'clock appointment this morning with Dr. Kim, but I got stuck behind a multi-vehicle accident on the highway and missed it completely. Receptionist: Oh no, I'm sorry to hear that. I do see the missed appointment on our system, and normally there's a twenty-five dollar late cancellation fee, but given the circumstances, I can waive that for you. Elena: Thank you, I appreciate that. My lower back pain has actually gotten worse over the past few days, so I really need to see someone soon. Receptionist: Let me check Dr. Kim's schedule... She doesn't have anything until next Thursday, but Dr. Osei has an opening tomorrow afternoon at two-thirty if you'd be open to seeing him instead. Elena: I haven't met him before, but given how much pain I'm in, tomorrow sounds much better than waiting a week. Receptionist: Understood. I'll book you with Dr. Osei tomorrow at two-thirty. Since it's a new provider for you, please arrive fifteen minutes early to fill out a brief intake form. Elena: No problem. Should I bring anything specific given the back pain? Receptionist: If you've had any recent imaging, like an X-ray, bring a copy if you have one, otherwise just come as you are and describe your symptoms to him. Elena: Okay, I don't have any imaging done yet. Receptionist: That's fine, he can order that if needed after the exam. I'll send a confirmation text shortly.",
    questions: [
      { q: "Why did Elena miss her appointment?", options: ["She overslept", "She was stuck behind an accident on the highway", "She forgot the appointment time", "Her car broke down"], answer: 1 },
      { q: "What does the receptionist do about the missed appointment fee?", options: ["Charges double", "Waives it", "Reduces it by half", "Adds it to the next visit"], answer: 1 },
      { q: "Why does Elena want to be seen soon?", options: ["She's traveling next week", "Her back pain has worsened", "She needs a form signed", "Insurance requires it"], answer: 1 },
      { q: "Why can't she see Dr. Kim right away?", options: ["Dr. Kim is on leave", "There's no opening until next Thursday", "Dr. Kim doesn't treat back pain", "The clinic is closed"], answer: 1 },
      { q: "Who does Elena agree to see instead?", options: ["A nurse practitioner", "Dr. Osei, tomorrow afternoon", "Dr. Kim, next Thursday", "A specialist across town"], answer: 1 },
      { q: "Why does she need to arrive fifteen minutes early?", options: ["To pay in advance", "To fill out an intake form as a new provider", "For a mandatory X-ray", "Parking is limited"], answer: 1 },
      { q: "What does the receptionist suggest bringing if available?", options: ["An insurance card only", "A copy of any recent imaging, like an X-ray", "A referral letter", "Previous prescriptions"], answer: 1 },
      { q: "What will happen if she has no imaging?", options: ["The appointment will be cancelled", "The doctor can order imaging after the exam", "She'll be charged an extra fee", "She must reschedule again"], answer: 1 }
    ]
  },
  {
    id: "L1-05",
    partNum: 1,
    part: "Part 1: Listening to Problem Solving",
    title: "An Unfamiliar Bank Charge",
    script: "Priya: Thanks for calling Horizon Bank, this is Priya speaking. How can I assist you today? Customer: Hi, I'm looking at my account online and there's a charge for eighty-nine dollars from a store I've never shopped at, sometime last Tuesday. Priya: I understand, let's look into that. Can you confirm the last four digits of your card for verification? Customer: Sure, it's 7734. Priya: Thank you. I do see that charge, from an electronics retailer. Have you or anyone with authorized access to your card made a purchase there recently? Customer: No, definitely not, and I still have my card right here with me. Priya: Okay, that does sound like unauthorized use. I'll open a dispute case right now. While we investigate, which usually takes up to ten business days, I can apply a temporary credit to your account for the disputed amount so it doesn't affect your balance. Customer: That would help a lot, thank you. Should I cancel my card? Priya: Yes, I'd recommend it since we don't know how the number was obtained. I can cancel this card immediately and issue a new one, which should arrive within five to seven business days. Customer: What happens if the merchant disputes the claim? Priya: If they provide evidence the charge was legitimate, we'll reach back out to you for more details before making a final decision, but in most cases like this, where the cardholder still has the physical card, the claim is resolved in the customer's favor. Customer: Okay, please go ahead and cancel the card and start the dispute.",
    questions: [
      { q: "What does the customer notice?", options: ["A missing deposit", "An unfamiliar eighty-nine dollar charge", "A doubled charge", "An ATM fee"], answer: 1 },
      { q: "What does the agent ask to verify identity?", options: ["The full card number", "The last four digits of the card", "A social insurance number", "Mother's maiden name"], answer: 1 },
      { q: "What kind of store was the charge from?", options: ["A grocery store", "An electronics retailer", "A gas station", "A clothing store"], answer: 1 },
      { q: "What does the agent offer while investigating?", options: ["A full refund immediately", "A temporary credit for the disputed amount", "A cash advance", "Free overdraft protection"], answer: 1 },
      { q: "How long does the investigation usually take?", options: ["24 hours", "Up to ten business days", "One month", "It's resolved immediately"], answer: 1 },
      { q: "What does the agent recommend regarding the card?", options: ["Keep using it as normal", "Cancel it and issue a new one", "Freeze it for one week", "Report it to police"], answer: 1 },
      { q: "How long will the new card take to arrive?", options: ["Same day", "Five to seven business days", "Two to three weeks", "One month"], answer: 1 },
      { q: "What usually happens when the cardholder still has the physical card?", options: ["The claim is automatically denied", "The claim is usually resolved in the customer's favor", "The bank charges a dispute fee", "The account is frozen permanently"], answer: 1 }
    ]
  },
  {
    id: "L1-06",
    partNum: 1,
    part: "Part 1: Listening to Problem Solving",
    title: "A Transit Pass Won't Scan",
    script: "Commuter: Excuse me, my monthly transit pass isn't working. I tapped it three times at the gate and it keeps flashing red. Staff: Let me take a look. Can I see the pass for a second?... Okay, I see the issue. According to our system, your renewal payment went through, but the pass itself wasn't updated to reflect the new month, it still shows last month's expiry date. Commuter: That's strange, I renewed it online four days ago like I always do. Staff: This does happen occasionally when there's a delay syncing the payment system with the card readers. I apologize for the inconvenience. Commuter: No worries, but I need to get to work in the next twenty minutes. Staff: Understood. I can issue you a temporary paper pass right now that will get you through the gates for today while we fix the digital one. Commuter: That works. Will my actual card be fixed by tomorrow? Staff: It should update automatically overnight, but if it's still showing the error tomorrow morning, come back to this booth and I'll manually refresh it for you. Commuter: Okay. Since I couldn't use it today, will I get any compensation? Staff: Since this was a system error on our end, I can add three extra days to your pass at no charge to make up for the inconvenience. Commuter: That's fair, thank you. Staff: Here's your temporary pass, just drop it in the return slot at the end of the day.",
    questions: [
      { q: "What is the commuter's problem?", options: ["The pass was stolen", "The pass isn't scanning and flashes red", "The pass expired last year", "The gate is broken for everyone"], answer: 1 },
      { q: "What does the staff member find is the cause?", options: ["The commuter never actually paid", "The pass wasn't updated to reflect the new month due to a sync delay", "The commuter used the wrong card", "The pass was reported lost"], answer: 1 },
      { q: "When did the commuter renew online?", options: ["This morning", "Four days ago", "Last month", "One hour ago"], answer: 1 },
      { q: "What does the staff give the commuter to use for today?", options: ["A full refund", "A temporary paper pass", "A new digital card", "A free taxi voucher"], answer: 1 },
      { q: "What should the commuter do if the error persists tomorrow?", options: ["Call customer service", "Return to the booth for a manual refresh", "Wait another week", "Buy a new pass"], answer: 1 },
      { q: "When should the digital pass update automatically?", options: ["Within the hour", "Overnight", "In one week", "It won't update automatically"], answer: 1 },
      { q: "What compensation does the staff offer?", options: ["A cash refund", "Three extra days added to the pass", "A free monthly pass next month", "A discount coupon"], answer: 1 },
      { q: "What should the commuter do with the temporary pass at the end of the day?", options: ["Keep it as a souvenir", "Drop it in the return slot", "Mail it back", "Give it to another rider"], answer: 1 }
    ]
  },
  {
    id: "L1-07",
    partNum: 1,
    part: "Part 1: Listening to Problem Solving",
    title: "A Double-Booked Shift",
    script: "Employee: Hi Mr. Patterson, do you have a minute? I think there's a mistake on this week's schedule. I'm listed for both the morning and evening shifts on Friday, back to back. Mr. Patterson: Let me pull that up... You're right, it looks like the new scheduling software double-booked you when we merged two shift templates last week. I'm sorry about that. Employee: No problem, I just wanted to flag it before Friday. Also, I had actually requested Friday evening off two weeks ago for a family event. Mr. Patterson: I see that request in the system too, it just wasn't applied when the schedule was generated. Let me fix both issues. I'll remove you from the evening shift entirely so your day off request is honored, and I'll ask Devon if he can cover it since he mentioned wanting extra hours. Employee: That sounds good. Should I still come in for the morning shift? Mr. Patterson: Yes, that one stays as originally planned. Employee: Great. Is there anything I need to do on my end? Mr. Patterson: No, I'll update the schedule and send everyone a notification once it's confirmed with Devon. If he can't take it, I'll reach out to you again, but I don't expect that to be an issue. Employee: Thanks for sorting this out so quickly. Mr. Patterson: Of course, and going forward, I'd recommend double-checking the schedule each Monday when it's posted, just in case the new software has more of these glitches while we get it sorted.",
    questions: [
      { q: "What mistake does the employee notice?", options: ["Being missing from the schedule entirely", "Being double-booked for morning and evening shifts on Friday", "Being scheduled at the wrong location", "Being given someone else's shift"], answer: 1 },
      { q: "What caused the scheduling error?", options: ["The employee filled out a form wrong", "New scheduling software merged two shift templates incorrectly", "The supervisor forgot to post the schedule", "A coworker took the shift by mistake"], answer: 1 },
      { q: "Why did the employee request Friday evening off?", options: ["A doctor's appointment", "A family event", "A vacation", "Another job"], answer: 1 },
      { q: "What does the supervisor do about the evening shift?", options: ["Keeps the employee on it anyway", "Removes the employee and asks Devon to cover it", "Cancels the shift entirely", "Splits it between two other staff"], answer: 1 },
      { q: "Does the employee still work the morning shift?", options: ["No, it's cancelled too", "Yes, it stays as originally planned", "It's moved to Saturday", "It's shortened by two hours"], answer: 1 },
      { q: "What will the supervisor do once things are confirmed?", options: ["Post a paper notice", "Send a notification to everyone", "Call each employee individually", "Do nothing further"], answer: 1 },
      { q: "What will the supervisor do if Devon can't cover the shift?", options: ["Leave the shift unfilled", "Reach out to the employee again", "Cancel the event coverage entirely", "Assign it randomly"], answer: 1 },
      { q: "What does the supervisor recommend going forward?", options: ["Submit all requests in writing", "Double-check the schedule each Monday when posted", "Avoid using the new software", "Report all future glitches to HR"], answer: 1 }
    ]
  },
  {
    id: "L1-08",
    partNum: 1,
    part: "Part 1: Listening to Problem Solving",
    title: "A Misdelivered Package",
    script: "Malik: Swift Parcel Support, this is Malik, how can I help? Customer: Hi, I'm tracking a package that says it was delivered yesterday afternoon, but I never received anything, and I was home all day. Malik: I'm sorry about that, let's investigate. Can you give me the tracking number? Customer: Yes, it's ending in 4429. Malik: Thank you. I see the delivery photo attached to this order... and it does show a package on a front porch, but looking closely, that's not a porch that matches your address in our system, it looks like a different house entirely, possibly a mis-scan by the driver. Customer: That would explain it, I don't even have a porch like that. Malik: I apologize for the error. I have two options for you: I can dispatch a replacement package today if the item is still in stock, which would arrive within two business days, or I can process a full refund right away. Customer: I still need the item, so I'd prefer the replacement. Malik: Understood, I'll get that started immediately with priority shipping at no extra charge, given the mix-up. Customer: Thank you. Is there anything you can do to find my original package? Malik: I'll flag this with the driver's local depot so they can attempt to track down the misdelivered package and retrieve it, but that's separate from your replacement, which is already on its way. Customer: That's fair. Will I get an email confirmation? Malik: Yes, you'll receive tracking details for the replacement within the next few minutes.",
    questions: [
      { q: "What is the customer's problem?", options: ["The package arrived damaged", "Tracking says delivered but the package was never received", "The package is still in transit for weeks", "The wrong item was shipped"], answer: 1 },
      { q: "What does the agent find in the delivery photo?", options: ["An empty porch", "A porch that doesn't match the customer's address", "A signature confirmation", "A locked mailbox"], answer: 1 },
      { q: "What likely happened, according to the agent?", options: ["The package was stolen after delivery", "The driver likely delivered it to the wrong house", "The customer gave the wrong address", "The package was never shipped"], answer: 1 },
      { q: "What two options does the agent offer?", options: ["Store credit or a discount", "A replacement package or a full refund", "An apology only, no compensation", "A partial refund only"], answer: 1 },
      { q: "Which option does the customer choose?", options: ["A full refund", "A replacement package", "Store credit", "Neither, cancel the order"], answer: 1 },
      { q: "How will the replacement be shipped?", options: ["Standard shipping with an extra fee", "Priority shipping at no extra charge", "Only after the original is found", "By the customer picking it up"], answer: 1 },
      { q: "What will the agent do about the original misdelivered package?", options: ["Ignore it since a replacement is coming", "Flag it with the driver's local depot", "Ask the customer to find it themselves", "Cancel the investigation"], answer: 1 },
      { q: "What will the customer receive shortly?", options: ["A phone call from the driver", "An email confirmation with tracking details", "A paper letter", "Nothing further is needed"], answer: 1 }
    ]
  },
  {
    id: "L1-09",
    partNum: 1,
    part: "Part 1: Listening to Problem Solving",
    title: "A Gym Billing Mistake",
    script: "Member: Hi, I'm calling about my gym membership bill. I signed up for the Basic plan two months ago, but I just noticed I've been charged for the Premium plan both months. Staff: I'm sorry about that, let me pull up your account... You're right, I see Basic on your original sign-up form, but somewhere in our system you were entered under Premium. That's on us. Member: Okay, so what can we do about the extra charges? Staff: I can refund the difference between Basic and Premium for both months, that comes to sixty dollars total, and I'll correct your plan going forward so you're only billed for Basic starting next cycle. Member: That works for me. How long will the refund take? Staff: It should appear back on your card within three to five business days. Member: Great, thank you. Also, I'm actually going to be traveling for a month starting next week, is there a way to pause my membership instead of paying for a month I won't use? Staff: Yes, we offer a freeze option for up to three months per year, free of charge as long as you give at least five days' notice, which you have. Member: Perfect, can you set that up starting next Monday? Staff: Absolutely, I'll freeze your account starting next Monday for four weeks, and it will automatically resume billing on the Basic plan once that period ends. Member: That's exactly what I needed, thanks for fixing everything today.",
    questions: [
      { q: "What billing error does the member notice?", options: ["Being charged twice for the same month", "Being charged for Premium instead of Basic", "Being charged after cancelling", "Being charged an annual fee unexpectedly"], answer: 1 },
      { q: "What does the staff member find caused the error?", options: ["The member upgraded by accident online", "The account was entered as Premium despite signing up for Basic", "The member requested Premium features", "A price increase applied to everyone"], answer: 1 },
      { q: "How much will be refunded?", options: ["Thirty dollars", "Sixty dollars", "One hundred dollars", "No refund, only a credit"], answer: 1 },
      { q: "How long will the refund take to appear?", options: ["Same day", "Three to five business days", "Two weeks", "One billing cycle"], answer: 1 },
      { q: "Why does the member ask about pausing the membership?", options: ["Financial hardship", "Traveling for a month", "Injury recovery", "Switching gyms"], answer: 1 },
      { q: "How long can a membership be frozen per year?", options: ["Up to one month", "Up to three months", "Up to six months", "Indefinitely"], answer: 1 },
      { q: "How much notice is required for a freeze?", options: ["No notice required", "At least five days", "Thirty days", "Two weeks"], answer: 1 },
      { q: "What happens after the freeze period ends?", options: ["The membership is cancelled", "Billing automatically resumes on the Basic plan", "The member must re-sign up", "It resumes on the Premium plan"], answer: 1 }
    ]
  },
  {
    id: "L1-10",
    partNum: 1,
    part: "Part 1: Listening to Problem Solving",
    title: "A Missing Anniversary Reservation",
    script: "Host: Good evening, welcome to Cedar and Vine, do you have a reservation with us? Customer: Yes, it should be under Whitfield, for seven o'clock, table for two. Host: Let me check... I'm sorry, I'm not seeing a reservation under that name for tonight. Customer: That's strange, I booked it online exactly a week ago for our anniversary. Host: I do apologize for the confusion, sometimes online bookings don't sync properly with our system if there's a connectivity issue on our end. Let me see what I can do right now. Customer: I really hope you can seat us, we specifically planned around this. Host: I understand completely, and I take that seriously, especially for an occasion like this. We do have a table opening up in about ten minutes, would that work? Customer: That would be fine, we can wait a few minutes. Host: I appreciate your patience. Since this was clearly an error on our system's part, I'd like to offer you a complimentary dessert tonight as an apology. Customer: That's very kind, thank you. Host: Of course. While you wait, feel free to have a seat at the bar, and I'll come find you the moment your table is ready. Customer: Sounds good. Host: Again, I'm sorry for the mix-up, and happy anniversary to you both.",
    questions: [
      { q: "What problem does the customer encounter?", options: ["The restaurant is fully booked with no tables", "The reservation isn't found in the system", "The wrong table size was booked", "The restaurant is closed for the night"], answer: 1 },
      { q: "What is the occasion for the reservation?", options: ["A birthday", "An anniversary", "A business meeting", "A graduation"], answer: 1 },
      { q: "What does the host suggest caused the problem?", options: ["The customer booked the wrong night", "Online booking didn't sync due to a connectivity issue", "The customer cancelled by mistake", "The restaurant overbooked intentionally"], answer: 1 },
      { q: "How long will the customer need to wait for a table?", options: ["No wait needed", "About ten minutes", "Thirty minutes", "One hour"], answer: 1 },
      { q: "What does the host offer as an apology?", options: ["A full refund of the meal", "A complimentary dessert", "A discount voucher for next visit", "A free bottle of wine"], answer: 1 },
      { q: "Where does the host suggest the customer wait?", options: ["Outside on the patio", "At the bar", "In their car", "Standing in the lobby"], answer: 1 },
      { q: "What will the host do once the table is ready?", options: ["Call their phone", "Come find them at the bar", "Have another staff member check them in", "Send a text message"], answer: 1 },
      { q: "What tone does the host take throughout the conversation?", options: ["Dismissive and rushed", "Apologetic and accommodating", "Annoyed and defensive", "Indifferent"], answer: 1 }
    ]
  },
  {
    id: "L1-11",
    partNum: 1,
    part: "Part 1: Listening to Problem Solving",
    title: "A Leak Under the Sink",
    script: "Homeowner: Hi, I have water leaking from under my kitchen sink, it's pooling on the floor and I don't know what to do. Plumber: Okay, don't panic, let's handle this step by step. First, do you know where your main water shut-off valve is, usually under the sink itself or in the basement? Homeowner: I think there's a small valve right under the sink. Plumber: Good, turn that clockwise until it stops, that should cut off water to that specific fixture without shutting off water to your whole house. Homeowner: Okay, I just turned it... the leaking has slowed down a lot already. Plumber: Great, that buys us some time. Based on what you're describing, it sounds like it could be a loose connection or a worn-out seal on the pipe, which are both common and usually straightforward to fix. Homeowner: How soon can someone come look at it? Plumber: I have a technician finishing a job nearby, he could be at your place within the hour if that works. Homeowner: Yes, that's perfect. Can you tell me roughly what this might cost? Plumber: For a simple seal replacement, it's usually between eighty and one hundred and twenty dollars including labor, but if he finds the pipe itself is damaged, it could run higher, he'll give you an exact quote before doing any additional work. Homeowner: That sounds reasonable. Should I clean up the water on the floor now? Plumber: Yes, please do, just to prevent any slipping and to protect your flooring while you wait.",
    questions: [
      { q: "What is the homeowner's emergency?", options: ["A clogged drain", "Water leaking from under the kitchen sink", "No hot water in the house", "A burst pipe outside"], answer: 1 },
      { q: "Which valve does the homeowner find and turn to slow the leak?", options: ["The water meter outside", "The shut-off valve under the sink", "The circuit breaker", "The main house valve in the basement"], answer: 1 },
      { q: "What happens after the homeowner turns the valve?", options: ["The leak stops completely and repair isn't needed", "The leaking slows down significantly", "Nothing changes", "The water pressure increases"], answer: 1 },
      { q: "What does the plumber think might be causing the leak?", options: ["A cracked sink basin", "A loose connection or worn-out seal", "A frozen pipe", "A clogged garbage disposal"], answer: 1 },
      { q: "When can a technician arrive?", options: ["Tomorrow morning", "Within the hour", "Later this week", "In three hours"], answer: 1 },
      { q: "What is the estimated cost for a simple seal replacement?", options: ["Twenty to forty dollars", "Eighty to one hundred twenty dollars including labor", "Three hundred to four hundred dollars", "It's free under warranty"], answer: 1 },
      { q: "What will happen if the pipe itself is damaged?", options: ["The job is automatically cancelled", "The cost could run higher, with a quote given before extra work", "The homeowner must find a new plumber", "It becomes a free repair"], answer: 1 },
      { q: "What does the plumber suggest the homeowner do while waiting?", options: ["Leave the water as is", "Clean up the water on the floor to prevent slipping", "Call a second plumber for a quote", "Turn off electricity to the house"], answer: 1 }
    ]
  },
  {
    id: "L1-12",
    partNum: 1,
    part: "Part 1: Listening to Problem Solving",
    title: "A Denied Insurance Claim",
    script: "Policyholder: Hi, I'm calling about a claim I submitted for roof damage after last month's storm. I just got a letter saying it was denied, and I don't understand why. Agent: I'm sorry for the frustration, let me look into that for you. Can you give me your claim number? Policyholder: Yes, it's HC-58213. Agent: Thank you, one moment... Okay, I see the claim was denied due to insufficient documentation, specifically, we didn't receive photos showing the damage before any repairs were started. Policyholder: Oh, I see, I did take photos, but I think I only sent the ones from after our neighbor helped tarp the roof temporarily. Agent: That would explain it, since the tarp may have covered some of the original damage in those images. Do you have any photos from immediately after the storm, before the tarp went up? Policyholder: I believe so, I took some on my phone that same night. Agent: Perfect, if you can email those to our claims department along with a brief note referencing this claim number, we can reopen the case for review. Policyholder: How long would that take? Agent: Once resubmitted, it typically takes five to seven business days for a decision. Policyholder: And if it's denied again? Agent: You'd have the right to formally appeal within thirty days of that decision, and at that point we could also send an adjuster out in person if photo evidence alone isn't sufficient. Policyholder: Okay, I'll send those original photos today. Agent: Great, I'll add a note to your file so the claims team knows to expect them.",
    questions: [
      { q: "Why is the policyholder calling?", options: ["To file a new claim", "Because their claim was denied and they don't understand why", "To cancel their policy", "To increase their coverage"], answer: 1 },
      { q: "Why was the claim denied?", options: ["The storm wasn't covered by the policy", "Insufficient documentation, missing photos of damage before repairs", "The claim was filed too late", "The policyholder owes back payments"], answer: 1 },
      { q: "What issue did the submitted photos have?", options: ["They were too blurry to see", "They were taken after the tarp was already up", "They were sent to the wrong department", "They showed a different property"], answer: 1 },
      { q: "What does the agent ask the policyholder to find?", options: ["A copy of the original policy", "Photos taken the night of the storm, before the tarp", "A written statement from the neighbor", "A repair invoice"], answer: 1 },
      { q: "How should the policyholder send the new photos?", options: ["Mail printed copies", "Email them to the claims department with the claim number", "Bring them in person only", "Fax them"], answer: 1 },
      { q: "How long will a decision take after resubmission?", options: ["24 hours", "Five to seven business days", "One business day", "Thirty days"], answer: 1 },
      { q: "What can the policyholder do if the claim is denied again?", options: ["Nothing further can be done", "Formally appeal within thirty days", "Sue the insurance company immediately", "Switch insurance providers only"], answer: 1 },
      { q: "What additional step might happen during an appeal?", options: ["An automatic full payout", "An adjuster sent in person", "A policy cancellation", "A premium increase"], answer: 1 }
    ]
  }
];

const LISTENING_PART2 = [
  {
    id: "L2-01",
    partNum: 2,
    part: "Part 2: Listening to a Daily Life Conversation",
    title: "Planning a Surprise Party",
    script: "Jamie: So, are we still doing the surprise party for Alicia next Saturday? Taylor: Yes, I booked the back room at the community center for six o'clock. Jamie: Perfect. Did you end up inviting her sister too? Taylor: I did, she's actually going to help distract Alicia that afternoon so we can finish decorating without her finding out. Jamie: Smart. What about food, are we doing catering or potluck? Taylor: I was thinking potluck to keep costs down, I'll order a cake, and everyone else can bring a dish. Jamie: That works, I'll bring drinks and some appetizers. Taylor: Great, I'll set up a group chat so people can claim what they're bringing without doubling up. Jamie: Good idea. What time should everyone arrive to set up? Taylor: Let's say five, so we have a full hour before Alicia gets there around six. Jamie: I can come at four thirty to help with decorations if you want. Taylor: That would be a huge help, thank you. Jamie: No problem, this is going to be such a nice surprise for her.",
    questions: [
      { q: "What event are Jamie and Taylor planning?", options: ["A wedding shower", "A surprise party for Alicia", "A retirement party", "A graduation celebration"], answer: 1 },
      { q: "Where will the party be held?", options: ["Taylor's house", "The back room at the community center", "A restaurant", "A park"], answer: 1 },
      { q: "What is Alicia's sister's role?", options: ["Bringing the cake", "Distracting Alicia while they decorate", "Booking the venue", "Sending invitations"], answer: 1 },
      { q: "How are they handling the food?", options: ["Full catering service", "A potluck, with Taylor ordering the cake", "Everyone eating beforehand", "A restaurant reservation"], answer: 1 },
      { q: "What time does Jamie plan to arrive to help decorate?", options: ["Four thirty", "Five o'clock", "Six o'clock", "Six thirty"], answer: 0 }
    ]
  },
  {
    id: "L2-02",
    partNum: 2,
    part: "Part 2: Listening to a Daily Life Conversation",
    title: "A Farmers Market and Bike Ride",
    script: "Noah: Hey, are you free Saturday morning? I was thinking we could check out that new farmers market downtown and maybe bike along the river after. Sofia: I'm free until about two in the afternoon, so that timing could work. What time were you thinking for the market? Noah: It opens at eight, but it gets pretty crowded by ten, so maybe we go right when it opens? Sofia: That's early, but I don't mind, fewer crowds sound nice. Should we bike there or drive? Noah: Let's bike, it's only about fifteen minutes from your place, and then we can just continue the ride along the river afterward instead of going back for our bikes. Sofia: Good plan. Do you want to grab breakfast at the market too? Noah: Definitely, I heard there's a stand that makes really good breakfast sandwiches. Sofia: Sounds great. Should I bring anything? Noah: Just bring a reusable bag if you have one, for whatever produce we end up buying. Sofia: Will do. I'll meet you at your place at seven forty-five then? Noah: Perfect, that gives us time to get there right at opening.",
    questions: [
      { q: "What are Noah and Sofia planning to do Saturday?", options: ["Go to a museum", "Visit a farmers market and bike along the river", "Attend a concert", "Go grocery shopping at a supermarket"], answer: 1 },
      { q: "Why do they want to arrive at the market early?", options: ["It closes early", "It gets crowded by ten", "There's a discount for early birds", "Sofia has to leave early"], answer: 1 },
      { q: "How will they get to the market?", options: ["By car", "By bike", "By bus", "On foot"], answer: 1 },
      { q: "What does Noah want to try at the market?", options: ["Fresh fruit smoothies", "Breakfast sandwiches from a stand", "Homemade jam", "Coffee from a food truck"], answer: 1 },
      { q: "What does Noah ask Sofia to bring?", options: ["Cash only", "A reusable bag", "Her own bike lock", "A picnic blanket"], answer: 1 }
    ]
  },
  {
    id: "L2-03",
    partNum: 2,
    part: "Part 2: Listening to a Daily Life Conversation",
    title: "Settling In a New Puppy",
    script: "Grace: How's the new puppy settling in? Liam: Really well, actually, though he's definitely a handful. We started puppy training classes this week. Grace: Oh nice, how's that going? Liam: Good so far, he's already getting the hang of sit and stay. The trainer says consistency is key, so we're practicing a little bit every day, not just during class. Grace: That makes sense. What about walks, is he doing okay on the leash? Liam: He's improving, he used to pull constantly, but the trainer showed us a technique where we stop walking every time he pulls, and he's starting to figure out that pulling gets him nowhere, literally. Grace: That's clever. Have you taken him to the vet yet? Liam: Yes, he had his second round of vaccines last week, and the vet said he's growing right on track for his breed. Grace: That's great to hear. Are you still doing the overnight crate training? Liam: We are, it's been rough some nights, but he's already sleeping through most of the night now, which is a huge improvement from the first week. Grace: You're doing a great job with him. Liam: Thanks, it's a lot of work, but it's been really rewarding too.",
    questions: [
      { q: "What has Liam started doing with his new puppy?", options: ["Puppy training classes", "Agility competitions", "Grooming lessons", "Boarding him at a kennel"], answer: 0 },
      { q: "According to the trainer, what is key to progress?", options: ["Using treats exclusively", "Consistency, practicing a little every day", "Only training on weekends", "Hiring a second trainer"], answer: 1 },
      { q: "What technique helps with leash pulling?", options: ["Using a shorter leash", "Stopping walking every time the puppy pulls", "Walking only at night", "Carrying the puppy part of the way"], answer: 1 },
      { q: "What did the vet say at the last visit?", options: ["The puppy needs to lose weight", "The puppy is growing right on track for his breed", "The puppy needs surgery", "The puppy missed his vaccines"], answer: 1 },
      { q: "How is crate training going?", options: ["It has completely failed", "Rough some nights, but he now sleeps through most nights", "They gave up on it", "The puppy refuses to enter the crate at all"], answer: 1 }
    ]
  },
  {
    id: "L2-04",
    partNum: 2,
    part: "Part 2: Listening to a Daily Life Conversation",
    title: "Helping With a Move",
    script: "Ben: So the move is officially next Saturday, right? Mia: Yep, the truck is booked for nine in the morning. Ben: Do you need help packing before then, or are you mostly done? Mia: I've got the kitchen and bedroom done, but the living room and all my books are still a disaster. Ben: I can come by Thursday evening after work to help with the living room if that helps. Mia: That would be amazing, thank you. Ben: No problem. Do you have enough boxes, or should I bring some from my place? Mia: I could use a few more, especially small ones for the books, they get heavy fast in big boxes. Ben: I'll bring a stack of small ones then. Mia: Perfect. Also, would you be able to help Saturday morning too, or is that too much to ask? Ben: I can do the morning, just not the afternoon, I have a family thing at two. Mia: That's totally fine, the movers should have everything loaded and at the new place by early afternoon anyway. Ben: Sounds good, I'll see you Thursday evening then, and again Saturday morning. Mia: Thanks so much, Ben, I really owe you one after this.",
    questions: [
      { q: "When is Mia's move scheduled?", options: ["Next Saturday at nine in the morning", "This Friday evening", "Next Sunday afternoon", "In two weeks"], answer: 0 },
      { q: "Which rooms does Mia still need to pack?", options: ["The kitchen and bathroom", "The living room and her books", "The bedroom only", "Everything is already packed"], answer: 1 },
      { q: "When will Ben come to help pack?", options: ["Wednesday morning", "Thursday evening", "Friday night", "Saturday afternoon"], answer: 1 },
      { q: "What does Mia ask Ben to bring?", options: ["Packing tape", "Small boxes, especially for books", "A dolly", "Bubble wrap"], answer: 1 },
      { q: "Why can't Ben help Saturday afternoon?", options: ["He's working", "He has a family thing at two", "He's out of town", "He's helping someone else move"], answer: 1 }
    ]
  },
  {
    id: "L2-05",
    partNum: 2,
    part: "Part 2: Listening to a Daily Life Conversation",
    title: "A Grandparents' Visit",
    script: "Nadia: My parents are coming to visit next month, and I wanted to check what weekend works best for everyone. Omar: Any weekend works for me except the fifteenth, that's when my cousin's wedding is. Nadia: Okay, that rules that one out. What about the twenty-second? Omar: That should be fine. How long are they staying? Nadia: About five days, they usually like to stay through the following Tuesday. Omar: That's great, the kids will be thrilled, they haven't seen their grandparents since the summer. Nadia: I know, my mom's especially been asking to see how much the baby has grown. Omar: Should we plan anything special while they're here, or just keep it relaxed? Nadia: I was thinking maybe one outing, like the botanical garden, since my dad loves plants, but otherwise just keep things low-key at home. Omar: That sounds perfect, especially since they'll want rest time too after the flight. Nadia: Exactly. I'll book their flights this week once I confirm the dates work for them too. Omar: Sounds good, let me know if you need help with anything on my end. Nadia: I will, thanks.",
    questions: [
      { q: "What are Nadia and Omar discussing?", options: ["Planning a wedding", "Planning her parents' upcoming visit", "Planning a trip abroad", "Planning a birthday party"], answer: 1 },
      { q: "Why can't the visit happen on the fifteenth?", options: ["Nadia is traveling for work", "Omar's cousin's wedding", "The kids have school events", "It's already booked for something else"], answer: 1 },
      { q: "How long will the grandparents stay?", options: ["A weekend only", "About five days", "Two weeks", "One month"], answer: 1 },
      { q: "What outing does Nadia suggest?", options: ["A zoo trip", "The botanical garden", "A museum", "A beach day"], answer: 1 },
      { q: "What will Nadia do this week?", options: ["Book their flights", "Buy gifts for the grandparents", "Clean the guest room", "Call the wedding venue"], answer: 0 }
    ]
  },
  {
    id: "L2-06",
    partNum: 2,
    part: "Part 2: Listening to a Daily Life Conversation",
    title: "Joining a Photography Club",
    script: "Ellie: I finally signed up for that photography club I mentioned last month. Dev: Oh nice, how's it structured? Ellie: We meet every other Wednesday evening, and each meeting has a theme, like street photography or portraits, and everyone brings a few shots to share and get feedback on. Dev: That sounds really useful, honest feedback can be hard to find otherwise. Ellie: Exactly, and next month there's a weekend outing planned to the old harbor district for a group shoot, which I'm excited about. Dev: Do you need any special equipment, or is any camera fine? Ellie: They said any camera works, even phones, it's more about composition and learning than gear. Dev: That's good, less pressure to buy anything expensive. Ellie: Right, though a few members do bring nicer cameras and are happy to let beginners try them out during meetings. Dev: Have you gone to a meeting yet? Ellie: Just one so far, but everyone was really welcoming, and I already learned a few editing tricks I hadn't tried before. Dev: I might tag along to the harbor outing if that's allowed. Ellie: Definitely, they said guests are welcome for the outings, just not the regular indoor meetings.",
    questions: [
      { q: "What has Ellie recently joined?", options: ["A photography club", "A painting class", "A book club", "A cooking class"], answer: 0 },
      { q: "How often does the club meet?", options: ["Every Wednesday evening", "Every other Wednesday evening", "Once a month", "Every weekend"], answer: 1 },
      { q: "What is planned for next month?", options: ["A gallery exhibition", "A weekend group photo shoot at the old harbor district", "A guest speaker event", "An equipment swap"], answer: 1 },
      { q: "What did the club say about equipment?", options: ["Only professional cameras are allowed", "Any camera, even phones, works fine", "Members must rent equipment", "Only film cameras are used"], answer: 1 },
      { q: "Can Dev attend the harbor outing?", options: ["No, it's members only", "Yes, guests are welcome for outings", "Only if he joins first", "Only children are allowed as guests"], answer: 1 }
    ]
  },
  {
    id: "L2-07",
    partNum: 2,
    part: "Part 2: Listening to a Daily Life Conversation",
    title: "A Community Park Cleanup",
    script: "Rosa: Are you still planning to join the park cleanup this Saturday? Theo: Yeah, I signed up online yesterday. What time does it start? Rosa: Nine in the morning, and they said it usually wraps up by noon. Theo: Should I bring my own gloves and bags, or does the organization provide those? Rosa: They provide gloves, trash bags, and grabber tools, but they recommend bringing your own reusable water bottle since it can get warm by late morning. Theo: Good to know. Is there a specific area we're assigned to, or do we just show up? Rosa: When you check in at the registration table, they'll split volunteers into small groups and assign each group a section of the park. Theo: Makes sense. Do you know roughly how many people usually show up? Rosa: Last time I went, it was around forty volunteers, which was enough to cover the whole park in about two and a half hours. Theo: That's a solid turnout. Should we plan to carpool since parking might be tight? Rosa: Good idea, I can drive, I'll pick you up around eight thirty so we have time to find parking and check in before it starts. Theo: Sounds good, see you then.",
    questions: [
      { q: "What event are Rosa and Theo discussing?", options: ["A charity run", "A park cleanup", "A food drive", "A tree planting event"], answer: 1 },
      { q: "What time does the cleanup start?", options: ["Eight in the morning", "Nine in the morning", "Ten in the morning", "Noon"], answer: 1 },
      { q: "What does the organization not provide, according to Rosa?", options: ["Gloves", "A reusable water bottle", "Trash bags", "Grabber tools"], answer: 1 },
      { q: "How are volunteers organized once they arrive?", options: ["They work individually wherever they like", "Split into small groups assigned to sections of the park", "Assigned based on age", "Randomly given a task list"], answer: 1 },
      { q: "What do Rosa and Theo decide to do about transportation?", options: ["Take public transit separately", "Carpool, with Rosa driving", "Walk together", "Meet there separately by car"], answer: 1 }
    ]
  },
  {
    id: "L2-08",
    partNum: 2,
    part: "Part 2: Listening to a Daily Life Conversation",
    title: "A Parent-Teacher Update",
    script: "Ms. Duran: Hi, thanks for coming in. I wanted to go over how your daughter's doing this term before we get into specific subjects. Overall, she's doing really well, especially in reading and group discussions. Mr. Okafor: That's great to hear, she does talk about enjoying reading time at home too. Ms. Duran: One area I'd like to see her build more confidence in is math, particularly with word problems. She understands the concepts when we go through them together, but she tends to rush through the reading part of the problem. Mr. Okafor: That's helpful to know, we can definitely work on that at home, maybe having her read problems out loud first. Ms. Duran: That's a great strategy, actually. I also send home a weekly worksheet with a few word problems if you want extra practice beyond what's assigned. Mr. Okafor: Yes, please, that would help. Is there anything else I should know about, socially or otherwise? Ms. Duran: She's made a good group of friends this term and participates actively in class discussions. My only other note is she sometimes forgets her homework folder, so a quick check before school might help. Mr. Okafor: I'll start doing that every morning. Thank you for the update.",
    questions: [
      { q: "What is Ms. Duran's overall assessment of the daughter's performance?", options: ["Struggling in most subjects", "Doing well overall, especially in reading and discussions", "Falling behind significantly", "Excelling only in math"], answer: 1 },
      { q: "What specific area needs improvement?", options: ["Reading comprehension generally", "Math word problems, specifically rushing through reading them", "Group participation", "Handwriting"], answer: 1 },
      { q: "What strategy does Mr. Okafor suggest trying at home?", options: ["Hiring a tutor", "Having her read the problems out loud first", "Skipping word problems entirely", "Using flashcards"], answer: 1 },
      { q: "What extra resource does Ms. Duran offer?", options: ["Free tutoring sessions", "A weekly worksheet with extra word problems", "A summer workbook", "Access to an online math program"], answer: 1 },
      { q: "What small habit does Ms. Duran suggest at home?", options: ["Reading with her every night", "Checking her homework folder each morning", "Limiting screen time", "Packing her lunch together"], answer: 1 }
    ]
  },
  {
    id: "L2-09",
    partNum: 2,
    part: "Part 2: Listening to a Daily Life Conversation",
    title: "Cutting Streaming Subscriptions",
    script: "Kevin: We're paying for three different streaming services right now, and I don't think we're even using two of them anymore. Amara: Yeah, I keep meaning to look into that. Which ones do we actually use regularly? Kevin: Definitely the one with all the documentaries, we watch something on there almost every week. The other two, honestly, I can't remember the last time we opened them. Amara: I think I used one of them for that one show a few months ago, but I finished it already. Kevin: Right, so maybe we cancel those two and just keep the documentary one, and if we really want to watch something specific later, we can subscribe again just for that month. Amara: That makes sense, that could save us close to twenty dollars a month combined. Kevin: Exactly. Should we do it today before we forget again? Amara: Yes, let's do it now. I'll cancel the two we're not using, can you double check our bank statement to make sure there aren't any other subscriptions we forgot about? Kevin: Good idea, I'll go through the last few months of statements tonight. Amara: Perfect, this is a good little cleanup to do.",
    questions: [
      { q: "What problem are Kevin and Amara discussing?", options: ["Their internet is too slow for streaming", "They are paying for streaming services they no longer use", "A billing error on their account", "Wanting to add a new streaming service"], answer: 1 },
      { q: "Which service do they actually use regularly?", options: ["The one with documentaries", "The one with a specific show", "All three equally", "None of them"], answer: 0 },
      { q: "What do they decide to do?", options: ["Cancel all three services", "Cancel the two unused services and keep the documentary one", "Keep all three but downgrade plans", "Switch to a completely different service"], answer: 1 },
      { q: "About how much could this save them monthly?", options: ["Close to twenty dollars", "About five dollars", "Over one hundred dollars", "Nothing, it's the same price"], answer: 0 },
      { q: "What does Kevin agree to check?", options: ["The Wi-Fi bill", "The bank statement for other forgotten subscriptions", "Their credit score", "The streaming service's customer reviews"], answer: 1 }
    ]
  },
  {
    id: "L2-10",
    partNum: 2,
    part: "Part 2: Listening to a Daily Life Conversation",
    title: "Reworking the Chore Schedule",
    script: "Priya: Can we talk about the chore schedule? I feel like I've been doing dishes almost every night this week. Sam: Oh, sorry, I didn't realize it had been that uneven. I've been swamped with a work project, but that's not a good excuse. Priya: I get that things get busy, I just want us to find something that works even during busy weeks. Sam: That's fair. What if we alternate weeks instead of splitting every task daily, so whoever's turn it is handles dishes and taking out the trash for that whole week? Priya: I like that, it's simpler to remember than juggling a daily list. Sam: Should we start this week or next? Priya: Let's start next Monday, so it's a clean start. I'll take the first week since you've had a rough one. Sam: Thanks, I appreciate that, and I'll make sure to stay on top of it starting my turn. Priya: Sounds good. Should we put a reminder on the fridge so we don't forget whose week it is? Sam: Yeah, let's do that, maybe a little calendar or chart. Priya: I'll make one tonight.",
    questions: [
      { q: "What is Priya's concern?", options: ["Sam never cleans anything", "She's been doing dishes almost every night", "Sam is too messy in general", "The apartment is too small"], answer: 1 },
      { q: "What is Sam's explanation?", options: ["Forgetting the schedule entirely", "Being swamped with a work project", "Thinking Priya preferred doing it", "Being out of town"], answer: 1 },
      { q: "What new system do they agree on?", options: ["Hiring a cleaning service", "Alternating weeks for dishes and trash instead of daily splitting", "Splitting every task exactly in half daily", "Doing chores only on weekends"], answer: 1 },
      { q: "When will the new system start?", options: ["Immediately, today", "Next Monday", "Next month", "After Sam's project ends"], answer: 1 },
      { q: "What will they put on the fridge?", options: ["A grocery list", "A reminder chart or calendar of whose week it is", "A budget spreadsheet", "House rules"], answer: 1 }
    ]
  },
  {
    id: "L2-11",
    partNum: 2,
    part: "Part 2: Listening to a Daily Life Conversation",
    title: "Organizing a Coworker's Farewell Lunch",
    script: "Diego: Have you heard, Marissa's last day is Friday, she's moving to take that new job. Lena: Oh wow, I hadn't heard yet. We should organize something for her. Diego: I was thinking we get the team together for lunch on Thursday instead of Friday, since Friday she'll probably be busy wrapping things up. Lena: Good call. Should we go out somewhere or order in? Diego: I think going out would feel more special, maybe that Italian place two blocks from the office, she mentioned liking it before. Lena: I'll check if they can take a group of about ten on short notice. Diego: Great, and should we chip in for a gift too? Lena: Yes, I can set up a quick collection, maybe suggest ten dollars each, and we can put it toward a gift card or something for her new place. Diego: Sounds good. I'll let the rest of the team know about lunch Thursday at noon. Lena: Perfect, I'll handle the gift card and a card everyone can sign. Diego: This will mean a lot to her, she's been here for years.",
    questions: [
      { q: "What is being planned for Marissa?", options: ["A promotion celebration", "A farewell lunch before her last day", "A surprise birthday party", "A retirement dinner"], answer: 1 },
      { q: "Why do they choose Thursday instead of Friday?", options: ["The restaurant is closed Fridays", "Marissa will likely be busy wrapping up on Friday", "Thursday is a company holiday", "Not enough people are free Friday"], answer: 1 },
      { q: "Where do they plan to go?", options: ["A cafe down the street", "An Italian place near the office", "A place Marissa has never tried", "The office cafeteria"], answer: 1 },
      { q: "What does Lena propose for the gift?", options: ["A collection of ten dollars each toward a gift card", "A single large gift from the manager", "A potluck instead of a gift", "No gift, just the lunch"], answer: 0 },
      { q: "What will Diego do next?", options: ["Book the restaurant himself", "Let the rest of the team know about lunch Thursday", "Buy the gift card", "Write the card"], answer: 1 }
    ]
  },
  {
    id: "L2-12",
    partNum: 2,
    part: "Part 2: Listening to a Daily Life Conversation",
    title: "Signing Up for a Library Book Club",
    script: "Hannah: I saw the library started a new book club, do you want to check it out with me? Felix: Maybe, what's the format like? Hannah: They meet once a month on a Tuesday evening, and each month they pick a different genre, so it's not the same type of book every time. Felix: That sounds fun, keeps it from getting repetitive. Do you know what this month's book is? Hannah: It's a mystery novel, around three hundred pages, so pretty manageable within a month. Felix: Do we need to buy the book, or does the library provide copies? Hannah: They actually reserve a set of copies for club members, so you can just borrow one for free from the front desk. Felix: That's convenient. Is it a big group? Hannah: From what the librarian told me, usually around twelve to fifteen people show up each month. Felix: That sounds like a nice size, not too small, not overwhelming. Hannah: Exactly. Want me to add your name to the list for this month's meeting? Felix: Yes, please do, I could use a reason to read more anyway.",
    questions: [
      { q: "What are Hannah and Felix discussing?", options: ["Starting their own book club", "Joining a new library book club", "Returning overdue library books", "Volunteering at the library"], answer: 1 },
      { q: "How often does the club meet?", options: ["Once a week", "Once a month on a Tuesday evening", "Every other week", "Once a season"], answer: 1 },
      { q: "What genre is this month's book?", options: ["Romance", "Mystery", "Science fiction", "History"], answer: 1 },
      { q: "How do members get a copy of the book?", options: ["Buy it at a discount", "Borrow one for free from the library front desk", "Download an e-book version only", "Share one copy among the group"], answer: 1 },
      { q: "About how many people usually attend?", options: ["Three to five", "Twelve to fifteen", "Thirty or more", "Just Hannah and Felix"], answer: 1 }
    ]
  }
];
