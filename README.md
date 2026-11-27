# Royal Bloodlines

A PLTL General Biology game (Pedigree Detective), for Mendelian genetics and the chromosomal basis of inheritance
(Ermolinsky Ch 12–13, Carreon Unit 3). Every team is a team of court genealogists with its own royal house. A made-up
trait runs through the family (the explanations name real conditions with the same pattern), and every family tree
is generated.

Rounds (the leader picks; each team gets its own houses and numbers):

1. **Royal crosses:** Punnett squares (the chance of a phenotype, genotype fractions) and a testcross.
2. **Read the bloodline:** three family trees; name each pattern: autosomal dominant, autosomal recessive, X-linked
   dominant, X-linked recessive, or mitochondrial (from the mother). Each tree is generated so its pattern is clear
   (at least 16 times likelier than any other, and most others flat-out impossible), assuming, as textbook problems
   do, that the trait is rare and anyone marrying into the family doesn't carry it. A wrong pick says which member
   rules it out ("she has it, but her father doesn't...").
3. **Who carries it?** genotypes of marked members of the team's own house, carriers included (AA/Aa/aa or
   Xᴬ/Xᵃ), with "can't tell" when the tree really doesn't decide.
4. **The heir's odds:** genetic counseling for the team's house: the chance a child (or a son) has the trait, the
   rule of multiplication (both of two children), and the rule of addition (has it or carries it).
5. **Beyond Mendel:** incomplete dominance (royal camellias), ABO blood types for a disputed heir, and a
   dihybrid cross.

Probabilities can be typed as a fraction (1/4), a decimal (0.25) or a percent (25%). The projector shows every
team's house, filling in as it works it out: the pattern stamped on, genotypes written under members, carriers
marked with a dot. One student per team is the **lead genealogist** and sends each answer; the role rotates every
step. Each step is worth 50 points, minus a quarter per wrong try; after three, the team can see the answer and move
on (0 points). Solved steps build up as study notes (Punnett squares filled in). Optional clock (20, 30 or 45 minutes).
The leader can **peek** at any team, **report a problem** from the results or the peek, and download the results.
Students should bring paper for the Punnett squares.

The course materials' own examples (the royal hemophilia pedigree, juvenile glaucoma, albinism, red and white
flowers) are not reused: the questions are modeled on the class, not copied.

## Pages

| Path | Who | What |
|---|---|---|
| `/` | Leader | Lobby (teams, rounds, clock), then the projector (every team's family tree) and results |
| `/join` | Students | Join with the code, work each clue, answer when you're the lead genealogist |

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the shared PLTL Supabase project's URL and publishable key.
3. `npm run dev`

The backend lives in the `supabase-backend` repository: the tables `rb_*`, the functions `rb-game` and `rb-play`, and
the rules in `_shared/royalBloodlines.ts` (tests in `_shared/royalBloodlines_test.ts`).
