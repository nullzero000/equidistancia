/**
 * SEFIROT - THE TEN EMANATIONS
 * Tree of Life structure from Lurianic Kabbalah
 * 
 * Sources:
 * - Etz Chaim (Chaim Vital)
 * - Pardes Rimonim (Moses Cordovero)
 * - Zohar (Pritzker Edition)
 */

export interface Sefirah {
  number: number;
  english: string;
  hebrew: string;
  divine_name: string;
  divine_name_hebrew: string;
  color_ramak: string;
  color_zohar: string;
  part_of_body: string;
  world: string;
  pillar: 'right' | 'left' | 'middle';
  description: string;
}

export const SEFIROT: Record<string, Sefirah> = {
  'Keter': {
    number: 1,
    english: 'Crown',
    hebrew: 'כתר',
    divine_name: 'Ehyeh',
    divine_name_hebrew: 'אהיה',
    color_ramak: 'Blinding White',
    color_zohar: 'Concealed',
    part_of_body: 'Above the Head / Skull',
    world: 'Atzilut (Emanation)',
    pillar: 'middle',
    description: 'The highest sefirah, representing pure divine will and infinite potential',
  },
  'Chokhmah': {
    number: 2,
    english: 'Wisdom',
    hebrew: 'חכמה',
    divine_name: 'Yah',
    divine_name_hebrew: 'יה',
    color_ramak: 'Color Including All Colors',
    color_zohar: 'White',
    part_of_body: 'Right Hemisphere of Brain',
    world: 'Atzilut (Emanation)',
    pillar: 'right',
    description: 'The flash of intuitive insight, the seminal point of all wisdom',
  },
  'Binah': {
    number: 3,
    english: 'Understanding',
    hebrew: 'בינה',
    divine_name: 'YHVH (as Elohim)',
    divine_name_hebrew: 'יהוה',
    color_ramak: 'Verdant Green / Bright Yellow',
    color_zohar: 'Red',
    part_of_body: 'Left Hemisphere of Brain / Heart',
    world: 'Beriah (Creation)',
    pillar: 'left',
    description: 'The womb of understanding, where wisdom develops into comprehension',
  },
  'Chesed': {
    number: 4,
    english: 'Lovingkindness',
    hebrew: 'חסד',
    divine_name: 'El',
    divine_name_hebrew: 'אל',
    color_ramak: 'Silver / Silvery White',
    color_zohar: 'White (Secondary)',
    part_of_body: 'Right Arm',
    world: 'Yetzirah (Formation)',
    pillar: 'right',
    description: 'Unlimited mercy and expansive love, the giving force',
  },
  'Gevurah': {
    number: 5,
    english: 'Strength',
    hebrew: 'גבורה',
    divine_name: 'Elohim',
    divine_name_hebrew: 'אלהים',
    color_ramak: 'Reddish Gold / Red',
    color_zohar: 'Red (Secondary)',
    part_of_body: 'Left Arm',
    world: 'Yetzirah (Formation)',
    pillar: 'left',
    description: 'Judgment and restriction, the force that contains and directs',
  },
  'Tiferet': {
    number: 6,
    english: 'Beauty',
    hebrew: 'תפארת',
    divine_name: 'YHVH',
    divine_name_hebrew: 'יהוה',
    color_ramak: 'Yellow and Purple',
    color_zohar: 'Green',
    part_of_body: 'Torso / Heart Center',
    world: 'Yetzirah (Formation)',
    pillar: 'middle',
    description: 'Harmony and balance, integrating mercy and judgment',
  },
  'Netzach': {
    number: 7,
    english: 'Eternity',
    hebrew: 'נצח',
    divine_name: 'YHVH Tzvaot',
    divine_name_hebrew: 'יהוה צבאות',
    color_ramak: 'Light Pink',
    color_zohar: 'Pink (Derivative)',
    part_of_body: 'Right Leg',
    world: 'Yetzirah (Formation)',
    pillar: 'right',
    description: 'Victory and endurance, the drive to overcome and persist',
  },
  'Hod': {
    number: 8,
    english: 'Splendor',
    hebrew: 'הוד',
    divine_name: 'Elohim Tzvaot',
    divine_name_hebrew: 'אלהים צבאות',
    color_ramak: 'Dark Pink',
    color_zohar: 'Dark Pink (Derivative)',
    part_of_body: 'Left Leg',
    world: 'Yetzirah (Formation)',
    pillar: 'left',
    description: 'Glory and acknowledgment, the power of reverberation and reflection',
  },
  'Yesod': {
    number: 9,
    english: 'Foundation',
    hebrew: 'יסוד',
    divine_name: 'Shaddai / El Chai',
    divine_name_hebrew: 'שדי / אל חי',
    color_ramak: 'Orange',
    color_zohar: 'Orange (Derivative)',
    part_of_body: 'Reproductive Organs',
    world: 'Yetzirah (Formation)',
    pillar: 'middle',
    description: 'The channel connecting higher sefirot to manifestation below',
  },
  'Malkuth': {
    number: 10,
    english: 'Kingdom',
    hebrew: 'מלכות',
    divine_name: 'Adonai',
    divine_name_hebrew: 'אדני',
    color_ramak: 'Dark Royal Blue',
    color_zohar: 'Black',
    part_of_body: 'Feet / Mouth',
    world: 'Assiah (Action)',
    pillar: 'middle',
    description: 'The physical world, where all divine emanations manifest',
  },
};

// Helper function to get sefirot by pillar
export function getSefirotByPillar(pillar: 'right' | 'left' | 'middle'): Sefirah[] {
  return Object.values(SEFIROT).filter(s => s.pillar === pillar);
}

// Helper function to get sefirot by world
export function getSefirotByWorld(world: string): Sefirah[] {
  return Object.values(SEFIROT).filter(s => s.world.includes(world));
}
