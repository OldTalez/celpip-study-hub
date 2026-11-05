// LEARNING NOTE (for beginners): this file is DATA, not logic. It lists practice content as plain objects
// (passages, questions, prompts). To add content, copy an existing entry, give it a new unique id, and edit the text.
// app.js loads these lists through index.html and picks from them at random.
const LISTENING_PART3 = [
  {
    id: "L3-01",
    partNum: 3,
    part: "Part 3: Listening for Information",
    title: "Choosing an Internet and Phone Bundle",
    script: "Agent: Thanks for calling ConnectWave, how can I help you today? Customer: Hi, I'm interested in switching my internet and maybe bundling in some other services. What are my options? Agent: Sure, we have three bundles. The Basic bundle is fifty dollars a month for one hundred megabit internet, no extras. The Standard bundle is seventy five dollars a month, it steps up to three hundred megabit internet and adds a home phone line. The Premium bundle is one hundred dollars a month, five hundred megabit internet, home phone, and a streaming package with over a hundred channels. Customer: I work from home and I'm on video calls most of the day, so I need something fast and reliable, but I don't really need a home phone. Agent: In that case, Premium might still make sense just for the speed and the streaming, even without using the phone line, but if you want to save money you could ask us to swap the phone line out of Premium for a ten dollar discount. Customer: That sounds better. What about contracts? Agent: You can sign a two year contract and lock in that discounted Premium rate, or go month to month at the regular Premium price, which is fifteen dollars more. Customer: I don't mind committing, my job isn't changing anytime soon. Agent: Great, I'll set you up with the two year discounted Premium bundle, no phone line. Also, since you're booking online today, we'll waive the fifty dollar installation fee. Customer: Perfect, let's do that.",
    questions: [
      { q: "What is the customer's main need?", options: ["A quiet home phone line", "Fast, reliable internet for video calls", "The cheapest monthly bill above all else", "A large number of TV channels"], answer: 1 },
      { q: "How much does the Basic bundle cost per month?", options: ["Fifty dollars", "Seventy five dollars", "One hundred dollars", "One hundred ten dollars"], answer: 0 },
      { q: "What does the customer ask the agent to remove from the Premium bundle?", options: ["The streaming package", "The home phone line", "The fast internet speed", "The installation fee"], answer: 1 },
      { q: "How much is the discount for removing the phone line?", options: ["Five dollars", "Ten dollars", "Fifteen dollars", "Twenty dollars"], answer: 1 },
      { q: "What does the customer decide about the contract length?", options: ["Month to month", "One year", "Two years", "Three years"], answer: 2 },
      { q: "What benefit does the customer receive for booking online?", options: ["A free router", "Waived installation fee", "A free month of service", "A free streaming upgrade"], answer: 1 }
    ]
  },
  {
    id: "L3-02",
    partNum: 3,
    part: "Part 3: Listening for Information",
    title: "Viewing an Apartment for Rent",
    script: "Property Manager: Thanks for coming in. I can show you the two units we currently have available. Tenant: Great, what are the differences? Property Manager: The one bedroom on the third floor is fourteen hundred dollars a month, unfurnished, and it shares a laundry room on that floor with two other units. The two bedroom on the fifth floor is eighteen fifty a month, partially furnished with a couch and dining table, and it has its own washer and dryer inside the unit. Tenant: I'm just one person, so the one bedroom probably makes more sense, but I do like the idea of having laundry in the unit. Property Manager: I understand, some tenants pay the difference just for that convenience. Tenant: Is parking included in either price? Property Manager: No, parking is a separate seventy five dollars a month for either unit, and spots are limited, so I'd recommend reserving one soon if you want it. Tenant: I have a small dog, is that allowed? Property Manager: Yes, pets are welcome with a one time deposit of three hundred dollars. Tenant: That's manageable. My only concern is the lease length, my job might relocate me in six months, so I was hoping for something month to month. Property Manager: We only offer twelve month leases here, but if your situation changes, you can break the lease early by giving two months notice and paying a fee equal to one month's rent. Tenant: Okay, that's not ideal but it's workable. I think I'll go with the one bedroom and add parking.",
    questions: [
      { q: "What is the monthly rent for the two bedroom unit?", options: ["$1,400", "$1,850", "$1,500", "$2,000"], answer: 1 },
      { q: "Why might the one bedroom unit be less convenient?", options: ["It has no windows", "Laundry is shared with other units", "It doesn't allow pets", "It has no parking available at all"], answer: 1 },
      { q: "What is required to keep a pet in the building?", options: ["A monthly pet fee", "A one-time $300 deposit", "A reference letter", "Pets are not allowed"], answer: 1 },
      { q: "Why is the tenant hesitant about a twelve month lease?", options: ["The rent is too high", "Their job might relocate them in six months", "They don't like the building", "They want a shorter commute"], answer: 1 },
      { q: "What can the tenant do if they need to leave early?", options: ["Nothing, the lease is binding", "Give two months notice and pay a fee equal to one month's rent", "Sublet with no penalty", "Break the lease for free after six months"], answer: 1 },
      { q: "Which unit does the tenant decide to rent?", options: ["The two bedroom with parking", "The one bedroom with parking", "The two bedroom without parking", "The one bedroom without parking"], answer: 1 }
    ]
  },
  {
    id: "L3-03",
    partNum: 3,
    part: "Part 3: Listening for Information",
    title: "Renting a Car for a Road Trip",
    script: "Agent: Hi there, what kind of vehicle are you looking to rent? Customer: I need something for a week long road trip, there will be four of us with a fair amount of luggage. Agent: For four people with luggage, I'd suggest either our midsize sedan at sixty dollars a day or our SUV at eighty five dollars a day. The economy car is cheaper at forty five dollars a day, but it's really only comfortable for two people plus small bags. Customer: We probably need the extra space then. What's included with each? Agent: The midsize and the SUV both come with unlimited mileage, which is great for a road trip. The economy car only includes two hundred kilometers per day, after that it's twenty cents per kilometer. Customer: Good thing we're not taking the economy car then, we're planning to drive quite a bit. Agent: Exactly. Would you like to add the damage waiver? It's fifteen dollars a day and covers you completely if there's an accident or damage to the vehicle. Customer: Yes, let's add that, better safe than sorry. Agent: One more thing, can I confirm your age? Customer: I'm twenty three. Agent: Just so you know, there's a young driver surcharge of twenty five dollars a day for renters under twenty five. Customer: Ah, I didn't realize that. That adds up, but I guess it's unavoidable. Agent: Unfortunately yes. Last thing, we use a full to full fuel policy, so please return the car with a full tank or you'll be charged a refueling fee. Customer: Understood. Let's go with the midsize sedan plus the damage waiver.",
    questions: [
      { q: "Why does the agent recommend against the economy car?", options: ["It's too expensive", "It's not comfortable for four people with luggage", "It has no air conditioning", "It's not available for a week"], answer: 1 },
      { q: "What is included with the midsize and SUV that isn't included with the economy car?", options: ["Free insurance", "Unlimited mileage", "A GPS device", "A second driver at no cost"], answer: 1 },
      { q: "What does the damage waiver cost per day?", options: ["Ten dollars", "Fifteen dollars", "Twenty dollars", "Twenty five dollars"], answer: 1 },
      { q: "Why is the customer charged an extra daily fee?", options: ["He has a poor driving record", "He is under twenty five years old", "He is renting for over a week", "He wants extra mileage"], answer: 1 },
      { q: "What does the \"full to full\" policy refer to?", options: ["Returning the car with a full tank of fuel", "Paying the full rental fee upfront", "Full insurance coverage", "Full mileage included"], answer: 0 },
      { q: "Which vehicle does the customer choose in the end?", options: ["Economy car", "Midsize sedan", "SUV", "He decides not to rent"], answer: 1 }
    ]
  },
  {
    id: "L3-04",
    partNum: 3,
    part: "Part 3: Listening for Information",
    title: "Comparing Auto Insurance Plans",
    script: "Advisor: Let's go over your options. The Basic plan is liability only, sixty dollars a month, and it only covers damage you cause to other people's vehicles or property, nothing on your own car. Client: And the others? Advisor: The Standard plan is ninety five dollars a month, it adds collision coverage, so if you're in an accident, your own car gets covered too. The Comprehensive plan is one hundred thirty dollars a month, and on top of collision, it covers theft, weather damage like hail, and vandalism. Client: My car is pretty old, I think it's only worth about four thousand dollars now. Advisor: That's worth knowing, because with collision coverage, the payout is capped at your car's current value, so for an older car, some people find Basic liability is enough since a big collision payout wouldn't be worth much anyway. Client: That makes sense, but I actually park on the street overnight, and there have been a few break-ins on my block recently. Advisor: In that case, I'd lean toward Comprehensive rather than Basic, since theft and vandalism are real risks for you specifically, even if collision coverage matters less for an older car. Client: Is there a way to lower the monthly cost of Comprehensive? Advisor: Yes, you can choose a higher deductible. Moving from a five hundred dollar deductible to a one thousand dollar deductible would lower your premium by about fifteen dollars a month. Client: Let's do Comprehensive with the higher deductible then, that seems like the right balance for my situation.",
    questions: [
      { q: "What does the Basic liability plan cover?", options: ["Only damage the client causes to others", "The client's own vehicle only", "Theft and vandalism", "Everything except weather damage"], answer: 0 },
      { q: "Why might collision coverage be less valuable for the client's car?", options: ["The car is brand new", "The car's value is low, so payouts are capped", "Collision coverage is not offered for old cars", "The client never drives"], answer: 1 },
      { q: "Why does the advisor recommend Comprehensive despite the car's age?", options: ["The client wants the cheapest option", "There have been break-ins where the client parks", "Comprehensive is required by law", "The client's car is very expensive"], answer: 1 },
      { q: "How can the client reduce the monthly cost of Comprehensive?", options: ["Switch to Basic", "Choose a higher deductible", "Drive less often", "Add a second driver"], answer: 1 },
      { q: "How much does raising the deductible save per month?", options: ["Five dollars", "Ten dollars", "Fifteen dollars", "Twenty five dollars"], answer: 2 },
      { q: "Which plan does the client choose?", options: ["Basic liability", "Standard", "Comprehensive with a higher deductible", "Comprehensive with a lower deductible"], answer: 2 }
    ]
  },
  {
    id: "L3-05",
    partNum: 3,
    part: "Part 3: Listening for Information",
    title: "Booking a Hall for an Anniversary Party",
    script: "Coordinator: So tell me about the event you're planning. Client: It's my parents' fiftieth wedding anniversary, and we're expecting around ninety guests. Coordinator: For that size, the main hall would fit best, it holds up to one hundred twenty people. It's seven hundred dollars flat and includes one hundred chairs and tables, so you wouldn't need to rent extra seating. Client: What about the garden pavilion, that sounds nice for photos. Coordinator: It's lovely, but it only holds eighty guests comfortably, which is a bit tight for your group, and it's outdoors, so it's weather dependent. If it rains, we'd move you indoors to a backup room for an extra one hundred fifty dollars. Client: I'd rather not risk the weather for an event this important. Let's go with the main hall. Coordinator: Good choice. Now, for catering, you can choose from our approved list of caterers at no extra charge, or bring in an outside caterer for a two hundred dollar service fee. Client: We actually have a family friend who caters, so we'd like to use them. Coordinator: That's fine, just budget for that two hundred dollar fee. One more thing, parking on site is limited to about thirty spots, so with ninety guests, I'd suggest mentioning carpooling or nearby street parking in your invitations. Client: Good tip, I'll add that. Last question, is a Saturday evening available next month? Coordinator: Unfortunately all our Saturday evenings are booked through the end of the year, but we do have Friday and Sunday evenings open. Client: Sunday should work fine for our family.",
    questions: [
      { q: "How many guests does the client expect?", options: ["40", "80", "90", "120"], answer: 2 },
      { q: "Why does the client rule out the garden pavilion?", options: ["It's too expensive", "It's outdoor and weather dependent", "It doesn't allow catering", "It's too far away"], answer: 1 },
      { q: "What is included with the main hall rental?", options: ["Catering", "One hundred chairs and tables", "Parking for all guests", "A DJ"], answer: 1 },
      { q: "Why will the client pay an extra catering fee?", options: ["They are using an outside caterer", "They want fancier food", "They are over the guest limit", "They need extra tables"], answer: 0 },
      { q: "What does the coordinator suggest regarding parking?", options: ["Renting a parking lot nearby", "Mentioning carpooling or street parking to guests", "Hiring a shuttle service", "Limiting the guest list"], answer: 1 },
      { q: "Which day does the client ultimately book?", options: ["Saturday evening", "Friday evening", "Sunday evening", "A weekday"], answer: 2 }
    ]
  },
  {
    id: "L3-06",
    partNum: 3,
    part: "Part 3: Listening for Information",
    title: "Registering for an Evening Course",
    script: "Advisor: What kind of course are you interested in? Student: I'm not sure yet, I'd like to hear the evening options since I work full time during the day. Advisor: Sure. We have introductory photography, which meets Tuesday evenings for eight weeks and costs two hundred twenty dollars, and that includes camera rental so you don't need your own equipment. We also offer conversational Spanish, Monday and Wednesday evenings for ten weeks, one hundred eighty dollars, but you'd need to buy your own textbook for about forty dollars. Student: Twice a week might be tough with my commute. Is there anything else? Advisor: There's also a digital marketing certificate program, but that one runs Saturday mornings for six weeks, three hundred fifty dollars, and it includes the certificate exam fee. Student: Saturdays are family time for me, so that's out. Between the other two, the once a week option sounds more manageable. Advisor: That would be the photography course then. Student: That works, and I like that equipment is included since I don't own a camera. Is there any discount available? Advisor: Yes, if you register at least two weeks before the start date, you get ten percent off. Student: When does it start? Advisor: Four weeks from now, so you'd qualify. Student: Great, can I pay in installments? Advisor: Yes, we allow the course fee to be split into two payments, one at registration and one at the halfway point. Student: Perfect, let's register for photography with the early discount.",
    questions: [
      { q: "Why does the student rule out the digital marketing certificate?", options: ["It's too expensive", "It meets on Saturday mornings, which conflicts with family time", "It requires a textbook", "It doesn't offer a certificate"], answer: 1 },
      { q: "Why does the student prefer photography over Spanish?", options: ["It's cheaper", "It meets only once a week", "It includes a certificate", "It has no homework"], answer: 1 },
      { q: "What is included in the photography course fee?", options: ["A textbook", "Camera rental", "The exam fee", "Private lessons"], answer: 1 },
      { q: "What discount does the student qualify for?", options: ["A student discount", "Ten percent off for registering two weeks early", "A group discount", "A returning student discount"], answer: 1 },
      { q: "How can the student pay for the course?", options: ["In full only", "Split into two installments", "Monthly payments over a year", "Only by cash"], answer: 1 },
      { q: "How many weeks does the photography course run?", options: ["Six weeks", "Eight weeks", "Ten weeks", "Four weeks"], answer: 1 }
    ]
  },
  {
    id: "L3-07",
    partNum: 3,
    part: "Part 3: Listening for Information",
    title: "Finding a Doctor After Moving",
    script: "Receptionist: Hi, how can I help you today? Patient: I just moved to the city and I'm not sure how to get set up with a doctor. I have some ongoing back pain I want to deal with, but also just want general checkups going forward. Receptionist: Okay, there are a few options. Our walk-in clinic doesn't require an appointment, but wait times can range from thirty minutes to two hours depending on the day. It's good for minor issues, but you won't see the same doctor twice, so it's not ideal for ongoing care. Patient: That's not great for something recurring. Receptionist: Right. If you want continuity, you could register with a family doctor, but the waitlist here is currently around six months, unless you have a chronic condition, which gets priority. Patient: Six months is a long wait. Is there anything faster? Receptionist: Actually, yes. We have a nurse practitioner clinic opening next month that's accepting new patients right away. Nurse practitioners can prescribe medication and refer you to specialists, and you'd see the same provider at each appointment. Patient: That sounds like a good middle option. What should I do about the back pain in the meantime? Receptionist: I'd suggest coming into the walk-in clinic this week just to get it looked at now, since the nurse practitioner clinic won't open for a few weeks. Then once it opens, you can register there for ongoing care. Patient: That makes sense, I'll do both then.",
    questions: [
      { q: "Why is the walk-in clinic not ideal for the patient's back pain?", options: ["It's too expensive", "You don't see the same provider twice", "It's only open on weekends", "It doesn't treat back pain"], answer: 1 },
      { q: "How long is the current waitlist for a family doctor?", options: ["Two months", "Six months", "One year", "There is no waitlist"], answer: 1 },
      { q: "Who gets priority on the family doctor waitlist?", options: ["New residents", "Patients with chronic conditions", "Children only", "Seniors only"], answer: 1 },
      { q: "What can a nurse practitioner do according to the receptionist?", options: ["Only give advice", "Prescribe medication and refer to specialists", "Perform surgery", "Only see returning patients"], answer: 1 },
      { q: "When does the nurse practitioner clinic begin accepting patients?", options: ["Immediately", "Next month", "In six months", "Next year"], answer: 1 },
      { q: "What does the patient decide to do?", options: ["Wait six months for a family doctor", "Visit the walk-in clinic now and register at the new clinic later", "Only visit the walk-in clinic forever", "Do nothing until the pain worsens"], answer: 1 }
    ]
  },
  {
    id: "L3-08",
    partNum: 3,
    part: "Part 3: Listening for Information",
    title: "Getting a Moving Company Quote",
    script: "Coordinator: Let's go over the details of your move. Customer: Sure, I'm moving from a one bedroom to a two bedroom across town, nothing too far. Coordinator: For a local move like that, we'd send two movers and a truck at one hundred twenty dollars an hour, and based on the size of your place, we estimate around four hours, so roughly four hundred eighty dollars. Customer: Does that include packing? Coordinator: No, that's just loading, transport, and unloading. If you want us to pack your boxes too, that's an extra one hundred fifty dollars for materials and labor. Customer: I'll pack most things myself, but I do have a piano that was my grandmother's, I definitely don't want that damaged. Coordinator: For a piano, we'd add a one hundred dollar special handling fee, it requires extra equipment and care. Customer: That's fine, it's worth it for peace of mind. What about insurance? Coordinator: Our basic coverage is included and covers sixty cents per pound per item if something's damaged, which honestly isn't much for something like a piano. We also offer upgraded coverage for fifty dollars that covers full replacement value instead. Customer: Given it's a family heirloom, let's definitely add that. Coordinator: Good call. One more thing, Saturday is our busiest day, but if you're flexible and can move on a Friday instead, we offer a ten percent discount. Customer: I can probably arrange Friday off work. Let's book Friday, self-packing, with the piano handling fee and the upgraded insurance.",
    questions: [
      { q: "What is included in the base moving quote?", options: ["Packing, loading, and unloading", "Loading, transport, and unloading only", "Only transport", "Packing materials only"], answer: 1 },
      { q: "Why does the customer want extra care for the piano?", options: ["It's very heavy", "It was her grandmother's and is a family heirloom", "It's rented", "It's fragile and brand new"], answer: 1 },
      { q: "What does the basic insurance coverage pay based on?", options: ["Full replacement value", "Weight per item", "A flat fee per box", "Nothing, it's not included"], answer: 1 },
      { q: "Why does the customer choose to upgrade the insurance?", options: ["The basic coverage is too expensive", "It's a valuable family item worth more than weight-based coverage would pay", "The mover requires it", "It's free to upgrade"], answer: 1 },
      { q: "How can the customer save ten percent on the move?", options: ["Pack everything themselves", "Move on a Friday instead of Saturday", "Book two months in advance", "Skip the insurance"], answer: 1 },
      { q: "What does the customer decide to do about packing?", options: ["Hire the company to pack everything", "Pack most things themselves", "Not pack any boxes at all", "Pay for partial packing"], answer: 1 }
    ]
  },
  {
    id: "L3-09",
    partNum: 3,
    part: "Part 3: Listening for Information",
    title: "Choosing Catering for a Birthday Party",
    script: "Caterer: Tell me a bit about the event. Client: It's my sister's fortieth birthday, we're expecting about fifty guests, and it's indoors in case of rain. Caterer: Great, that rules out our food truck option since that one's outdoor only anyway, but let me walk you through the other two. Our buffet package is twenty two dollars per person and includes three main dishes and two side dishes. Our plated dinner is thirty five dollars per person, includes an appetizer, a main course, and dessert, but it requires a final headcount one week before the event since each guest selects their meal in advance. Client: We actually have a few guests who still haven't confirmed, so a fixed headcount that far ahead sounds risky. Caterer: Then the buffet might suit you better, it's more flexible with numbers closer to the date. Client: We also have a couple of guests who are vegetarian and one who's gluten free. Caterer: No problem, for the buffet we set up labeled stations so those dishes are clearly marked, at no extra charge. For the plated dinner, guests would need to select a vegetarian option in advance, but it's the same price either way. Client: Given the flexibility we need, let's go with the buffet. What about a cake? Caterer: We can provide one for eighty dollars, or if you'd rather bring your own, there's no cutting fee with the buffet package. The plated package charges twenty five dollars to cut an outside cake. Client: We'll bring our own cake from a family bakery then, that works out well with the buffet.",
    questions: [
      { q: "Why is the food truck option not considered?", options: ["It's too expensive", "It's outdoor only and the event is indoors", "It doesn't serve dessert", "It requires a large minimum guest count"], answer: 1 },
      { q: "Why does the client avoid the plated dinner option?", options: ["It's too expensive", "It requires a fixed headcount a week in advance and some guests haven't confirmed", "It doesn't offer vegetarian options", "It's only available on weekends"], answer: 1 },
      { q: "How does the buffet package handle dietary restrictions?", options: ["It doesn't accommodate them", "Labeled stations at no extra charge", "An extra fee per dietary need", "Guests must bring their own food"], answer: 1 },
      { q: "What is the cost per person for the buffet?", options: ["$18", "$22", "$35", "$80"], answer: 1 },
      { q: "Why does the client choose to bring their own cake?", options: ["It's cheaper overall and there's no cutting fee with the buffet", "The caterer doesn't offer cake", "It's required for indoor events", "The family bakery is closer"], answer: 0 },
      { q: "Which package does the client choose overall?", options: ["Plated dinner", "Food truck", "Buffet", "A combination of all three"], answer: 2 }
    ]
  },
  {
    id: "L3-10",
    partNum: 3,
    part: "Part 3: Listening for Information",
    title: "Enrolling a Toddler in Daycare",
    script: "Director: What are you looking for in terms of care? Parent: My daughter is eighteen months old, and I work four days a week, so I need something that covers most of that. Director: We have a few options. Full time is five days a week for twelve hundred dollars a month, but that program currently has a two month waitlist. Part time is three days a week for eight hundred dollars a month, and we do have openings there right now. Parent: I only need four days though, not five, so part time alone wouldn't quite cover it. Director: You could combine part time with our drop-in option for your fourth day. Drop-in is sixty dollars a day, and you're allowed up to two drop-in days per week if you need them. Parent: That could work. Is there anything different about drop-in day, like meals? Director: Good question, meals are included with full time and part time enrollment, but for drop-in days, you'd need to send your daughter with her own lunch and snacks. Parent: Okay, that's manageable. Is there anything I need to know about booking drop-in days? Director: Yes, you'll need to request drop-in spots at least forty eight hours in advance, and it's subject to availability since we can't guarantee a spot last minute. Parent: Understood. One more thing, I might enroll my younger son here too once he's old enough. Director: If you enroll a second child, you'd get a ten percent sibling discount on both children's fees. Parent: Good to know for later. For now, let's set up the three day part time plan plus one drop-in day each week.",
    questions: [
      { q: "Why doesn't the parent choose the full-time program?", options: ["It's too expensive", "It has a two month waitlist", "It doesn't include meals", "The hours don't match her schedule"], answer: 1 },
      { q: "How does the parent plan to cover her fourth day of work?", options: ["By using the full-time program only", "By combining part-time enrollment with a drop-in day", "By switching to full-time later", "She decides not to cover the fourth day"], answer: 1 },
      { q: "What is different about drop-in days compared to enrolled days?", options: ["Drop-in days require you to send your own lunch", "Drop-in days cost less overall", "Drop-in days include more activities", "Drop-in days require a full year commitment"], answer: 0 },
      { q: "How far in advance must drop-in days be booked?", options: ["24 hours", "48 hours", "One week", "One month"], answer: 1 },
      { q: "What discount is available if the parent enrolls a second child?", options: ["A free month", "Ten percent off both children's fees", "Free drop-in days", "A discount only on drop-in days"], answer: 1 },
      { q: "What plan does the parent choose in the end?", options: ["Full-time only", "Part-time only", "Part-time plus one drop-in day per week", "Drop-in only"], answer: 2 }
    ]
  },
  {
    id: "L3-11",
    partNum: 3,
    part: "Part 3: Listening for Information",
    title: "Getting Quotes for a Kitchen Renovation",
    script: "Contractor: Let's talk through what makes sense for your kitchen. Homeowner: My budget is somewhere between fifteen and twenty thousand dollars, and honestly, I've always wanted an open concept layout. Contractor: I can walk you through our three packages. The refresh package is eight thousand dollars, takes about two weeks, and covers new countertops, paint, and hardware, but keeps everything else as is. The mid-range remodel is eighteen thousand dollars, about five weeks, and adds new cabinets and flooring on top of the refresh items. Homeowner: And the open concept option? Contractor: That would be our full remodel, thirty five thousand dollars and about ten weeks, since it involves knocking down a wall and moving plumbing and electrical, which also requires a permit from the city. Homeowner: That's well beyond my budget and longer than I expected. Contractor: Given your range, I'd actually recommend the mid-range remodel, new cabinets and flooring will make a big visual difference even without changing the layout. Homeowner: I'm a little disappointed about the open concept though. Contractor: There is a middle ground, actually. During the mid-range remodel, we could widen the doorway between the kitchen and living room, without touching plumbing or electrical, so no permit needed. It's not a full wall removal, but it opens up sightlines quite a bit, for about twelve hundred dollars extra. Homeowner: That sounds like a good compromise for now, I could always do the full remodel years down the road. Contractor: Exactly, this way you get some openness within your current budget. Homeowner: Let's go with the mid-range remodel plus the widened doorway.",
    questions: [
      { q: "What is the homeowner's budget range?", options: ["$8,000-$10,000", "$15,000-$20,000", "$25,000-$30,000", "$35,000 or more"], answer: 1 },
      { q: "Why does the full remodel exceed what the homeowner wants?", options: ["It doesn't include new cabinets", "It costs more and takes longer than the homeowner wants", "It doesn't offer an open layout", "It requires no permit"], answer: 1 },
      { q: "What does the full remodel require that the others don't?", options: ["New paint", "A city permit for structural changes", "New countertops", "A longer warranty"], answer: 1 },
      { q: "What compromise does the contractor suggest?", options: ["Doing the full remodel on a payment plan", "Widening the doorway during the mid-range remodel", "Skipping cabinets to save money", "Waiting a year to save up"], answer: 1 },
      { q: "Does widening the doorway require a permit?", options: ["Yes, because it involves plumbing", "No, because it doesn't touch plumbing or electrical", "Yes, because it involves electrical work", "It depends on the city"], answer: 1 },
      { q: "What does the homeowner finally decide to do?", options: ["Full remodel now", "Refresh package only", "Mid-range remodel plus a widened doorway", "Wait and do nothing this year"], answer: 2 }
    ]
  },
  {
    id: "L3-12",
    partNum: 3,
    part: "Part 3: Listening for Information",
    title: "Choosing a Family Gym Membership",
    script: "Staff: Welcome to Peak Fitness Center! What brings you in today? Customer: I'm looking into membership options for my whole family, my spouse and I have two kids, ages five and eight. Staff: We actually have a family plan for up to four members, that's one hundred thirty dollars a month. It includes access for everyone, plus supervised childcare for up to two hours while you work out, which is popular with parents your kids' ages. Customer: That childcare piece is really helpful, we don't always have a sitter. What if we didn't need the family plan, like just a couple's plan? Staff: The couple plan is eighty five dollars a month, but that only covers two adults, no childcare and no access for the kids. Customer: Given we have two kids, family plan sounds like the better fit then. Does it include pool access? Staff: Yes, pool access is included in the family plan at no extra cost. For individual or couple plans, pool access is an optional add-on for twenty dollars a month. Customer: That's good, because I was hoping to get my kids into swim lessons here too. Staff: Just to clarify, swim lessons are a separate program from general pool access, they're fifteen dollars per session and booked directly with one of our swim instructors, not automatically included with any membership. Customer: That's fine, we can book those separately. I think the family plan makes the most sense for us, with the childcare and pool access included. Staff: Great choice, I'll get the paperwork ready for all four of you.",
    questions: [
      { q: "How many members does the family plan cover?", options: ["Two", "Three", "Up to four", "Unlimited"], answer: 2 },
      { q: "What special benefit comes with the family plan that the couple plan lacks?", options: ["A free towel service", "Supervised childcare for up to two hours", "Personal training sessions", "A private locker"], answer: 1 },
      { q: "How much extra would pool access cost on the couple plan?", options: ["It's included for free", "Ten dollars a month", "Twenty dollars a month", "Thirty dollars a month"], answer: 2 },
      { q: "Are swim lessons included with the family plan?", options: ["Yes, fully included", "No, they are a separate paid program", "Only for children under five", "Only on weekends"], answer: 1 },
      { q: "How are swim lessons booked?", options: ["Automatically with membership", "Directly with a swim instructor for a per-session fee", "Through the family plan hotline", "They cannot be booked, only drop-in"], answer: 1 },
      { q: "Which plan does the customer choose?", options: ["Individual plan", "Couple plan", "Family plan", "Couple plan plus pool add-on"], answer: 2 }
    ]
  }
];

const LISTENING_PART4 = [
  {
    id: "L4-01",
    partNum: 4,
    part: "Part 4: Listening to a News Item",
    title: "New Bike-Share Program Launches Downtown",
    script: "The City of Fairbrook will launch its first bike-share program next Monday, with two hundred bikes available at twenty five stations across downtown and near the university campus. Riders will use a mobile app to unlock bikes, and the first thirty minutes of each ride will be free, with a rate of two dollars per hour after that. For frequent riders, the city is offering an annual pass for sixty dollars that covers unlimited rides under forty five minutes. The program is funded through a combination of local business sponsorships and a city infrastructure grant. Officials note that helmets will not be provided at the stations, so riders are reminded to bring their own. The initiative is part of a broader city goal to reduce downtown car traffic by fifteen percent over the next three years. If the program sees strong usage in its first year, city planners say they hope to expand the network into two additional neighborhoods, though that expansion would depend on ridership data collected over the coming months.",
    questions: [
      { q: "How many bike stations will the program have at launch?", options: ["Two hundred", "Twenty five", "Fifteen", "Forty five"], answer: 1 },
      { q: "How much does the first thirty minutes of a ride cost?", options: ["Two dollars", "Free", "Sixty dollars", "One dollar"], answer: 1 },
      { q: "What does the annual pass cover?", options: ["Unlimited rides of any length", "Unlimited rides under forty five minutes", "One free ride per day", "Discounted helmets"], answer: 1 },
      { q: "What is NOT provided at the bike stations?", options: ["Bikes", "Helmets", "A mobile app", "Payment kiosks"], answer: 1 },
      { q: "What does the city hope to achieve with this program?", options: ["Increase tourism", "Reduce downtown car traffic by fifteen percent over three years", "Raise money for schools", "Replace the bus system"], answer: 1 }
    ]
  },
  {
    id: "L4-02",
    partNum: 4,
    part: "Part 4: Listening to a News Item",
    title: "Riverside Community Park Opens This Weekend",
    script: "Riverside Community Park will officially open this Saturday after eighteen months of construction. The new park features a large playground, a splash pad, walking trails along the river, and a fenced off-leash area for dogs. A ribbon cutting ceremony will take place at ten in the morning, with the mayor in attendance to mark the occasion. The splash pad will operate seasonally, running from May through September, and will be free to use. Because on-site parking is limited, the city is encouraging residents to walk, bike, or take a free shuttle running from downtown every twenty minutes on opening day. The total cost of the project came to two point eight million dollars, funded through a mix of city budget allocations and community fundraising efforts led by local residents. Notably, the park was built on a former industrial lot that required significant environmental cleanup before construction could begin, turning what was once an abandoned site into new green space for the neighborhood.",
    questions: [
      { q: "How long did construction of the park take?", options: ["Six months", "Eighteen months", "Three years", "One month"], answer: 1 },
      { q: "When does the splash pad operate?", options: ["Year round", "May through September", "Only in July", "Weekends only"], answer: 1 },
      { q: "Why is the city encouraging shuttle use on opening day?", options: ["The park is far from downtown", "On-site parking is limited", "Roads will be closed", "It's a fundraiser"], answer: 1 },
      { q: "How was the project funded?", options: ["Entirely by the city", "Entirely by donations", "A mix of city budget and community fundraising", "A federal grant"], answer: 2 },
      { q: "What was previously on the site of the new park?", options: ["A parking lot", "A former industrial lot", "A shopping mall", "Another park"], answer: 1 }
    ]
  },
  {
    id: "L4-03",
    partNum: 4,
    part: "Part 4: Listening to a News Item",
    title: "Maple Street Bridge Repairs Begin Next Week",
    script: "Drivers are being warned of upcoming lane closures on the Maple Street bridge starting next week, as crews begin a six week structural repair project. During construction, traffic will be reduced to a single alternating lane controlled by temporary signals. The city is recommending that through traffic use the detour route via Elm Avenue and Birch Road to avoid delays, though access to local businesses along Maple Street will be maintained throughout the project. Most of the work will take place overnight, between nine at night and five in the morning, to minimize disruption during peak daytime hours, though officials say some daytime lane closures will still be unavoidable for certain phases of the work. The repairs address structural issues identified during a routine bridge inspection earlier this year. City engineers say it's important to complete the project before winter arrives, since freezing temperatures could worsen the existing damage if left unaddressed. Residents who want real-time updates on closures and delays can sign up for text alerts through the city's website.",
    questions: [
      { q: "How long is the bridge repair project expected to take?", options: ["Two weeks", "Six weeks", "Three months", "One year"], answer: 1 },
      { q: "What route does the city recommend for through traffic?", options: ["Straight through Maple Street", "Via Elm Avenue and Birch Road", "There is no detour", "Only via public transit"], answer: 1 },
      { q: "When will most of the construction work happen?", options: ["During the morning rush hour", "Overnight between 9pm and 5am", "On weekends only", "All day, every day"], answer: 1 },
      { q: "Why is it important to finish before winter?", options: ["The crew is unavailable after that", "Freezing temperatures could worsen the existing damage", "The budget expires", "Businesses close for winter"], answer: 1 },
      { q: "How can residents get real-time updates?", options: ["Call the mayor's office", "Sign up for text alerts on the city's website", "Visit city hall in person", "Listen to a special radio channel"], answer: 1 }
    ]
  },
  {
    id: "L4-04",
    partNum: 4,
    part: "Part 4: Listening to a News Item",
    title: "New Express Bus Route Announced",
    script: "The regional transit authority announced a new express bus route connecting the suburb of Oakridge to downtown, set to begin service next month. The new Route 50 will cut travel time significantly, from the current fifty five minutes on the regular route down to about thirty minutes, thanks to limited stops and a dedicated bus lane along part of the corridor. During rush hour, buses will run every fifteen minutes, and every thirty minutes outside of peak times. The fare will match the standard bus fare of three dollars and twenty five cents, and transfers to other routes remain free. To encourage residents to try the new service, the transit authority is offering free rides for the first two weeks after launch. The route is part of a broader effort to reduce highway congestion caused by Oakridge commuters, roughly seventy percent of whom currently drive to work alone, according to a recent transit survey. Officials hope the faster, more frequent service will convince at least some of those drivers to switch to public transit.",
    questions: [
      { q: "How much faster is the new express route compared to the regular route?", options: ["It saves about 10 minutes", "It saves about 25 minutes", "It saves about 5 minutes", "There is no time difference"], answer: 1 },
      { q: "How often does Route 50 run during rush hour?", options: ["Every 10 minutes", "Every 15 minutes", "Every 30 minutes", "Every hour"], answer: 1 },
      { q: "How much will the new route cost to ride?", options: ["More than the regular bus fare", "The same as the standard bus fare", "It's completely free permanently", "Half the regular fare"], answer: 1 },
      { q: "What promotion is being offered at launch?", options: ["Free rides for the first two weeks", "A permanent fare discount", "Free parking at stations", "A raffle for prizes"], answer: 0 },
      { q: "What is the transit authority hoping to reduce?", options: ["Bus maintenance costs", "Highway congestion from Oakridge commuters", "The number of bus routes", "Fuel prices"], answer: 1 }
    ]
  },
  {
    id: "L4-05",
    partNum: 4,
    part: "Part 4: Listening to a News Item",
    title: "Longtime Neighborhood Bakery to Close",
    script: "After thirty two years in business, Sweet Maple Bakery on Fifth Street will close its doors at the end of this month, as the owner has decided to retire and the building has been sold to new developers. The closure has come as a disappointment to many longtime customers who have relied on the shop for birthday cakes, morning pastries, and community gatherings over the decades. There is, however, a silver lining. A former employee who worked at Sweet Maple for over a decade plans to open a new bakery two blocks away early next year, and has received the original owner's blessing to continue using several of the shop's signature recipes. In recognition of the bakery's contribution to the neighborhood, the city has announced it will install a small commemorative plaque near the site once the building is redeveloped. For its final week of operation, Sweet Maple Bakery will offer a discount on all baked goods and is hosting a customer appreciation weekend, inviting the community to stop by and share memories before the shop closes for good.",
    questions: [
      { q: "Why is Sweet Maple Bakery closing?", options: ["It went out of business due to low sales", "The owner is retiring and the building was sold", "It failed a health inspection", "It's relocating to another city"], answer: 1 },
      { q: "How long had Sweet Maple Bakery been in business?", options: ["12 years", "20 years", "32 years", "50 years"], answer: 2 },
      { q: "What is the \"silver lining\" mentioned in the report?", options: ["The bakery will reopen in the same location", "A former employee plans to open a new bakery nearby using some original recipes", "The building will become a park", "The recipes will be published in a cookbook"], answer: 1 },
      { q: "What is the city planning to do?", options: ["Rename a street after the bakery", "Install a commemorative plaque near the site", "Fund the new bakery", "Turn the building into a museum"], answer: 1 },
      { q: "What is happening during the bakery's final week?", options: ["Prices are increasing", "A discount and a customer appreciation weekend", "The bakery is only open by appointment", "Nothing special is planned"], answer: 1 }
    ]
  },
  {
    id: "L4-06",
    partNum: 4,
    part: "Part 4: Listening to a News Item",
    title: "Annual Fundraiser Supports Emergency Shelter",
    script: "The Fairbrook Emergency Shelter will hold its annual Warm Hearts fundraiser this weekend at the community center, featuring a silent auction, a bake sale, and live performances from several local bands. Organizers are hoping to raise twenty five thousand dollars this year to support winter operations, including beds, heating, and meals for shelter guests. Last year's event raised nineteen thousand dollars, and organizers say the need has only grown, with the shelter serving fifteen percent more people last winter compared to the year before, largely due to rising housing costs in the area. New this year, a local credit union has agreed to match donations dollar for dollar up to ten thousand dollars, effectively doubling the impact of early contributions. The silent auction will feature donated services and gift items from more than thirty local businesses. Entry to the event itself is free, though organizers are encouraging attendees to bring cash or cards for the bake sale and auction. Volunteers are still needed to help with event setup on Friday evening and cleanup on Sunday, and anyone interested can sign up through the shelter's website.",
    questions: [
      { q: "What is this year's fundraising goal?", options: ["$10,000", "$19,000", "$25,000", "$30,000"], answer: 2 },
      { q: "How much did last year's event raise?", options: ["$10,000", "$19,000", "$25,000", "$35,000"], answer: 1 },
      { q: "Why has demand at the shelter increased?", options: ["More volunteers are needed", "Rising housing costs have increased the number of people needing help", "The shelter reduced its capacity", "A nearby shelter closed"], answer: 1 },
      { q: "What is new about this year's fundraiser?", options: ["A new venue", "Corporate matching donations up to $10,000", "Higher entry fees", "An online-only format"], answer: 1 },
      { q: "How much does it cost to attend the event?", options: ["$25", "$10", "It's free to enter", "$50"], answer: 2 }
    ]
  },
  {
    id: "L4-07",
    partNum: 4,
    part: "Part 4: Listening to a News Item",
    title: "Heat Warning Issued for the Region",
    script: "The regional weather authority has issued a heat warning effective starting tomorrow, with daytime temperatures expected to reach between thirty four and thirty seven degrees for four consecutive days. Overnight lows are expected to stay above twenty two degrees, offering little relief after dark. Officials are urging residents to check in on elderly neighbors and family members, stay well hydrated, and avoid strenuous outdoor activity between eleven in the morning and four in the afternoon, when temperatures peak. To help residents cope, the city is opening five cooling centers at select libraries and community centers, which will extend their hours for the duration of the heat event. City pools will also offer free admission while the warning remains in effect. Residents are reminded never to leave pets or children unattended in vehicles, even briefly, as interior temperatures can rise dangerously fast in the heat. The advisory is expected to remain in place until temperatures drop back below thirty degrees, which forecasters currently anticipate happening by the weekend.",
    questions: [
      { q: "How many days is the heat warning expected to last?", options: ["Two days", "Four days", "One week", "It's indefinite"], answer: 1 },
      { q: "What time of day is considered peak heat, when strenuous activity should be avoided?", options: ["6am to 9am", "11am to 4pm", "4pm to 8pm", "All day"], answer: 1 },
      { q: "Where are the city's cooling centers located?", options: ["Fire stations", "Libraries and community centers", "Hospitals only", "Shopping malls"], answer: 1 },
      { q: "What is offered for free during the heat warning?", options: ["Bus rides", "Admission to city pools", "Bottled water at stores", "Hotel rooms"], answer: 1 },
      { q: "When is the advisory expected to lift?", options: ["Tomorrow", "By the weekend", "In two weeks", "It has no expected end date"], answer: 1 }
    ]
  },
  {
    id: "L4-08",
    partNum: 4,
    part: "Part 4: Listening to a News Item",
    title: "Composting Program Expands Citywide",
    script: "The city is expanding its curbside organics and composting program to the remaining neighborhoods that haven't yet been included, with the rollout beginning next month. Households in the newly added areas will receive their green bins about two weeks before collection starts, along with an information pamphlet on what can and cannot go inside. Accepted items include food scraps, yard waste, and soiled paper products, but the city is emphasizing that plastic bags, even ones labeled compostable, along with diapers and pet waste, are not accepted and can contaminate an entire load. Organics will be collected weekly, on the same day as regular recycling pickup. City officials say the program's goal is to reduce landfill waste by thirty percent, noting that neighborhoods already participating are diverting about eight thousand tonnes of waste from landfills each year. Looking ahead, officials mentioned that households who consistently don't participate could eventually see their regular garbage collection reduced to biweekly as an incentive to compost, though no such change is planned for this current phase. The program expansion itself will not add any new cost to residents' utility bills.",
    questions: [
      { q: "When does the composting program expansion begin?", options: ["This week", "Next month", "Next year", "In six months"], answer: 1 },
      { q: "Which of the following is NOT accepted in the green bin?", options: ["Food scraps", "Yard waste", "Plastic bags labeled compostable", "Soiled paper"], answer: 2 },
      { q: "How often will organics be collected?", options: ["Daily", "Weekly", "Biweekly", "Monthly"], answer: 1 },
      { q: "What is the city's stated waste reduction goal?", options: ["10%", "30%", "50%", "75%"], answer: 1 },
      { q: "What future measure might encourage non-participating households to compost?", options: ["A fine", "Reduced garbage collection to biweekly", "Loss of recycling service", "A tax increase"], answer: 1 }
    ]
  },
  {
    id: "L4-09",
    partNum: 4,
    part: "Part 4: Listening to a News Item",
    title: "Central Library Reopens After Renovation",
    script: "The Fairbrook Central Library will reopen this week after an eight month renovation that added an entirely new wing to the building. The updated library features a children's area that has doubled in size, a dedicated quiet study zone for teens, twelve new public computer stations, and a community meeting room that residents can book free of charge. Along with the physical upgrades, the library is extending its hours. Weekday hours will now run until nine in the evening, up from the previous closing time of six o'clock, and for the first time, the library will also open on Sundays, from noon until five in the afternoon. The renovation project cost three point five million dollars, funded through a municipal bond approved by voters last year. To celebrate the reopening, the library is offering free library card sign-ups throughout the week, and is hosting a celebration on Saturday with light refreshments for the community.",
    questions: [
      { q: "How long did the renovation take?", options: ["Three months", "Eight months", "One year", "Two years"], answer: 1 },
      { q: "What new feature can residents book for free?", options: ["The teen study zone", "A community meeting room", "The children's area", "Computer stations"], answer: 1 },
      { q: "What is the new weekday closing time?", options: ["6pm", "7pm", "9pm", "10pm"], answer: 2 },
      { q: "What is new about the library's schedule?", options: ["It is now open on Sundays for the first time", "It is closed on Mondays", "It now closes earlier", "It no longer opens on weekdays"], answer: 0 },
      { q: "How was the renovation funded?", options: ["Private donations", "A municipal bond", "A federal grant", "Library fines"], answer: 1 }
    ]
  },
  {
    id: "L4-10",
    partNum: 4,
    part: "Part 4: Listening to a News Item",
    title: "School District Announces Later Start Times",
    script: "The Fairbrook School District has announced that all high schools will shift to a later start time beginning next school year, moving from eight in the morning to eight forty five. The decision is based on research showing that later start times align better with teenagers' natural sleep patterns and can improve both attendance and academic performance. Elementary schools will not be affected by the change and will keep their current schedules. However, because of the shift, some elementary school bus routes will need to run earlier than before to allow the same buses to also serve the high schools later in the morning. District officials pointed to a pilot program at one high school last year, where a later start time was tested and resulted in noticeably improved attendance and grades compared to the previous year. Parents with questions or concerns are invited to attend an information session next Tuesday evening at the district office. To help offset the later dismissal time, after-school programs will also extend their hours by thirty minutes, giving coaches and program coordinators time to adjust practice and activity schedules accordingly.",
    questions: [
      { q: "What is the new high school start time?", options: ["8:00am", "8:30am", "8:45am", "9:00am"], answer: 2 },
      { q: "Why is the district making this change?", options: ["To save money on transportation", "Research shows later start times benefit teen sleep and performance", "Teachers requested it", "To match neighboring districts"], answer: 1 },
      { q: "Which schools will be affected by the new start time?", options: ["Elementary schools only", "High schools only", "All schools equally", "Only middle schools"], answer: 1 },
      { q: "What evidence does the district cite to support the change?", options: ["National test score data", "Results from a pilot program at one high school last year", "A parent survey", "A recommendation from the government"], answer: 1 },
      { q: "How are after-school programs adjusting?", options: ["They are being cancelled", "Extending hours by thirty minutes", "Moving to weekends", "Reducing available activities"], answer: 1 }
    ]
  },
  {
    id: "L4-11",
    partNum: 4,
    part: "Part 4: Listening to a News Item",
    title: "Free Flu Shot Clinics Announced",
    script: "The regional health authority is launching a series of free flu shot clinics starting next week, running through the end of November at locations across the region, including pharmacies, community centers, and a mobile clinic that will travel to underserved rural areas. Most locations will accept walk-ins with no appointment necessary, though some pharmacies are requesting that residents book a time slot in advance. Health officials are especially encouraging vaccination among priority groups, including seniors over sixty five, young children, pregnant individuals, and health care workers, who face higher risks from seasonal flu. The push comes after last year's flu season saw a twenty percent increase in hospitalizations compared to the previous year. Officials are urging residents to get vaccinated early, noting that it takes about two weeks after the shot for full immunity to develop. The vaccine will be free for all residents, regardless of insurance status. The mobile clinic's schedule, which will rotate through six rural communities over the course of the campaign, has been posted on the health authority's website for residents to check when it will be in their area.",
    questions: [
      { q: "How long will the flu shot clinics run?", options: ["One week", "Until the end of November", "All winter", "Until January"], answer: 1 },
      { q: "Do all locations require an appointment?", options: ["Yes, all locations require booking", "No, most accept walk-ins, though some pharmacies request bookings", "No appointments are accepted anywhere", "Only the mobile clinic requires booking"], answer: 1 },
      { q: "Why is early vaccination encouraged?", options: ["The vaccine supply is limited", "Full immunity takes about two weeks to develop", "Clinics close early each day", "Prices increase later in the season"], answer: 1 },
      { q: "What happened during last year's flu season?", options: ["Hospitalizations decreased", "Hospitalizations increased by twenty percent", "The vaccine was unavailable", "Schools closed early"], answer: 1 },
      { q: "How many rural communities will the mobile clinic visit?", options: ["Two", "Four", "Six", "Ten"], answer: 2 }
    ]
  },
  {
    id: "L4-12",
    partNum: 4,
    part: "Part 4: Listening to a News Item",
    title: "Summer Arts Festival Returns for Tenth Year",
    script: "The Fairbrook Summer Arts Festival returns next month for its tenth year, running for three days at riverside park. This year's festival will feature more than eighty local artists and craft vendors, live performances on two stages, and a lineup of food trucks. General admission to the festival is free, though select workshops throughout the weekend will require tickets ranging from ten to twenty five dollars. Organizers have announced that the local folk band The Copper Wires will headline the festival's main stage on Saturday evening. New this year is a designated family zone offering hands-on art activities designed for children. Because parking near the park is limited, the city is running a free shuttle from downtown every twenty minutes throughout the weekend. Proceeds from the ticketed workshops will go toward the city's youth arts education fund, supporting art programs in local schools. As for weather, organizers say the festival will proceed rain or shine, though if conditions turn severe, performances on the main stage may be relocated to a covered pavilion on site.",
    questions: [
      { q: "How many years has the festival been running, including this one?", options: ["Five", "Eight", "Ten", "Fifteen"], answer: 2 },
      { q: "Is general admission to the festival free?", options: ["No, tickets are required for everyone", "Yes, though some workshops require tickets", "Yes, but only on the first day", "No, it costs $10"], answer: 1 },
      { q: "What is new at this year's festival?", options: ["A second stage", "A designated family zone with hands-on activities", "Food trucks", "Free parking"], answer: 1 },
      { q: "Where does the money from ticketed workshops go?", options: ["Festival organizer profits", "The city's youth arts education fund", "Artist vendor fees", "Shuttle bus maintenance"], answer: 1 },
      { q: "What happens if the weather turns severe?", options: ["The festival is cancelled entirely", "Main stage acts may move to a covered pavilion", "The festival is rescheduled to the following week", "Only food trucks remain open"], answer: 1 }
    ]
  }
];
