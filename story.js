
const stories = [
  {
    title: "The Little Star Keeper",
    image: "images/fairy 1.jpg",
    
    description: "A little girl discovers a secret hidden among the stars.",
    paragraphs: [
      "Once upon a time, in a village above the clouds, lived a little girl named Luna. Every night, she watched the stars sparkle and wondered who kept them shining.",
      "One magical evening, a tiny golden star fell into her garden. Luna gently picked it up and discovered that it had lost its light. She carried it to the highest hill and sang a song of hope.",
      "Her kind voice filled the sky. The little star glowed brighter and brighter until it flew home, leaving a sparkling trail across the night. From that night on, Luna became the keeper of forgotten stars."
    ],
    moral: "Even the smallest act of kindness can bring light into someone's world."
  },
  {
    title: "The crystal of eldoria",
    image: "images/fairy2.jpg",
    description: "A mysterious rose teaches a princess the meaning of love.",
    paragraphs: [
      "In a quiet kingdom, a princess named Elara found a glowing rose behind an ancient garden wall. The flower shimmered with pink and golden light, but no one knew where it came from.",
      "Every morning, Elara watered the rose and spoke to it kindly. One cold night, a terrible frost covered the garden. Instead of protecting only her precious flower, Elara wrapped the nearby plants in warm blankets too.",
      "By sunrise, the garden was filled with blossoms. The enchanted rose opened its petals and released a shower of golden butterflies. The garden had awakened because Elara's heart had grown beyond one beautiful flower."
    ],
    moral: "True beauty grows when kindness is shared with everyone."
  },
  {
    title: "The Dragon's Secret",
    image: "images/secret.jpg",
    description: "A brave child discovers that not every dragon is frightening.",
    paragraphs: [
      "Beyond the Emerald Mountains lived a young dragon named Ember. People feared him because smoke rose from his cave, and his roar echoed through the valley.",
      "One day, a brave boy named Theo climbed the mountain and found Ember crying beside a broken wing. Theo was frightened, but he stayed and helped wrap the dragon's injured wing with soft cloth.",
      "When a storm threatened the village, Ember spread his enormous wings and guided lost travellers to safety. The villagers finally understood that the creature they feared had always wanted a friend."
    ],
    moral: "Never judge someone by their appearance; understanding begins with compassion."
  },
  {
    title: "The Moonlight Princess",
    image: "images/moon.jpg",
    description: "A princess follows a trail of moonbeams to save her kingdom.",
    paragraphs: [
      "Princess Mira lived in a silver castle where moonlight painted every window. One night, the moon disappeared behind dark clouds, and the kingdom's magical lanterns began to fade.",
      "Mira followed a silver trail through the Whispering Woods. She met a wise owl, crossed a bridge of mist, and climbed a hill where the clouds touched the earth.",
      "There she discovered that the moon was hidden behind a curtain of enchanted fog. Mira rang an ancient bell, and the wind swept the clouds away. Moonlight returned to the kingdom, and Mira came home with courage shining in her heart."
    ],
    moral: "Courage means taking the next step, even when the path is uncertain."
  },
  {
    title: "The Secret Fairy Door",
    image: "images/fairy4.jpg",
    description: "A hidden woodland door leads to an extraordinary adventure.",
    paragraphs: [
      "While exploring a forest, a curious girl named Poppy noticed a tiny green door inside an old tree. A golden handle sparkled in the sunlight, and a faint melody floated from the other side.",
      "Poppy opened the door and stepped into a miniature world where flowers sang, mushrooms glowed, and butterflies carried letters between the trees. The fairies explained that their river of dreams had stopped flowing.",
      "Poppy helped them clear fallen branches from the river. Water rushed through the little kingdom once more, filling the forest with music. Before she left, the fairies gave her a tiny key that would always remind her to stay curious."
    ],
    moral: "Curiosity and teamwork can turn an ordinary day into a wonderful adventure."
  },
  {
    title: "The Cloud Castle",
    image: "images/cloud.jpg",
    description: "A young dreamer finds a castle floating above the mountains.",
    paragraphs: [
      "Every afternoon, a boy named Finn watched clouds drift above the mountains. He imagined castles hidden inside them and dreamed of visiting one.",
      "One breezy morning, a fluffy cloud lowered a staircase into his garden. Finn climbed until he reached a castle made of mist and rainbows. Its royal cloud keeper had lost the golden bell that brought rain to thirsty lands.",
      "Finn searched the towers and found the bell tangled in a silver vine. When he rang it, gentle rain fell across the valleys below. The cloud keeper thanked him and gave him a feather that shimmered whenever he dreamed."
    ],
    moral: "Dreams become more meaningful when we use our gifts to help others."
  },
  {
    title: "The little Mermaid",
    image: "images/littlefairy.jpg",
    description: "A young mermaid learns the magic of friendship.",
    paragraphs: [
      "Deep beneath the turquoise sea lived a mermaid named Marina. She collected pearls and listened to whales singing, but she wished she had a friend from the world above the waves.",
      "One day, Marina found a small sea turtle trapped among floating ropes. She freed it carefully and guided it to a coral garden. The turtle returned with a school of colourful fish, and together they showed Marina the wonders of the ocean.",
      "Marina realised she had been surrounded by possible friends all along. She began helping other sea creatures, and soon her coral home was filled with laughter, music, and friendship."
    ],
    moral: "Friendship often begins when we open our hearts and help someone in need."
  },
  {
    title: "The Golden Butterfly",
    image: "images/golden.jpg",
    description: "A golden butterfly shows a lonely garden how to bloom again.",
    paragraphs: [
      "At the edge of a sleepy village stood a garden where no flowers bloomed. A little girl named Rosie visited every day, hoping to see it become colourful again.",
      "One morning, a golden butterfly landed on her hand. It fluttered towards a dry flower bed, and Rosie understood that the garden needed care. She brought water, planted seeds, and invited the village children to help.",
      "Days passed, and tiny green shoots appeared. Soon the garden overflowed with flowers, bees, and butterflies. The golden butterfly returned every spring, reminding Rosie of the wonderful garden they had created together."
    ],
    moral: "Patience, care, and small daily efforts can create something beautiful."
  }
];

const storyGrid = document.getElementById("storyGrid");
const storyModal = document.getElementById("storyModal");
const modalTitle = document.getElementById("modalTitle");
const modalStory = document.getElementById("modalStory");
const modalMoral = document.getElementById("modalMoral");
const modalClose = document.getElementById("modalClose");
const modalDone = document.getElementById("modalDone");

let lastFocusedElement = null;

// Create all eight cards
stories.forEach((story, index) => {
  const card = document.createElement("article");
  card.className = "story-card";

  card.innerHTML = `
    <div class="story-image-wrap">
      <img
        class="story-image"
        src="${story.image}"
        alt="${story.title}"
        loading="lazy"
      >
      <span class="story-number">STORY ${String(index + 1).padStart(2, "0")}</span>
    </div>

    <div class="story-card-content">
      <h3>${story.title}</h3>
      <p>${story.description}</p>
      <button class="read-btn" type="button" data-story="${index}">
        Read Story <span aria-hidden="true">↗</span>
      </button>
    </div>
  `;

  storyGrid.appendChild(card);
});

// Open the selected story
function openStory(index) {
  const story = stories[index];

  if (!story) return;

  lastFocusedElement = document.activeElement;

  modalTitle.textContent = story.title;
  modalStory.replaceChildren();

  story.paragraphs.forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    modalStory.appendChild(p);
  });

  modalMoral.textContent = story.moral;

  storyModal.classList.add("is-open");
  storyModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  // Animate the popup if GSAP is available
  if (window.gsap) {
    gsap.fromTo(
      ".story-modal",
      { opacity: 0, y: 35, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.4)" }
    );
  }

  modalClose.focus();
}

// Close the story popup
function closeStory() {
  if (!storyModal.classList.contains("is-open")) return;

  storyModal.classList.remove("is-open");
  storyModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

// Event delegation: all Read Story buttons work
storyGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".read-btn");

  if (!button) return;

  openStory(Number(button.dataset.story));
});

modalClose.addEventListener("click", closeStory);
modalDone.addEventListener("click", closeStory);

// Close when clicking outside the popup
storyModal.addEventListener("click", (event) => {
  if (event.target === storyModal) {
    closeStory();
  }
});

// Close using Escape
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeStory();
  }
});

// GSAP scroll animations
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".hero-content > *", {
    opacity: 0,
    y: 28,
    duration: 0.8,
    stagger: 0.12,
    ease: "power3.out",
    delay: 0.15
  });

  gsap.from(".hero-art", {
    opacity: 0,
    scale: 0.8,
    duration: 1.1,
    ease: "back.out(1.5)",
    delay: 0.25
  });

  gsap.from(".section-heading > *", {
    scrollTrigger: {
      trigger: ".section-heading",
      start: "top 85%"
    },
    opacity: 0,
    y: 25,
    duration: 0.7,
    stagger: 0.15
  });

  gsap.from(".story-card", {
    scrollTrigger: {
      trigger: ".story-grid",
      start: "top 82%"
    },
    opacity: 0,
    y: 45,
    duration: 0.7,
    stagger: 0.13,
    ease: "power2.out",
    clearProps: "opacity,transform"
  });
}





