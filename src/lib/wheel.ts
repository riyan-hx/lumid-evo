/** Feelings wheel (C4): core → middle → precise word, each with a plain-language meaning. */
export type WheelNode = { name: string; feeling: string; means: string; children?: WheelNode[] };

const leaf = (name: string, feeling: string, means: string): WheelNode => ({ name, feeling, means });

export const WHEEL: WheelNode[] = [
  {
    name: "Scared", feeling: "Anxious", means: "Sensing danger, even if it's not right here.",
    children: [
      { name: "Anxious", feeling: "Anxious", means: "Worry about what might happen.", children: [leaf("Overwhelmed", "Overwhelmed", "Too much at once — more than you can hold right now."), leaf("Insecure", "Anxious", "Unsure you're good enough or safe enough."), leaf("Worried", "Anxious", "Your mind keeps returning to what could go wrong."), leaf("Helpless", "Overwhelmed", "Feeling there's nothing you can do.")] },
      { name: "Nervous", feeling: "Anxious", means: "On edge before something.", children: [leaf("Tense", "Anxious", "Your body is braced, ready for trouble."), leaf("Restless", "Anxious", "Hard to stay still or settle."), leaf("Panicky", "Anxious", "Fear rising fast, hard to think."), leaf("Dreading", "Anxious", "Not wanting something that's coming.")] },
    ],
  },
  {
    name: "Sad", feeling: "Sad", means: "A heavy, low feeling — often about a loss.",
    children: [
      { name: "Lonely", feeling: "Lonely", means: "Wanting connection that isn't there.", children: [leaf("Left out", "Lonely", "Others are together and you're not."), leaf("Unseen", "Lonely", "No one notices how you're doing."), leaf("Isolated", "Lonely", "Cut off from people."), leaf("Homesick", "Lonely", "Missing a place or the people there.")] },
      { name: "Hurt", feeling: "Sad", means: "Pain caused by someone or something.", children: [leaf("Disappointed", "Sad", "Something didn't turn out as you hoped."), leaf("Rejected", "Sad", "Pushed away or not chosen."), leaf("Empty", "Numb", "Nothing much inside right now."), leaf("Hopeless", "Sad", "Hard to see things getting better.")] },
    ],
  },
  {
    name: "Mad", feeling: "Angry", means: "Something feels unfair or crossed a line.",
    children: [
      { name: "Frustrated", feeling: "Angry", means: "Blocked from what you need.", children: [leaf("Irritated", "Angry", "Small things are getting under your skin."), leaf("Annoyed", "Angry", "Mildly bothered."), leaf("Resentful", "Angry", "Holding on to an old hurt."), leaf("Furious", "Angry", "Very strong anger.")] },
      { name: "Disrespected", feeling: "Angry", means: "Not treated as you deserve.", children: [leaf("Ignored", "Angry", "Your voice didn't count."), leaf("Belittled", "Angry", "Made to feel small."), leaf("Betrayed", "Angry", "Trust was broken."), leaf("Jealous", "Angry", "Wanting what someone else has.")] },
    ],
  },
  {
    name: "Peaceful", feeling: "Calm", means: "Settled and at ease.",
    children: [
      { name: "Content", feeling: "Calm", means: "Things are enough right now.", children: [leaf("Relieved", "Calm", "A weight has lifted."), leaf("Grateful", "Calm", "Thankful for something or someone."), leaf("Safe", "Calm", "Protected and okay."), leaf("Rested", "Calm", "Your body has had what it needs.")] },
      { name: "Hopeful", feeling: "Okay", means: "Expecting things can go well.", children: [leaf("Proud", "Okay", "Pleased with something you did."), leaf("Excited", "Okay", "Looking forward with energy."), leaf("Loved", "Okay", "Cared for by someone."), leaf("Curious", "Okay", "Interested to know more.")] },
    ],
  },
];
