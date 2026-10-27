/**
 * Marx's Capital, Débutant: the concepts as the course introduces them, one
 * list per part (src/courses/marx). Formulas between $…$ are the same in the
 * three languages. French follows the usual terms of the French editions
 * (plus-value, taux de profit), Spanish those of the Siglo XXI edition
 * (plusvalor, tasa de ganancia).
 */
import type { LinuxQuestion as MarxQuestion } from "../linux/types";

const commodityBasics: MarxQuestion[] = [
  {
    id: "mx-com-01",
    q: ["What are the two factors of a commodity, according to Marx?", "Quels sont les deux facteurs de la marchandise, selon Marx ?", "¿Cuáles son los dos factores de la mercancía, según Marx?"],
    a: ["Use value and value", "La valeur d'usage et la valeur", "El valor de uso y el valor"],
    w: [["Supply and demand", "L'offre et la demande", "La oferta y la demanda"], ["Labour and capital", "Le travail et le capital", "El trabajo y el capital"], ["Cost price and profit", "Le prix de revient et le profit", "El precio de coste y la ganancia"]],
    e: [
      "A commodity is a useful thing (a use value) and an exchangeable one; what makes it exchangeable in definite proportions is its value, the abstract human labour it contains. Exchange value is the form in which value appears (Volume I, chapter 1).",
      "Une marchandise est une chose utile (une valeur d'usage) et une chose échangeable ; ce qui la rend échangeable dans des proportions définies est sa valeur, le travail humain abstrait qu'elle contient. La valeur d'échange est la forme sous laquelle la valeur apparaît (Livre I, chapitre 1).",
      "Una mercancía es una cosa útil (un valor de uso) y una cosa intercambiable; lo que la hace intercambiable en proporciones definidas es su valor, el trabajo humano abstracto que contiene. El valor de cambio es la forma en que aparece el valor (Libro I, capítulo 1).",
    ],
  },
  {
    id: "mx-com-02",
    q: ["What determines the magnitude of a commodity's value?", "Qu'est-ce qui détermine la grandeur de la valeur d'une marchandise ?", "¿Qué determina la magnitud del valor de una mercancía?"],
    a: ["The labour time socially necessary to produce it", "Le temps de travail socialement nécessaire pour la produire", "El tiempo de trabajo socialmente necesario para producirla"],
    w: [["The time its own producer actually spent on it", "Le temps que son propre producteur y a réellement passé", "El tiempo que su propio productor le dedicó realmente"], ["How useful buyers find it", "L'utilité que lui trouvent les acheteurs", "La utilidad que le encuentran los compradores"], ["The quantity of money in circulation", "La quantité de monnaie en circulation", "La cantidad de dinero en circulación"]],
    e: [
      "Value is measured by the time needed under the normal conditions of production, with the average skill and intensity of the time. A slow worker does not make a more valuable product; a rise in productivity lowers the value of each unit.",
      "La valeur se mesure au temps nécessaire dans les conditions normales de production, avec l'habileté et l'intensité moyennes de l'époque. Un ouvrier lent ne fait pas un produit qui vaut plus ; une hausse de la productivité abaisse la valeur de chaque unité.",
      "El valor se mide por el tiempo necesario en las condiciones normales de producción, con la habilidad y la intensidad medias de la época. Un obrero lento no hace un producto que valga más; un aumento de la productividad rebaja el valor de cada unidad.",
    ],
  },
  {
    id: "mx-com-03",
    q: ["In Marx's development of the value-form, which form comes last?", "Dans le développement de la forme-valeur chez Marx, quelle forme vient en dernier ?", "En el desarrollo de la forma de valor en Marx, ¿qué forma viene al final?"],
    a: ["The money form: one commodity, gold, is the general equivalent", "La forme monnaie : une marchandise, l'or, est l'équivalent général", "La forma de dinero: una mercancía, el oro, es el equivalente general"],
    w: [["The simple form: one commodity expressed in one other", "La forme simple : une marchandise exprimée dans une autre", "La forma simple: una mercancía expresada en otra"], ["The expanded form: one commodity expressed in all others", "La forme développée : une marchandise exprimée dans toutes les autres", "La forma desplegada: una mercancía expresada en todas las demás"], ["The price form fixed by the state for each good", "La forme prix fixée par l'État pour chaque bien", "La forma precio fijada por el Estado para cada bien"]],
    e: [
      "Simple, expanded, general, money: each form expresses value more adequately. In the money form, the general equivalent is fixed by custom in gold. Money is thus the form value takes when exchange becomes general, not an invention added to it.",
      "Simple, développée, générale, monnaie : chaque forme exprime la valeur de façon plus adéquate. Dans la forme monnaie, l'équivalent général est fixé par l'usage dans l'or. La monnaie est donc la forme que prend la valeur quand l'échange se généralise, et non une invention qui s'y ajoute.",
      "Simple, desplegada, general, dinero: cada forma expresa el valor de manera más adecuada. En la forma de dinero, el equivalente general queda fijado por la costumbre en el oro. El dinero es, pues, la forma que toma el valor cuando el intercambio se generaliza, no un invento añadido.",
    ],
  },
];

const moneyBasics: MarxQuestion[] = [
  {
    id: "mx-mon-01",
    q: ["To serve as a measure of value, does money need to be physically present?", "Pour servir de mesure des valeurs, la monnaie doit-elle être physiquement présente ?", "Para servir de medida de los valores, ¿debe estar el dinero físicamente presente?"],
    a: ["No: prices are expressed in imaginary money", "Non : les prix s'expriment en monnaie imaginaire", "No: los precios se expresan en dinero imaginario"],
    w: [["Yes: a price needs the gold to be in the seller's hands", "Oui : un prix exige que l'or soit dans les mains du vendeur", "Sí: un precio exige que el oro esté en manos del vendedor"], ["Yes: otherwise the commodity has no value", "Oui : sinon la marchandise n'a pas de valeur", "Sí: si no, la mercancía no tiene valor"], ["Only when the state has fixed the price", "Seulement quand l'État a fixé le prix", "Solo cuando el Estado ha fijado el precio"]],
    e: [
      "A price tag says how much gold a commodity is worth before any gold changes hands: as a measure of value, money is only ideal. It must be really present as means of circulation and, above all, as means of payment.",
      "Une étiquette de prix dit combien d'or vaut une marchandise avant que l'or ne change de mains : comme mesure des valeurs, la monnaie n'est qu'idéelle. Elle doit être réellement présente comme moyen de circulation et, surtout, comme moyen de paiement.",
      "Una etiqueta de precio dice cuánto oro vale una mercancía antes de que el oro cambie de manos: como medida de los valores, el dinero es solo ideal. Debe estar realmente presente como medio de circulación y, sobre todo, como medio de pago.",
    ],
  },
  {
    id: "mx-mon-02",
    q: ["Why does the circulation C–M–C contain the possibility of crisis?", "Pourquoi la circulation M–A–M contient-elle la possibilité de la crise ?", "¿Por qué la circulación M–D–M contiene la posibilidad de la crisis?"],
    a: ["Because nothing forces whoever sells to buy at once: sale and purchase separate", "Parce que rien n'oblige celui qui vend à acheter aussitôt : vente et achat se séparent", "Porque nada obliga a quien vende a comprar enseguida: venta y compra se separan"],
    w: [["Because money is always scarcer than commodities", "Parce que la monnaie est toujours plus rare que les marchandises", "Porque el dinero siempre es más escaso que las mercancías"], ["Because each sale is made below value", "Parce que chaque vente se fait au-dessous de la valeur", "Porque cada venta se hace por debajo del valor"], ["Because prices are set by the state", "Parce que les prix sont fixés par l'État", "Porque los precios los fija el Estado"]],
    e: [
      "Each sale is someone's purchase, but a seller may hold the money. If many do, other goods cannot be sold. This is only the formal possibility of crises, and Marx's argument against Say's law that supply creates its own demand (Volume I, chapter 3). In French editions the formula is written M–A–M (marchandise, argent); in Spanish ones M–D–M (mercancía, dinero).",
      "Chaque vente est l'achat de quelqu'un, mais un vendeur peut garder l'argent. Si beaucoup le font, d'autres marchandises ne se vendent pas. Ce n'est que la possibilité formelle des crises, et l'argument de Marx contre la loi de Say selon laquelle l'offre crée sa propre demande (Livre I, chapitre 3). Les éditions anglaises écrivent C–M–C (commodity, money).",
      "Cada venta es la compra de alguien, pero un vendedor puede quedarse con el dinero. Si muchos lo hacen, otras mercancías no se venden. Es solo la posibilidad formal de las crisis, y el argumento de Marx contra la ley de Say según la cual la oferta crea su propia demanda (Libro I, capítulo 3). Las ediciones inglesas escriben C–M–C (commodity, money).",
    ],
  },
  {
    id: "mx-mon-03",
    q: ["Which of these is NOT one of the functions of money in Volume I?", "Laquelle de ces fonctions n'est PAS une fonction de la monnaie dans le Livre I ?", "¿Cuál de estas NO es una función del dinero en el Libro I?"],
    a: ["Creating value by lending at interest", "Créer de la valeur en prêtant à intérêt", "Crear valor prestando a interés"],
    w: [["Means of payment, which settles debts", "Moyen de paiement, qui règle les dettes", "Medio de pago, que salda las deudas"], ["Hoard, value withdrawn from circulation", "Trésor, valeur retirée de la circulation", "Tesoro, valor retirado de la circulación"], ["World money, which settles balances between nations", "Monnaie universelle, qui solde les comptes entre nations", "Dinero mundial, que salda las cuentas entre naciones"]],
    e: [
      "Volume I lists measure of value, means of circulation, hoard, means of payment and world money. Money lent as capital belongs to Volume III, and even there interest is a share of surplus value produced elsewhere, not new value created by lending.",
      "Le Livre I énumère mesure des valeurs, moyen de circulation, trésor, moyen de paiement et monnaie universelle. La monnaie prêtée comme capital relève du Livre III, et même là l'intérêt est une part de plus-value produite ailleurs, pas une valeur nouvelle créée par le prêt.",
      "El Libro I enumera medida de los valores, medio de circulación, tesoro, medio de pago y dinero mundial. El dinero prestado como capital pertenece al Libro III, y aun allí el interés es una parte del plusvalor producido en otro lugar, no valor nuevo creado por el préstamo.",
    ],
  },
];

const surplusBasics: MarxQuestion[] = [
  {
    id: "mx-sv-01",
    q: ["What is Marx's general formula for capital?", "Quelle est la formule générale du capital chez Marx ?", "¿Cuál es la fórmula general del capital en Marx?"],
    a: ["M–C–M′: buying in order to sell for more", "A–M–A′ : acheter pour vendre plus cher", "D–M–D′: comprar para vender más caro"],
    w: [["C–M–C: selling in order to buy", "M–A–M : vendre pour acheter", "M–D–M: vender para comprar"], ["M–M: money exchanged for money", "A–A : de l'argent échangé contre de l'argent", "D–D: dinero cambiado por dinero"], ["C–C: barter of products", "M–M : le troc des produits", "M–M: el trueque de productos"]],
    e: [
      "Simple circulation ends in a use value; capital starts and ends with money, and the movement only makes sense if M′ = M + ΔM. The increment is surplus value, and since the end is again money, the movement has no natural limit (Volume I, chapter 4).",
      "La circulation simple aboutit à une valeur d'usage ; le capital commence et finit par de l'argent, et le mouvement n'a de sens que si A′ = A + ΔA. L'accroissement est la plus-value, et comme le terme est encore de l'argent, le mouvement n'a pas de limite naturelle (Livre I, chapitre 4).",
      "La circulación simple termina en un valor de uso; el capital empieza y acaba con dinero, y el movimiento solo tiene sentido si D′ = D + ΔD. El incremento es el plusvalor, y como el final es otra vez dinero, el movimiento no tiene límite natural (Libro I, capítulo 4).",
    ],
  },
  {
    id: "mx-sv-02",
    q: ["What does the worker sell to the capitalist?", "Que vend l'ouvrier au capitaliste ?", "¿Qué vende el obrero al capitalista?"],
    a: ["Labour-power: the capacity to work, for a given time", "La force de travail : la capacité de travailler, pour un temps donné", "La fuerza de trabajo: la capacidad de trabajar, por un tiempo dado"],
    w: [["Labour itself, the work done, paid at its full value", "Le travail lui-même, l'ouvrage fait, payé à sa pleine valeur", "El trabajo mismo, la obra hecha, pagada a su pleno valor"], ["The product of the day, at its market price", "Le produit de la journée, à son prix de marché", "El producto de la jornada, a su precio de mercado"], ["A share in the capital of the firm", "Une part du capital de l'entreprise", "Una parte del capital de la empresa"]],
    e: [
      "The distinction is the key to surplus value. Labour-power has a value, the value of the worker's means of subsistence; its use, labour, creates value. The capitalist pays the first and gets the second, which can exceed it.",
      "La distinction est la clé de la plus-value. La force de travail a une valeur, celle des moyens de subsistance de l'ouvrier ; son usage, le travail, crée de la valeur. Le capitaliste paie la première et obtient le second, qui peut la dépasser.",
      "La distinción es la clave del plusvalor. La fuerza de trabajo tiene un valor, el de los medios de subsistencia del obrero; su uso, el trabajo, crea valor. El capitalista paga lo primero y obtiene lo segundo, que puede superarlo.",
    ],
  },
  {
    id: "mx-sv-03",
    q: ["Why does Marx call the capital spent on means of production 'constant'?", "Pourquoi Marx appelle-t-il « constant » le capital dépensé en moyens de production ?", "¿Por qué Marx llama «constante» al capital gastado en medios de producción?"],
    a: ["Its value only passes into the product, without changing in magnitude", "Sa valeur ne fait que passer dans le produit, sans changer de grandeur", "Su valor solo pasa al producto, sin cambiar de magnitud"],
    w: [["Its price never changes on the market", "Son prix ne change jamais sur le marché", "Su precio nunca cambia en el mercado"], ["It is spent once, at the founding of the firm", "Il est dépensé une seule fois, à la création de l'entreprise", "Se gasta una sola vez, al fundar la empresa"], ["It stays in the firm and never wears out", "Il reste dans l'entreprise et ne s'use jamais", "Se queda en la empresa y nunca se desgasta"]],
    e: [
      "Machines and materials transfer their value to the product (a machine by its wear), but add none. Variable capital, spent on labour-power, is replaced and increased: it produces its own value plus a surplus value (Volume I, chapter 8).",
      "Les machines et les matières transmettent leur valeur au produit (une machine par son usure), mais n'en ajoutent pas. Le capital variable, dépensé en force de travail, est remplacé et accru : il produit sa propre valeur plus une plus-value (Livre I, chapitre 8).",
      "Las máquinas y los materiales transfieren su valor al producto (una máquina por su desgaste), pero no añaden ninguno. El capital variable, gastado en fuerza de trabajo, se repone y se acrecienta: produce su propio valor más un plusvalor (Libro I, capítulo 8).",
    ],
  },
];

const dayBasics: MarxQuestion[] = [
  {
    id: "mx-wd-01",
    q: ["How is the rate of surplus value defined?", "Comment le taux de plus-value est-il défini ?", "¿Cómo se define la tasa de plusvalor?"],
    a: ["$s/v$: surplus labour divided by necessary labour", "$s/v$ : le surtravail divisé par le travail nécessaire", "$s/v$: el plustrabajo dividido por el trabajo necesario"],
    w: [["$s/(c+v)$: surplus value over the whole capital", "$s/(c+v)$ : la plus-value sur tout le capital", "$s/(c+v)$: el plusvalor sobre todo el capital"], ["$s/c$: surplus value over the means of production", "$s/c$ : la plus-value sur les moyens de production", "$s/c$: el plusvalor sobre los medios de producción"], ["$v/s$: wages over surplus value", "$v/s$ : les salaires sur la plus-value", "$v/s$: los salarios sobre el plusvalor"]],
    e: [
      "Only variable capital creates new value, so exploitation is measured against it: the hours worked for the capitalist over the hours that reproduce the value of labour-power. Related to the whole capital, surplus value gives the rate of profit, always lower.",
      "Seul le capital variable crée de la valeur nouvelle, donc l'exploitation se mesure par rapport à lui : les heures travaillées pour le capitaliste sur les heures qui reproduisent la valeur de la force de travail. Rapportée à tout le capital, la plus-value donne le taux de profit, toujours plus bas.",
      "Solo el capital variable crea valor nuevo, así que la explotación se mide respecto a él: las horas trabajadas para el capitalista sobre las horas que reproducen el valor de la fuerza de trabajo. Referido a todo el capital, el plusvalor da la tasa de ganancia, siempre más baja.",
    ],
  },
  {
    id: "mx-wd-02",
    q: ["What is absolute surplus value?", "Qu'est-ce que la plus-value absolue ?", "¿Qué es el plusvalor absoluto?"],
    a: ["Surplus value obtained by lengthening the working day", "La plus-value obtenue en allongeant la journée de travail", "El plusvalor obtenido alargando la jornada de trabajo"],
    w: [["Surplus value obtained by making wage goods cheaper", "La plus-value obtenue en rendant les biens salariaux moins chers", "El plusvalor obtenido abaratando los bienes salariales"], ["The total surplus value of a whole country", "La plus-value totale d'un pays entier", "El plusvalor total de un país entero"], ["Surplus value that does not depend on any wage", "La plus-value qui ne dépend d'aucun salaire", "El plusvalor que no depende de ningún salario"]],
    e: [
      "With necessary labour fixed, every hour added to the day is surplus labour. Making wage goods cheaper, which shortens necessary labour within the same day, is relative surplus value (Part 5 of the course).",
      "À travail nécessaire fixe, chaque heure ajoutée à la journée est du surtravail. Rendre les biens salariaux moins chers, ce qui raccourcit le travail nécessaire dans la même journée, c'est la plus-value relative (partie 5 du cours).",
      "Con el trabajo necesario fijo, cada hora añadida a la jornada es plustrabajo. Abaratar los bienes salariales, lo que acorta el trabajo necesario dentro de la misma jornada, es el plusvalor relativo (parte 5 del curso).",
    ],
  },
  {
    id: "mx-wd-03",
    q: ["Which English law of 1847 limited the working day in textile mills to ten hours for women and young persons?", "Quelle loi anglaise de 1847 a limité à dix heures la journée des femmes et des adolescents dans les filatures ?", "¿Qué ley inglesa de 1847 limitó a diez horas la jornada de mujeres y adolescentes en las fábricas textiles?"],
    a: ["The Ten Hours' Act", "La loi des dix heures (Ten Hours' Act)", "La ley de las diez horas (Ten Hours' Act)"],
    w: [["The Poor Law Amendment Act", "La loi sur les pauvres (Poor Law Amendment Act)", "La ley de pobres (Poor Law Amendment Act)"], ["The Corn Laws", "Les lois sur les blés (Corn Laws)", "Las leyes de granos (Corn Laws)"], ["The Statute of Labourers", "Le statut des travailleurs (Statute of Labourers)", "El estatuto de los trabajadores (Statute of Labourers)"]],
    e: [
      "Chapter 10 follows the Factory Acts: 1833 for children, 1844 for women, the Ten Hours' Act of 1847, and the 1850 Act that closed the 'relay system' employers used to evade it. Marx reads them as won by workers' struggle.",
      "Le chapitre 10 suit les lois sur les fabriques : 1833 pour les enfants, 1844 pour les femmes, la loi des dix heures de 1847, et la loi de 1850 qui a fermé le « système des relais » par lequel les employeurs la contournaient. Marx les lit comme conquises par la lutte ouvrière.",
      "El capítulo 10 sigue las leyes fabriles: 1833 para los niños, 1844 para las mujeres, la ley de las diez horas de 1847 y la ley de 1850 que cerró el «sistema de relevos» con que los patronos la eludían. Marx las lee como conquistadas por la lucha obrera.",
    ],
  },
];

const relativeBasics: MarxQuestion[] = [
  {
    id: "mx-rel-01",
    q: ["How does relative surplus value arise?", "Comment naît la plus-value relative ?", "¿Cómo surge el plusvalor relativo?"],
    a: ["Higher productivity cheapens wage goods, shortening necessary labour within the same day", "Une productivité accrue rend les biens salariaux moins chers, ce qui raccourcit le travail nécessaire dans la même journée", "Una mayor productividad abarata los bienes salariales y acorta el trabajo necesario dentro de la misma jornada"],
    w: [["The employer lengthens the working day beyond its legal limit", "L'employeur allonge la journée de travail au-delà de sa limite légale", "El patrón alarga la jornada de trabajo más allá de su límite legal"], ["Workers accept lower real wages in a crisis", "Les ouvriers acceptent des salaires réels plus bas pendant une crise", "Los obreros aceptan salarios reales más bajos en una crisis"], ["The capitalist sells above value to other capitalists", "Le capitaliste vend au-dessus de la valeur à d'autres capitalistes", "El capitalista vende por encima del valor a otros capitalistas"]],
    e: [
      "If the means of subsistence take less time to produce, the value of labour-power falls and, in an unchanged day, surplus labour grows. The worker may consume as much as before, or more, and still be more exploited (Volume I, chapter 12).",
      "Si les moyens de subsistance demandent moins de temps à produire, la valeur de la force de travail baisse et, dans une journée inchangée, le surtravail augmente. L'ouvrier peut consommer autant qu'avant, ou plus, et être pourtant plus exploité (Livre I, chapitre 12).",
      "Si los medios de subsistencia requieren menos tiempo para producirse, el valor de la fuerza de trabajo baja y, en una jornada igual, el plustrabajo crece. El obrero puede consumir lo mismo que antes, o más, y estar sin embargo más explotado (Libro I, capítulo 12).",
    ],
  },
  {
    id: "mx-rel-02",
    q: ["Does a machine create new value in the product?", "Une machine crée-t-elle de la valeur nouvelle dans le produit ?", "¿Crea una máquina valor nuevo en el producto?"],
    a: ["No: it transfers its own value, bit by bit, as it wears out", "Non : elle transmet sa propre valeur, peu à peu, à mesure qu'elle s'use", "No: transfiere su propio valor, poco a poco, a medida que se desgasta"],
    w: [["Yes: more value the more productive it is", "Oui : d'autant plus qu'elle est productive", "Sí: tanto más cuanto más productiva es"], ["Yes: as much as the workers it replaces", "Oui : autant que les ouvriers qu'elle remplace", "Sí: tanto como los obreros a los que sustituye"], ["Only when it runs at night", "Seulement quand elle tourne la nuit", "Solo cuando funciona de noche"]],
    e: [
      "A machine is constant capital. It makes labour more productive, so more use values come out of an hour, but the value it adds to them is only its own, spread over its life. New value comes from living labour alone.",
      "Une machine est du capital constant. Elle rend le travail plus productif, donc une heure donne plus de valeurs d'usage, mais la valeur qu'elle leur ajoute n'est que la sienne, répartie sur sa durée de vie. La valeur nouvelle vient du seul travail vivant.",
      "Una máquina es capital constante. Hace el trabajo más productivo, así que una hora da más valores de uso, pero el valor que les añade es solo el suyo, repartido a lo largo de su vida útil. El valor nuevo viene solo del trabajo vivo.",
    ],
  },
  {
    id: "mx-rel-03",
    q: ["In co-operation, whom does the extra productive power of combined labour appear to belong to?", "Dans la coopération, à qui semble appartenir la force productive supplémentaire du travail combiné ?", "En la cooperación, ¿a quién parece pertenecer la fuerza productiva adicional del trabajo combinado?"],
    a: ["To capital, which brings the workers together and commands them", "Au capital, qui réunit les ouvriers et les commande", "Al capital, que reúne a los obreros y los dirige"],
    w: [["To each worker separately, paid for it in wages", "À chaque ouvrier séparément, payé pour elle dans son salaire", "A cada obrero por separado, pagado por ella en su salario"], ["To the state, which taxes it", "À l'État, qui la taxe", "Al Estado, que la grava"], ["To the consumer, who pays a lower price", "Au consommateur, qui paie un prix plus bas", "Al consumidor, que paga un precio más bajo"]],
    e: [
      "The capitalist pays each worker for their individual labour-power; the productive power that arises from working together costs nothing and appears as a power of capital. Command, supervision, becomes a function of capital (Volume I, chapter 13).",
      "Le capitaliste paie à chaque ouvrier sa force de travail individuelle ; la force productive qui naît du travail en commun ne lui coûte rien et apparaît comme une force du capital. Le commandement, la surveillance, devient une fonction du capital (Livre I, chapitre 13).",
      "El capitalista paga a cada obrero su fuerza de trabajo individual; la fuerza productiva que nace del trabajo en común no le cuesta nada y aparece como una fuerza del capital. El mando, la vigilancia, se convierte en una función del capital (Libro I, capítulo 13).",
    ],
  },
];

const wagesBasics: MarxQuestion[] = [
  {
    id: "mx-wag-01",
    q: ["What does the wage form hide, according to Marx?", "Que cache la forme salaire, selon Marx ?", "¿Qué oculta la forma salario, según Marx?"],
    a: ["The division of the working day into paid and unpaid labour", "La division de la journée de travail en travail payé et non payé", "La división de la jornada en trabajo pagado y no pagado"],
    w: [["The fact that wages are paid in money rather than in kind", "Le fait que les salaires sont payés en argent plutôt qu'en nature", "El hecho de que los salarios se pagan en dinero y no en especie"], ["The value of the means of production used", "La valeur des moyens de production utilisés", "El valor de los medios de producción utilizados"], ["The taxes the employer pays on wages", "Les impôts que l'employeur paie sur les salaires", "Los impuestos que el patrón paga sobre los salarios"]],
    e: [
      "Paid per hour or per piece after the work, the wage seems to pay for all the labour done. Under serfdom unpaid labour is visible; in wage labour even unpaid labour appears paid (Volume I, chapter 19).",
      "Payé à l'heure ou à la pièce après le travail, le salaire semble payer tout le travail fourni. Sous le servage, le travail non payé est visible ; dans le salariat, même le travail non payé paraît payé (Livre I, chapitre 19).",
      "Pagado por hora o por pieza después del trabajo, el salario parece pagar todo el trabajo realizado. Bajo la servidumbre el trabajo no pagado es visible; en el trabajo asalariado incluso el no pagado parece pagado (Libro I, capítulo 19).",
    ],
  },
  {
    id: "mx-wag-02",
    q: ["What are piece wages, for Marx?", "Qu'est-ce que le salaire aux pièces, pour Marx ?", "¿Qué es el salario a destajo, para Marx?"],
    a: ["A converted form of time wages, set from the output of an average day", "Une forme transformée du salaire au temps, fixée d'après la production d'une journée moyenne", "Una forma transformada del salario por tiempo, fijada según la producción de una jornada media"],
    w: [["Payment for the full value each piece contains", "Le paiement de toute la valeur que contient chaque pièce", "El pago de todo el valor que contiene cada pieza"], ["A share of the profit on each piece sold", "Une part du profit sur chaque pièce vendue", "Una parte de la ganancia de cada pieza vendida"], ["A form of wages that ends exploitation", "Une forme de salaire qui supprime l'exploitation", "Una forma de salario que suprime la explotación"]],
    e: [
      "The rate per piece is calculated so that an average day's output earns the daily value of labour-power. The form itself controls quality and intensity and pushes workers to work longer and faster: 'most in harmony with the capitalist mode of production' (chapter 21).",
      "Le tarif par pièce est calculé pour qu'une journée moyenne rapporte la valeur journalière de la force de travail. La forme elle-même contrôle la qualité et l'intensité, et pousse les ouvriers à travailler plus longtemps et plus vite : la forme du salaire la plus conforme au mode de production capitaliste (chapitre 21).",
      "La tarifa por pieza se calcula para que una jornada media rinda el valor diario de la fuerza de trabajo. La forma misma controla la calidad y la intensidad, y empuja a los obreros a trabajar más tiempo y más deprisa: la forma de salario más adecuada al modo de producción capitalista (capítulo 21).",
    ],
  },
  {
    id: "mx-wag-03",
    q: ["Why does Marx call the expression 'value of labour' irrational?", "Pourquoi Marx dit-il que l'expression « valeur du travail » est irrationnelle ?", "¿Por qué dice Marx que la expresión «valor del trabajo» es irracional?"],
    a: ["Labour is the substance and measure of value and has no value itself; what is sold is labour-power", "Le travail est la substance et la mesure de la valeur et n'a pas de valeur lui-même ; ce qui se vend, c'est la force de travail", "El trabajo es la sustancia y la medida del valor y no tiene valor; lo que se vende es la fuerza de trabajo"],
    w: [["Labour is never paid in money", "Le travail n'est jamais payé en argent", "El trabajo nunca se paga en dinero"], ["The value of labour changes every day", "La valeur du travail change chaque jour", "El valor del trabajo cambia cada día"], ["Only machines have a value", "Seules les machines ont une valeur", "Solo las máquinas tienen valor"]],
    e: [
      "Asking the value of labour is like asking the weight of weight: a twelve-hour day of labour would be 'worth' twelve hours. The phrase is the surface form of the value of labour-power, and it hides surplus value.",
      "Demander la valeur du travail, c'est comme demander le poids du poids : une journée de douze heures de travail « vaudrait » douze heures. L'expression est la forme de surface de la valeur de la force de travail, et elle cache la plus-value.",
      "Preguntar el valor del trabajo es como preguntar el peso del peso: una jornada de doce horas de trabajo «valdría» doce horas. La expresión es la forma superficial del valor de la fuerza de trabajo, y oculta el plusvalor.",
    ],
  },
];

const accumulationBasics: MarxQuestion[] = [
  {
    id: "mx-acc-01",
    q: ["Besides goods, what does simple reproduction reproduce?", "Outre des biens, que reproduit la reproduction simple ?", "Además de bienes, ¿qué reproduce la reproducción simple?"],
    a: ["The capital relation itself: capitalists on one side, workers without means of production on the other", "Le rapport capitaliste lui-même : des capitalistes d'un côté, des ouvriers sans moyens de production de l'autre", "La relación capitalista misma: capitalistas de un lado, obreros sin medios de producción del otro"],
    w: [["Nothing else: it is a purely technical repetition", "Rien d'autre : c'est une répétition purement technique", "Nada más: es una repetición puramente técnica"], ["A gradual equalisation of wealth", "Une égalisation progressive des richesses", "Una igualación progresiva de la riqueza"], ["The workers' ownership of their tools", "La propriété des ouvriers sur leurs outils", "La propiedad de los obreros sobre sus herramientas"]],
    e: [
      "Each round ends with workers who must sell their labour-power again and capitalists who own the product. Over time, even the original capital is consumed and replaced by capitalised surplus value (Volume I, chapter 23).",
      "Chaque cycle se termine avec des ouvriers qui doivent revendre leur force de travail et des capitalistes qui possèdent le produit. Avec le temps, même le capital initial est consommé et remplacé par de la plus-value capitalisée (Livre I, chapitre 23).",
      "Cada ciclo termina con obreros que deben vender de nuevo su fuerza de trabajo y capitalistas dueños del producto. Con el tiempo, incluso el capital inicial se consume y se sustituye por plusvalor capitalizado (Libro I, capítulo 23).",
    ],
  },
  {
    id: "mx-acc-02",
    q: ["Where does the industrial reserve army come from, according to Marx?", "D'où vient l'armée industrielle de réserve, selon Marx ?", "¿De dónde viene el ejército industrial de reserva, según Marx?"],
    a: ["From accumulation itself, as capital needs relatively less labour", "De l'accumulation elle-même, le capital ayant relativement moins besoin de travail", "De la propia acumulación, pues el capital necesita relativamente menos trabajo"],
    w: [["From workers having too many children", "Des ouvriers qui ont trop d'enfants", "De que los obreros tienen demasiados hijos"], ["From laziness encouraged by poor relief", "De la paresse encouragée par l'assistance", "De la pereza fomentada por la asistencia"], ["From immigration alone", "De la seule immigration", "Solo de la inmigración"]],
    e: [
      "As the organic composition rises, demand for labour grows more slowly than capital: capital produces its own relative surplus population. Marx turns against Malthus, for whom population growth was the cause (Volume I, chapter 25).",
      "Quand la composition organique monte, la demande de travail croît moins vite que le capital : le capital produit sa propre surpopulation relative. Marx se retourne contre Malthus, pour qui la croissance de la population était la cause (Livre I, chapitre 25).",
      "Cuando sube la composición orgánica, la demanda de trabajo crece más despacio que el capital: el capital produce su propia sobrepoblación relativa. Marx se vuelve contra Malthus, para quien la causa era el crecimiento de la población (Libro I, capítulo 25).",
    ],
  },
  {
    id: "mx-acc-03",
    q: ["What is the organic composition of capital?", "Qu'est-ce que la composition organique du capital ?", "¿Qué es la composición orgánica del capital?"],
    a: ["The value ratio $c/v$, in so far as it reflects the technical ratio of means of production to workers", "Le rapport en valeur $c/v$, dans la mesure où il reflète le rapport technique entre moyens de production et ouvriers", "La relación de valor $c/v$, en cuanto refleja la relación técnica entre medios de producción y obreros"],
    w: [["The ratio of profit to wages, $s/v$", "Le rapport du profit aux salaires, $s/v$", "La relación de la ganancia a los salarios, $s/v$"], ["The share of capital owned by shareholders", "La part du capital détenue par des actionnaires", "La parte del capital en manos de accionistas"], ["The number of workers per firm", "Le nombre d'ouvriers par entreprise", "El número de obreros por empresa"]],
    e: [
      "The technical composition is the mass of means of production per worker; the value composition is $c/v$; Marx calls the value composition organic when it follows changes in technique. Accumulation tends to raise it.",
      "La composition technique est la masse de moyens de production par ouvrier ; la composition-valeur est $c/v$ ; Marx appelle organique la composition-valeur quand elle suit les changements techniques. L'accumulation tend à l'élever.",
      "La composición técnica es la masa de medios de producción por obrero; la composición de valor es $c/v$; Marx llama orgánica a la composición de valor cuando sigue los cambios técnicos. La acumulación tiende a elevarla.",
    ],
  },
];

const primitiveBasics: MarxQuestion[] = [
  {
    id: "mx-pri-01",
    q: ["What is so-called primitive accumulation, at its core?", "Qu'est-ce, au fond, que l'accumulation dite primitive ?", "¿Qué es, en el fondo, la llamada acumulación originaria?"],
    a: ["The historical separation of producers from their means of production", "La séparation historique des producteurs d'avec leurs moyens de production", "La separación histórica de los productores respecto de sus medios de producción"],
    w: [["The savings of the first industrious capitalists", "L'épargne des premiers capitalistes travailleurs", "El ahorro de los primeros capitalistas laboriosos"], ["The first accumulation of gold by merchants", "La première accumulation d'or par les marchands", "La primera acumulación de oro por los comerciantes"], ["The first factories built with machinery", "Les premières fabriques équipées de machines", "Las primeras fábricas equipadas con máquinas"]],
    e: [
      "Capitalist accumulation presupposes workers who have nothing to sell but their labour-power. They were created by expropriation, above all from the land, by force and law (Volume I, chapters 26–27). The French translation calls it accumulation primitive, the Spanish acumulación originaria.",
      "L'accumulation capitaliste suppose des ouvriers qui n'ont rien d'autre à vendre que leur force de travail. Ils ont été créés par l'expropriation, surtout de la terre, par la force et par la loi (Livre I, chapitres 26–27 de l'édition anglaise, chapitre 24 de l'allemande).",
      "La acumulación capitalista supone obreros que no tienen nada que vender salvo su fuerza de trabajo. Fueron creados por la expropiación, sobre todo de la tierra, por la fuerza y la ley (Libro I, capítulos 26–27 de la edición inglesa, capítulo 24 de la alemana).",
    ],
  },
  {
    id: "mx-pri-02",
    q: ["In England, what did the enclosures of common land do, according to Marx?", "En Angleterre, qu'ont fait les enclosures des terres communales, selon Marx ?", "En Inglaterra, ¿qué hicieron los cercamientos de tierras comunales, según Marx?"],
    a: ["They drove peasants off the land and turned them into proletarians", "Elles ont chassé les paysans de la terre et en ont fait des prolétaires", "Expulsaron a los campesinos de la tierra y los convirtieron en proletarios"],
    w: [["They gave each peasant family its own fenced plot", "Elles ont donné à chaque famille paysanne sa propre parcelle close", "Dieron a cada familia campesina su propia parcela cercada"], ["They protected woods from overuse by landlords", "Elles ont protégé les bois de la surexploitation par les seigneurs", "Protegieron los bosques de la sobreexplotación por los señores"], ["They mainly served the Crown's hunting rights", "Elles servaient surtout les droits de chasse de la Couronne", "Servían sobre todo a los derechos de caza de la Corona"]],
    e: [
      "Turning arable and common land into sheep-walks and large farms, from the 15th century to the Highland Clearances, expropriated the rural population and supplied both labour for industry and a home market (chapter 27).",
      "En transformant terres arables et communaux en pâturages à moutons et en grandes fermes, du XVe siècle aux Highland Clearances, les enclosures ont exproprié la population rurale et fourni à la fois du travail pour l'industrie et un marché intérieur (chapitre 27).",
      "Al convertir tierras de labor y comunales en pastos para ovejas y grandes fincas, del siglo XV a los Highland Clearances, los cercamientos expropiaron a la población rural y proporcionaron a la vez mano de obra para la industria y un mercado interior (capítulo 27).",
    ],
  },
  {
    id: "mx-pri-03",
    q: ["What does Marx call the laws against vagabondage from the end of the 15th century?", "Comment Marx appelle-t-il les lois contre le vagabondage depuis la fin du XVe siècle ?", "¿Cómo llama Marx a las leyes contra la vagancia desde finales del siglo XV?"],
    a: ["Bloody legislation, which forced the expropriated into wage discipline", "Une législation sanguinaire, qui a soumis les expropriés à la discipline du salariat", "Una legislación sanguinaria, que sometió a los expropiados a la disciplina del salario"],
    w: [["Poor relief that freed workers from the labour market", "Une assistance qui libérait les ouvriers du marché du travail", "Una asistencia que liberaba a los obreros del mercado de trabajo"], ["The first social insurance laws", "Les premières lois d'assurance sociale", "Las primeras leyes de seguro social"], ["Laws protecting the guilds' monopolies", "Des lois protégeant les monopoles des corporations", "Leyes que protegían los monopolios de los gremios"]],
    e: [
      "Whipping, branding, enslavement and execution punished those who did not work, while statutes fixed maximum wages. The state used force to create and discipline a working class (chapter 28).",
      "Le fouet, la marque au fer, l'esclavage et la mort punissaient ceux qui ne travaillaient pas, tandis que des statuts fixaient des salaires maximums. L'État a usé de la force pour créer et discipliner une classe ouvrière (chapitre 28).",
      "Los azotes, la marca a hierro, la esclavitud y la muerte castigaban a quienes no trabajaban, mientras los estatutos fijaban salarios máximos. El Estado usó la fuerza para crear y disciplinar a una clase obrera (capítulo 28).",
    ],
  },
];

const circulationBasics: MarxQuestion[] = [
  {
    id: "mx-cir-01",
    q: ["Through which three forms does industrial capital pass in its circuit?", "Par quelles trois formes le capital industriel passe-t-il dans son cycle ?", "¿Por qué tres formas pasa el capital industrial en su ciclo?"],
    a: ["Money capital, productive capital, commodity capital", "Capital-argent, capital productif, capital-marchandise", "Capital dinerario, capital productivo, capital mercancías"],
    w: [["Fixed capital, circulating capital, fictitious capital", "Capital fixe, capital circulant, capital fictif", "Capital fijo, capital circulante, capital ficticio"], ["Merchant capital, bank capital, landed capital", "Capital marchand, capital bancaire, capital foncier", "Capital comercial, capital bancario, capital territorial"], ["Constant capital, variable capital, surplus value", "Capital constant, capital variable, plus-value", "Capital constante, capital variable, plusvalor"]],
    e: [
      "M – C … P … C′ – M′: money buys labour-power and means of production, production yields commodities containing surplus value, and their sale returns more money. A capital must be in all three forms at once, in different portions, to produce without interruption (Volume II, chapters 1–4).",
      "A – M … P … M′ – A′ : l'argent achète force de travail et moyens de production, la production donne des marchandises qui contiennent de la plus-value, et leur vente rend plus d'argent. Un capital doit se trouver sous les trois formes à la fois, en portions différentes, pour produire sans interruption (Livre II, chapitres 1–4).",
      "D – M … P … M′ – D′: el dinero compra fuerza de trabajo y medios de producción, la producción da mercancías que contienen plusvalor y su venta devuelve más dinero. Un capital debe estar en las tres formas a la vez, en porciones distintas, para producir sin interrupción (Libro II, capítulos 1–4).",
    ],
  },
  {
    id: "mx-cir-02",
    q: ["What is the turnover time of a capital?", "Qu'est-ce que le temps de rotation d'un capital ?", "¿Qué es el tiempo de rotación de un capital?"],
    a: ["Its time of production plus its time of circulation", "Son temps de production plus son temps de circulation", "Su tiempo de producción más su tiempo de circulación"],
    w: [["The time the workers spend at work each day", "Le temps que les ouvriers passent au travail chaque jour", "El tiempo que los obreros pasan trabajando cada día"], ["The life of its machines", "La durée de vie de ses machines", "La vida útil de sus máquinas"], ["The time between two dividends", "Le temps entre deux dividendes", "El tiempo entre dos dividendos"]],
    e: [
      "Turnover is the time a capital takes to return to its money form with its surplus value: producing, then selling and buying again. The number of turnovers in a year is the year divided by that time (Volume II, chapter 7).",
      "La rotation est le temps qu'il faut à un capital pour revenir à sa forme argent avec sa plus-value : produire, puis vendre et racheter. Le nombre de rotations dans l'année est l'année divisée par ce temps (Livre II, chapitre 7).",
      "La rotación es el tiempo que tarda un capital en volver a su forma dinero con su plusvalor: producir, luego vender y volver a comprar. El número de rotaciones en un año es el año dividido por ese tiempo (Libro II, capítulo 7).",
    ],
  },
  {
    id: "mx-cir-03",
    q: ["What distinguishes fixed capital from circulating capital?", "Qu'est-ce qui distingue le capital fixe du capital circulant ?", "¿Qué distingue el capital fijo del circulante?"],
    a: ["Fixed capital transfers its value over many turnovers, circulating capital in each one", "Le capital fixe transmet sa valeur sur de nombreuses rotations, le capital circulant à chaque rotation", "El capital fijo transfiere su valor a lo largo de muchas rotaciones, el circulante en cada una"],
    w: [["Fixed capital creates value, circulating capital does not", "Le capital fixe crée de la valeur, le capital circulant non", "El capital fijo crea valor, el circulante no"], ["Fixed capital is the workers' wages", "Le capital fixe, ce sont les salaires des ouvriers", "El capital fijo son los salarios de los obreros"], ["Circulating capital is the money in the bank", "Le capital circulant, c'est l'argent à la banque", "El capital circulante es el dinero en el banco"]],
    e: [
      "A machine passes its value into products over years; materials and wages are replaced with each product sold. This is a distinction of turnover, not of value creation: wages are circulating and variable, materials circulating but constant.",
      "Une machine fait passer sa valeur dans les produits sur des années ; les matières et les salaires sont remplacés avec chaque produit vendu. C'est une distinction de rotation, pas de création de valeur : les salaires sont circulants et variables, les matières circulantes mais constantes.",
      "Una máquina pasa su valor a los productos a lo largo de años; los materiales y los salarios se reponen con cada producto vendido. Es una distinción de rotación, no de creación de valor: los salarios son circulantes y variables, los materiales circulantes pero constantes.",
    ],
  },
];

const reproductionBasics: MarxQuestion[] = [
  {
    id: "mx-rep-01",
    q: ["In Marx's reproduction schemes, what does Department I produce?", "Dans les schémas de reproduction de Marx, que produit le secteur I ?", "En los esquemas de reproducción de Marx, ¿qué produce el sector I?"],
    a: ["Means of production", "Des moyens de production", "Medios de producción"],
    w: [["Means of consumption for workers and capitalists", "Des moyens de consommation pour ouvriers et capitalistes", "Medios de consumo para obreros y capitalistas"], ["Luxury goods only", "Seulement des biens de luxe", "Solo bienes de lujo"], ["Gold for money", "De l'or pour la monnaie", "Oro para el dinero"]],
    e: [
      "Department I makes machines, materials and energy; Department II makes consumer goods. Each product is $c + v + s$, and the two departments must exchange part of their products for the economy to reproduce itself (Volume II, chapter 20).",
      "Le secteur I fabrique machines, matières et énergie ; le secteur II des biens de consommation. Chaque produit vaut $c + v + s$, et les deux secteurs doivent échanger une partie de leurs produits pour que l'économie se reproduise (Livre II, chapitre 20).",
      "El sector I fabrica máquinas, materiales y energía; el sector II, bienes de consumo. Cada producto vale $c + v + s$, y los dos sectores deben intercambiar parte de sus productos para que la economía se reproduzca (Libro II, capítulo 20).",
    ],
  },
  {
    id: "mx-rep-02",
    q: ["What condition must hold for simple reproduction?", "Quelle condition doit être remplie pour la reproduction simple ?", "¿Qué condición debe cumplirse para la reproducción simple?"],
    a: ["$\\text{I}(v+s) = \\text{II}c$", "$\\text{I}(v+s) = \\text{II}c$", "$\\text{I}(v+s) = \\text{II}c$"],
    w: [["$\\text{I}c = \\text{II}c$", "$\\text{I}c = \\text{II}c$", "$\\text{I}c = \\text{II}c$"], ["$\\text{I}(c+v+s) = \\text{II}(c+v+s)$", "$\\text{I}(c+v+s) = \\text{II}(c+v+s)$", "$\\text{I}(c+v+s) = \\text{II}(c+v+s)$"], ["$\\text{I}s = \\text{II}s$", "$\\text{I}s = \\text{II}s$", "$\\text{I}s = \\text{II}s$"]],
    e: [
      "Department I's workers and capitalists need consumer goods worth I(v + s); Department II needs means of production worth IIc to replace what it used up. The exchange balances only if the two are equal.",
      "Les ouvriers et capitalistes du secteur I ont besoin de biens de consommation valant I(v + s) ; le secteur II a besoin de moyens de production valant IIc pour remplacer ce qu'il a usé. L'échange s'équilibre seulement si les deux sont égaux.",
      "Los obreros y capitalistas del sector I necesitan bienes de consumo por valor de I(v + s); el sector II necesita medios de producción por valor de IIc para reponer lo que gastó. El intercambio se equilibra solo si ambos son iguales.",
    ],
  },
  {
    id: "mx-rep-03",
    q: ["What does expanded reproduction require of Department I?", "Qu'exige la reproduction élargie du secteur I ?", "¿Qué exige la reproducción ampliada del sector I?"],
    a: ["That $\\text{I}(v+s)$ exceed $\\text{II}c$: more means of production than both departments use up", "Que $\\text{I}(v+s)$ dépasse $\\text{II}c$ : plus de moyens de production que les deux secteurs n'en usent", "Que $\\text{I}(v+s)$ supere a $\\text{II}c$: más medios de producción de los que ambos sectores consumen"],
    w: [["That it stop producing for Department II", "Qu'il cesse de produire pour le secteur II", "Que deje de producir para el sector II"], ["That its surplus value be entirely consumed", "Que sa plus-value soit entièrement consommée", "Que su plusvalor se consuma por completo"], ["That $\\text{I}(v+s)$ be smaller than $\\text{II}c$", "Que $\\text{I}(v+s)$ soit plus petit que $\\text{II}c$", "Que $\\text{I}(v+s)$ sea menor que $\\text{II}c$"]],
    e: [
      "To accumulate, the economy must produce additional means of production; they can only come from Department I. Marx's first expanded scheme starts from I: 4000c + 1000v + 1000s and II: 1500c + 750v + 750s, so that 500 are available (Volume II, chapter 21).",
      "Pour accumuler, l'économie doit produire des moyens de production supplémentaires ; ils ne peuvent venir que du secteur I. Le premier schéma élargi de Marx part de I : 4000c + 1000v + 1000s et II : 1500c + 750v + 750s, si bien que 500 sont disponibles (Livre II, chapitre 21).",
      "Para acumular, la economía debe producir medios de producción adicionales; solo pueden venir del sector I. El primer esquema ampliado de Marx parte de I: 4000c + 1000v + 1000s y II: 1500c + 750v + 750s, de modo que quedan 500 disponibles (Libro II, capítulo 21).",
    ],
  },
];

const profitBasics: MarxQuestion[] = [
  {
    id: "mx-pro-01",
    q: ["What is the cost price of a commodity in Volume III?", "Qu'est-ce que le prix de revient d'une marchandise dans le Livre III ?", "¿Qué es el precio de coste de una mercancía en el Libro III?"],
    a: ["$k = c + v$, what the commodity costs the capitalist", "$k = c + v$, ce que la marchandise coûte au capitaliste", "$k = c + v$, lo que la mercancía le cuesta al capitalista"],
    w: [["$c + v + s$, what it costs society", "$c + v + s$, ce qu'elle coûte à la société", "$c + v + s$, lo que le cuesta a la sociedad"], ["$v + s$, the new value created", "$v + s$, la valeur nouvelle créée", "$v + s$, el valor nuevo creado"], ["The market price on the day of sale", "Le prix de marché le jour de la vente", "El precio de mercado el día de la venta"]],
    e: [
      "The commodity costs the capitalist $c + v$ but costs society its value $c + v + s$, including the surplus labour. Profit appears as the excess of the selling price over the cost price, as if it came from the whole capital (Volume III, chapter 1).",
      "La marchandise coûte au capitaliste $c + v$, mais elle coûte à la société sa valeur $c + v + s$, surtravail compris. Le profit apparaît comme l'excédent du prix de vente sur le prix de revient, comme s'il venait de tout le capital (Livre III, chapitre 1).",
      "La mercancía le cuesta al capitalista $c + v$, pero a la sociedad le cuesta su valor $c + v + s$, plustrabajo incluido. La ganancia aparece como el excedente del precio de venta sobre el precio de coste, como si viniera de todo el capital (Libro III, capítulo 1).",
    ],
  },
  {
    id: "mx-pro-02",
    q: ["Compared with the rate of surplus value, the rate of profit is…", "Par rapport au taux de plus-value, le taux de profit est…", "En comparación con la tasa de plusvalor, la tasa de ganancia es…"],
    a: ["Always lower, since it divides by $c + v$ instead of $v$", "Toujours plus bas, puisqu'il divise par $c + v$ au lieu de $v$", "Siempre menor, pues divide por $c + v$ en vez de por $v$"],
    w: [["Always higher, since it counts the whole capital", "Toujours plus élevé, puisqu'il compte tout le capital", "Siempre mayor, pues cuenta todo el capital"], ["Equal to it whenever wages are paid in full", "Égal à lui dès que les salaires sont payés en entier", "Igual a ella siempre que los salarios se pagan por entero"], ["Unrelated to it", "Sans rapport avec lui", "Sin relación con ella"]],
    e: [
      "Both have the same numerator, surplus value. $p' = s/(c+v) = s' \\cdot v/(c+v)$, and $v/(c+v) < 1$ as long as there are means of production. Example: $80c + 20v + 20s$ gives $s' = 100\\%$, $p' = 20\\%$.",
      "Les deux ont le même numérateur, la plus-value. $p' = s/(c+v) = s' \\cdot v/(c+v)$, et $v/(c+v) < 1$ dès qu'il y a des moyens de production. Exemple : $80c + 20v + 20s$ donne $s' = 100\\%$, $p' = 20\\%$.",
      "Ambas tienen el mismo numerador, el plusvalor. $p' = s/(c+v) = s' \\cdot v/(c+v)$, y $v/(c+v) < 1$ en cuanto hay medios de producción. Ejemplo: $80c + 20v + 20s$ da $s' = 100\\%$, $p' = 20\\%$.",
    ],
  },
  {
    id: "mx-pro-03",
    q: ["What makes the rates of profit of different branches tend to equalise?", "Qu'est-ce qui fait tendre à l'égalité les taux de profit des différentes branches ?", "¿Qué hace que las tasas de ganancia de las distintas ramas tiendan a igualarse?"],
    a: ["Competition: capital moves from low-profit branches to high-profit ones", "La concurrence : le capital quitte les branches peu rentables pour les plus rentables", "La competencia: el capital pasa de las ramas poco rentables a las más rentables"],
    w: [["A law fixing the same profit for all", "Une loi qui fixe le même profit pour tous", "Una ley que fija la misma ganancia para todos"], ["The equal organic composition of all capitals", "La composition organique égale de tous les capitaux", "La composición orgánica igual de todos los capitales"], ["Workers moving to the best-paid branches", "Les ouvriers qui se déplacent vers les branches les mieux payées", "Los obreros que se trasladan a las ramas mejor pagadas"]],
    e: [
      "At the same rate of exploitation, branches with a low composition would earn more. Capital flows in, supply rises, prices fall there and rise elsewhere, until a general rate of profit forms and goods sell at prices of production (Volume III, chapters 9–10).",
      "À taux d'exploitation égal, les branches à faible composition gagneraient plus. Le capital y afflue, l'offre augmente, les prix y baissent et montent ailleurs, jusqu'à ce qu'un taux général de profit se forme et que les biens se vendent à leurs prix de production (Livre III, chapitres 9–10).",
      "Con igual tasa de explotación, las ramas de composición baja ganarían más. El capital acude a ellas, la oferta aumenta, allí bajan los precios y suben en otras, hasta que se forma una tasa general de ganancia y los bienes se venden a precios de producción (Libro III, capítulos 9–10).",
    ],
  },
];

const creditBasics: MarxQuestion[] = [
  {
    id: "mx-cre-01",
    q: ["Does merchant capital produce surplus value?", "Le capital marchand produit-il de la plus-value ?", "¿Produce plusvalor el capital comercial?"],
    a: ["No, but it shares in the general rate of profit", "Non, mais il participe au taux général de profit", "No, pero participa en la tasa general de ganancia"],
    w: [["Yes: buying cheap and selling dear creates value", "Oui : acheter bon marché et vendre cher crée de la valeur", "Sí: comprar barato y vender caro crea valor"], ["Yes, as much as industrial capital of the same size", "Oui, autant qu'un capital industriel de même taille", "Sí, tanto como un capital industrial del mismo tamaño"], ["No, and merchants earn no profit at all", "Non, et les marchands ne font aucun profit", "No, y los comerciantes no obtienen ninguna ganancia"]],
    e: [
      "Buying and selling only change the form of value. By shortening circulation, merchants save industrial capital time, and they receive a share of surplus value: industrialists sell to them below the price of production, they sell at it (Volume III, chapters 16–17).",
      "Acheter et vendre ne font que changer la forme de la valeur. En raccourcissant la circulation, les marchands font gagner du temps au capital industriel, et ils reçoivent une part de la plus-value : les industriels leur vendent au-dessous du prix de production, ils vendent à ce prix (Livre III, chapitres 16–17).",
      "Comprar y vender solo cambian la forma del valor. Al acortar la circulación, los comerciantes ahorran tiempo al capital industrial y reciben una parte del plusvalor: los industriales les venden por debajo del precio de producción y ellos venden a ese precio (Libro III, capítulos 16–17).",
    ],
  },
  {
    id: "mx-cre-02",
    q: ["Where does interest come from, according to Marx?", "D'où vient l'intérêt, selon Marx ?", "¿De dónde viene el interés, según Marx?"],
    a: ["It is a part of the profit made with the borrowed capital", "C'est une part du profit fait avec le capital emprunté", "Es una parte de la ganancia obtenida con el capital prestado"],
    w: [["From the productivity of money itself", "De la productivité de l'argent lui-même", "De la productividad del dinero mismo"], ["From the lender's abstinence, which creates value", "De l'abstinence du prêteur, qui crée de la valeur", "De la abstinencia del prestamista, que crea valor"], ["From a tax on wages collected by banks", "D'un impôt sur les salaires perçu par les banques", "De un impuesto sobre los salarios cobrado por los bancos"]],
    e: [
      "Money lent as capital lets the borrower make profit; the lender gets a share, interest, and the borrower keeps profit of enterprise. M–M′ looks like money breeding money, the most fetish-like form of capital (Volume III, chapters 21–24).",
      "L'argent prêté comme capital permet à l'emprunteur de faire du profit ; le prêteur en reçoit une part, l'intérêt, et l'emprunteur garde le profit d'entreprise. A–A′ ressemble à de l'argent qui engendre de l'argent, la forme la plus fétichisée du capital (Livre III, chapitres 21–24).",
      "El dinero prestado como capital permite al prestatario obtener ganancia; el prestamista recibe una parte, el interés, y el prestatario se queda con la ganancia empresarial. D–D′ parece dinero que engendra dinero, la forma más fetichista del capital (Libro III, capítulos 21–24).",
    ],
  },
  {
    id: "mx-cre-03",
    q: ["What sets the price of wheat when lands of unequal fertility are all cultivated?", "Qu'est-ce qui fixe le prix du blé quand des terres de fertilité inégale sont toutes cultivées ?", "¿Qué fija el precio del trigo cuando se cultivan tierras de fertilidad desigual?"],
    a: ["The price of production on the worst land in use", "Le prix de production sur la plus mauvaise terre cultivée", "El precio de producción en la peor tierra cultivada"],
    w: [["The price of production on the best land", "Le prix de production sur la meilleure terre", "El precio de producción en la mejor tierra"], ["The average of all lands' costs", "La moyenne des coûts de toutes les terres", "La media de los costes de todas las tierras"], ["The rent the landowners ask", "La rente que demandent les propriétaires", "La renta que piden los terratenientes"]],
    e: [
      "The worst land still cultivated must cover its price of production, or it would be abandoned; its cost regulates the market price. Better lands produce the same wheat more cheaply and the difference becomes differential rent (Volume III, chapters 38–39).",
      "La plus mauvaise terre encore cultivée doit couvrir son prix de production, sinon elle serait abandonnée ; son coût règle le prix de marché. Les meilleures terres produisent le même blé moins cher, et la différence devient rente différentielle (Livre III, chapitres 38–39).",
      "La peor tierra aún cultivada debe cubrir su precio de producción, o se abandonaría; su coste regula el precio de mercado. Las tierras mejores producen el mismo trigo más barato, y la diferencia se convierte en renta diferencial (Libro III, capítulos 38–39).",
    ],
  },
];

export const commodity = { commodityBasics };
export const money = { moneyBasics };
export const surplus = { surplusBasics };
export const workingDay = { dayBasics };
export const relative = { relativeBasics };
export const wages = { wagesBasics };
export const accumulation = { accumulationBasics };
export const primitive = { primitiveBasics };
export const circulation = { circulationBasics };
export const reproduction = { reproductionBasics };
export const profit = { profitBasics };
export const credit = { creditBasics };
