export interface Element {
  number: number
  symbol: string
  name: string
  nameJa: string
  mass: string
  category: string
  row: number
  col: number
}

export const categoryColors: Record<string, string> = {
  'alkali': '#ff6b6b',
  'alkaline': '#ffd93d',
  'transition': '#6bcf7f',
  'post-transition': '#95e1d3',
  'metalloid': '#a8dadc',
  'nonmetal': '#4ecdc4',
  'halogen': '#f38181',
  'noble-gas': '#aa96da',
  'lanthanide': '#ffb347',
  'actinide': '#ff9999',
}

export const elements: Element[] = [
  // Period 1
  { number: 1, symbol: 'H', name: 'Hydrogen', nameJa: '水素', mass: '1.008', category: 'nonmetal', row: 1, col: 1 },
  { number: 2, symbol: 'He', name: 'Helium', nameJa: 'ヘリウム', mass: '4.003', category: 'noble-gas', row: 1, col: 18 },
  
  // Period 2
  { number: 3, symbol: 'Li', name: 'Lithium', nameJa: 'リチウム', mass: '6.941', category: 'alkali', row: 2, col: 1 },
  { number: 4, symbol: 'Be', name: 'Beryllium', nameJa: 'ベリリウム', mass: '9.012', category: 'alkaline', row: 2, col: 2 },
  { number: 5, symbol: 'B', name: 'Boron', nameJa: 'ホウ素', mass: '10.81', category: 'metalloid', row: 2, col: 13 },
  { number: 6, symbol: 'C', name: 'Carbon', nameJa: '炭素', mass: '12.01', category: 'nonmetal', row: 2, col: 14 },
  { number: 7, symbol: 'N', name: 'Nitrogen', nameJa: '窒素', mass: '14.01', category: 'nonmetal', row: 2, col: 15 },
  { number: 8, symbol: 'O', name: 'Oxygen', nameJa: '酸素', mass: '16.00', category: 'nonmetal', row: 2, col: 16 },
  { number: 9, symbol: 'F', name: 'Fluorine', nameJa: 'フッ素', mass: '19.00', category: 'halogen', row: 2, col: 17 },
  { number: 10, symbol: 'Ne', name: 'Neon', nameJa: 'ネオン', mass: '20.18', category: 'noble-gas', row: 2, col: 18 },
  
  // Period 3
  { number: 11, symbol: 'Na', name: 'Sodium', nameJa: 'ナトリウム', mass: '22.99', category: 'alkali', row: 3, col: 1 },
  { number: 12, symbol: 'Mg', name: 'Magnesium', nameJa: 'マグネシウム', mass: '24.31', category: 'alkaline', row: 3, col: 2 },
  { number: 13, symbol: 'Al', name: 'Aluminum', nameJa: 'アルミニウム', mass: '26.98', category: 'post-transition', row: 3, col: 13 },
  { number: 14, symbol: 'Si', name: 'Silicon', nameJa: 'ケイ素', mass: '28.09', category: 'metalloid', row: 3, col: 14 },
  { number: 15, symbol: 'P', name: 'Phosphorus', nameJa: 'リン', mass: '30.97', category: 'nonmetal', row: 3, col: 15 },
  { number: 16, symbol: 'S', name: 'Sulfur', nameJa: '硫黄', mass: '32.07', category: 'nonmetal', row: 3, col: 16 },
  { number: 17, symbol: 'Cl', name: 'Chlorine', nameJa: '塩素', mass: '35.45', category: 'halogen', row: 3, col: 17 },
  { number: 18, symbol: 'Ar', name: 'Argon', nameJa: 'アルゴン', mass: '39.95', category: 'noble-gas', row: 3, col: 18 },
  
  // Period 4
  { number: 19, symbol: 'K', name: 'Potassium', nameJa: 'カリウム', mass: '39.10', category: 'alkali', row: 4, col: 1 },
  { number: 20, symbol: 'Ca', name: 'Calcium', nameJa: 'カルシウム', mass: '40.08', category: 'alkaline', row: 4, col: 2 },
  { number: 21, symbol: 'Sc', name: 'Scandium', nameJa: 'スカンジウム', mass: '44.96', category: 'transition', row: 4, col: 3 },
  { number: 22, symbol: 'Ti', name: 'Titanium', nameJa: 'チタン', mass: '47.87', category: 'transition', row: 4, col: 4 },
  { number: 23, symbol: 'V', name: 'Vanadium', nameJa: 'バナジウム', mass: '50.94', category: 'transition', row: 4, col: 5 },
  { number: 24, symbol: 'Cr', name: 'Chromium', nameJa: 'クロム', mass: '52.00', category: 'transition', row: 4, col: 6 },
  { number: 25, symbol: 'Mn', name: 'Manganese', nameJa: 'マンガン', mass: '54.94', category: 'transition', row: 4, col: 7 },
  { number: 26, symbol: 'Fe', name: 'Iron', nameJa: '鉄', mass: '55.85', category: 'transition', row: 4, col: 8 },
  { number: 27, symbol: 'Co', name: 'Cobalt', nameJa: 'コバルト', mass: '58.93', category: 'transition', row: 4, col: 9 },
  { number: 28, symbol: 'Ni', name: 'Nickel', nameJa: 'ニッケル', mass: '58.69', category: 'transition', row: 4, col: 10 },
  { number: 29, symbol: 'Cu', name: 'Copper', nameJa: '銅', mass: '63.55', category: 'transition', row: 4, col: 11 },
  { number: 30, symbol: 'Zn', name: 'Zinc', nameJa: '亜鉛', mass: '65.39', category: 'transition', row: 4, col: 12 },
  { number: 31, symbol: 'Ga', name: 'Gallium', nameJa: 'ガリウム', mass: '69.72', category: 'post-transition', row: 4, col: 13 },
  { number: 32, symbol: 'Ge', name: 'Germanium', nameJa: 'ゲルマニウム', mass: '72.64', category: 'metalloid', row: 4, col: 14 },
  { number: 33, symbol: 'As', name: 'Arsenic', nameJa: 'ヒ素', mass: '74.92', category: 'metalloid', row: 4, col: 15 },
  { number: 34, symbol: 'Se', name: 'Selenium', nameJa: 'セレン', mass: '78.96', category: 'nonmetal', row: 4, col: 16 },
  { number: 35, symbol: 'Br', name: 'Bromine', nameJa: '臭素', mass: '79.90', category: 'halogen', row: 4, col: 17 },
  { number: 36, symbol: 'Kr', name: 'Krypton', nameJa: 'クリプトン', mass: '83.80', category: 'noble-gas', row: 4, col: 18 },
  
  // Period 5
  { number: 37, symbol: 'Rb', name: 'Rubidium', nameJa: 'ルビジウム', mass: '85.47', category: 'alkali', row: 5, col: 1 },
  { number: 38, symbol: 'Sr', name: 'Strontium', nameJa: 'ストロンチウム', mass: '87.62', category: 'alkaline', row: 5, col: 2 },
  { number: 39, symbol: 'Y', name: 'Yttrium', nameJa: 'イットリウム', mass: '88.91', category: 'transition', row: 5, col: 3 },
  { number: 40, symbol: 'Zr', name: 'Zirconium', nameJa: 'ジルコニウム', mass: '91.22', category: 'transition', row: 5, col: 4 },
  { number: 41, symbol: 'Nb', name: 'Niobium', nameJa: 'ニオブ', mass: '92.91', category: 'transition', row: 5, col: 5 },
  { number: 42, symbol: 'Mo', name: 'Molybdenum', nameJa: 'モリブデン', mass: '95.95', category: 'transition', row: 5, col: 6 },
  { number: 43, symbol: 'Tc', name: 'Technetium', nameJa: 'テクネチウム', mass: '98', category: 'transition', row: 5, col: 7 },
  { number: 44, symbol: 'Ru', name: 'Ruthenium', nameJa: 'ルテニウム', mass: '101.1', category: 'transition', row: 5, col: 8 },
  { number: 45, symbol: 'Rh', name: 'Rhodium', nameJa: 'ロジウム', mass: '102.9', category: 'transition', row: 5, col: 9 },
  { number: 46, symbol: 'Pd', name: 'Palladium', nameJa: 'パラジウム', mass: '106.4', category: 'transition', row: 5, col: 10 },
  { number: 47, symbol: 'Ag', name: 'Silver', nameJa: '銀', mass: '107.9', category: 'transition', row: 5, col: 11 },
  { number: 48, symbol: 'Cd', name: 'Cadmium', nameJa: 'カドミウム', mass: '112.4', category: 'transition', row: 5, col: 12 },
  { number: 49, symbol: 'In', name: 'Indium', nameJa: 'インジウム', mass: '114.8', category: 'post-transition', row: 5, col: 13 },
  { number: 50, symbol: 'Sn', name: 'Tin', nameJa: 'スズ', mass: '118.7', category: 'post-transition', row: 5, col: 14 },
  { number: 51, symbol: 'Sb', name: 'Antimony', nameJa: 'アンチモン', mass: '121.8', category: 'metalloid', row: 5, col: 15 },
  { number: 52, symbol: 'Te', name: 'Tellurium', nameJa: 'テルル', mass: '127.6', category: 'metalloid', row: 5, col: 16 },
  { number: 53, symbol: 'I', name: 'Iodine', nameJa: 'ヨウ素', mass: '126.9', category: 'halogen', row: 5, col: 17 },
  { number: 54, symbol: 'Xe', name: 'Xenon', nameJa: 'キセノン', mass: '131.3', category: 'noble-gas', row: 5, col: 18 },
  
  // Period 6
  { number: 55, symbol: 'Cs', name: 'Cesium', nameJa: 'セシウム', mass: '132.9', category: 'alkali', row: 6, col: 1 },
  { number: 56, symbol: 'Ba', name: 'Barium', nameJa: 'バリウム', mass: '137.3', category: 'alkaline', row: 6, col: 2 },
  { number: 57, symbol: 'La', name: 'Lanthanum', nameJa: 'ランタン', mass: '138.9', category: 'lanthanide', row: 6, col: 3 },
  { number: 72, symbol: 'Hf', name: 'Hafnium', nameJa: 'ハフニウム', mass: '178.5', category: 'transition', row: 6, col: 4 },
  { number: 73, symbol: 'Ta', name: 'Tantalum', nameJa: 'タンタル', mass: '180.9', category: 'transition', row: 6, col: 5 },
  { number: 74, symbol: 'W', name: 'Tungsten', nameJa: 'タングステン', mass: '183.8', category: 'transition', row: 6, col: 6 },
  { number: 75, symbol: 'Re', name: 'Rhenium', nameJa: 'レニウム', mass: '186.2', category: 'transition', row: 6, col: 7 },
  { number: 76, symbol: 'Os', name: 'Osmium', nameJa: 'オスミウム', mass: '190.2', category: 'transition', row: 6, col: 8 },
  { number: 77, symbol: 'Ir', name: 'Iridium', nameJa: 'イリジウム', mass: '192.2', category: 'transition', row: 6, col: 9 },
  { number: 78, symbol: 'Pt', name: 'Platinum', nameJa: '白金', mass: '195.1', category: 'transition', row: 6, col: 10 },
  { number: 79, symbol: 'Au', name: 'Gold', nameJa: '金', mass: '197.0', category: 'transition', row: 6, col: 11 },
  { number: 80, symbol: 'Hg', name: 'Mercury', nameJa: '水銀', mass: '200.6', category: 'transition', row: 6, col: 12 },
  { number: 81, symbol: 'Tl', name: 'Thallium', nameJa: 'タリウム', mass: '204.4', category: 'post-transition', row: 6, col: 13 },
  { number: 82, symbol: 'Pb', name: 'Lead', nameJa: '鉛', mass: '207.2', category: 'post-transition', row: 6, col: 14 },
  { number: 83, symbol: 'Bi', name: 'Bismuth', nameJa: 'ビスマス', mass: '209.0', category: 'post-transition', row: 6, col: 15 },
  { number: 84, symbol: 'Po', name: 'Polonium', nameJa: 'ポロニウム', mass: '209', category: 'metalloid', row: 6, col: 16 },
  { number: 85, symbol: 'At', name: 'Astatine', nameJa: 'アスタチン', mass: '210', category: 'halogen', row: 6, col: 17 },
  { number: 86, symbol: 'Rn', name: 'Radon', nameJa: 'ラドン', mass: '222', category: 'noble-gas', row: 6, col: 18 },
  
  // Period 7
  { number: 87, symbol: 'Fr', name: 'Francium', nameJa: 'フランシウム', mass: '223', category: 'alkali', row: 7, col: 1 },
  { number: 88, symbol: 'Ra', name: 'Radium', nameJa: 'ラジウム', mass: '226', category: 'alkaline', row: 7, col: 2 },
  { number: 89, symbol: 'Ac', name: 'Actinium', nameJa: 'アクチニウム', mass: '227', category: 'actinide', row: 7, col: 3 },
  { number: 104, symbol: 'Rf', name: 'Rutherfordium', nameJa: 'ラザホージウム', mass: '267', category: 'transition', row: 7, col: 4 },
  { number: 105, symbol: 'Db', name: 'Dubnium', nameJa: 'ドブニウム', mass: '268', category: 'transition', row: 7, col: 5 },
  { number: 106, symbol: 'Sg', name: 'Seaborgium', nameJa: 'シーボーギウム', mass: '269', category: 'transition', row: 7, col: 6 },
  { number: 107, symbol: 'Bh', name: 'Bohrium', nameJa: 'ボーリウム', mass: '270', category: 'transition', row: 7, col: 7 },
  { number: 108, symbol: 'Hs', name: 'Hassium', nameJa: 'ハッシウム', mass: '277', category: 'transition', row: 7, col: 8 },
  { number: 109, symbol: 'Mt', name: 'Meitnerium', nameJa: 'マイトネリウム', mass: '278', category: 'transition', row: 7, col: 9 },
  { number: 110, symbol: 'Ds', name: 'Darmstadtium', nameJa: 'ダームスタチウム', mass: '281', category: 'transition', row: 7, col: 10 },
  { number: 111, symbol: 'Rg', name: 'Roentgenium', nameJa: 'レントゲニウム', mass: '282', category: 'transition', row: 7, col: 11 },
  { number: 112, symbol: 'Cn', name: 'Copernicium', nameJa: 'コペルニシウム', mass: '285', category: 'transition', row: 7, col: 12 },
  { number: 113, symbol: 'Nh', name: 'Nihonium', nameJa: 'ニホニウム', mass: '286', category: 'post-transition', row: 7, col: 13 },
  { number: 114, symbol: 'Fl', name: 'Flerovium', nameJa: 'フレロビウム', mass: '289', category: 'post-transition', row: 7, col: 14 },
  { number: 115, symbol: 'Mc', name: 'Moscovium', nameJa: 'モスコビウム', mass: '290', category: 'post-transition', row: 7, col: 15 },
  { number: 116, symbol: 'Lv', name: 'Livermorium', nameJa: 'リバモリウム', mass: '293', category: 'post-transition', row: 7, col: 16 },
  { number: 117, symbol: 'Ts', name: 'Tennessine', nameJa: 'テネシン', mass: '294', category: 'halogen', row: 7, col: 17 },
  { number: 118, symbol: 'Og', name: 'Oganesson', nameJa: 'オガネソン', mass: '294', category: 'noble-gas', row: 7, col: 18 },
  
  // Lanthanides (row 9)
  { number: 58, symbol: 'Ce', name: 'Cerium', nameJa: 'セリウム', mass: '140.1', category: 'lanthanide', row: 9, col: 4 },
  { number: 59, symbol: 'Pr', name: 'Praseodymium', nameJa: 'プラセオジム', mass: '140.9', category: 'lanthanide', row: 9, col: 5 },
  { number: 60, symbol: 'Nd', name: 'Neodymium', nameJa: 'ネオジム', mass: '144.2', category: 'lanthanide', row: 9, col: 6 },
  { number: 61, symbol: 'Pm', name: 'Promethium', nameJa: 'プロメチウム', mass: '145', category: 'lanthanide', row: 9, col: 7 },
  { number: 62, symbol: 'Sm', name: 'Samarium', nameJa: 'サマリウム', mass: '150.4', category: 'lanthanide', row: 9, col: 8 },
  { number: 63, symbol: 'Eu', name: 'Europium', nameJa: 'ユウロピウム', mass: '152.0', category: 'lanthanide', row: 9, col: 9 },
  { number: 64, symbol: 'Gd', name: 'Gadolinium', nameJa: 'ガドリニウム', mass: '157.3', category: 'lanthanide', row: 9, col: 10 },
  { number: 65, symbol: 'Tb', name: 'Terbium', nameJa: 'テルビウム', mass: '158.9', category: 'lanthanide', row: 9, col: 11 },
  { number: 66, symbol: 'Dy', name: 'Dysprosium', nameJa: 'ジスプロシウム', mass: '162.5', category: 'lanthanide', row: 9, col: 12 },
  { number: 67, symbol: 'Ho', name: 'Holmium', nameJa: 'ホルミウム', mass: '164.9', category: 'lanthanide', row: 9, col: 13 },
  { number: 68, symbol: 'Er', name: 'Erbium', nameJa: 'エルビウム', mass: '167.3', category: 'lanthanide', row: 9, col: 14 },
  { number: 69, symbol: 'Tm', name: 'Thulium', nameJa: 'ツリウム', mass: '168.9', category: 'lanthanide', row: 9, col: 15 },
  { number: 70, symbol: 'Yb', name: 'Ytterbium', nameJa: 'イッテルビウム', mass: '173.0', category: 'lanthanide', row: 9, col: 16 },
  { number: 71, symbol: 'Lu', name: 'Lutetium', nameJa: 'ルテチウム', mass: '175.0', category: 'lanthanide', row: 9, col: 17 },
  
  // Actinides (row 10)
  { number: 90, symbol: 'Th', name: 'Thorium', nameJa: 'トリウム', mass: '232.0', category: 'actinide', row: 10, col: 4 },
  { number: 91, symbol: 'Pa', name: 'Protactinium', nameJa: 'プロトアクチニウム', mass: '231.0', category: 'actinide', row: 10, col: 5 },
  { number: 92, symbol: 'U', name: 'Uranium', nameJa: 'ウラン', mass: '238.0', category: 'actinide', row: 10, col: 6 },
  { number: 93, symbol: 'Np', name: 'Neptunium', nameJa: 'ネプツニウム', mass: '237', category: 'actinide', row: 10, col: 7 },
  { number: 94, symbol: 'Pu', name: 'Plutonium', nameJa: 'プルトニウム', mass: '244', category: 'actinide', row: 10, col: 8 },
  { number: 95, symbol: 'Am', name: 'Americium', nameJa: 'アメリシウム', mass: '243', category: 'actinide', row: 10, col: 9 },
  { number: 96, symbol: 'Cm', name: 'Curium', nameJa: 'キュリウム', mass: '247', category: 'actinide', row: 10, col: 10 },
  { number: 97, symbol: 'Bk', name: 'Berkelium', nameJa: 'バークリウム', mass: '247', category: 'actinide', row: 10, col: 11 },
  { number: 98, symbol: 'Cf', name: 'Californium', nameJa: 'カリホルニウム', mass: '251', category: 'actinide', row: 10, col: 12 },
  { number: 99, symbol: 'Es', name: 'Einsteinium', nameJa: 'アインスタイニウム', mass: '252', category: 'actinide', row: 10, col: 13 },
  { number: 100, symbol: 'Fm', name: 'Fermium', nameJa: 'フェルミウム', mass: '257', category: 'actinide', row: 10, col: 14 },
  { number: 101, symbol: 'Md', name: 'Mendelevium', nameJa: 'メンデレビウム', mass: '258', category: 'actinide', row: 10, col: 15 },
  { number: 102, symbol: 'No', name: 'Nobelium', nameJa: 'ノーベリウム', mass: '259', category: 'actinide', row: 10, col: 16 },
  { number: 103, symbol: 'Lr', name: 'Lawrencium', nameJa: 'ローレンシウム', mass: '266', category: 'actinide', row: 10, col: 17 },
]
