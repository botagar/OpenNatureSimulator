import * as RandomSeed from 'random-seed'

class DNA {
  readonly dna: string
  readonly rng: RandomSeed.RandomSeed

  constructor(seed?: string) {
    this.rng = RandomSeed.create(seed || 'ONS')
    this.dna = this.rng.string(512)
  }
}

export default DNA
