// A small sample family for the landing page and the how-to guide (not one any team gets): the trait is X-linked
// recessive, passed from the queen (a carrier) to a son, and through a carrier daughter to a grandson.
const P = (id, label, name, sex, gen, x, father, mother, spouse, affected) => ({ id, label, name, sex, gen, x, father, mother, spouse, affected })

export const DEMO_HOUSE = {
  name: 'House Valemont',
  trait: { name: 'the Silver Streak', desc: 'a streak of silver hair from birth' },
  people: [
    P(0, 'I-1', 'Aldric', 'M', 1, 1.5, null, null, 1, false),
    P(1, 'I-2', 'Elowen', 'F', 1, 2.5, null, null, 0, false),
    P(2, 'II-1', 'Cedric', 'M', 2, 0, 0, 1, null, true),
    P(3, 'II-2', 'Bastian', 'M', 2, 1.5, null, null, 4, false),
    P(4, 'II-3', 'Isolde', 'F', 2, 2.5, 0, 1, 3, false),
    P(5, 'II-4', 'Maribel', 'F', 2, 4, 0, 1, null, false),
    P(6, 'III-1', 'Felix', 'M', 3, 1, 3, 4, null, true),
    P(7, 'III-2', 'Odette', 'F', 3, 2, 3, 4, null, false),
    P(8, 'III-3', 'Hugo', 'M', 3, 3, 3, 4, null, false),
  ],
  seal: null,
  revealed: {},
}
