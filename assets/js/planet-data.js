// Single source of truth for planetary facts used by the 3D scene, the scale
// lab, and the quiz. Update numbers here — nothing else needs to change.
// Source: NASA Science, "Planet Sizes and Locations in Our Solar System"
// https://science.nasa.gov/solar-system/planet-sizes-and-locations-in-our-solar-system/

// gravity: surface gravity relative to Earth = 1.00
// tempC: average temperature in Celsius (NASA "by the numbers" pages)
// periodDays: orbital period in Earth days
export const PLANETS = [
  {name:'Mercury',diameter:'4,879 km',distance:'58 million km',au:'0.39 AU',r:0.52,orbit:7.5,color:0x8c8780,speed:.011,desc:'The smallest planet and the closest to the Sun.',gravity:0.38,tempC:167,periodDays:88},
  {name:'Venus',diameter:'12,104 km',distance:'108 million km',au:'0.72 AU',r:0.9,orbit:10.7,color:0xc8a476,speed:.008,desc:'Nearly Earth-sized, with a thick carbon-dioxide atmosphere.',gravity:0.91,tempC:464,periodDays:225},
  {name:'Earth',diameter:'12,756 km',distance:'149.7 million km',au:'1.00 AU',r:0.95,orbit:14,color:0x477e9d,speed:.0065,desc:'Our reference point for comparing the other planets.',gravity:1.00,tempC:15,periodDays:365.25},
  {name:'Mars',diameter:'6,792 km',distance:'227.9 million km',au:'1.52 AU',r:0.67,orbit:17.5,color:0xa6533d,speed:.0052,desc:'A cold rocky world with a thin atmosphere and two small moons.',gravity:0.38,tempC:-65,periodDays:687},
  {name:'Jupiter',diameter:'142,984 km',distance:'778 million km',au:'5.20 AU',r:3.65,orbit:24,color:0xc9a681,speed:.0028,desc:'The largest planet, a gas giant more than 11 Earth diameters wide.',gravity:2.53,tempC:-110,periodDays:4333},
  {name:'Saturn',diameter:'120,536 km',distance:'1.4 billion km',au:'9.58 AU',r:3.1,orbit:31,color:0xc9b88d,speed:.0021,desc:'A gas giant surrounded by a broad system of icy rings.',gravity:1.07,tempC:-140,periodDays:10759},
  {name:'Uranus',diameter:'51,118 km',distance:'2.9 billion km',au:'19.2 AU',r:1.8,orbit:38,color:0x74b8bd,speed:.0015,desc:'An ice giant that rotates on its side relative to most planets.',gravity:0.90,tempC:-195,periodDays:30687},
  {name:'Neptune',diameter:'49,528 km',distance:'4.5 billion km',au:'30.05 AU',r:1.72,orbit:45,color:0x4b72b9,speed:.0012,desc:'The most distant major planet, an ice giant with extremely fast winds.',gravity:1.14,tempC:-200,periodDays:60190}
];

export const SCALE_DATA = [
  {name:'Mercury', ratio:'0.38×', earths:'0.055 Earths', detail:'Diameter is 4,879 km. You could fit about 18 Mercurys inside Earth by volume.'},
  {name:'Venus', ratio:'0.95×', earths:'0.86 Earths', detail:'Diameter is 12,104 km. Nearly identical in size to Earth ("Earth\'s twin"), but with extreme greenhouse heat.'},
  {name:'Earth', ratio:'1.00×', earths:'1.00 Earth (Baseline)', detail:'Diameter is 12,756 km. Our standard reference for planetary scale.'},
  {name:'Mars', ratio:'0.53×', earths:'0.15 Earths', detail:'Diameter is 6,792 km. Just over half the width of Earth; about 6.6 Mars volumes fit inside Earth.'},
  {name:'Jupiter', ratio:'11.21×', earths:'1,321 Earths', detail:'Diameter is 142,984 km. Over 11 Earths lined up end-to-end, and over 1,300 Earths could fit inside its volume!'},
  {name:'Saturn', ratio:'9.45×', earths:'764 Earths', detail:'Diameter is 120,536 km (excluding rings). Rings span up to 282,000 km, yet are only tens of meters thick.'},
  {name:'Uranus', ratio:'4.01×', earths:'63 Earths', detail:'Diameter is 51,118 km. An ice giant wide enough to hold about 63 Earths inside.'},
  {name:'Neptune', ratio:'3.88×', earths:'58 Earths', detail:'Diameter is 49,528 km. Slightly smaller in diameter than Uranus, but more massive, holding ~58 Earth volumes.'}
];

export const QUIZ_BANK = [
  {q:'If Earth were placed exactly <strong>1 meter</strong> from the Sun in a classroom model, how far away would <strong>Neptune</strong> be?',
   options:[{label:'About 3 meters'},{label:'About 10 meters'},{label:'About 30 meters (end of hallway)',correct:true},{label:'Over 100 meters'}],
   right:'At 1 AU = 1 meter, Neptune (30.05 AU) is about <strong>30 meters away</strong> — the entire length of a school hallway! This illustrates why planet sizes must be exaggerated in solar system models.',
   wrong:'Neptune is 30 times farther from the Sun than Earth is (30.05 AU). If Earth is at 1 meter, Neptune is <strong>30 meters away</strong>!'},
  {q:'About how many Earths could fit inside <strong>Jupiter</strong> by volume?',
   options:[{label:'About 11'},{label:'About 100'},{label:'About 1,300',correct:true},{label:'About 10,000'}],
   right:'Jupiter\'s diameter is 11.2× Earth\'s, and volume scales with the cube of diameter, so roughly <strong>1,321 Earths</strong> could fit inside it.',
   wrong:'Jupiter\'s diameter is 11.2× Earth\'s. Volume scales with diameter cubed (11.2³ ≈ 1,321), so about <strong>1,321 Earths</strong> fit inside.'},
  {q:'Which is closer to the truth: in real life, are the planets in solar system diagrams usually drawn...',
   options:[{label:'Actual size, actual spacing'},{label:'Oversized, actual spacing'},{label:'Oversized, compressed spacing',correct:true},{label:'Actual size, compressed spacing'}],
   right:'Nearly every classroom or app diagram <strong>oversizes the planets and compresses the distances</strong> — otherwise the planets would be invisible dots kilometers apart on the page.',
   wrong:'Real diagrams almost always <strong>oversize the planets and compress the distances</strong> between them, or the planets would shrink to invisible dots.'}
];
