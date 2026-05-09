import type { Card } from '../types';

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function initDrawPile(deck: Card[]): Card[] {
  return shuffle([...deck]);
}

export function drawCards(
  drawPile: Card[],
  discardPile: Card[],
  hand: Card[],
  count: number
): { hand: Card[]; drawPile: Card[]; discardPile: Card[] } {
  let newDraw = [...drawPile];
  let newDiscard = [...discardPile];
  let newHand = [...hand];

  for (let i = 0; i < count; i++) {
    if (newDraw.length === 0) {
      if (newDiscard.length === 0) break;
      newDraw = shuffle(newDiscard);
      newDiscard = [];
    }
    newHand.push(newDraw.pop()!);
  }

  return { hand: newHand, drawPile: newDraw, discardPile: newDiscard };
}

export function discardHand(
  hand: Card[],
  discardPile: Card[]
): { hand: Card[]; discardPile: Card[] } {
  return { hand: [], discardPile: [...discardPile, ...hand] };
}
