/**
 * physics/elementInfo.js
 * -----------------------------------------------------------------------
 * Descriptive chemistry for all 118 elements: a standard nine-way category
 * (used to color the periodic table grid, following the convention used on
 * most printed tables) plus a short, factual explanation of each element's
 * real-world properties, discovery, and uses — shown when that element is
 * selected in the Atomic Structure lab.
 *
 * Categories follow the widely-taught classification. A few boundary calls
 * are genuinely debated among chemists (e.g. whether Zn/Cd/Hg count as
 * "transition metals" since their d-subshell is full, or exactly which six
 * or seven elements are "metalloids"); this file makes the same choices
 * most general-chemistry textbooks and periodic table posters do. For the
 * heaviest synthetic elements (roughly Z ≥ 104), only a few atoms have ever
 * been produced, each surviving fractions of a second — their listed
 * category and any chemical behavior is therefore extrapolated from
 * periodic trends and quantum-chemical prediction, not direct observation;
 * the summaries say so explicitly where that matters.
 * -----------------------------------------------------------------------
 */

export const CATEGORY_LABEL = {
  alkali: "Alkali metal",
  alkaline: "Alkaline earth metal",
  transition: "Transition metal",
  lanthanide: "Lanthanide",
  actinide: "Actinide",
  posttransition: "Post-transition metal",
  metalloid: "Metalloid",
  nonmetal: "Nonmetal",
  halogen: "Halogen",
  noble: "Noble gas",
};

export const CATEGORY_COLOR = {
  alkali: "#ef5b6f",
  alkaline: "#f2a94e",
  transition: "#5b8def",
  lanthanide: "#c084fc",
  actinide: "#a374e8",
  posttransition: "#6bd68a",
  metalloid: "#d9c25c",
  nonmetal: "#4fd8e0",
  halogen: "#35b6c9",
  noble: "#8fa8c8",
};

// [category, summary] keyed by Z, 1..118.
const RAW = {
  1: ["nonmetal", "The simplest and most abundant element in the universe, making up roughly 75% of all normal matter. A colorless, odorless gas at room temperature that occurs almost entirely combined with other elements on Earth — chiefly in water — despite sitting atop the alkali-metal column."],
  2: ["noble", "A colorless, inert gas produced by nuclear fusion in stars and by the radioactive decay of heavy elements underground. Too light and unreactive to form stable compounds, it's used to fill balloons and airships and to cool superconducting magnets in MRI scanners."],
  3: ["alkali", "The lightest metal, soft enough to cut with a knife and so reactive it's stored under oil to keep it from reacting with air. Best known today as the active material in lithium-ion batteries."],
  4: ["alkaline", "A lightweight, stiff, toxic gray metal prized in aerospace and X-ray equipment for being nearly transparent to X-rays while remaining strong. Beryl, its principal ore mineral, is also the source of emerald and aquamarine gemstones."],
  5: ["metalloid", "A hard, brittle semiconductor-like element rarely found free in nature. Combined with oxygen it forms borax and boric acid, and boron compounds toughen glass (borosilicate/Pyrex) and are essential trace nutrients for plants."],
  6: ["nonmetal", "The backbone of all known organic chemistry and life on Earth, uniquely able to form long chains and rings with itself. Its pure forms range from soft graphite to the hardest natural material, diamond, depending only on how the atoms are bonded."],
  7: ["nonmetal", "Makes up about 78% of Earth's atmosphere as an inert diatomic gas, yet is an essential building block of amino acids and DNA. Industrially fixed into ammonia by the Haber-Bosch process to make most of the world's fertilizer."],
  8: ["nonmetal", "The most abundant element in Earth's crust and oceans and the second most abundant gas in the atmosphere. Essential for cellular respiration in nearly all complex life, and for combustion."],
  9: ["halogen", "The most reactive and electronegative element on the periodic table, existing as a pale yellow, highly corrosive gas. Its compounds include the fluoride added to drinking water and toothpaste, and the Teflon coating on nonstick cookware."],
  10: ["noble", "A colorless, inert gas best known for the orange-red glow it produces in electrified glass tubes — the original 'neon sign.' Obtained industrially by distilling liquid air, of which it is only a trace component."],
  11: ["alkali", "A soft, silvery metal so reactive it fizzes and can ignite on contact with water. Almost never found free in nature, but its compound with chlorine — table salt — is essential to animal life and abundant in seawater."],
  12: ["alkaline", "A lightweight, silvery structural metal that burns with a brilliant white flame, used in flares and fireworks as well as aluminum alloys. The magnesium ion sits at the center of every chlorophyll molecule in green plants."],
  13: ["posttransition", "The most abundant metal in Earth's crust, though too reactive to occur free — it's refined from bauxite ore by electrolysis. Its light weight, corrosion resistance, and recyclability make it central to aircraft, packaging, and construction."],
  14: ["metalloid", "The second most abundant element in Earth's crust, mostly locked up as silica (sand) and silicate minerals. As an ultra-pure crystal it is the semiconductor at the heart of virtually every modern computer chip."],
  15: ["nonmetal", "Essential to DNA, ATP, and bone, phosphorus never occurs free in nature and was first isolated from evaporated urine in 1669. Its white allotrope is highly flammable and toxic, while red phosphorus (used in match strikers) is comparatively stable."],
  16: ["nonmetal", "A brittle yellow solid known since antiquity for its role in gunpowder and its pungent smell when burned. Today mostly converted into sulfuric acid, the single most-produced industrial chemical, used in fertilizer and countless manufacturing processes."],
  17: ["halogen", "A dense, greenish-yellow toxic gas used since World War I as a chemical weapon, but far better known today for disinfecting drinking water and swimming pools and as a feedstock for PVC plastic."],
  18: ["noble", "The third most abundant gas in Earth's atmosphere (about 1%) and the most abundant noble gas by far. Its complete inertness makes it useful for filling incandescent light bulbs and shielding metal during welding."],
  19: ["alkali", "A soft, silvery-white metal even more reactive than sodium, violently displacing hydrogen from water. Essential to every living cell for nerve signaling and muscle contraction, and a core ingredient of agricultural fertilizer."],
  20: ["alkaline", "The most abundant metal in the human body, forming the mineral structure of bones and teeth as calcium phosphate. As the metal itself it's silvery and reactive, but it's almost always encountered combined, notably in limestone and chalk."],
  21: ["transition", "A rare, soft silvery-white metal predicted by Mendeleev before its 1879 discovery. Today it's alloyed with aluminum for lightweight sports equipment (like baseball bats and bicycle frames) and aerospace parts."],
  22: ["transition", "A strong, lightweight, highly corrosion-resistant metal — about as strong as steel at roughly half the weight. Used in jet engines, spacecraft, and surgical implants; titanium dioxide is also the bright white pigment in most white paint."],
  23: ["transition", "A soft, silvery-gray metal almost never used pure. Alloyed into steel it dramatically increases strength and shock resistance, which is why vanadium steel became prized for tools, springs, and the Ford Model T's chassis."],
  24: ["transition", "A hard, lustrous metal that gives stainless steel its corrosion resistance and chrome plating its mirror shine. Its compounds produce some of the most vivid pigments known, including the deep green of emerald and the red of ruby."],
  25: ["transition", "A hard, brittle gray-white metal, the fourth most-used metal by tonnage worldwide, almost entirely as a steelmaking additive that removes impurities and adds strength. It's also an essential trace nutrient for enzyme function."],
  26: ["transition", "The most widely used metal on Earth and the primary component of steel. Also the core element of hemoglobin, the protein that carries oxygen in blood, and the dominant element by mass of the Earth's core."],
  27: ["transition", "A hard, lustrous, ferromagnetic metal that has colored glass and ceramics a deep blue since antiquity ('cobalt blue'). Today critical to the cathodes of lithium-ion batteries and to high-temperature superalloys used in jet turbines."],
  28: ["transition", "A hard, corrosion-resistant, silvery-white metal, alloyed into stainless steel and coinage worldwide (the US five-cent coin owes its nickname to it). Also a key component of rechargeable batteries and superalloys."],
  29: ["transition", "One of the few metals with a natural color other than gray or silver, and among the first metals worked by humans. Its excellent electrical conductivity makes it the standard material for wiring, while its alloys give us bronze and brass."],
  30: ["transition", "A bluish-white metal used mainly to galvanize steel — coating it to prevent rust — and as an alloying element in brass. It's also an essential trace nutrient in the human diet, important for immune function and wound healing."],
  31: ["posttransition", "A silvery metal with a startlingly low melting point (about 30°C) — it will melt in your hand. Predicted by Mendeleev before its 1875 discovery, it's now essential to LEDs and semiconductors as gallium arsenide and gallium nitride."],
  32: ["metalloid", "A grayish-white metalloid, another element predicted by Mendeleev before its 1886 discovery. An early semiconductor material for transistors, it's now used mainly in fiber-optic and infrared-lens glass and in some solar cells."],
  33: ["metalloid", "A notorious poison since antiquity, arsenic is a brittle gray metalloid that in trace, controlled forms is used in semiconductor doping (gallium arsenide) and, historically, in wood preservatives and pesticides."],
  34: ["nonmetal", "A metalloid-adjacent nonmetal whose electrical conductivity changes dramatically with light exposure, which made it useful in early photocells and photocopiers. It's also an essential trace dietary nutrient, though toxic in excess."],
  35: ["halogen", "The only nonmetallic element that is liquid at room temperature — a dense, reddish-brown, corrosive liquid that gives off a sharp irritating vapor (its name comes from the Greek for 'stench'). Used in flame retardants and historically in photographic film."],
  36: ["noble", "A colorless, inert trace gas in Earth's atmosphere, used in energy-efficient fluorescent lighting and some camera flashes. Its orange-red spectral line was used from 1960–1983 to define the international standard meter."],
  37: ["alkali", "A soft, silvery-white metal so reactive it ignites spontaneously in air and reacts violently with water. Used in precision atomic clocks and, because of its radioactive isotope's slow decay, in geological dating of ancient rocks."],
  38: ["alkaline", "A soft, silvery metal whose compounds burn with a brilliant red flame, making it the standard ingredient in red fireworks and highway flares. Strontium-90, a radioactive fission product, is a well-known nuclear-fallout hazard because it mimics calcium in bone."],
  39: ["transition", "A silvery transition metal, chemically similar to the lanthanides it's often grouped with. Used in red phosphors for older CRT and LED displays and in yttrium-aluminum-garnet (YAG) crystals for solid-state lasers."],
  40: ["transition", "A lustrous, highly corrosion-resistant metal, nearly transparent to neutrons, which makes it the standard cladding material for nuclear fuel rods. Its oxide, cubic zirconia, is a popular inexpensive diamond substitute."],
  41: ["transition", "A soft, ductile, blue-tinged gray metal used mainly to strengthen steel alloys for pipelines and structural beams. Also a key ingredient in superconducting magnet wire, including in MRI machines and particle accelerators."],
  42: ["transition", "A hard, silvery metal with one of the highest melting points of any element, used to make steel alloys tougher and more heat-resistant for tools, engine parts, and armor plating. Also an essential trace nutrient for enzymes in nearly all living things."],
  43: ["transition", "The lightest element with no stable isotopes — every atom is radioactive — and the first element ever produced artificially (1937), filling a gap Mendeleev had left open. Its isotope Tc-99m is the most widely used radioactive tracer in medical imaging."],
  44: ["transition", "A rare, hard, silvery-white platinum-group metal used to harden platinum and palladium alloys for electrical contacts and jewelry, and as a catalyst in some industrial processes and dye-sensitized solar cells."],
  45: ["transition", "One of the rarest and most expensive precious metals, a hard, reflective silvery-white platinum-group metal used almost entirely as the key catalyst in automobile catalytic converters, which reduce nitrogen oxide emissions."],
  46: ["transition", "A silvery-white platinum-group metal used heavily in catalytic converters and in multilayer ceramic capacitors inside electronics. Uniquely able to absorb up to 900 times its own volume of hydrogen gas."],
  47: ["transition", "The metal with the highest electrical and thermal conductivity of any element, long prized for jewelry and coinage for its bright white luster. Also valued historically for photographic film (silver halides) and today for its antibacterial properties."],
  48: ["transition", "A soft, toxic, bluish-white metal once widely used in rechargeable nickel-cadmium batteries and as a bright yellow-to-red pigment. Use has declined sharply due to toxicity, though it remains important in some thin-film solar cells."],
  49: ["posttransition", "A soft, silvery, very malleable metal that famously lets out a high-pitched 'cry' when bent. Its main modern use is indium tin oxide, the transparent electrically conductive coating on touchscreens and flat-panel displays."],
  50: ["posttransition", "A soft, silvery-white metal known since the Bronze Age for alloying with copper to make bronze. Today used mainly to coat steel cans (tin-plating) and as a key ingredient in solder for joining electronic components."],
  51: ["metalloid", "A brittle, silvery-blue metalloid known since antiquity — its ore, stibnite, was used as the ancient eye cosmetic kohl. Today used mainly as a flame retardant additive and to harden lead alloys for batteries and bullets."],
  52: ["metalloid", "A rare, brittle, silvery-white metalloid whose compounds give a strong garlic-like odor to anyone exposed to them. Used in some thermoelectric devices and in cadmium telluride thin-film solar panels."],
  53: ["halogen", "A lustrous blue-black solid that sublimes directly into a violet vapor when heated. Essential in trace amounts for making thyroid hormone, which is why table salt is commonly iodized to prevent deficiency."],
  54: ["noble", "A rare, heavy, colorless noble gas — the least chemically inert of the stable noble gases, forming a handful of genuine compounds. Used in high-intensity camera flashes, some car headlights, and as an efficient ion-thruster propellant."],
  55: ["alkali", "The most reactive of the stable alkali metals and one of only a few metals liquid near room temperature (melting at about 28°C). The vibration frequency of a caesium-133 atom's electron transition defines the SI second itself."],
  56: ["alkaline", "A soft, silvery-white reactive metal whose insoluble sulfate compound is opaque to X-rays and safe to ingest, making it the standard 'barium meal' used to image the digestive tract."],
  57: ["lanthanide", "A soft, silvery, highly reactive metal that gives its name to the entire lanthanide series. Used in high-refractive-index camera and telescope lenses and, in nickel-metal-hydride form, in hybrid-car batteries."],
  58: ["lanthanide", "The most abundant of all the rare-earth elements — actually more common in Earth's crust than copper. Its ability to readily give up electrons makes it useful in catalytic converters, self-cleaning ovens, and lighter flints."],
  59: ["lanthanide", "A soft, silvery rare-earth metal whose name means 'green twin' for the pale green color of its oxide. Used to color glass and ceramics yellow and to strengthen magnesium alloys for aircraft engines."],
  60: ["lanthanide", "The rare-earth element behind the strongest permanent magnets commercially available (neodymium-iron-boron magnets), found in headphones, hard drives, and electric-vehicle motors. Also used to tint glass and in high-power lasers."],
  61: ["lanthanide", "The only lanthanide with no stable isotopes, found in nature only in trace amounts from uranium decay. Produced artificially for use in glow-in-the-dark paint and small nuclear-powered batteries for remote sensors."],
  62: ["lanthanide", "A silvery rare-earth metal used with cobalt to make samarium-cobalt magnets, which hold their magnetism at much higher temperatures than neodymium magnets. Also used as a neutron absorber in some reactor control rods."],
  63: ["lanthanide", "The most reactive of the rare-earth metals, valued for the sharp red and blue phosphors it produces under excitation — historically essential to color television tubes and still used in euro banknote anti-counterfeiting ink."],
  64: ["lanthanide", "A silvery rare-earth metal with an unusually high capacity to absorb neutrons and strong magnetic properties. Its compounds are the standard contrast agent injected before many MRI scans to sharpen the image."],
  65: ["lanthanide", "A silvery rare-earth metal whose compounds glow bright green under excitation, used in fluorescent lighting phosphors and in Terfenol-D, an alloy that changes shape dramatically in a magnetic field, used in sonar and actuators."],
  66: ["lanthanide", "A soft, silvery rare-earth metal with an extremely high melting point and strong magnetic response even at high temperature. Added in small amounts to neodymium magnets to keep them from weakening when hot, essential in EV motors."],
  67: ["lanthanide", "The element with the highest magnetic strength of any naturally occurring element, used to create the strongest artificial magnetic fields achievable. Also used to color cubic zirconia and glass, and in surgical lasers."],
  68: ["lanthanide", "A silvery rare-earth metal best known for erbium-doped fiber amplifiers, which boost light signals directly inside long-distance fiber-optic cables without converting them back to electricity. Also gives glass a pink tint."],
  69: ["lanthanide", "The second-rarest naturally occurring lanthanide (after promethium, which is essentially absent in nature), a soft silvery metal used in portable X-ray devices and some solid-state medical lasers."],
  70: ["lanthanide", "A soft, silvery rare-earth metal used in fiber-laser and atomic-clock applications — ytterbium optical lattice clocks are among the most precise timekeeping devices ever built. Also used as a stress-gauge material in explosives testing."],
  71: ["lanthanide", "The heaviest, hardest, and most expensive naturally occurring lanthanide, marking the end of the series. Has few large-scale uses, though lutetium-based scintillator crystals are used in PET medical scanners."],
  72: ["transition", "A shiny, silvery, corrosion-resistant metal chemically very similar to zirconium, yet unusually for its group an excellent neutron absorber — the opposite of zirconium — which makes it ideal for nuclear reactor control rods."],
  73: ["transition", "An extremely corrosion-resistant, high-melting-point metal, biocompatible enough for surgical implants. Its main modern use is in tiny, reliable tantalum capacitors found in almost every smartphone and laptop."],
  74: ["transition", "The metal with the highest melting point of any element (about 3,400°C), which is why it was the standard filament material in incandescent light bulbs for a century. Also alloyed into the hardest cutting tools and armor-piercing ammunition."],
  75: ["transition", "One of the rarest and densest metals in Earth's crust, discovered nearly last among the stable elements (1925). Alloyed into single-crystal turbine blades for jet engines, where its extreme heat resistance is critical."],
  76: ["transition", "The densest naturally occurring element, a hard, brittle, blue-white metal. Its oxide is highly toxic and volatile, so it's mostly alloyed with other platinum-group metals for extremely hard-wearing fountain-pen tips and electrical contacts."],
  77: ["transition", "The most corrosion-resistant metal known and, along with osmium, one of the two densest elements. A thin worldwide layer of iridium-rich clay marks the Cretaceous-Paleogene boundary, key evidence for the asteroid impact that ended the age of dinosaurs."],
  78: ["transition", "A dense, unreactive, lustrous precious metal, prized for jewelry and as a highly effective catalyst — it's a core component of catalytic converters and of the electrodes used in hydrogen fuel cells."],
  79: ["transition", "One of the least reactive metals known, which along with its rarity and luster has made it a store of value across nearly every human civilization. Also an excellent electrical conductor used in plating for high-reliability connectors."],
  80: ["transition", "The only metal that is liquid at room temperature, long used in thermometers, barometers, and old-style fluorescent lighting. Now heavily restricted in most applications because of its high toxicity to the nervous system."],
  81: ["posttransition", "A soft, malleable, bluish-white metal notoriously used as an odorless, tasteless poison, nicknamed 'inheritance powder.' It does have legitimate uses, including in some infrared optics and historically in rodenticides, now largely banned."],
  82: ["posttransition", "A soft, dense, highly malleable metal used by humans for millennia in plumbing, pigments, and ammunition. Now known to be a potent neurotoxin, so its use in paint, gasoline, and plumbing has been phased out worldwide, though it remains standard in car batteries."],
  83: ["posttransition", "A brittle, pinkish-tinged metal famous for growing spectacular rainbow-hued, stair-stepped crystals as it cools. Among the least toxic heavy metals, it has largely replaced lead in plumbing solder, fishing weights, and Pepto-Bismol's active ingredient."],
  84: ["metalloid", "A rare, extremely radioactive metalloid discovered and named by Marie Curie after her native Poland. Intensely toxic in even microgram quantities, it gained notoriety as the poison used in the 2006 assassination of Alexander Litvinenko."],
  85: ["halogen", "The rarest naturally occurring element on Earth — its longest-lived isotopes decay within hours, so only a vanishingly small amount exists in the crust at any moment, too little to ever have been seen with the naked eye. Being studied for targeted cancer radiotherapy."],
  86: ["noble", "A colorless, radioactive noble gas produced by the decay of uranium and thorium in soil and rock. It can seep into basements and is the second-leading cause of lung cancer after smoking, which is why home radon testing is recommended in many regions."],
  87: ["alkali", "The most unstable of the first 101 elements and among the rarest elements on Earth, since its longest-lived isotope has a half-life of just 22 minutes — only a vanishingly small amount is estimated to exist naturally at any moment."],
  88: ["alkaline", "A luminous, intensely radioactive metal discovered by Marie and Pierre Curie in 1898. Once used in glow-in-the-dark watch dials — until the danger to the workers who painted them became tragically clear — it is no longer used commercially."],
  89: ["actinide", "A silvery, intensely radioactive metal that glows faintly blue in the dark from the energy of its own radiation, and gives its name to the actinide series. Too rare and radioactive for practical use beyond research and as a neutron source."],
  90: ["actinide", "A silvery, radioactive metal about three times more abundant in Earth's crust than uranium. Historically used in the mantles of gas camping lanterns for its bright white light, and studied as a potentially safer alternative nuclear fuel."],
  91: ["actinide", "A rare, dense, highly radioactive and toxic metal with almost no uses outside of scientific research. Its scarcity and hazard made it one of the last naturally occurring elements to be isolated in pure metallic form."],
  92: ["actinide", "The heaviest naturally occurring element in significant quantity, famous as the fuel for nuclear reactors and the original material of the atomic bomb. Its slow radioactive decay also generates much of the internal heat keeping Earth's interior molten."],
  93: ["actinide", "The first transuranium element ever synthesized (1940), named to continue the solar-system naming pattern after uranium. Produced today mainly as a byproduct of nuclear reactors, with limited use in neutron-detection instruments."],
  94: ["actinide", "An intensely radioactive, silvery metal that tarnishes readily and is a key fuel for both nuclear weapons and reactors. Its isotope Pu-238 also powers the radioisotope generators aboard deep-space probes like Voyager and the Mars rovers."],
  95: ["actinide", "A synthetic radioactive metal first made during the Manhattan Project. A tiny amount of its isotope Am-241 is used as the ionization source in most household smoke detectors."],
  96: ["actinide", "A synthetic radioactive metal named after Marie and Pierre Curie — the only element named after two real people. Used as a compact heat source for spacecraft instruments and as an alpha-particle source for Mars rover spectrometers."],
  97: ["actinide", "A synthetic radioactive metal first produced in 1949 at the University of California, Berkeley, for which it's named. Exists only in microgram quantities and has no uses beyond scientific research, including as a target for synthesizing heavier elements."],
  98: ["actinide", "A synthetic radioactive metal that is one of the very few transuranium elements with an actual practical use: as a compact, portable neutron source for starting up nuclear reactors, detecting metal fatigue, and assaying gold and silver ore."],
  99: ["actinide", "A synthetic radioactive element first identified in debris from the 1952 'Ivy Mike' hydrogen bomb test and named after Albert Einstein. Produced only in microgram-or-smaller amounts, with no uses beyond basic research."],
  100: ["actinide", "A synthetic radioactive element also first identified in hydrogen-bomb test debris, named after physicist Enrico Fermi. The heaviest element that can still be made in weighable (though minuscule) quantities via neutron bombardment."],
  101: ["actinide", "First made in 1955 by bombarding einsteinium with helium nuclei — famously identified from just a handful of atoms, a landmark in doing chemistry one atom at a time. Named in honor of Dmitri Mendeleev, creator of the periodic table."],
  102: ["actinide", "A synthetic radioactive element named after Alfred Nobel and the institution where it was first credibly synthesized. Exists only fleetingly in particle-accelerator experiments, with no practical application."],
  103: ["actinide", "The last member of the actinide series, named after Ernest Lawrence, inventor of the cyclotron particle accelerator used to create many superheavy elements. Produced only a few atoms at a time and studied purely to probe the edge of the periodic table."],
  104: ["transition", "The first transactinide element, named after physicist Ernest Rutherford. Produced only a handful of atoms at a time in particle accelerators, with a half-life measured in seconds — far too little exists to study more than its most basic chemistry."],
  105: ["transition", "A superheavy synthetic element named after Dubna, Russia, home of the Joint Institute for Nuclear Research where it was co-discovered. Like its neighbors, only ever produced a few atoms at a time, decaying within seconds."],
  106: ["transition", "Named after Glenn Seaborg, the chemist who helped discover plutonium and nine other transuranium elements — one of very few elements named after a person who was still alive at the time. Exists only briefly in accelerator experiments."],
  107: ["transition", "A superheavy synthetic element named after physicist Niels Bohr. Only a few atoms have ever been produced, each surviving less than a second before radioactively decaying, leaving its chemistry almost entirely theoretical."],
  108: ["transition", "Named after Hesse, the German state where it was first synthesized at the GSI Helmholtz Centre. Predicted to be one of the densest elements possible, though far too little of it has ever existed at once to measure directly."],
  109: ["transition", "Named after physicist Lise Meitner, who co-discovered nuclear fission but was overlooked for the Nobel Prize awarded for that work. Produced one atom at a time by fusing bismuth and iron nuclei in a particle accelerator."],
  110: ["transition", "Named after Darmstadt, Germany, home of the GSI laboratory where it was discovered in 1994. Its predicted chemical behavior, extrapolated from trends up the periodic table, suggests it may resemble platinum — though this remains untested."],
  111: ["transition", "Named after Wilhelm Röntgen, discoverer of X-rays. Created by fusing bismuth and nickel nuclei in a particle accelerator, with only a handful of atoms ever detected, each decaying in a fraction of a second."],
  112: ["transition", "Named after astronomer Nicolaus Copernicus. Theoretical calculations suggest it could behave like an extremely volatile, almost noble-gas-like metal — potentially even a gas at room temperature — though this remains a prediction."],
  113: ["posttransition", "The first element discovered and named by an Asian research team (RIKEN, Japan) — its name honors Japan ('Nihon'). Confirmed in 2004 and officially named in 2016, with essentially nothing known about its chemistry beyond theoretical prediction."],
  114: ["posttransition", "Named after the Flerov Laboratory of Nuclear Reactions in Russia. Theory predicts it could be an unusually volatile, possibly even gaseous or liquid metal at room temperature, sitting near a hypothesized 'island of stability' of longer-lived superheavy nuclei."],
  115: ["posttransition", "Named after the Moscow region of Russia, home to the Joint Institute for Nuclear Research where it was co-discovered. Like its neighbors, it exists for only fractions of a second before decaying, so its chemistry is essentially unmeasured."],
  116: ["posttransition", "Named after the Lawrence Livermore National Laboratory in California, which collaborated on its discovery. A handful of atoms have been detected, each surviving only tens of milliseconds before radioactive decay."],
  117: ["halogen", "Named after the U.S. state of Tennessee, home to Oak Ridge National Laboratory and Vanderbilt University, key contributors to its discovery. Far too radioactive and scarce for its chemistry to be studied directly."],
  118: ["noble", "The heaviest element confirmed to date, named after physicist Yuri Oganessian, a leading figure in superheavy-element research. Theory suggests relativistic effects at such a high atomic number might make it surprisingly reactive rather than inert."],
};

export function getElementInfo(Z) {
  const entry = RAW[Z];
  if (!entry) return { category: "nonmetal", summary: "" };
  return { category: entry[0], summary: entry[1] };
}
