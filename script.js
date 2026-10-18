/* ============================================================
   script.js — The Fairy Tale Garden
   Sections:
     1. Setup
     2. Star hover bounce (GSAP)
     3. Idle float (GSAP)
     4. Mobile menu
     5. Music engine (Web Audio, no mp3 needed)
     6. Music button (cartoon dance + floating notes)
     7. Start music on the first tap
     8. Hero intro (words bounce in, fairy appears, tagline types)
     9. Magic particles (sparkles, fog, bursts)
    10. Magic travel (orb follows a curved path as you scroll)
    11. Pumpkin transformation
    12. Fairy spell (3D spin + flip, then the wand casts)
    13. Hero background drift + sparkly stars
    14. Stories (hanging lights + glowing cards)
    15. Story Club (balloon + clouds)
    16. Footer (flowing water + boats)
    17. Page start
   ============================================================ */


/* ---------- 1. SETUP ---------- */
const starLinks = document.querySelectorAll('.star-link'); // every star link in the navbar
const starItems = document.querySelectorAll('.star-item'); // the <li> that wraps each star
const navMenu = document.getElementById('nav'); // the nav (it collapses on phones)
const menuToggle = document.getElementById('menuToggle'); // the hamburger button (phones only)
const musicBtn = document.getElementById('musicBtn'); // the cartoon music button
const musicChar = musicBtn.querySelector('.music-char'); // the SVG character inside the button
const notesBox = document.getElementById('musicNotes'); // empty box where floating notes appear
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; // true if the visitor asked for less animation
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin); // switch on GSAP's scroll plugin and curved-path plugin


/* ---------- 2. STAR HOVER BOUNCE ---------- */
starLinks.forEach((link, index) => { // go through the 4 stars one by one (index = 0, 1, 2, 3)
  const tilt = index % 2 === 0 ? 10 : -10; // alternate the lean direction so the stars don't all tilt the same way

  const bounceIn = () => { // runs when a mouse, finger or keyboard reaches a star
    gsap.killTweensOf(link); // stop any bounce that is still running on this star
    if (reduceMotion) { // visitor wants less motion...
      gsap.to(link, { scale: 1.1, duration: 0.15 }); // ...so just grow a little
      return; // and stop here
    }
    gsap.timeline() // start a little sequence of two moves
      .to(link, { scaleX: 1.3, scaleY: 0.82, duration: 0.1, ease: 'power2.out' }) // move 1: squash wide and flat
      .to(link, { scale: 1.2, rotation: tilt, duration: 0.9, ease: 'elastic.out(1, 0.3)' }); // move 2: spring up and wobble
  };

  const settle = () => { // runs when the pointer leaves or focus moves away
    gsap.killTweensOf(link); // stop the bounce
    gsap.to(link, { scale: 1, rotation: 0, duration: reduceMotion ? 0.15 : 0.7, ease: 'elastic.out(1, 0.5)' }); // spring back to normal size
  };

  link.addEventListener('pointerenter', bounceIn); // mouse or finger arrives -> bounce
  link.addEventListener('pointerleave', settle); // mouse or finger leaves -> settle
  link.addEventListener('focus', bounceIn); // keyboard users get the bounce too
  link.addEventListener('blur', settle); // and the settle
});


/* ---------- 3. IDLE FLOAT ---------- */
if (!reduceMotion) { // only float if the visitor allows animation
  starItems.forEach((item, index) => { // each star <li> floats on its own rhythm
    gsap.to(item, { // animate the <li> (the bounce above animates the link inside it, so they don't clash)
      y: -6, // drift up 6px
      duration: 1.6 + index * 0.25, // every star floats at a slightly different speed
      ease: 'sine.inOut', // smooth start and end
      yoyo: true, // after going up, come back down
      repeat: -1, // forever
      delay: index * 0.3 // stagger the starts so they don't move in sync
    });
  });
}


/* ---------- 4. MOBILE MENU ---------- */
menuToggle.addEventListener('click', () => { // when the hamburger is tapped
  const open = navMenu.classList.toggle('is-open'); // add/remove the open class; gives back true if it is now open
  menuToggle.setAttribute('aria-expanded', open); // tell screen readers whether the menu is open
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); // keep the button name correct
  if (open && !reduceMotion) { // when opening (and motion is allowed)...
    gsap.from(starItems, { scale: 0, duration: 0.6, stagger: 0.08, ease: 'back.out(2)' }); // ...stars pop in one after another
  }
});

navMenu.addEventListener('click', (event) => { // when anything inside the menu is clicked
  if (event.target.closest('a')) { // if it was a star link
    navMenu.classList.remove('is-open'); // close the menu
    menuToggle.setAttribute('aria-expanded', 'false'); // update screen readers
    menuToggle.setAttribute('aria-label', 'Open menu'); // update the button name
  }
});


/* ---------- 5. MUSIC ENGINE ---------- */
// An original music-box lullaby made from code, so there is no audio file to download or license.

const BPM = 76; // speed: beats per minute (lower = calmer)
const STEP = 60 / BPM / 2; // length of one eighth note in seconds

// Melody as [MIDI note number, length in eighth notes]. 8 bars x 8 eighths = 64 steps.
const MELODY = [
  [[76, 1], [79, 1], [84, 2], [81, 1], [79, 1], [76, 2]], // bar 1
  [[76, 1], [81, 1], [79, 2], [76, 1], [74, 1], [72, 2]], // bar 2
  [[69, 1], [72, 1], [74, 2], [72, 1], [69, 1], [67, 2]], // bar 3
  [[67, 1], [74, 1], [76, 2], [74, 1], [72, 1], [74, 2]], // bar 4
  [[79, 1], [76, 1], [79, 1], [84, 1], [81, 2], [79, 2]], // bar 5
  [[81, 1], [79, 1], [76, 1], [79, 1], [81, 2], [84, 2]], // bar 6
  [[84, 1], [81, 1], [79, 1], [76, 1], [74, 2], [72, 2]], // bar 7
  [[74, 1], [76, 1], [74, 1], [67, 1], [72, 4]] // bar 8 (ends softly, then the loop restarts)
].flat(); // join the 8 bars into one long list

// Chords as three low notes each: C, A minor, F, G
const C = [48, 55, 64]; // C chord notes
const AM = [45, 52, 60]; // A minor chord notes
const F = [41, 48, 57]; // F chord notes
const G = [43, 50, 59]; // G chord notes
const CHORDS = [C, C, AM, AM, F, F, G, G, C, C, AM, AM, F, F, G, C]; // one chord per half-bar (4 eighths each)

let audioCtx = null; // the browser's audio system (created on first play)
let masterGain = null; // volume knob for the current play session
let loopTimer = null; // timer that schedules the next repeat of the tune
let isPlaying = false; // true while music is on

function midiToFreq(midi) { // turns a MIDI note number into a frequency in Hz
  return 440 * Math.pow(2, (midi - 69) / 12); // note 69 is A = 440 Hz; every 12 notes doubles the pitch
}

function playNote(midi, when, length, volume) { // plays one soft bell-like note
  const freq = midiToFreq(midi); // find the pitch
  [[1, volume], [2, volume * 0.25]].forEach(([multiple, level]) => { // two layers: the note itself and a quiet higher "sparkle"
    const osc = audioCtx.createOscillator(); // a tone generator
    const env = audioCtx.createGain(); // a volume shaper for this one note
    osc.type = 'sine'; // smooth, gentle wave shape
    osc.frequency.value = freq * multiple; // 1x = the note, 2x = one octave higher
    env.gain.setValueAtTime(0.0001, when); // start silent
    env.gain.linearRampToValueAtTime(level, when + 0.01); // quick "ting" up to full volume
    env.gain.exponentialRampToValueAtTime(0.0001, when + length / multiple); // then fade away like a music-box tine
    osc.connect(env); // tone goes into the volume shaper
    env.connect(masterGain); // shaper goes into the master volume
    osc.start(when); // begin at the scheduled time
    osc.stop(when + length + 0.05); // stop just after it has faded out
  });
}

function scheduleLoop(startTime) { // schedules the whole 64-step tune starting at startTime
  let step = 0; // how many eighth notes in we are
  MELODY.forEach(([midi, steps]) => { // for each melody note...
    playNote(midi, startTime + step * STEP, steps * STEP * 1.6, 0.22); // ...play it at its time (rings a bit longer than its length)
    step += steps; // move forward by that note's length
  });
  CHORDS.forEach((chord, i) => { // for each half-bar chord...
    [0, 1, 2, 1].forEach((noteIndex, k) => { // ...play a gentle low-mid-high-mid pattern
      playNote(chord[noteIndex], startTime + (i * 4 + k) * STEP, STEP * 2.4, 0.12); // quieter than the melody
    });
  });
  return startTime + 64 * STEP; // tell the caller when this repeat ends
}

function startMusic() { // turns the music on
  if (!audioCtx) { // first time only
    audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // create the audio system
  }
  audioCtx.resume(); // browsers start it paused until a tap; this wakes it
  masterGain = audioCtx.createGain(); // a fresh volume knob for this session
  masterGain.gain.setValueAtTime(0.0001, audioCtx.currentTime); // start silent...
  masterGain.gain.exponentialRampToValueAtTime(0.5, audioCtx.currentTime + 0.8); // ...fade in over 0.8 seconds
  masterGain.connect(audioCtx.destination); // send the sound to the speakers

  const echo = audioCtx.createDelay(); // a delay line for a soft dreamy echo
  echo.delayTime.value = 0.3; // echo repeats after 0.3 seconds
  const echoGain = audioCtx.createGain(); // controls how loud the echo is
  echoGain.gain.value = 0.3; // 30% of the original volume
  masterGain.connect(echo); // music also goes into the echo
  echo.connect(echoGain); // echo output goes through its volume
  echoGain.connect(echo); // and feeds back into itself so it repeats a few times
  echoGain.connect(audioCtx.destination); // and also reaches the speakers

  isPlaying = true; // remember that music is on
  let nextStart = audioCtx.currentTime + 0.1; // start the tune a tiny moment from now
  const queueNext = () => { // schedules one repeat, then arranges the next
    nextStart = scheduleLoop(nextStart); // schedule this repeat; get back when it ends
    loopTimer = setTimeout(queueNext, (nextStart - audioCtx.currentTime - 1) * 1000); // come back 1 second before it ends to schedule the next repeat
  };
  queueNext(); // kick off the first repeat
}

function stopMusic() { // turns the music off
  isPlaying = false; // remember that music is off
  clearTimeout(loopTimer); // stop scheduling new repeats
  const fading = masterGain; // keep a handle on this session's volume knob
  fading.gain.cancelScheduledValues(audioCtx.currentTime); // cancel the fade-in if it was still going
  fading.gain.setValueAtTime(Math.max(fading.gain.value, 0.0001), audioCtx.currentTime); // hold the current volume
  fading.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4); // fade out over 0.4 seconds
  setTimeout(() => fading.disconnect(), 600); // after the fade, cut the connection so nothing is left playing
}


/* ---------- 6. MUSIC BUTTON ---------- */
const NOTE_SYMBOLS = ['♪', '♫', '♩', '♬']; // little music symbols that float out of the button
const NOTE_COLOURS = ['#ff6fb5', '#ff9e5e', '#ffe066', '#6dffb3', '#5ee7ff', '#7aa2ff', '#b388ff']; // your glow colours
let noteTimer = null; // timer that spawns a note every so often

const dance = gsap.timeline({ paused: true, repeat: -1, yoyo: true }) // a looping back-and-forth animation, paused until music plays
  .fromTo(musicChar, { rotation: -9, y: 0 }, { rotation: 9, y: -3, duration: 0.45, ease: 'sine.inOut', transformOrigin: '50% 80%' }); // sway left to right and bob up

function spawnNote() { // creates one floating note
  const note = document.createElement('span'); // make a new <span>
  const colour = gsap.utils.random(NOTE_COLOURS); // pick a random glow colour
  note.className = 'float-note'; // style it with the CSS class
  note.textContent = gsap.utils.random(NOTE_SYMBOLS); // pick a random music symbol
  note.style.color = colour; // colour the symbol
  note.style.textShadow = `0 0 10px ${colour}`; // give it the same colour glow
  notesBox.appendChild(note); // put it on the page
  const startX = gsap.utils.random(-25, 25); // random starting left/right spot
  gsap.fromTo(note,
    { x: startX, y: 0, opacity: 1, scale: 0.6 }, // start small and fully visible under the button
    {
      x: startX + gsap.utils.random(-40, 40), // drift sideways
      y: gsap.utils.random(70, 110), // float down into the page
      opacity: 0, // fade out
      scale: 1.2, // grow a little
      rotation: gsap.utils.random(-30, 30), // twirl
      duration: 2.2, // takes 2.2 seconds
      ease: 'power1.out', // fast at first, slower at the end
      onComplete: () => note.remove() // delete the note when it is done
    }
  );
}

function setPlayingLook(on) { // switches the button between "awake" and "asleep"
  musicBtn.classList.toggle('is-playing', on); // CSS swaps the face when this class is present
  musicBtn.setAttribute('aria-label', on ? 'Mute background music' : 'Play background music'); // screen-reader name
  clearInterval(noteTimer); // always stop old note spawning first
  if (on && !reduceMotion) { // if playing and motion is allowed...
    dance.play(); // ...start the dance
    spawnNote(); // ...send out a note straight away
    noteTimer = setInterval(spawnNote, 650); // ...and another every 0.65 seconds
  } else { // otherwise (muted)...
    dance.pause(); // ...stop dancing
    gsap.to(musicChar, { rotation: 0, y: 0, duration: 0.4 }); // ...and settle upright
  }
}

function saveChoice(value) { // remembers the visitor's choice for next visit
  try { localStorage.setItem('gardenMusic', value); } catch (error) { /* storage blocked: ignore */ } // try/catch so the page never breaks
}

function toggleMusic() { // runs when the button is pressed
  if (isPlaying) { // music is on -> turn it off
    stopMusic(); // fade the sound out
    setPlayingLook(false); // button falls asleep
    saveChoice('muted'); // remember "muted"
  } else { // music is off -> turn it on
    startMusic(); // fade the sound in
    setPlayingLook(true); // button wakes up
    saveChoice('playing'); // remember "playing"
  }
}

musicBtn.addEventListener('click', () => { // when the button is clicked or tapped
  gsap.fromTo(musicBtn, { scale: 0.8 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }); // bouncy press effect
  toggleMusic(); // then switch the music
});


/* ---------- 7. START MUSIC ON THE FIRST TAP ---------- */
// Browsers block sound until the visitor interacts, so we wait for the first tap or click anywhere.
let savedChoice = null; // what the visitor chose last time
try { savedChoice = localStorage.getItem('gardenMusic'); } catch (error) { /* storage blocked: ignore */ } // read it safely

function firstTap(event) { // runs once, on the first pointer press
  document.removeEventListener('pointerdown', firstTap); // never run again
  if (musicBtn.contains(event.target)) return; // if they pressed the music button, let the button handle it
  if (savedChoice !== 'muted' && !isPlaying) { // if they did not mute it last time and it is not already on...
    startMusic(); // ...start the music
    setPlayingLook(true); // ...and wake the button up
  }
}

document.addEventListener('pointerdown', firstTap); // listen for the first press anywhere on the page


/* ---------- 8. HERO INTRO (words bounce in, fairy appears, tagline types) ---------- */
const heroWords = gsap.utils.toArray('.hero-title .word'); // the six heading words
const heroFairy = document.getElementById('heroFairy'); // wrapper around the fairy picture
const wandRays = document.querySelector('.wand-rays'); // the glowing star on the wand tip
const heroTagline = document.getElementById('heroTagline'); // the tagline <p>
const scrollHint = document.getElementById('scrollHint'); // little "follow the magic" tip shown after the spell
const taglineText = heroTagline.textContent.trim(); // remember the full sentence before we clear it
let introDone = false; // turns true once the whole intro has played

function bounceWordIn(word, startX) { // builds the animation for ONE word and returns it
  const tl = gsap.timeline(); // a small empty timeline for this word
  tl.set(word, { autoAlpha: 1, x: startX, y: 0, skewX: -8 }) // show the word far to the right, leaning back like it is speeding
    .to(word, { x: 0, duration: 1.0, ease: 'power3.out' }, 0) // slide left: fast at first, then brakes hard at its place
    .to(word, { keyframes: [ // three hops while it slides (each hop lower than the last)
      { y: -46, duration: 0.15, ease: 'power2.out' }, { y: 0, duration: 0.15, ease: 'power2.in' }, // hop 1: up, then down
      { y: -30, duration: 0.15, ease: 'power2.out' }, { y: 0, duration: 0.15, ease: 'power2.in' }, // hop 2
      { y: -16, duration: 0.15, ease: 'power2.out' }, { y: 0, duration: 0.15, ease: 'power2.in' } // hop 3
    ] }, 0) // the hops start at the same moment as the slide
    .to(word, { skewX: 14, duration: 0.12, ease: 'power2.out' }, 0.82) // the sudden brake: the word leans forward
    .to(word, { y: -58, scaleY: 1.12, duration: 0.2, ease: 'power2.out' }, 0.92) // one big final jump
    .to(word, { y: 0, scaleY: 1, duration: 0.22, ease: 'power2.in' }, 1.12) // fall back down
    .to(word, { scaleX: 1.2, scaleY: 0.8, duration: 0.08, ease: 'power1.out' }, 1.34) // squash flat when landing
    .to(word, { scaleX: 1, scaleY: 1, skewX: 0, duration: 0.7, ease: 'elastic.out(1, 0.35)' }, 1.42); // wobble back to normal and stay put
  return tl; // hand the finished animation back
}

function playHeroIntro() { // runs the whole hero animation once
  if (reduceMotion) { // visitor wants less motion...
    gsap.set(heroWords, { autoAlpha: 1 }); // ...so show all the words straight away
    gsap.set(heroFairy, { autoAlpha: 1 }); // ...and the fairy
    introDone = true; // mark the intro as finished
    return; // and skip the animation
  }
  gsap.set(heroWords, { autoAlpha: 0, transformOrigin: '50% 100%' }); // hide the words; they squash from their feet
  gsap.set(heroFairy, { autoAlpha: 0, scale: 0.5, y: 40 }); // hide the fairy and make her small
  heroTagline.setAttribute('aria-label', taglineText); // screen readers read the full sentence, not the typing
  heroTagline.textContent = ''; // empty the tagline so it can be typed
  heroTagline.classList.add('typing'); // show the blinking cursor

  const master = gsap.timeline({ delay: 0.4 }); // the main timeline that plays everything in order
  heroWords.forEach((word, i) => { // for each word...
    const startX = window.innerWidth - word.getBoundingClientRect().left + 80; // distance from its place to just past the right edge
    master.add(bounceWordIn(word, startX), i * 0.75); // ...start it 0.75 seconds after the previous word
  });

  master.call(() => { const p = docPoint(heroFairy); burstAt(p.x, p.y, 34); }, null, '>-0.2') // sparkle puff just before the fairy appears
    .to(heroFairy, { autoAlpha: 1, scale: 1, y: 0, duration: 1.1, ease: 'back.out(1.7)' }, '<') // fairy pops in at the puff
;

  const typer = { n: 0 }; // a counter we animate: how many letters are visible
  master.to(typer, { // type the tagline letter by letter
    n: taglineText.length, // count up to the full length
    duration: taglineText.length * 0.045, // 0.045 seconds per letter
    ease: 'none', // steady speed like real typing
    onUpdate: () => { heroTagline.textContent = taglineText.slice(0, Math.round(typer.n)); }, // show the first n letters
    onComplete: () => heroTagline.classList.remove('typing') // hide the cursor at the end
  }, '>-0.1')
    .add(fairySpell(), '>+0.4') // the fairy does her 3D spin + flip, returns, and casts the spell
    .call(() => { introDone = true; startFairyIdle(); }, null, '>'); // intro finished: she floats gently again
}


/* ---------- 9. MAGIC PARTICLES (sparkles, fog, bursts) ---------- */
const magicLayer = document.getElementById('magicLayer'); // overlay that covers the whole page
const magicOrb = document.getElementById('magicOrb'); // the glowing ball that travels down the page
const orbBody = magicOrb.querySelector('.orb-body'); // the visible part of the orb (we fade this)
const wandTip = document.getElementById('wandTip'); // the invisible point on the wand's star
const SPARK_COLOURS = ['#ffd23f', '#ffb300', '#ff6fb5', '#ff9e5e', '#6dffb3', '#5ee7ff', '#7aa2ff', '#b388ff']; // gold + rainbow
const FOG_COLOURS = ['255,111,181', '255,210,63', '109,255,179', '94,231,255', '179,136,255', '122,162,255']; // rainbow as r,g,b
const MAX_PARTICLES = 90; // safety limit so the page stays smooth
let liveParticles = 0; // how many particles exist right now

function docPoint(el) { // centre of an element in page coordinates
  const r = el.getBoundingClientRect(); // position relative to the screen
  return { x: r.left + r.width / 2 + window.scrollX, y: r.top + r.height / 2 + window.scrollY }; // add the scroll to get page coordinates
}

function makeSpark(isStar, colour, size) { // creates one spark element and puts it on the layer
  const el = document.createElement('span'); // a new empty <span>
  el.className = isStar ? 'spark spark-star' : 'spark spark-dot'; // star or round dot style
  el.style.color = colour; // its colour (the glow uses the same colour)
  if (isStar) { el.textContent = '✦'; el.style.fontSize = size + 'px'; } // stars are a text symbol sized by font size
  else { el.style.width = el.style.height = size * 0.5 + 'px'; } // dots are small circles
  magicLayer.appendChild(el); // put it on the page
  liveParticles++; // count it
  return el; // give it back so we can animate it
}

function removeSpark(el) { el.remove(); liveParticles--; } // delete a spark and stop counting it

function spawnSpark(x, y) { // one tiny star or dot drifting away from a point
  if (reduceMotion || liveParticles >= MAX_PARTICLES) return; // do nothing if motion is off or too many exist
  const el = makeSpark(Math.random() < 0.6, gsap.utils.random(SPARK_COLOURS), gsap.utils.random(9, 20)); // 60% stars, 40% dots
  gsap.fromTo(el,
    { x, y, scale: 0.3, opacity: 1, rotation: gsap.utils.random(-40, 40) }, // start small at the point
    { x: x + gsap.utils.random(-45, 45), y: y + gsap.utils.random(15, 85), scale: gsap.utils.random(0.8, 1.5), opacity: 0, rotation: gsap.utils.random(-160, 160), duration: gsap.utils.random(0.9, 1.7), ease: 'power1.out', onComplete: () => removeSpark(el) } // drift, grow, fade, then delete
  );
}

function spawnFog(x, y) { // one soft rainbow puff of fog
  if (reduceMotion || liveParticles >= MAX_PARTICLES) return; // same safety checks
  const el = document.createElement('span'); // a new <span> for the puff
  const size = gsap.utils.random(70, 130); // random puff size in pixels
  const rgb = gsap.utils.random(FOG_COLOURS); // random rainbow colour
  el.className = 'fog'; // style it with the CSS class
  el.style.width = el.style.height = size + 'px'; // make it a square box (the CSS makes it round)
  el.style.background = `radial-gradient(circle, rgba(${rgb},0.55) 0%, rgba(${rgb},0) 70%)`; // soft glow that fades to nothing
  magicLayer.appendChild(el); // put it on the page
  liveParticles++; // count it
  gsap.fromTo(el,
    { x: x - size / 2, y: y - size / 2, scale: 0.4, opacity: 0.9 }, // start small, centred on the point
    { x: x - size / 2 + gsap.utils.random(-30, 30), y: y - size / 2 + gsap.utils.random(10, 50), scale: 1.6, opacity: 0, duration: gsap.utils.random(1.4, 2.2), ease: 'sine.out', onComplete: () => removeSpark(el) } // spread out, drift down, fade
  );
}

function burstAt(x, y, count) { // a sparkle explosion at a point
  if (reduceMotion) return; // no explosion if motion is off
  for (let i = 0; i < count; i++) { // one pass per sparkle
    const el = makeSpark(i % 3 !== 0, gsap.utils.random(SPARK_COLOURS), gsap.utils.random(12, 26)); // mostly stars, some dots
    const angle = (i / count) * Math.PI * 2 + gsap.utils.random(-0.2, 0.2); // spread evenly around a circle
    const dist = gsap.utils.random(80, 240); // how far it flies
    gsap.fromTo(el,
      { x, y, scale: 0.4, opacity: 1 }, // start small at the centre
      { x: x + Math.cos(angle) * dist, y: y + Math.sin(angle) * dist, scale: gsap.utils.random(0.9, 1.8), opacity: 0, rotation: gsap.utils.random(-200, 200), duration: gsap.utils.random(0.8, 1.5), ease: 'power2.out', onComplete: () => removeSpark(el) } // fly outwards and fade
    );
  }
  const ring = document.createElement('span'); // a glowing ring that flashes outwards
  ring.className = 'flash-ring'; // style it with the CSS class
  magicLayer.appendChild(ring); // put it on the page
  gsap.fromTo(ring, { x: x - 20, y: y - 20, scale: 0.2, opacity: 1 }, { scale: 9, opacity: 0, duration: 0.9, ease: 'power2.out', onComplete: () => ring.remove() }); // grow big and fade
  for (let i = 0; i < 5; i++) spawnFog(x + gsap.utils.random(-40, 40), y + gsap.utils.random(-40, 40)); // a few puffs of rainbow fog
}

gsap.to('.orb-halo', { rotation: 360, duration: 5, ease: 'none', repeat: -1 }); // the rainbow halo around the orb spins forever
gsap.to('.orb-core', { scale: 1.25, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }); // the bright core pulses

let sparkTimer = 0; // milliseconds since the last spark
let fogTimer = 0; // milliseconds since the last fog puff
let lastScrollY = window.scrollY; // where the page was scrolled on the previous frame

gsap.ticker.add((time, deltaTime) => { // runs on every animation frame
  if (reduceMotion || !introDone) return; // nothing to do until the intro is finished
  const speed = Math.abs(window.scrollY - lastScrollY); // how many pixels were scrolled since the last frame
  lastScrollY = window.scrollY; // remember for next frame
  const atWand = window.scrollY < 8; // true while the page is still at the top
  const orbShown = gsap.getProperty(orbBody, 'opacity') > 0.2; // true while the orb is visible
  if (!atWand && !orbShown) return; // far from the top and no orb: nothing to emit
  const from = atWand ? docPoint(wandTip) : { x: gsap.getProperty(magicOrb, 'x'), y: gsap.getProperty(magicOrb, 'y') }; // emit from the wand at the top, from the orb otherwise
  sparkTimer += deltaTime; // add the time since the last frame
  if (sparkTimer > Math.max(25, 90 - speed * 4)) { // faster scrolling makes sparks come more often
    sparkTimer = 0; // restart the counter
    spawnSpark(from.x, from.y); // release one spark
  }
  fogTimer += deltaTime; // same idea for fog
  if (!atWand && fogTimer > 140) { // fog only follows the travelling orb
    fogTimer = 0; // restart the counter
    spawnFog(from.x, from.y); // release one puff of fog
  }
});


/* ---------- 10. MAGIC TRAVEL (orb follows a curved path as you scroll) ---------- */
const stage = document.getElementById('pumpkinStage'); // the spot where the pumpkin sits
let travelTween = null; // the animation that moves the orb along the path
let travelProgress = 0; // 0 = at the wand, 1 = at the pumpkin
let arrived = false; // true once the orb has hit the pumpkin
let orbCharged = false; // true once the fairy has cast the spell and the orb exists

function updateOrb() { // fades the orb in as the visitor starts scrolling
  if (!introDone || arrived) return; // do nothing before the intro or after the arrival
  gsap.set(orbBody, { opacity: orbCharged ? 1 : Math.min(1, travelProgress * 25) }); // once the fairy has charged it, it stays visible
}

function buildMagicPath() { // works out the curved path and ties it to scrolling
  if (reduceMotion) return; // no travelling orb when motion is reduced
  if (travelTween) { travelTween.scrollTrigger.kill(); travelTween.kill(); } // remove the old path if this is a rebuild
  const start = docPoint(wandTip); // the path starts on the wand's star
  const end = docPoint(stage); // and ends at the pumpkin
  const W = document.documentElement.clientWidth; // width of the page
  const dy = end.y - start.y; // vertical distance to travel
  const A = Math.min(W * 0.22, 260); // how far the curve swings sideways
  const keep = (x) => gsap.utils.clamp(30, W - 30, x); // keeps the path inside the screen
  const points = [ // two S-shaped curves: start, control, control, middle, control, control, end
    start,
    { x: keep(start.x + A * 1.6), y: start.y + dy * 0.08 }, // pulls the path to the right
    { x: keep(end.x + A * 1.6), y: start.y + dy * 0.28 }, // keeps it swinging right
    { x: keep(end.x + A * 0.3), y: start.y + dy * 0.5 }, // middle of the journey
    { x: keep(end.x - A * 1.2), y: start.y + dy * 0.68 }, // swings back to the left
    { x: keep(end.x - A * 1.0), y: start.y + dy * 0.9 }, // eases toward the pumpkin
    end
  ];
  const scrollDistance = Math.max(300, end.y - window.innerHeight / 2); // scroll needed until the pumpkin is mid-screen
  gsap.set(magicOrb, { x: start.x, y: start.y }); // park the orb on the wand
  travelTween = gsap.to(magicOrb, { // move the orb along the path
    motionPath: { path: points, type: 'cubic' }, // follow our curve
    ease: 'none', // follows the scrollbar exactly
    scrollTrigger: { // tie the movement to scrolling
      trigger: document.body, // measure scrolling on the whole page
      start: 0, // begins at the top of the page
      end: scrollDistance, // ends when the pumpkin is in the middle of the screen
      scrub: 0.8, // follows the scrollbar with a soft 0.8 second lag
      onUpdate: (self) => { travelProgress = self.progress; updateOrb(); } // remember how far along it is
    }
  });
}

let resizeTimer = null; // timer so we only rebuild once after resizing stops
window.addEventListener('resize', () => { // when the window size changes...
  clearTimeout(resizeTimer); // cancel the previous timer
  resizeTimer = setTimeout(() => { if (introDone) buildMagicPath(); }, 250); // ...rebuild the path after a short pause
});


/* ---------- 11. PUMPKIN TRANSFORMATION ---------- */
const pumpkinImg = document.getElementById('pumpkinImg'); // the ordinary pumpkin
const carriageImg = document.getElementById('carriageImg'); // the golden carriage
const sceneBg = document.querySelector('.scene-bg'); // the rainbow background picture
const titleBefore = document.querySelector('.title-before'); // heading before the magic
const titleAfter = document.querySelector('.title-after'); // heading after the magic

const transformTl = gsap.timeline({ paused: true }) // the transformation, waiting until the magic arrives
  .to(pumpkinImg, { scale: 1.25, rotation: 6, duration: 0.25, ease: 'power2.out' }) // the pumpkin swells and tilts
  .to(pumpkinImg, { autoAlpha: 0, scale: 1.5, duration: 0.45, ease: 'power1.in' }, 0.2) // then fades away
  .to(titleBefore, { '--fill': '#ffffff', '--edge': '#4a2c9a', '--glow': '#ff6fb5', duration: 0.9 }, 0.3) // the first heading STAYS, but recolours to suit the new starry sky
  .to(sceneBg, { opacity: 1, duration: 1.2, ease: 'power1.inOut' }, 0.3) // the rainbow background fades in over the navy
  .fromTo(carriageImg, // the golden carriage appears
    { autoAlpha: 0, scale: 0.5, rotation: -6, filter: 'brightness(2.2) drop-shadow(0 0 40px #ffd23f)' }, // starts small and blazing bright
    { autoAlpha: 1, scale: 1, rotation: 0, filter: 'brightness(1) drop-shadow(0 0 22px rgba(255,210,63,0.8))', duration: 1.1, ease: 'elastic.out(1, 0.6)' }, // pops to full size with a golden glow
    0.35)
  .fromTo(titleAfter, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'back.out(1.6)' }, 0.9); // the second heading rises in BELOW the carriage

if (reduceMotion) transformTl.timeScale(3); // very quick version for reduced motion

let arriveCall = null; // handle for the short delay before the burst

function arrive() { // the magic touches the pumpkin
  arrived = true; // the orb has arrived
  const p = docPoint(stage); // the middle of the pumpkin
  gsap.to(orbBody, { opacity: 0, scale: 2.4, duration: 0.35, ease: 'power2.out' }); // the orb swells and vanishes
  burstAt(p.x, p.y, 46); // sparkle burst
  transformTl.play(); // pumpkin becomes the carriage
}

function leave() { // the visitor scrolled back up
  arrived = false; // the orb is travelling again
  transformTl.reverse(); // carriage turns back into a pumpkin
  gsap.to(orbBody, { scale: 1, duration: 0.3 }); // orb returns to normal size
  updateOrb(); // and shows or hides itself by progress
}

ScrollTrigger.create({ // watch for the pumpkin reaching the middle of the screen
  trigger: stage, // watch the pumpkin area
  start: 'center 52%', // when its centre is just below the middle of the screen
  onEnter: () => { arriveCall = gsap.delayedCall(reduceMotion ? 0 : 0.5, arrive); }, // wait half a second so the orb arrives first
  onLeaveBack: () => { if (arriveCall) arriveCall.kill(); leave(); } // scrolling back up undoes the magic
});


/* ---------- 12. FAIRY SPELL (3D spin + flip, back in place, then the wand casts) ---------- */
function sprinkleAroundFairy() { // a few sparkles that follow the fairy while she flies
  if (Math.random() > 0.4) return; // only some frames
  const p = docPoint(heroFairy); // where she is right now
  spawnSpark(p.x + gsap.utils.random(-130, 130), p.y + gsap.utils.random(-160, 160)); // one spark near her
}

function fairySpell() { // builds the whole spell animation and returns it
  const tl = gsap.timeline(); // empty timeline
  tl.set(heroFairy, { transformPerspective: 900, transformOrigin: '50% 55%' }) // switch on 3D depth, spin around her middle
    .to(heroFairy, { scale: 0.9, y: 14, duration: 0.3, ease: 'power2.out' }) // crouch like a jump is coming
    .to(heroFairy, { y: -60, scale: 1.08, rotationY: 360, duration: 1.4, ease: 'power2.inOut', onUpdate: sprinkleAroundFairy }) // fly up and spin all the way around (3D)
    .to(heroFairy, { rotationX: 360, y: -40, duration: 1.1, ease: 'power2.inOut', onUpdate: sprinkleAroundFairy }, '>-0.15') // then a big forward flip
    .set(heroFairy, { rotationX: 0, rotationY: 0 }) // 360 degrees looks identical to 0, so reset quietly
    .to(heroFairy, { y: 0, scale: 1, duration: 0.8, ease: 'bounce.out' }) // she drops back into her place with a bounce
    .set(heroFairy, { transformOrigin: '50% 90%' }) // back to swaying from her feet
    .call(() => { introDone = true; buildMagicPath(); }) // she is at rest: measure the wand and build the magic's path
    .to(heroFairy, { rotation: 5, duration: 0.25, ease: 'power2.out' }, '+=0.15') // she leans the wand toward the pumpkin
    .fromTo(wandRays, { scale: 0.7, rotation: 0 }, { scale: 2.4, rotation: 180, duration: 0.7, ease: 'power2.in' }, '<') // the wand star charges up
    .call(castSpell) // release the magic!
    .to(wandRays, { scale: 1, duration: 0.5, ease: 'back.out(2)' }) // wand star settles
    .to(heroFairy, { rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' }, '<'); // she straightens up with a wobble
  return tl; // hand it back
}

function castSpell() { // the moment the magic leaves the wand
  const p = docPoint(wandTip); // the wand's star
  burstAt(p.x, p.y, 36); // sparkle explosion
  orbCharged = true; // the orb now exists
  gsap.fromTo(orbBody, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(2.2)' }); // the glowing orb pops out of the wand
  showScrollHint(); // tell the visitor to follow it
}

function startFairyIdle() { // gentle floating once the spell is done
  gsap.to(heroFairy, { y: -12, rotation: 1.5, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }); // float up and down forever
  gsap.fromTo(wandRays, { rotation: -25, scale: 0.85 }, { rotation: 25, scale: 1.15, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }); // wand star rotates and pulses
}

function showScrollHint() { // little "Follow the magic" pill
  if (!scrollHint) return; // safety
  gsap.set(scrollHint, { xPercent: -50, x: 0 }); // keep it centred (GSAP now owns the transform)
  gsap.fromTo(scrollHint, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6 }); // fade it in
  gsap.to(scrollHint.querySelector('b'), { y: 6, duration: 0.6, yoyo: true, repeat: -1, ease: 'sine.inOut' }); // bouncing arrow
  const hide = () => { // when the visitor starts scrolling...
    if (window.scrollY > 80) { gsap.to(scrollHint, { autoAlpha: 0, duration: 0.4 }); window.removeEventListener('scroll', hide); } // ...fade it out
  };
  window.addEventListener('scroll', hide, { passive: true }); // listen for scrolling
}


/* ---------- 13. HERO BACKGROUND DRIFT + SPARKLY STARS ---------- */
if (!reduceMotion) { // slow breathing movement of the rainbow picture
  gsap.to('#heroBg', { scale: 1.08, xPercent: -1.5, duration: 16, ease: 'sine.inOut', yoyo: true, repeat: -1 });
}

function scatterStars(box, count) { // fills a box with little twinkling dots
  for (let i = 0; i < count; i++) { // one pass per star
    const el = document.createElement('span'); // a new dot
    const size = gsap.utils.random(2, 5); // random size
    el.className = 'tw-star'; // style from CSS
    el.style.cssText = `left:${gsap.utils.random(0, 100)}%;top:${gsap.utils.random(0, 100)}%;width:${size}px;height:${size}px;opacity:0.7`; // random place
    box.appendChild(el); // put it in the box
    if (!reduceMotion) gsap.fromTo(el, { opacity: gsap.utils.random(0.1, 0.4), scale: 0.7 }, { opacity: 1, scale: 1.3, duration: gsap.utils.random(1, 2.8), delay: gsap.utils.random(0, 2), ease: 'sine.inOut', yoyo: true, repeat: -1 }); // twinkle forever
  }
}
scatterStars(document.getElementById('storyStars'), 80); // stars in the stories section
scatterStars(document.getElementById('footerStars'), 50); // stars in the footer sky


/* ---------- 14. STORIES (hanging lights + glowing cards) ---------- */
gsap.utils.toArray('.card-col').forEach((col, i) => { // each of the three cards
  const dir = i % 2 === 0 ? 1 : -1; // alternate swing direction
  const garland = col.querySelector('.garland-box'); // the lights picture
  const hang = col.querySelector('.card-hang'); // strings + card (swings)
  const card = col.querySelector('.story-card'); // the card itself (floats + tilts)
  if (reduceMotion) return; // no motion wanted

  gsap.from(col, { y: -70, autoAlpha: 0, duration: 1.1, delay: i * 0.18, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.card-row', start: 'top 82%', once: true } }); // cards drop in when scrolled to

  gsap.to(garland, { rotation: 1.4 * dir, duration: 2.8 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }); // lights sway
  gsap.fromTo(hang, { rotation: -2 * dir }, { rotation: 2 * dir, duration: 2.6 + i * 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1 }); // card swings on its strings
  gsap.to(card, { y: -8, duration: 2 + i * 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1 }); // card bobs

  let lastSpark = 0; // time of the last hover sparkle
  card.addEventListener('pointerenter', () => gsap.to(card, { scale: 1.06, duration: 0.45, ease: 'back.out(2)' })); // grow on hover
  card.addEventListener('pointermove', (e) => { // tilt toward the pointer + leave sparkles
    const r = card.getBoundingClientRect(); // card box on screen
    const px = (e.clientX - r.left) / r.width - 0.5; // pointer position -0.5 .. 0.5 across
    const py = (e.clientY - r.top) / r.height - 0.5; // pointer position -0.5 .. 0.5 down
    gsap.to(card, { rotationY: px * 16, rotationX: -py * 16, transformPerspective: 700, duration: 0.4, ease: 'power2.out', overwrite: 'auto' }); // 3D tilt
    if (e.timeStamp - lastSpark > 110) { lastSpark = e.timeStamp; spawnSpark(e.clientX + window.scrollX, e.clientY + window.scrollY); } // a spark at the pointer
  });
  card.addEventListener('pointerleave', () => gsap.to(card, { scale: 1, rotationX: 0, rotationY: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' })); // spring back
});


/* ---------- 15. STORY CLUB (balloon falls in the background, two clouds drift) ---------- */
const clubSky = document.getElementById('clubSky'); // the background layer
const clubBalloon = document.getElementById('clubBalloon'); // the balloon picture
const cloudA = document.getElementById('cloudA'); // first cloud (left to right)
const cloudB = document.getElementById('cloudB'); // second cloud (right to left, lower)
const clubAnims = []; // everything that should pause when the section is off-screen

if (!reduceMotion) {
  const pickBalloonX = () => gsap.set(clubBalloon, { left: gsap.utils.random(4, 70) + '%' }); // a new random spot each fall
  pickBalloonX(); // first spot

  const balloonTl = gsap.timeline({ repeat: -1, repeatDelay: 1, paused: true, onRepeat: pickBalloonX }) // one fall, forever
    .set(clubBalloon, { opacity: 0, scale: 1 }, 0) // starts invisible above the section
    .fromTo(clubBalloon, { y: () => -clubBalloon.offsetHeight - 20 }, { y: () => clubSky.clientHeight * 0.78, duration: 16, ease: 'none', immediateRender: false, invalidateOnRefresh: true }, 0) // drifts from above down
    .fromTo(clubBalloon, { x: -40, rotation: -4 }, { x: 40, rotation: 4, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: 3, immediateRender: false }, 0) // sways left and right
    .to(clubBalloon, { opacity: 0.95, duration: 2, ease: 'power1.out' }, 0) // fades in
    .to(clubBalloon, { scale: 0.5, opacity: 0, duration: 2.2, ease: 'power2.in' }, 13.8) // shrinks and vanishes when it reaches the bottom
    .call(() => { // a little puff where it vanished
      const p = docPoint(clubBalloon); // where the balloon is
      for (let i = 0; i < 14; i++) spawnSpark(p.x + gsap.utils.random(-50, 50), p.y + gsap.utils.random(-50, 50)); // sparkles
      for (let i = 0; i < 3; i++) spawnFog(p.x + gsap.utils.random(-30, 30), p.y + gsap.utils.random(-30, 30)); // fog puffs
    }, null, 14.6);
  clubAnims.push(balloonTl);

  const lane = (cloud, fromLeft, duration, delay, startAt) => { // one cloud crossing the sky again and again
    const w = () => cloud.offsetWidth + 40; // distance to start fully off-screen
    const tl = gsap.timeline({ repeat: -1, paused: true, delay }); // looping crossing
    tl.fromTo(cloud,
      { x: fromLeft ? () => -w() : () => clubSky.clientWidth + 40 }, // start off one side
      { x: fromLeft ? () => clubSky.clientWidth + 40 : () => -w(), duration, ease: 'none', invalidateOnRefresh: true }, 0); // end off the other side
    tl.progress(startAt); // begin part-way so something is visible straight away
    clubAnims.push(tl); // pause/resume with the section
    clubAnims.push(gsap.to(cloud, { y: 12, duration: 3 + Math.random() * 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true })); // gentle bobbing
  };
  lane(cloudA, true, 32, 0, 0.1); // top cloud: left to right
  lane(cloudB, false, 38, 7, 0); // lower cloud: right to left, starts a little later so they come one by one

  ScrollTrigger.create({ // only animate while the section is on screen
    trigger: '#club', start: 'top bottom', end: 'bottom top',
    onToggle: (self) => clubAnims.forEach((a) => (self.isActive ? a.play() : a.pause()))
  });

  gsap.from('.cword', { y: 60, scale: 0.6, autoAlpha: 0, duration: 0.8, stagger: 0.15, ease: 'back.out(2)', scrollTrigger: { trigger: '.club-title', start: 'top 85%', once: true } }); // title words pop in
  gsap.from('.perk', { y: 70, autoAlpha: 0, duration: 0.8, stagger: 0.15, ease: 'back.out(1.5)', clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: '.club-perks', start: 'top 88%', once: true } }); // perk cards rise
  gsap.from('.meet-item', { y: 40, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out', clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: '.club-meet', start: 'top 92%', once: true } }); // details + button
  gsap.to('#clubCta', { scale: 1.06, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: -1 }); // button pulses
} else { // reduced motion: just show clouds and balloon in fixed places
  gsap.set(clubBalloon, { opacity: 0.9, y: 120 });
  gsap.set(cloudA, { x: 60 });
  gsap.set(cloudB, { x: 300 });
}


/* ---------- 16. FOOTER (flowing water + boats) ---------- */
const sea = document.getElementById('sea'); // the water area
const footerAnims = []; // paused while the footer is off-screen
document.getElementById('year').textContent = new Date().getFullYear(); // keep the copyright year fresh

const BOAT_COLOURS = [ // [hull, sail 1, sail 2, flag]
  ['#ff6fb5', '#fff7d6', '#ffd23f', '#ff9e5e'],
  ['#7aa2ff', '#ffffff', '#ffb7da', '#ff6fb5'],
  ['#ff9e5e', '#fff0a3', '#b5ffd9', '#6dffb3'],
  ['#b388ff', '#ffffff', '#5ee7ff', '#ffe066'],
  ['#2fd4a4', '#fff7d6', '#ff9ecb', '#ff6fb5']
];

function creditBoatSVG(c, k) { // a sailing boat with a flag + a hanging credit banner (k = page, name, bg, line, ink)
  return `<svg viewBox="-10 -68 140 188"><g>
    <line x1="60" y1="-62" x2="60" y2="90" stroke="#7a4a2b" stroke-width="4" stroke-linecap="round"/>
    <path class="flag" d="M60,-64 L84,-57 L60,-50 Z" fill="${c[3]}"/>
    <line x1="-8" y1="-52" x2="128" y2="-52" stroke="#7a4a2b" stroke-width="3" stroke-linecap="round"/>
    <g class="banner">
      <path d="M-4,-50 H124 V-4 L60,-14 L-4,-4 Z" fill="${k.bg}" stroke="${k.line}" stroke-width="2" stroke-linejoin="round"/>
      <text class="banner-page" x="60" y="-37" text-anchor="middle" fill="${k.ink}">${k.page}</text>
      <text class="banner-name" x="60" y="-22" text-anchor="middle">${k.name}</text>
    </g>
    <path class="sail" d="M57,16 L57,82 L18,82 Z" fill="${c[1]}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
    <path class="sail" d="M64,26 L64,82 L98,82 Z" fill="${c[2]}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
    <path d="M10,86 H110 L96,108 Q93,112 87,112 H33 Q27,112 24,108 Z" fill="${c[0]}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
    <path d="M14,92 H106" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="48" cy="99" r="2.8" fill="#35205f"/><circle cx="72" cy="99" r="2.8" fill="#35205f"/>
    <path d="M53,102 Q60,108 67,102" fill="none" stroke="#35205f" stroke-width="2.4" stroke-linecap="round"/></g></svg>`;
}

function boatSVG(kind, c, credit) { // returns the cartoon boat as SVG text
  if (kind === 'credit') return creditBoatSVG(c, credit); // the boats that carry the page credits
  if (kind === 'paper') { // a folded paper boat
    return `<svg viewBox="0 0 120 100"><g><path class="sail" d="M60,10 L60,64 L104,64 Z" fill="#fff"/><path class="sail" d="M60,20 L60,64 L20,64 Z" fill="#e6f0ff"/>
      <path d="M8,62 H112 L92,92 H28 Z" fill="#fff" stroke="#9fb7ff" stroke-width="3" stroke-linejoin="round"/><path d="M28,92 L40,62 M92,92 L80,62" stroke="#9fb7ff" stroke-width="2"/>
      <circle cx="48" cy="76" r="2.6" fill="#35205f"/><circle cx="72" cy="76" r="2.6" fill="#35205f"/><path d="M52,82 Q60,89 68,82" fill="none" stroke="#35205f" stroke-width="2.4" stroke-linecap="round"/></g></svg>`;
  }
  return `<svg viewBox="0 0 120 120"><g>
    <line x1="60" y1="8" x2="60" y2="90" stroke="#7a4a2b" stroke-width="4" stroke-linecap="round"/>
    <path d="M60,6 L78,12 L60,18 Z" fill="${c[3]}"/>
    <path class="sail" d="M57,16 L57,82 L18,82 Z" fill="${c[1]}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
    <path class="sail" d="M64,26 L64,82 L98,82 Z" fill="${c[2]}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
    <path d="M10,86 H110 L96,108 Q93,112 87,112 H33 Q27,112 24,108 Z" fill="${c[0]}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
    <path d="M14,92 H106" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="48" cy="99" r="2.8" fill="#35205f"/><circle cx="72" cy="99" r="2.8" fill="#35205f"/>
    <circle cx="44" cy="104" r="3" fill="rgba(255,111,181,.55)"/><circle cx="76" cy="104" r="3" fill="rgba(255,111,181,.55)"/>
    <path d="M53,102 Q60,108 67,102" fill="none" stroke="#35205f" stroke-width="2.4" stroke-linecap="round"/></g></svg>`;
}

function addBoat(laneId, kind, width, bottom, duration, colours, startAt, credit) { // adds one boat and sails it left to right
  const el = document.createElement('div'); // wrapper for the boat
  el.className = 'boat'; // CSS class
  el.style.width = width + 'px'; // its size
  el.style.bottom = bottom + '%'; // how high it sits on the water
  el.innerHTML = boatSVG(kind, colours, credit); // draw it
  document.getElementById(laneId).appendChild(el); // put it on the water
  const svg = el.querySelector('svg'); // the drawing (it rocks)
  if (reduceMotion) { gsap.set(el, { x: startAt * (sea.clientWidth - width) }); return; } // static spot
  const sail = gsap.utils.toArray(el.querySelectorAll('.sail')); // the sails (they flutter)

  const tl = gsap.timeline({ repeat: -1, paused: true }); // the sailing trip
  tl.fromTo(el, { x: -width - 40 }, { x: () => sea.clientWidth + 40, duration, ease: 'none', invalidateOnRefresh: true }); // left edge to right edge
  tl.progress(startAt); // start part-way along so the sea is busy straight away
  footerAnims.push(tl);

  const rock = gsap.fromTo(svg, { rotation: -gsap.utils.random(3, 6), y: 0 }, { rotation: gsap.utils.random(3, 6), y: gsap.utils.random(3, 8), duration: gsap.utils.random(1.4, 2.4), ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true }); // rocking on the waves
  footerAnims.push(rock);
  if (sail.length) footerAnims.push(gsap.to(sail, { skewX: -5, transformOrigin: '50% 100%', duration: gsap.utils.random(0.9, 1.5), ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true })); // sails flutter in the wind
  if (kind === 'credit') { // credit boats: the flag and the banner wave in the wind too
    footerAnims.push(gsap.fromTo(el.querySelector('.flag'), { skewY: -8 }, { skewY: 8, svgOrigin: '60 -57', duration: gsap.utils.random(0.5, 0.8), ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true }));
    footerAnims.push(gsap.fromTo(el.querySelector('.banner'), { skewX: -3 }, { skewX: 3, svgOrigin: '60 -52', duration: gsap.utils.random(1.2, 1.8), ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true }));
  }
}

const seaScale = Math.max(0.6, Math.min(1, window.innerWidth / 1200)); // smaller boats on phones
[ // [lane, kind, width, bottom %, seconds, colours, start progress]
  ['laneFar', 'sail', 70, 60, 46, BOAT_COLOURS[1], 0.05],
  ['laneFar', 'paper', 60, 56, 54, BOAT_COLOURS[0], 0.45],
  ['laneFar', 'sail', 85, 62, 40, BOAT_COLOURS[3], 0.75],
  ['laneNear', 'sail', 165, 30, 34, BOAT_COLOURS[0], 0.2],
  ['laneNear', 'sail', 120, 26, 28, BOAT_COLOURS[2], 0.6],
  ['laneNear', 'paper', 130, 28, 38, BOAT_COLOURS[4], 0.9],
  ['laneNear', 'sail', 140, 32, 31, BOAT_COLOURS[4], 0.4]
].forEach(([laneId, kind, width, bottom, secs, colours, start]) => addBoat(laneId, kind, Math.round(width * seaScale), bottom, secs, colours, start)); // build all the boats

/* the three credit boats: who made which page (added last so they sail in front) */
const CREDIT_BOATS = [ // [page, name, [hull, sail 1, sail 2, flag], banner fill, banner edge, page-label colour, bottom %, start progress]
  ['Home page',    'Madiha Sheikh', ['#ff6fb5', '#fff7d6', '#ffd23f', '#ff9e5e'], '#fff7d6', '#ff6fb5', '#d6447f', 29, 0.10],
  ['Story page',   'Sana Ghazi',    ['#7aa2ff', '#ffffff', '#ffb7da', '#ff6fb5'], '#ffffff', '#7aa2ff', '#3b5fc4', 27, 0.43],
  ['Journal page', 'Ashna Fatima',  ['#b388ff', '#ffffff', '#5ee7ff', '#ffe066'], '#e9ddff', '#b388ff', '#6a43b5', 30, 0.76]
];
const creditWidth = Math.round(Math.max(120, 150 * seaScale)); // never smaller than 120px so the names stay readable
CREDIT_BOATS.forEach(([page, name, colours, bg, line, ink, bottom, start]) =>
  addBoat('laneNear', 'credit', creditWidth, bottom, 42, colours, start, { page, name, bg, line, ink })); // same speed = they never bunch up

if (!reduceMotion) {
  [['.wave-back', 24, 5], ['.wave-mid', 17, 7], ['.wave-front', 12, 6]].forEach(([sel, secs, bob]) => { // three water layers
    footerAnims.push(gsap.fromTo(sel, { xPercent: -50 }, { xPercent: 0, duration: secs, ease: 'none', repeat: -1, paused: true })); // water flows left to right, endlessly
    footerAnims.push(gsap.to(sel, { y: bob, duration: secs / 4, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true })); // and rises and falls a little
  });
  ScrollTrigger.create({ // only animate while the footer is visible
    trigger: '#footer', start: 'top bottom', end: 'bottom top',
    onToggle: (self) => footerAnims.forEach((a) => (self.isActive ? a.play() : a.pause()))
  });
}


/* ---------- 17. PAGE START ---------- */
const pageLoaded = document.readyState === 'complete' // has the page (and all pictures) finished loading?
  ? Promise.resolve() // yes: carry on straight away
  : new Promise((resolve) => window.addEventListener('load', resolve)); // no: wait for the load event
const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve(); // wait for Grandstander so word positions are measured correctly

Promise.all([pageLoaded, fontsReady]).then(() => { // when both are ready...
  ScrollTrigger.refresh(); // re-measure all scroll positions
  playHeroIntro(); // ...start the hero animation
  if (reduceMotion) { introDone = true; } // reduced motion: no waiting
});
