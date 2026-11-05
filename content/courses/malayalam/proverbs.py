import json, sys
# id, Malayalam, ISO, literal {en,fr,es}, sense {en,fr,es}
P = {
 1: ("മുറ്റത്തെ മുല്ലയ്ക്ക് മണമില്ല", "muṟṟatte mullaykkŭ maṇamilla",
     ("the yard's jasmine has no scent", "le jasmin de la cour n'a pas de parfum", "el jazmín del patio no tiene aroma"),
     ("what is close at hand is not valued", "on ne voit pas la valeur de ce qui est proche", "no se valora lo que está cerca")),
 12: ("മിന്നുന്നതെല്ലാം പൊന്നല്ല", "minnunnatellāṁ ponnalla",
     ("all that shines is not gold", "tout ce qui brille n'est pas or", "no todo lo que brilla es oro"),
     ("appearances deceive", "les apparences sont trompeuses", "las apariencias engañan")),
 14: ("നിറകുടം തുളുമ്പില്ല", "niṟakuṭaṁ tuḷumpilla",
     ("a full pot does not splash", "un pot plein ne déborde pas", "un cántaro lleno no salpica"),
     ("those who know much do not show off", "qui sait beaucoup ne s'en vante pas", "quien mucho sabe no presume")),
 20: ("കുരയ്ക്കും പട്ടി കടിക്കില്ല", "kuraykkuṁ paṭṭi kaṭikkilla",
     ("the barking dog will not bite", "le chien qui aboie ne mord pas", "perro que ladra no muerde"),
     ("loud threats are seldom carried out", "les grandes menaces s'exécutent rarement", "las amenazas ruidosas rara vez se cumplen")),
 25: ("ഇക്കരെ നിന്നാൽ അക്കരെ പച്ച", "ikkare ninnāl akkare pacca",
     ("from this bank, the other bank is green", "de cette rive, l'autre rive est verte", "desde esta orilla, la otra orilla es verde"),
     ("the grass is always greener elsewhere", "l'herbe est toujours plus verte ailleurs", "lo ajeno siempre parece mejor")),
 28: ("കാക്ക കുളിച്ചാൽ കൊക്കാകുമോ?", "kākka kuḷiccāl kokkākumō?",
     ("if the crow bathes, will it become a heron?", "si la corneille se baigne, devient-elle un héron ?", "si el cuervo se baña, ¿se vuelve garza?"),
     ("nature does not change by washing the surface", "on ne change pas sa nature en se lavant", "la naturaleza no cambia lavando la superficie")),
 29: ("മൗനം വിദ്വാനു ഭൂഷണം", "maunaṁ vidvānu bhūṣaṇaṁ",
     ("silence is the ornament of the learned", "le silence est la parure du savant", "el silencio es el adorno del sabio"),
     ("the wise know when to keep quiet", "le sage sait se taire", "el sabio sabe callar")),
 17: ("കൊക്കെത്ര കുളം കണ്ടതാ", "kokketra kuḷaṁ kaṇṭatā",
     ("how many ponds the heron has seen", "combien d'étangs le héron a vus", "cuántos estanques ha visto la garza"),
     ("an old hand is not easily fooled", "on ne trompe pas un vieux routier", "a perro viejo no hay tus tus")),
 8: ("ഇരിക്കുന്നതിന് മുമ്പ് കാൽ നീട്ടരുത്", "irikkunnatinŭ mumpŭ kāl nīṭṭarutŭ",
     ("do not stretch your legs before you sit", "n'étends pas les jambes avant de t'asseoir", "no estires las piernas antes de sentarte"),
     ("first things first; do not rush", "chaque chose en son temps", "cada cosa a su tiempo")),
 13: ("ആറ്റിൽ കളഞ്ഞാലും അളന്നു കളയണം", "āṯṯil kaḷaññāluṁ aḷannu kaḷayaṇaṁ",
     ("even if you throw it in the river, measure it first", "même si tu le jettes à la rivière, mesure-le d'abord", "aunque lo tires al río, mídelo antes"),
     ("know what you spend, even when you waste it", "sache ce que tu dépenses, même en pure perte", "sabe lo que gastas, aunque lo malgastes")),
 15: ("പല തുള്ളി പെരുവെള്ളം", "pala tuḷḷi peruveḷḷaṁ",
     ("many drops, a flood", "beaucoup de gouttes, une crue", "muchas gotas, una crecida"),
     ("small amounts add up", "les petits ruisseaux font les grandes rivières", "muchos pocos hacen un mucho")),
 24: ("ഓടുന്ന പട്ടിക്ക് ഒരു മുഴം മുമ്പേ എറിയണം", "ōṭunna paṭṭikkŭ oru muḻaṁ mumpē eṟiyaṇaṁ",
     ("throw a cubit ahead of the running dog", "lance une coudée devant le chien qui court", "tira un codo por delante del perro que corre"),
     ("anticipate; act one step ahead", "il faut anticiper", "hay que adelantarse")),
 31: ("സമ്പത്ത് കാലത്ത് തൈ പത്ത് വെച്ചാൽ ആപത്ത് കാലത്ത് കാ പത്ത് തിന്നാം", "sampattŭ kālattŭ tai pattŭ veccāl āpattŭ kālattŭ kā pattŭ tinnāṁ",
     ("plant ten saplings in good times, eat ten fruits in bad times", "plante dix jeunes arbres aux jours fastes, mange dix fruits aux jours difficiles", "planta diez arbolitos en tiempos buenos y comerás diez frutos en tiempos malos"),
     ("provide in plenty for times of need", "prévois dans l'abondance pour les temps de besoin", "en la abundancia, prevé la necesidad")),
 3: ("അണ്ണാൻ കുഞ്ഞും തന്നാലായത്", "aṇṇān kuññuṁ tannālāyatŭ",
     ("even the squirrel's young: what it can", "même le petit de l'écureuil : ce qu'il peut", "hasta la cría de ardilla: lo que puede"),
     ("everyone helps as they can", "chacun aide selon ses moyens", "cada uno ayuda según puede")),
 9: ("ഒരു വെടിക്ക് രണ്ടു പക്ഷി", "oru veṭikkŭ raṇṭu pakṣi",
     ("two birds for one shot", "deux oiseaux d'un seul coup de fusil", "dos pájaros de un tiro"),
     ("two results from one effort", "faire d'une pierre deux coups", "matar dos pájaros de un tiro")),
 32: ("എലിയെ പേടിച്ച് ഇല്ലം ചുടുക", "eliye pēṭiccŭ illaṁ cuṭuka",
     ("burning the house for fear of a rat", "brûler la maison par peur d'un rat", "quemar la casa por miedo a una rata"),
     ("a cure worse than the trouble", "un remède pire que le mal", "un remedio peor que la enfermedad")),
 4: ("കാക്കയ്ക്കും തൻ കുഞ്ഞ് പൊൻകുഞ്ഞ്", "kākkaykkuṁ tan kuññŭ ponkuññŭ",
     ("even to the crow its own chick is a golden chick", "même pour la corneille son petit est un petit d'or", "hasta para el cuervo su cría es una cría de oro"),
     ("every parent finds their own child beautiful", "chaque parent trouve son enfant beau", "a cada padre le parece hermoso su hijo")),
 10: ("ചക്കിക്കൊത്ത ചങ്കരൻ", "cakkikkotta caṅkaran",
     ("a Sankaran fit for Chakki", "un Sankaran fait pour Chakki", "un Sankaran a la medida de Chakki"),
     ("two of a kind, a well-matched pair", "ils sont bien assortis", "Dios los cría y ellos se juntan")),
 16: ("വിത്തുഗുണം പത്തുഗുണം", "vittuguṇaṁ pattuguṇaṁ",
     ("the seed's quality is tenfold quality", "la qualité de la graine vaut dix fois", "la calidad de la semilla vale por diez"),
     ("good stock gives good fruit", "bon sang ne saurait mentir", "de casta le viene al galgo")),
 21: ("ചൊട്ടയിലെ ശീലം ചുടല വരെ", "coṭṭayile śīlaṁ cuṭala vare",
     ("a habit from infancy lasts to the cremation ground", "l'habitude de l'enfance dure jusqu'au bûcher", "la costumbre de la cuna dura hasta la pira"),
     ("habits formed young last a lifetime", "les habitudes de l'enfance durent toute la vie", "genio y figura hasta la sepultura")),
 22: ("തന്നോളം വളർന്നാൽ താനെന്ന് വിളിക്കണം", "tannōḷaṁ vaḷarnnāl tānennŭ viḷikkaṇaṁ",
     ("when he has grown as tall as you, call him your equal", "quand il a grandi jusqu'à toi, traite-le en égal", "cuando ha crecido como tú, trátalo como a un igual"),
     ("treat a grown child as an equal", "un enfant devenu grand se traite en égal", "a un hijo mayor se le trata de igual a igual")),
 19: ("ഉപ്പോളം വരുമോ ഉപ്പിലിട്ടത്?", "uppōḷaṁ varumō uppiliṭṭatŭ?",
     ("can the pickle equal the salt?", "le cornichon vaut-il le sel ?", "¿puede el encurtido igualar a la sal?"),
     ("the copy never equals the source", "la copie ne vaut jamais l'original", "la copia nunca iguala al original")),
 33: ("കണ്ണുള്ളപ്പോൾ കണ്ണിന്റെ വിലയറിയില്ല", "kaṇṇuḷḷappōḷ kaṇṇinṯe vilayaṟiyilla",
     ("while you have eyes you do not know their worth", "tant qu'on a des yeux, on n'en connaît pas le prix", "mientras se tienen ojos no se sabe su valor"),
     ("we value things only once they are lost", "on n'apprécie une chose qu'une fois perdue", "nadie sabe lo que tiene hasta que lo pierde")),
 5: ("ഒരുമയുണ്ടെങ്കിൽ ഉലക്കമേലും കിടക്കാം", "orumayuṇṭeṅkil ulakkamēluṁ kiṭakkāṁ",
     ("with unity one can sleep even on a pestle", "dans l'union on peut dormir même sur un pilon", "con unión se puede dormir hasta sobre un mortero"),
     ("unity makes hardship bearable", "l'union rend l'épreuve supportable", "la unión hace llevadera la penuria")),
 2: ("ആന കൊടുത്താലും ആശ കൊടുക്കരുത്", "āna koṭuttāluṁ āśa koṭukkarutŭ",
     ("give even an elephant, but do not give hope", "donne même un éléphant, mais ne donne pas d'espoir", "da incluso un elefante, pero no des esperanza"),
     ("never raise false hopes", "ne jamais donner de faux espoirs", "nunca dar falsas esperanzas")),
 6: ("അരിയെത്ര? പയറഞ്ഞാഴി", "ariyetra? payaṟaññāḻi",
     ("how much is the rice? five measures of beans", "combien le riz ? cinq mesures de haricots", "¿cuánto el arroz? cinco medidas de judías"),
     ("an answer beside the question", "répondre à côté de la question", "responder lo que no se pregunta")),
 7: ("ആന വായിൽ അമ്പഴങ്ങ", "āna vāyil ampaḻaṅṅa",
     ("a hog plum in the elephant's mouth", "une prune sauvage dans la bouche d'un éléphant", "una ciruela en la boca de un elefante"),
     ("far too little for the need", "bien trop peu pour le besoin", "muy poco para tanta necesidad")),
 11: ("പട്ടി ചന്തയ്ക്ക് പോയ പോലെ", "paṭṭi cantaykkŭ pōya pōle",
     ("like the dog that went to the market", "comme le chien qui est allé au marché", "como el perro que fue al mercado"),
     ("going about with no purpose and coming back with nothing", "aller partout sans but et revenir les mains vides", "ir sin rumbo y volver con las manos vacías")),
 18: ("അടി തെറ്റിയാൽ ആനയും വീഴും", "aṭi teṯṯiyāl ānayuṁ vīḻuṁ",
     ("if its step slips, even the elephant falls", "si son pas glisse, même l'éléphant tombe", "si da un mal paso, hasta el elefante cae"),
     ("even the strongest can fail", "même les plus forts peuvent tomber", "hasta el más fuerte puede caer")),
 23: ("അൽപ്പജ്ഞാനം ആപത്ത്", "alppajñānaṁ āpattŭ",
     ("little knowledge, danger", "peu de savoir, danger", "poco saber, peligro"),
     ("a little learning is a dangerous thing", "un peu de savoir est dangereux", "saber poco es peligroso")),
 26: ("പൊന്നുരുക്കുന്നിടത്ത് പൂച്ചയ്ക്കെന്ത് കാര്യം", "ponnurukkunniṭattŭ pūccaykkentŭ kāryaṁ",
     ("what business has a cat where gold is melted?", "qu'a à faire un chat où l'on fond l'or ?", "¿qué pinta un gato donde se funde el oro?"),
     ("keep out of what does not concern you", "ne te mêle pas de ce qui ne te regarde pas", "no te metas donde no te llaman")),
 27: ("ഗതികെട്ടാൽ പുലി പുല്ലും തിന്നും", "gatikeṭṭāl puli pulluṁ tinnuṁ",
     ("in distress, the tiger eats grass too", "dans la détresse, le tigre mange aussi de l'herbe", "en la desgracia, el tigre come hierba también"),
     ("need makes anyone give in", "nécessité fait loi", "la necesidad no tiene ley")),
 30: ("വേലി തന്നെ വിളവ് തിന്നുക", "vēli tanne viḷavŭ tinnuka",
     ("the fence itself eating the crop", "la clôture elle-même mange la récolte", "la propia cerca se come la cosecha"),
     ("betrayal by the one meant to protect", "trahi par celui qui devait protéger", "el guardián que traiciona")),
}
THEMES = [
 ("appear", (1, 12, 14, 20, 25, 28, 29, 17), ("Appearances and judgement", "Apparences et jugement", "Apariencias y juicio")),
 ("foresight", (8, 13, 15, 24, 31, 3, 9, 32), ("Foresight, care and effort", "Prévoyance, soin et effort", "Previsión, cuidado y esfuerzo")),
 ("family", (4, 10, 16, 21, 22, 19, 33, 5), ("Family, character and habit", "Famille, caractère et habitude", "Familia, carácter y costumbre")),
 ("folly", (2, 6, 7, 11, 18, 23, 26, 27, 30), ("Folly, need and misfortune", "Folie, besoin et malheur", "Necedad, necesidad y desgracia")),
]
assert sorted(sum((list(t[1]) for t in THEMES), [])) == sorted(P)
L = {"en": 0, "fr": 1, "es": 2}
HEAD = {"en": "| Proverb | Reading | Word for word | Sense |", "fr": "| Proverbe | Lecture | Mot à mot | Sens |", "es": "| Refrán | Lectura | Palabra por palabra | Sentido |"}
TEXT = {
"en": """# 19. A compendium of proverbs

Malayalis quote proverbs (പഴഞ്ചൊല്ല് *paḻañcollŭ*, "old words") all the time: in conversation, in the newspaper, in films, often only the first half, trusting the listener to finish it. Many come from village life, the rice field, the river, the elephant and the crow; a few are Sanskrit maxims. This lesson gathers thirty-three of the commonest, by theme, with a word-for-word rendering and their sense.

All of them are in this lesson's vocabulary: *📚 Practise the course's vocabulary* brings them back by spaced repetition, the proverb shown and its sense chosen, or the other way round. Read them aloud: they are built from the grammar of the course, the dative of ആനയ്ക്ക്, the -ആൽ of "if", the -ഉം of "even", the -അരുത് of "must not".

{tables}

## Some words

ഉലക്ക *ulakka* is the long wooden pestle for pounding rice; അമ്പഴങ്ങ *ampaḻaṅṅa* the small hog plum; ഇല്ലം *illaṁ* a Brahmin family house; ചുടല *cuṭala* the cremation ground; മുഴം *muḻaṁ* a cubit, a forearm's length; നാഴി *nāḻi* an old measure of grain. ചക്കി and ചങ്കരൻ are an ordinary village wife and husband: the proverb is said, with a smile, of two people as good, or as bad, as each other.
""",
"fr": """# 19. Recueil de proverbes

Les Malayalis citent sans cesse des proverbes (പഴഞ്ചൊല്ല് *paḻañcollŭ*, « vieilles paroles ») : dans la conversation, dans le journal, au cinéma, souvent seulement la première moitié, en comptant sur l'auditeur pour la finir. Beaucoup viennent de la vie du village, la rizière, la rivière, l'éléphant et la corneille ; quelques-uns sont des maximes sanskrites. Cette leçon en rassemble trente-trois parmi les plus courants, par thème, avec un mot à mot et leur sens.

Tous sont dans le vocabulaire de cette leçon : *📚 Réviser le vocabulaire du cours* les ramène par répétition espacée, le proverbe montré et son sens à choisir, ou l'inverse. Lisez-les à voix haute : ils sont bâtis avec la grammaire du cours, le datif de ആനയ്ക്ക്, le -ആൽ de « si », le -ഉം de « même », le -അരുത് de « il ne faut pas ».

{tables}

## Quelques mots

ഉലക്ക *ulakka* est le long pilon de bois pour décortiquer le riz ; അമ്പഴങ്ങ *ampaḻaṅṅa* la petite prune sauvage ; ഇല്ലം *illaṁ* une maison de famille brahmane ; ചുടല *cuṭala* le lieu de crémation ; മുഴം *muḻaṁ* une coudée, la longueur d'un avant-bras ; നാഴി *nāḻi* une ancienne mesure de grain. ചക്കി et ചങ്കരൻ sont un mari et une femme de village ordinaires : on dit le proverbe, en souriant, de deux personnes aussi bonnes, ou aussi mauvaises, l'une que l'autre.
""",
"es": """# 19. Compendio de refranes

Los malayalis citan refranes (പഴഞ്ചൊല്ല് *paḻañcollŭ*, «palabras viejas») sin parar: en la conversación, en el periódico, en el cine, a menudo solo la primera mitad, confiando en que el oyente la complete. Muchos vienen de la vida del pueblo, el arrozal, el río, el elefante y el cuervo; algunos son máximas sánscritas. Esta lección reúne treinta y tres de los más corrientes, por temas, con su traducción palabra por palabra y su sentido.

Todos están en el vocabulario de esta lección: *📚 Repasar el vocabulario del curso* los trae de vuelta por repetición espaciada, el refrán mostrado y su sentido a elegir, o al revés. Léalos en voz alta: están hechos con la gramática del curso, el dativo de ആനയ്ക്ക്, el -ആൽ de «si», el -ഉം de «incluso», el -അരുത് de «no se debe».

{tables}

## Algunas palabras

ഉലക്ക *ulakka* es la larga mano de mortero de madera para descascarillar el arroz; അമ്പഴങ്ങ *ampaḻaṅṅa* la pequeña ciruela silvestre; ഇല്ലം *illaṁ* una casa de familia brahmán; ചുടല *cuṭala* el lugar de cremación; മുഴം *muḻaṁ* un codo, el largo de un antebrazo; നാഴി *nāḻi* una antigua medida de grano. ചക്കി y ചങ്കരൻ son una esposa y un marido corrientes de pueblo: el refrán se dice, sonriendo, de dos personas igual de buenas, o igual de malas, la una que la otra.
""",
}
EX = {
"en": """::: exercise sense
What does the proverb mean?

- നിറകുടം തുളുമ്പില്ല → ((those who know much do not show off* / full pots are heavy / never fill a pot))
- കുരയ്ക്കും പട്ടി കടിക്കില്ല → ((loud threats are seldom carried out* / dogs are dangerous / keep a dog))
- ഇക്കരെ നിന്നാൽ അക്കരെ പച്ച → ((the grass is always greener elsewhere* / cross the river / rice grows on both banks))
- വേലി തന്നെ വിളവ് തിന്നുക → ((betrayal by the one meant to protect* / build a good fence / harvest early))
:::

::: exercise complete
Complete the proverb.

- മിന്നുന്നതെല്ലാം ___ → ((പൊന്നല്ല* / വെള്ളമല്ല / പൂവല്ല))
- പല തുള്ളി ___ → ((പെരുവെള്ളം* / പെരുമഴ / ചോറ്))
- ഒരു വെടിക്ക് ___ → ((രണ്ടു പക്ഷി* / മൂന്ന് ആന / ഒരു മരം))
- അടി തെറ്റിയാൽ ___ വീഴും → ((ആനയും* / കാക്കയും / മഴയും))
:::

::: exercise match
Which Malayalam proverb says the same?

- All that glitters is not gold. → ((മിന്നുന്നതെല്ലാം പൊന്നല്ല* / നിറകുടം തുളുമ്പില്ല / പല തുള്ളി പെരുവെള്ളം))
- Barking dogs seldom bite. → ((കുരയ്ക്കും പട്ടി കടിക്കില്ല* / പട്ടി ചന്തയ്ക്ക് പോയ പോലെ / ആന വായിൽ അമ്പഴങ്ങ))
- To kill two birds with one stone. → ((ഒരു വെടിക്ക് രണ്ടു പക്ഷി* / അണ്ണാൻ കുഞ്ഞും തന്നാലായത് / കാക്ക കുളിച്ചാൽ കൊക്കാകുമോ?))
- You don't know what you've got till it's gone. → ((കണ്ണുള്ളപ്പോൾ കണ്ണിന്റെ വിലയറിയില്ല* / ചക്കിക്കൊത്ത ചങ്കരൻ / മൗനം വിദ്വാനു ഭൂഷണം))
:::

::: exercise words
Transliterate the key word.

- പൊന്ന് "gold" → [[ponnŭ]]
- പട്ടി "dog" → [[paṭṭi]]
- പുലി "tiger" → [[puli]]
- പച്ച "green" → [[pacca]]
:::

::: summary
- Proverbs are quoted constantly, often by their first half.
- Appearances: മിന്നുന്നതെല്ലാം പൊന്നല്ല, നിറകുടം തുളുമ്പില്ല, കുരയ്ക്കും പട്ടി കടിക്കില്ല. Foresight: പല തുള്ളി പെരുവെള്ളം, ഓടുന്ന പട്ടിക്ക് ഒരു മുഴം മുമ്പേ എറിയണം.
- Family and habit: കാക്കയ്ക്കും തൻ കുഞ്ഞ് പൊൻകുഞ്ഞ്, ചൊട്ടയിലെ ശീലം ചുടല വരെ. Folly and need: ഗതികെട്ടാൽ പുലി പുല്ലും തിന്നും.
- All thirty-three are in the course vocabulary.
:::
""",
"fr": """::: exercise sense
Que veut dire le proverbe ?

- നിറകുടം തുളുമ്പില്ല → ((qui sait beaucoup ne s'en vante pas* / les pots pleins sont lourds / ne remplis jamais un pot))
- കുരയ്ക്കും പട്ടി കടിക്കില്ല → ((les grandes menaces s'exécutent rarement* / les chiens sont dangereux / garde un chien))
- ഇക്കരെ നിന്നാൽ അക്കരെ പച്ച → ((l'herbe est toujours plus verte ailleurs* / traverse la rivière / le riz pousse sur les deux rives))
- വേലി തന്നെ വിളവ് തിന്നുക → ((trahi par celui qui devait protéger* / bâtis une bonne clôture / récolte tôt))
:::

::: exercise complete
Complétez le proverbe.

- മിന്നുന്നതെല്ലാം ___ → ((പൊന്നല്ല* / വെള്ളമല്ല / പൂവല്ല))
- പല തുള്ളി ___ → ((പെരുവെള്ളം* / പെരുമഴ / ചോറ്))
- ഒരു വെടിക്ക് ___ → ((രണ്ടു പക്ഷി* / മൂന്ന് ആന / ഒരു മരം))
- അടി തെറ്റിയാൽ ___ വീഴും → ((ആനയും* / കാക്കയും / മഴയും))
:::

::: exercise match
Quel proverbe malayalam dit la même chose ?

- Tout ce qui brille n'est pas or. → ((മിന്നുന്നതെല്ലാം പൊന്നല്ല* / നിറകുടം തുളുമ്പില്ല / പല തുള്ളി പെരുവെള്ളം))
- Chien qui aboie ne mord pas. → ((കുരയ്ക്കും പട്ടി കടിക്കില്ല* / പട്ടി ചന്തയ്ക്ക് പോയ പോലെ / ആന വായിൽ അമ്പഴങ്ങ))
- Faire d'une pierre deux coups. → ((ഒരു വെടിക്ക് രണ്ടു പക്ഷി* / അണ്ണാൻ കുഞ്ഞും തന്നാലായത് / കാക്ക കുളിച്ചാൽ കൊക്കാകുമോ?))
- On ne connaît la valeur des choses qu'une fois perdues. → ((കണ്ണുള്ളപ്പോൾ കണ്ണിന്റെ വിലയറിയില്ല* / ചക്കിക്കൊത്ത ചങ്കരൻ / മൗനം വിദ്വാനു ഭൂഷണം))
:::

::: exercise words
Transcrivez le mot clé.

- പൊന്ന് « or » → [[ponnŭ]]
- പട്ടി « chien » → [[paṭṭi]]
- പുലി « tigre » → [[puli]]
- പച്ച « vert » → [[pacca]]
:::

::: summary
- On cite sans cesse les proverbes, souvent par leur première moitié.
- Apparences : മിന്നുന്നതെല്ലാം പൊന്നല്ല, നിറകുടം തുളുമ്പില്ല, കുരയ്ക്കും പട്ടി കടിക്കില്ല. Prévoyance : പല തുള്ളി പെരുവെള്ളം, ഓടുന്ന പട്ടിക്ക് ഒരു മുഴം മുമ്പേ എറിയണം.
- Famille et habitude : കാക്കയ്ക്കും തൻ കുഞ്ഞ് പൊൻകുഞ്ഞ്, ചൊട്ടയിലെ ശീലം ചുടല വരെ. Folie et besoin : ഗതികെട്ടാൽ പുലി പുല്ലും തിന്നും.
- Les trente-trois sont dans le vocabulaire du cours.
:::
""",
"es": """::: exercise sense
¿Qué significa el refrán?

- നിറകുടം തുളുമ്പില്ല → ((quien mucho sabe no presume* / los cántaros llenos pesan / nunca llenes un cántaro))
- കുരയ്ക്കും പട്ടി കടിക്കില്ല → ((las amenazas ruidosas rara vez se cumplen* / los perros son peligrosos / ten un perro))
- ഇക്കരെ നിന്നാൽ അക്കരെ പച്ച → ((lo ajeno siempre parece mejor* / cruza el río / el arroz crece en las dos orillas))
- വേലി തന്നെ വിളവ് തിന്നുക → ((el guardián que traiciona* / construye una buena cerca / cosecha pronto))
:::

::: exercise complete
Complete el refrán.

- മിന്നുന്നതെല്ലാം ___ → ((പൊന്നല്ല* / വെള്ളമല്ല / പൂവല്ല))
- പല തുള്ളി ___ → ((പെരുവെള്ളം* / പെരുമഴ / ചോറ്))
- ഒരു വെടിക്ക് ___ → ((രണ്ടു പക്ഷി* / മൂന്ന് ആന / ഒരു മരം))
- അടി തെറ്റിയാൽ ___ വീഴും → ((ആനയും* / കാക്കയും / മഴയും))
:::

::: exercise match
¿Qué refrán malayalam dice lo mismo?

- No todo lo que brilla es oro. → ((മിന്നുന്നതെല്ലാം പൊന്നല്ല* / നിറകുടം തുളുമ്പില്ല / പല തുള്ളി പെരുവെള്ളം))
- Perro ladrador, poco mordedor. → ((കുരയ്ക്കും പട്ടി കടിക്കില്ല* / പട്ടി ചന്തയ്ക്ക് പോയ പോലെ / ആന വായിൽ അമ്പഴങ്ങ))
- Matar dos pájaros de un tiro. → ((ഒരു വെടിക്ക് രണ്ടു പക്ഷി* / അണ്ണാൻ കുഞ്ഞും തന്നാലായത് / കാക്ക കുളിച്ചാൽ കൊക്കാകുമോ?))
- Nadie sabe lo que tiene hasta que lo pierde. → ((കണ്ണുള്ളപ്പോൾ കണ്ണിന്റെ വിലയറിയില്ല* / ചക്കിക്കൊത്ത ചങ്കരൻ / മൗനം വിദ്വാനു ഭൂഷണം))
:::

::: exercise words
Translitere la palabra clave.

- പൊന്ന് «oro» → [[ponnŭ]]
- പട്ടി «perro» → [[paṭṭi]]
- പുലി «tigre» → [[puli]]
- പച്ച «verde» → [[pacca]]
:::

::: summary
- Los refranes se citan sin parar, a menudo solo su primera mitad.
- Apariencias: മിന്നുന്നതെല്ലാം പൊന്നല്ല, നിറകുടം തുളുമ്പില്ല, കുരയ്ക്കും പട്ടി കടിക്കില്ല. Previsión: പല തുള്ളി പെരുവെള്ളം, ഓടുന്ന പട്ടിക്ക് ഒരു മുഴം മുമ്പേ എറിയണം.
- Familia y costumbre: കാക്കയ്ക്കും തൻ കുഞ്ഞ് പൊൻകുഞ്ഞ്, ചൊട്ടയിലെ ശീലം ചുടല വരെ. Necedad y necesidad: ഗതികെട്ടാൽ പുലി പുല്ലും തിന്നും.
- Los treinta y tres están en el vocabulario del curso.
:::
""",
}
out = sys.argv[1]
for lang, i in L.items():
    tables = []
    for _, ids, names in THEMES:
        rows = [f"## {names[i]}", "", HEAD[lang], "|---|---|---|---|"]
        for n in ids:
            ml, iso, lit, sense = P[n]
            rows.append(f"| {ml} | *{iso}* | {lit[i]} | {sense[i]} |")
        tables.append("\n".join(rows))
    open(f"{out}/{lang}.md", "w").write(TEXT[lang].replace("{tables}", "\n\n".join(tables)) + "\n" + EX[lang])
entries = []
for _, ids, _ in THEMES:
    for n in ids:
        ml, iso, lit, sense = P[n]
        entries.append({"term": ml, "reading": iso, "meaning": sense[0], "translations": {"fr": sense[1], "es": sense[2]}, "type": "phrase"})
for t, r, m, fr, es in [("പൊന്ന്", "ponnŭ", "gold", "or", "oro"), ("പട്ടി", "paṭṭi", "dog", "chien", "perro"), ("പുലി", "puli", "tiger, leopard", "tigre, léopard", "tigre, leopardo"), ("പച്ച", "pacca", "green", "vert", "verde"), ("ഉലക്ക", "ulakka", "pestle", "pilon", "mano de mortero")]:
    entries.append({"term": t, "reading": r, "meaning": m, "translations": {"fr": fr, "es": es}, "type": "adjective" if m == "green" else "noun"})
json.dump({"entries": entries}, open(f"{out}/vocab.json", "w"), ensure_ascii=False, indent=1)
print(len(entries), "entries")
