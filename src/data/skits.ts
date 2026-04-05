import type { Skit } from '@/types/skit'

const now = new Date().toISOString()

export const SEED_SKITS: Skit[] = [
  {
    id: 'smoking',
    title: 'Smoking on a Plane',
    subtitle: "A monologue about freedom, ashtrays, and Sammie",
    speakers: ['GUY', 'FA'],
    palaceImages: [
      'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1557825835-70d97c4aa567?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1540339832862-474599807836?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=300&h=200&fit=crop',
    ],
    chunks: [
      { id: 1, label: 'The Opener',
        lines: [
          { speaker: 'FA', text: "Oh, sir. There's no smoking on airplanes." },
          { speaker: 'GUY', text: "I know. Isn't that wild? Don't worry about it. I'll be quick." },
        ]},
      { id: 2, label: 'The FAA Threat',
        lines: [
          { speaker: 'FA', text: "Sir, if you don't put that out, I'm going to have to report you to the FAA." },
          { speaker: 'GUY', text: "Sammie — it's Sammie, right? Do you know when the first commercial flight went smokeless, Sammie?" },
          { speaker: 'FA', text: 'No.' },
        ]},
      { id: 3, label: '1973, Moon & Tombstone',
        lines: [
          { speaker: 'GUY', text: "1973. You know what else happened in 1973? We went to the moon. Now look at us. We can't smoke, and we stopped going to the moon. Coincidence? (beat) I think not. Look at this. (points to armrest) See that little metal rectangle? It's a sealed-over ashtray, a remnant of a better time. But they welded it shut. That's not an armrest, Sammie. That's a tombstone. For freedom." },
        ]},
      { id: 4, label: 'Liquids, Shoes, Rick',
        lines: [
          { speaker: 'GUY', text: "It starts with ashtrays. Then it's liquids over 3.4 ounces. And just when we've been brainwashed into believing a bottle of water will lead to the next 911, they're making you take off your shoes like you're entering a Japanese temple, except there's no peace, there's no garden. There's just an overweight guy named Rick waving a metal detector wand over your belt buckle." },
        ]},
      { id: 5, label: 'Deodorant Sandwich',
        lines: [
          { speaker: 'GUY', text: "And now you can't do one damn thing without someone reporting you to the Department of Homeland Security. I mean, I had to put my deodorant in a Ziploc bag. A Ziploc bag, Sammie. Like a sandwich. They're treating my personal hygiene like a sandwich. And for what? So that some algorithm can flag me because I bought a one-way ticket? I buy everything one-way. That's how I live my life. Forward. Always forward." },
        ]},
      { id: 6, label: 'Proud Tradition',
        lines: [
          { speaker: 'FA', text: "Sir, I really need you to—" },
          { speaker: 'GUY', text: "I remember back in the day when you got on a plane and you knew you were in for a good time. A little smoking, a little drinking, and the stewardesses. You come from a proud tradition (of smoking hot stewadesses), Sammie. Flight attendants used to hand you a warm towel, a cocktail, and a cigarette. Now you hand people a bag of peanuts and an apology. And I can't even open the damn bag of peanuts cause Mr. Brown is deathly allergic to them. But I want you to know that it's not your fault, Sammie. That's the system...But we don't have to take it." },
        ]},
      { id: 7, label: 'The Heroes',
        lines: [
          { speaker: 'GUY', text: "Like Henry David Thoreau and Rosa Parks and David Lee Roth when he left Van Halen, we can say enough. Enough of this farce. Enough playing by their rules." },
        ]},
      { id: 8, label: '30,000 Feet',
        lines: [
          { speaker: 'GUY', text: "And when you and I are old, Sammie — and we will get old — we can look back on this moment. Thirty thousand feet above God's green earth. And we can say: we smoked one. We smoked one, for America!" },
        ]},
      { id: 9, label: 'The Drag & Punchline',
        lines: [
          { speaker: 'GUY', text: '(takes a long drag) (beat)' },
          { speaker: 'FA', text: '...Can I get a drag of that?' },
        ]},
    ],
    macroSections: [
      { id: 'all', label: 'Full Skit', chunks: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      { id: 'm1', label: 'Act I: Setup (1-3)', chunks: [1, 2, 3] },
      { id: 'm2', label: 'Act II: Rant (4-5)', chunks: [4, 5] },
      { id: 'm3', label: 'Act III: Rally (6-8)', chunks: [6, 7, 8] },
      { id: 'm4', label: 'Finale (9)', chunks: [9] },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'bubble',
    title: 'Here Comes Another Bubble',
    subtitle: "A Billy Joel parody — Silicon Valley's greatest hits",
    speakers: ['PERFORMER'],
    palaceImages: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=200&fit=crop',
    ],
    chunks: [
      { id: 1, label: 'Verse 1: The Origin Story',
        lines: [
          { speaker: 'PERFORMER', text: "Got me an M.L. degree from Stanford, class of GPT. Moved out to the Mission, full of dreams and ambition. Left my internship at Google Brain, thought I'd train the next big thing. Made a model, kind of mid — called it Jarvis, raised a bid." },
          { speaker: 'PERFORMER', text: "Startup with no revenue, raise a hundred million too. Put AI and crypto stuff, now it's finally dumb enough. Happy days are here again — Elon Musk, Sam Altman. Time to write a business plan, so I can be like those guys." },
        ]},
      { id: 2, label: 'Chorus 1: The Bubble',
        lines: [
          { speaker: 'PERFORMER', text: "Here comes another bubble! It's a monster rally, all around the valley. Demos filled with sleight of hand, AI wrappers barely stand. But if the hype is big enough, no one asks you to do stuff. Let's yell pivot, higher, fast — bail out, just outlast." },
        ]},
      { id: 3, label: 'Verse 2: The Hustle',
        lines: [
          { speaker: 'PERFORMER', text: "Moonshot deck, 10x plan — VC thinks I'm the man. Chatbot, therapist, startup, nihilist. Pump injection, jailbreak scripts, CEO with ego trips." },
          { speaker: 'PERFORMER', text: "Press release with zero blue. Grok, is that true? Deepfake nudes, lawsuit wrecks — now it's stealing indie sets." },
        ]},
      { id: 4, label: 'Chorus 2: The Tweet Storm',
        lines: [
          { speaker: 'PERFORMER', text: "Here comes another bubble! But VCs are backing, baby, let's get cracking." },
          { speaker: 'PERFORMER', text: "Tweet, tweet, tweet it all — tweet it if it's big or small. Tweet your threads on moral worth, tweet like you invented birth. Tweet like you're a prophet king, tweet your takes on everything. Tweet — even if you're wrong — won't you tweet about the song?" },
        ]},
      { id: 5, label: 'Verse 3: The Culture',
        lines: [
          { speaker: 'PERFORMER', text: "Every party, all dudes — house rules, no shoes. All on Twitter all the time, cutting tapes instead of lines." },
          { speaker: 'PERFORMER', text: "Got to YC, still feel beige — all these guys are half my age. Twenty-nine, past my prime — I feel so behind the times." },
        ]},
      { id: 6, label: 'Chorus 3: The Promise',
        lines: [
          { speaker: 'PERFORMER', text: "Here comes another bubble! In a year we swear — we'll all be billionaires." },
        ]},
      { id: 7, label: 'Verse 4: The Money',
        lines: [
          { speaker: 'PERFORMER', text: "Make yourself a million bucks — partly skill, mostly luck. Now you're rich enough to pay for a one-bed in Noe." },
          { speaker: 'PERFORMER', text: "Want a yard and extra room? Maybe join a polycule. Flip the written, flip the chores — open floor plan, open doors. Make yourself a billion bucks, pay for games and venture luck." },
        ]},
      { id: 8, label: 'Outro: The Ego Trip',
        lines: [
          { speaker: 'PERFORMER', text: "Buy a ranch, a private zoo — with a goat that quotes Marc Andreessen too. Build yourself a rocket ship, blast off on an ego trip." },
          { speaker: 'PERFORMER', text: "Can this really be the end? Back to work you go again. Here comes another bubble — with the game you're on, it's still going on, and on, and on... pop." },
        ]},
    ],
    macroSections: [
      { id: 'all', label: 'Full Song', chunks: [1, 2, 3, 4, 5, 6, 7, 8] },
      { id: 'm1', label: 'Act I: Origin & First Bubble (1-2)', chunks: [1, 2] },
      { id: 'm2', label: 'Act II: The Hustle & Tweets (3-4)', chunks: [3, 4] },
      { id: 'm3', label: 'Act III: Culture & Promise (5-6)', chunks: [5, 6] },
      { id: 'm4', label: 'Finale: Money & Pop (7-8)', chunks: [7, 8] },
    ],
    createdAt: now,
    updatedAt: now,
  },
]
