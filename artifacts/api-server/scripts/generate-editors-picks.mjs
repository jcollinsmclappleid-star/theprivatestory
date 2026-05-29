#!/usr/bin/env node

/**
 * Generate the 10 Editor's Picks short narrated samples for the central
 * /samples landing page. Each piece is a ~2-minute literary cliffhanger that
 * fades before any explicit content — see docs/compliance/editorial-standard.md
 * for the editorial test every script must pass.
 *
 * Output: public-static/voice-samples/editors-picks/{slug}.mp3
 *   These are committed to git and copied to public/ on each api-server build,
 *   then served as static files at /voice-samples/editors-picks/{slug}.mp3.
 *
 * Voice mix (target female 25-45 audience):
 *   Clara x3 (British, soothing) - 01, 02, 03
 *   Kayla x3 (American, expressive) - 04, 05, 06
 *   Maya  x2 (American, intimate)   - 07, 08
 *   James x2 (British, assured)     - 09, 10  (his-POV scenes)
 *
 * Usage:
 *   node scripts/generate-editors-picks.mjs              # skip existing
 *   node scripts/generate-editors-picks.mjs --force      # regenerate all
 *   node scripts/generate-editors-picks.mjs 01 04        # only those slugs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(
  __dirname,
  "..",
  "public-static",
  "voice-samples",
  "editors-picks",
);
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const FORCE = process.argv.includes("--force");
const ONLY = process.argv.slice(2).filter((a) => !a.startsWith("--"));

if (!ELEVENLABS_API_KEY) {
  console.error("ERROR: ELEVENLABS_API_KEY environment variable not set");
  process.exit(1);
}

const VOICE = {
  clara: { id: "FA6HhUjVbervLw2rNl8M", name: "Clara", settings: { stability: 0.62, similarity_boost: 0.78, style: 0.12 } },
  kayla: { id: "aTxZrSrp47xsP6Ot4Kgd", name: "Kayla", settings: { stability: 0.48, similarity_boost: 0.80, style: 0.32 } },
  maya:  { id: "tQ4MEZFJOzsahSEEZtHK", name: "Maya",  settings: { stability: 0.45, similarity_boost: 0.82, style: 0.35 } },
  james: { id: "AeRdCCKzvd23BpJoofzx", name: "James", settings: { stability: 0.55, similarity_boost: 0.78, style: 0.18 } },
};

const PICKS = [
  {
    slug: "01-last-one",
    title: "The Last One in the Building",
    voice: VOICE.clara,
    text:
`She had stayed late on purpose. She told herself it was the quarterly close, but the quarterly close had finished an hour ago and she was still at her desk because she had heard him say, that morning, that he might come back to pick something up.

The lift chimed at the end of the corridor. She did not look up.

He stopped in her doorway.

"You're still here."

"Just finishing."

"You finished an hour ago. I checked the system."

She lifted her eyes from the screen.

He had loosened his tie at some point. The top button of his shirt was open. He held a coat over one arm, the way men do when they have not yet decided whether they are leaving or staying.

"So why are you still at your desk," he said.

"You know why."

She had said it before she could stop herself. She felt the heat rise in her throat, in her cheeks. She did not look away.

He set the coat down on the chair across from her.

He walked across the office to her desk. Slowly. Not a man rushing toward something — a man closing the distance he had been keeping for two years.

She stood up.

She took his hands — both of them — and placed them at her waist. Felt him go completely still. Felt the change in his breathing.

"Two years," she said.

Then she tilted her face up and kissed him.

The sound he made against her mouth was not patient. His hands gripped her waist and pulled her in and kissed her back with everything two years of not doing this had built — her fingers in his hair, the edge of the desk pressing into the backs of her thighs. She felt how much he wanted her and it sent heat through her in a wave she did not try to manage.

"I should have done this months ago," he said against her mouth.

"Longer than that."

He pulled back just far enough to look at her the way she had wanted him to look at her for two years. His hands found the zip at the back of her dress.

"Tell me to stop."

She reached back and found his hands. Guided them.

"Don't."`,
  },
  {
    slug: "02-adjoining-suites",
    title: "The Adjoining Suites",
    voice: VOICE.clara,
    text:
`The awards dinner had ended at midnight. She had won. The two of them had been her business partners for six years, the three of them at the same table for every dinner that had ever mattered, and tonight on the walk back through the marble lobby of the hotel, something had changed in the air between them, and she had felt it on her skin.

They had taken adjoining suites because they always did. There was a door between them. There had always been a door between them.

She kicked her heels off in her room. She could hear them next door — the low murmur of two men talking, the clink of a bottle, a laugh that was lower than the laugh she usually heard from either of them.

She went to the mirror and unpinned her hair. Her dress was still on. Her lipstick was still on. She looked at herself for a long moment.

She knocked on the connecting door.

It opened immediately. They had been standing on the other side of it.

"We were going to come and ask if you wanted a nightcap," one of them said.

"I know."

"You don't drink whisky."

"I do tonight."

The other one — the quieter one — set a glass down on the dresser without taking his eyes off her.

"You should know," he said, "what we were talking about. Before you knocked."

"I know what you were talking about."

A pause.

"And?"

She stepped through the doorway. She walked between them. She turned, slowly, so she could see them both. The door behind her was still open. The door behind them was not.

"Close it," she said.

One of them crossed to the door. The click of the latch was the loudest thing in the room.

The quieter one came to her first. He stopped in front of her and put one hand at the side of her face.

"You're sure," he said.

"Ask me again and I'll change my mind."

She looked at him. Then past him, at the other one.

"You," she said. "First."

To the one still watching: "Not yet."

He kissed her — slowly, carefully, the way a man kisses someone he has been wanting to kiss for six years. Behind her, the other one held himself absolutely still on her instruction alone. The specific charge of that — two men, both wanting her, one held back by a single word — moved through her like something low and deliberate.

When she was ready she lifted her chin from the kiss and looked over her shoulder.

The look was the instruction.

He came forward. His hands at her hair, her jaw. She heard the first one's breath change behind her.

Her gown had a zip at the side. She reached back, found a hand, and guided it there herself.`,
  },
  {
    slug: "03-spa-at-six",
    title: "The Spa at Six",
    voice: VOICE.clara,
    text:
`She had been booking the same masseuse for a year. Always the last appointment. Always the same room — the one with the candle that smelled of orange and something darker she could never name.

Tonight she was on the table face-down. The room was warm. The hands on her shoulders were the hands she had been thinking about, increasingly often, in the week before each appointment.

"You're tense," the woman said quietly.

"I know."

"More than usual."

She didn't answer. The hands worked down her spine, slowly, professionally — the same hands that had touched her for an hour at a time, every two weeks, for a year. Tonight they felt different. Tonight she felt them.

"You can turn over if you want."

She turned over.

She was supposed to keep her eyes closed. She didn't. The woman was standing at the head of the table, hands resting on the towel, looking down at her with an expression she had never let her see before.

"You always book the last slot," the woman said.

"Yes."

"Why."

"You know why."

The candle moved its light along the ceiling. The hands lifted from the towel and rested, very lightly, against her collarbones — flat, warm, asking.

"Tell me to stop," the woman said.

"No."

"Tell me what you want."

She opened her mouth. Closed it. Opened it again. The towel was very thin. The room was very quiet. The hands had not moved a centimetre, but she could feel them everywhere.

"Lock the door," she said.

The woman did not move yet.

"Say it again."

"Lock the door."

The woman walked, slowly, around the table. She did not look away.

The lock turned.

She came back to the head of the table.

The woman on the table reached up.

She took the masseuse's hands — both of them — and pulled her down. The woman came without resistance, her breath catching, and when she was close enough the woman on the table took her face in both hands and kissed her first.

Not waiting. Not receiving. Deciding.

The masseuse's mouth opened under hers. A year of last appointments folding into one moment they had both been careful not to name.

"You should have said something," the masseuse said against her mouth.

"So should you."

A low sound between them. Then the woman's hands moving with the knowledge of a year of appointments turned toward something entirely else. Her mouth at her collarbone. Her throat. Moving lower.

She wrapped one hand in the woman's hair and told her exactly what she wanted next.`,
  },
  {
    slug: "04-driver",
    title: "The Driver",
    voice: VOICE.kayla,
    text:
`He had driven her for three years. He opened the car door. He waited at events. He never spoke unless she spoke first. She had never, not once, said his first name out loud.

Tonight she had drunk too much champagne at a gallery opening, and he had carried her bag into the lobby of her building, and now they were standing at the lift, and she could not, suddenly, remember why she had ever bothered to be careful around him.

"Come up," she said.

"Ma'am."

"Don't."

"Sorry."

"I mean don't call me that. Not tonight."

He looked at her properly for the first time in three years. He looked at her the way she had always known he wanted to look at her, the way he had been holding himself back from looking at her every Tuesday and Friday at the school run and every Saturday night at the restaurant.

"Come up," she said again. "Just to make sure I get in."

"You'll get in."

"Then come up to make sure I don't open the door for anyone else."

The lift arrived. He held it. She walked in. He hesitated for half a second on the threshold, and then, slowly, followed her.

In her hallway she set her bag down. She took off one earring. She put it on the small table by the door. She turned to him.

"Marcus," she said.

His name. The first time.

He closed his eyes for a second. When he opened them, he was a different man — not her driver any more, not exactly anything any more.

"Say it again," he said.

"Marcus."

He was already crossing the hallway when she reached for the second earring.

He stopped a step short of her.

She turned to face him. She did not step back. She looked at him the way she had been looking at him, she understood now, for three years — and then she stepped forward, closed the last of the distance herself, and put both her hands against his chest.

He went still.

"Tell me what you've been thinking about," she said. "All of it."

He told her. Against her ear, his voice different from anything she had ever heard from him — not her driver's voice at all. Specific. Low. She felt heat move through her from her chest down.

"Show me," she said.

He kissed her. Not tentative — three years of not doing this in a single motion — and when he pressed her back against the wall of her own hallway she made a sound she hadn't planned to make.

His hands moved into her hair. She grabbed the front of his shirt. His lips at her jaw. Her throat.

"Show me," she said again.

He found the zip at the side of her dress — certain, unhurried, the hands of a man who had been told yes — and she felt the cool air and then the warmth of his palms and stopped thinking about anything except this.`,
  },
  {
    slug: "05-cabin",
    title: "The Cabin",
    voice: VOICE.kayla,
    text:
`The snow had started at four. By eight, it was clear no one was driving anywhere. The cabin had one bedroom, and a sofa long enough for one man, and three of them — her, and the two men she had known since university, the two men who had, separately, in the years since, both told her things they shouldn't have told her.

They had been drinking the wine the cabin owner had left as a welcome. The fire was high. She was warm in a way that had nothing to do with the fire.

"Right," one of them said finally. "The bedroom is yours. We'll work it out down here."

"Will you."

It came out lower than she had meant it to. Both of them looked at her at the same time.

The other one — the quieter one, the one who had once told her, drunk at a wedding, that he had loved her since they were twenty-two — set his glass down on the table.

"Don't," he said.

"Don't what."

"Don't say a thing you can't take back."

She stood up. She took off the cardigan she had been wearing over her dress. She folded it, slowly, and put it on the arm of the chair. Both of them watched her.

"I've been thinking about this," she said, "for ten years."

"Both of us?"

"Both of you."

The fire cracked. The first one — the louder one — stood up too. The quieter one didn't, yet.

"This isn't a joke," he said.

"No."

"You'd have to mean it."

"I mean it."

She walked into the middle of the room. She turned so she could see them both.

Neither of them moved.

She looked at the louder one. Then at the quieter one.

"Tell me," she said. "Both of you. What you want to do tonight. Out loud."

A silence.

The louder one told her first — directly, specifically, without apology. Her breath shortened.

The quieter one told her differently — slower, more considered, and somehow more complete. She felt heat move through her before he had finished the sentence.

She held out a hand to each of them.

Both took it.

The louder one pulled her toward him and kissed her — certain, one hand at the back of her head. Behind her the quieter one stepped close, his chest warm against her back, his hands at her waist, holding himself to just that while he waited.

She was between them. The reality of it made her dizzy.

"Ten years," she said, when the first one pulled back.

"Don't think," said the quieter one at her ear. His hands beginning to move. "Just—"

She turned and kissed him instead. He kissed her exactly as he had described. Behind her, the first one's hands slid lower.

"Both of you," she said against his mouth. "Tonight. All of it."

They didn't answer. They didn't need to.`,
  },
  {
    slug: "06-supervisor",
    title: "The Supervisor's Office",
    voice: VOICE.kayla,
    text:
`Her viva had ended three hours ago. She had passed. There had been champagne in the common room, and her parents had called, and she had, somehow, drifted back along the empty corridor to her supervisor's office because her supervisor had said, come and see me before you leave, we should toast properly.

The door was open. The lamp was on. Her supervisor was at her desk, no longer in the academic robe — just a black silk shirt, a glass of wine, and the half-smile she had been giving her at supervisions for three years.

"Doctor," she said.

"Don't."

"It's strange to hear it."

"Get used to it. Sit."

She sat. There was a glass already poured for her. The office was warm and smelled of old paper and the faint perfume her supervisor had always worn that, for three years, she had pretended not to notice.

"I have something to say," her supervisor said, "and I have been waiting to say it. I waited because I was your supervisor, and I will not be accused of saying it before I had the right to."

"Say it."

"You have known what I am about to say for at least a year."

"Yes."

"And."

"I waited for the same reason."

There was a long silence. Her supervisor stood up, walked around the desk, and stopped in front of her chair. She set her glass down on the desk behind her.

"I am no longer your supervisor," she said.

"No."

"Stand up."

She stood up. Her supervisor walked past her — past her, not toward her — to the door. She closed it. She turned the key.

She turned around.

She did not move from the door.

"Come here," she said.

She crossed the room.

Her supervisor took her face in both hands — this woman who had kept her at exactly the right distance for three years, always measured, always right on the edge — and kissed her slowly. Like she had been thinking about this since the second chapter.

"Since your second chapter," her supervisor said against her mouth.

"Your fourth session." She reached for her. "The Woolf one."

Her supervisor pulled back one inch.

"Be still."

She went still. Hands dropped. Her supervisor looked at her — the specific look of someone deciding what to do with something they have been waiting for — and then returned to her mouth with considerably less patience than before.

Her hands moved into her hair. Then less talking.

Her supervisor's hands found the hem of her dress and she remembered she was supposed to be still and it cost her something real to stay that way.

"You're certain," her supervisor said.

"I wrote three thousand words about wanting this."

"Then we have a great deal of ground to cover."

Her mouth on her throat. She stopped being able to be still at all.`,
  },
  {
    slug: "07-bodyguard",
    title: "The Bodyguard",
    voice: VOICE.maya,
    text:
`He had been hired six weeks ago. He stood in the corner of every room she was in. He drove behind her car. He was at the end of every corridor. He had, in six weeks, said perhaps forty words to her in total.

Tonight she had asked him to come into the suite with her, after the gala, instead of standing in the corridor. She had said it was a security check. They both knew it wasn't.

The suite was lit by one lamp. He stood, exactly as he stood in every other room, three metres from her, watching the door, hands clasped in front of him.

"You can stand somewhere else," she said.

"This is where I stand."

"Not tonight."

He looked at her. The professional blankness he had worn for six weeks was still there, but underneath it tonight she could see the thing she had been looking for, all six weeks, in glimpses.

"I have a question," she said.

"Ma'am."

"If I told you to do something. Something that wasn't your job."

"That would depend."

"On what."

"On what it was."

She walked across the room and stopped in front of him. She had never been this close to him. He smelled of nothing — clean, neutral, deliberate.

"If I told you," she said quietly, "to put your hands on my hips."

He didn't breathe.

"Would you."

A pause. A small, rough pause.

"Yes."

"And if I told you not to move."

"Yes."

"And if I told you what to do next."

His jaw worked.

"Yes."

She told him to.

His hands found her hips — large, careful, the restrained precision of a man trained to stand in corners. His palms were warm through the fabric of her dress and her breath went shallow.

"Don't move," she said.

"No."

"Now tell me what you want to do."

A pause. Then he told her. Quietly. Specifically. She felt heat move through her from her chest down.

"And if I said yes to that?"

"Then I'd do exactly what I said."

She reached up and took his face in her hands. Felt his whole body tighten under the restraint she had asked for.

"Yes," she said.

The six weeks of standing in corners broke. He pulled her flush against him and when he kissed her it was exactly what he had described — she felt it from her sternum down. She let it happen and then she stepped back one inch.

He stopped immediately. Hands still on her.

"Again," she said. "But slower."

A pause. A look that bore no resemblance to anything professional.

Then he kissed her again — slowly, precisely, nothing held back and nothing rushed — with the absolute deliberateness of a man who had been given an instruction and intended to follow it to the letter.

She had six weeks of corners to work through. She intended to take her time.`,
  },
  {
    slug: "08-proposition",
    title: "The Proposition",
    voice: VOICE.maya,
    text:
`The members' club was the kind that didn't have a sign on the door. She had come alone. She had been at the bar for an hour, deliberately not looking at the man at the corner table who had been, deliberately, looking at her.

The waiter brought a drink she hadn't ordered. The same as the one she was already drinking.

"From the gentleman."

"Tell the gentleman thank you."

"He asked if he could come over."

She didn't answer for a moment. Then she nodded.

He was older than she had thought. Better dressed. He didn't sit down — he stood beside her stool, close but not touching, and waited until she turned to face him.

"I'm going to be very direct with you," he said. "Is that all right."

"Yes."

"I have a room upstairs. Suite four. I have been watching you for an hour, and I would like you to come up. I will not touch you in the lift. I will not touch you in the corridor. If at any point between this stool and that door you change your mind, you walk away, and I will not follow. I will not ask twice. I am asking once."

She looked at him. He looked back. He did not move closer. He did not press. He had said what he was going to say, and now he was waiting for an answer, and his face had the steady, undefended look of a man who could take either one.

"What's the catch," she said.

"There's no catch. I think you're the most interesting woman in this room."

She picked up the new drink. She drank half of it. She set it down.

She stood up.

She did not say yes. She did not need to.

He kept his word — did not touch her in the lift, did not press in the corridor. She found the restraint more effective than persuasion would have been.

In the suite she stopped two steps inside the door. He turned.

She said: "Sit down."

He sat.

She moved around the room once. Took off the earring she had been wearing. Set it on the desk. Stood at the window for a moment. She was thinking. She was also entirely aware of what it felt like to be watched by a man sitting very still and waiting because she had asked him to.

When she was ready she crossed to him.

She kissed him first. His hands stayed where they were until she brought them to her hips herself. Then they moved, certain and unhurried, and he kissed her back like a man who understood he had been given her complete attention and intended to deserve every second of it.

She pulled back. Looked at him. He did not move.

She reached for his tie.

"Show me," she said. "Everything."`,
  },
  {
    slug: "09-neighbour",
    title: "The Neighbour",
    voice: VOICE.james,
    text:
`She had moved in across the hall three weeks ago. He had seen her exactly four times — once in the lift, once on the stairs, twice in the lobby — and each time he had thought, don't, and each time, walking back into his own flat, he had thought it again.

The knock came at half past ten.

He opened the door. She was holding an empty wine glass and a small, embarrassed smile.

"This is going to sound — I genuinely have run out of corkscrews. Do you have one I can borrow."

"I have one."

"Brilliant. Sorry. I'll bring it back."

He went to the kitchen. He took longer than he needed to find it. When he came back to the door she was still there, leaning lightly against the frame, not — he noticed, with a precision that troubled him — wearing shoes.

He held out the corkscrew. She did not take it.

"Are you on your own tonight," she said.

"My daughter is at her mother's."

"Oh."

A pause. He should have closed the door. He did not.

"I have wine," she said, "and no one to drink it with, and I have been hearing you walk around in there alone for three weeks."

"You've been listening."

"Yes."

He looked at her properly. He let himself, for the first time, look at her properly. She let him.

"If I come over," he said, "I should be honest with you about what I have been thinking for three weeks."

"That would save us both some time."

He stepped out into the hallway. He pulled his door closed behind him.

She turned and walked the four steps to her own door. She left it open behind her.

He stood on the threshold.

He stepped through.

She was in the kitchen, her back to him, pouring the wine. The line of her shoulders. The way she wasn't quite steady with the bottle. She knew he was there. She was letting him come to her.

He came to her.

She turned when he was close enough. He took the glass out of her hand, set it on the counter, and took her face in both hands and finally looked at her the way he had been refusing to look at her for three weeks.

The kiss was slow at first — learning her — and then less slow. Her hands at his chest, his shirt buttons. He walked her backwards until she was against the counter.

He lifted her onto it. She wrapped her legs around him and then — immediately, deliberately — put both hands flat on his chest and held him there.

Not stopping. Slowing.

He went still.

"Look at me," she said.

He looked at her. Three weeks of choosing not to, resolved in three seconds.

"Now," she said, and pulled him back in.

"Three weeks," he said against her mouth.

"Don't stop."`,
  },
  {
    slug: "10-night-manager",
    title: "The Night Manager",
    voice: VOICE.james,
    text:
`He was the night manager. He had been the night manager for nine years. He noticed everything because that was the job — who came in, who left, who had drunk too much, who needed help, who needed a taxi, who needed to be left alone.

She had checked in three days ago. Suite four-twelve. She had been to a different event every night, and come back at a different hour each time, and tonight she came back at midnight, alone, in a midnight-blue dress that was — he could tell, because he noticed everything — too good for the event she had been to.

She came to the desk. She had been crying, or about to cry, he wasn't sure which.

"I think I locked my key in the room."

"I'll walk you up."

"You don't have to."

"It's policy."

It wasn't policy. He took the master, and they walked to the lift in a silence that he found, by the third floor, that he did not want to break.

At her door he produced the key. He opened it. He stepped back.

She did not go in.

She turned around in the doorway. She looked at him for a long second. He had seen this look before, in nine years of nights — the look of a woman who was about to ask for something a stranger could give her that no one she knew could.

"Don't go yet," she said.

"Madam."

"Please."

"You've been drinking."

"Two glasses. Three hours ago."

He looked at her. He looked, for the first time in nine years, properly at a guest. She let him.

"I'll come in for a moment," he said. "Until you're inside."

She stepped back into her room.

She left the door open behind her.

He came in. He let the door stay open. He told himself it was policy. He followed her into the room.

She turned when he was close. He touched her face — nine years of professional distance ending in one movement, his thumb along her jaw, tilting her face up. Her eyes closed.

"I don't do this," he said.

"I know."

"You should know that."

"I know." She opened her eyes. "I don't care."

He kissed her.

Nine years dissolved. Her hands gripped his lapels and she kissed him back — not desperate, deliberate — like a woman who knew exactly what she was choosing.

When he walked her backwards she stopped him two steps from the bed and turned. She crossed to the door — still open, from when he had followed her in — and closed it herself.

She turned the latch.

She turned around.

"Now," she said.

He came to her.`,
  },
];

async function generateOne(pick) {
  const outputPath = path.join(OUTPUT_DIR, `${pick.slug}.mp3`);
  if (!FORCE && fs.existsSync(outputPath)) {
    console.log(`  - skip ${pick.slug} (${pick.voice.name}) — already exists`);
    return;
  }
  console.log(`  - gen  ${pick.slug} (${pick.voice.name}) "${pick.title}"`);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${pick.voice.id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: pick.text,
        model_id: "eleven_multilingual_v2",
        voice_settings: pick.voice.settings,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `ElevenLabs API error (${response.status}) for ${pick.slug}: ${error}`,
    );
  }

  const buffer = await response.arrayBuffer();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(buffer));
  console.log(`    -> ${outputPath} (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const filtered = ONLY.length
    ? PICKS.filter((p) => ONLY.some((o) => p.slug.startsWith(o)))
    : PICKS;
  console.log(`Generating ${filtered.length} editor's pick(s)...`);
  for (const pick of filtered) {
    await generateOne(pick);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
