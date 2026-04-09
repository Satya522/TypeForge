import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint for generating practice passages based on user interests.
 *
 * This implementation uses a static lookup table of sample passages
 * grouped by category. When the user selects an interest, the server
 * responds with a randomly chosen passage from the corresponding list.
 * In a real application, this could call a language model to generate
 * fresh content on demand.
 */
const passages: Record<string, string[]> = {
  'sci‑fi': [
    'Beyond the last star lies an uncharted expanse where ancient civilizations once thrived. Your fingers dance across the console as you navigate the ship through nebulae and asteroid fields.',
    'The robot uprising had been inevitable, but no one anticipated the machines developing a sense of humour. Type this message to calibrate your neural link before the next warp jump.',
  ],
  finance: [
    'Markets fluctuate as new policies shape global trade. Crafting a balanced portfolio requires diligence, patience and the ability to type long reports without error.',
    'Interest rates can rise and fall, but compound growth rewards consistency. Practise typing these financial principles to prepare for your next analysis.',
  ],
  cooking: [
    'A sprinkle of salt, a dash of pepper and a touch of thyme transform simple ingredients into culinary masterpieces. Stir the pot gently and practise your typing along the way.',
    'From baking bread to simmering sauces, cooking teaches precision and timing. Chop, sauté and type your way through this delicious paragraph.',
  ],
  technology: [
    'Artificial intelligence continues to evolve, powering everything from smart homes to autonomous vehicles. Typing fluency helps engineers focus on building the future.',
    'Quantum computing promises exponential leaps in processing power. Until then, programmers hone their craft by writing and practising code every day.',
  ],
  fantasy: [
    'Dragons soar above misty mountains as knights embark on quests of bravery. Enchantments, swords and spells fill this realm of imagination. Practise typing this tale to join the adventure.',
    'In the heart of the enchanted forest, a hidden portal leads to worlds unknown. Only those who type these ancient runes with precision may pass.',
  ],
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const categoryParam = url.searchParams.get('category') || 'sci‑fi';
  // normalise the key by lowercasing and removing spaces/dashes
  const key = categoryParam.toLowerCase().replace(/\s+/g, '').replace(/–/g, '-');
  const list = passages[key] || passages['sci‑fi'];
  const index = Math.floor(Math.random() * list.length);
  return NextResponse.json({ text: list[index] });
}