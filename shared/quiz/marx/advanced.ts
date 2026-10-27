/**
 * Marx's Capital, Avancé: finer points of the text and the main later
 * debates (value-form, subsumption, impoverishment, the transformation
 * problem, the falling rate of profit, rent). Positions in a debate are
 * stated as their authors' views, not as settled.
 */
import type { LinuxQuestion as MarxQuestion } from "../linux/types";

const commodityDebates: MarxQuestion[] = [
  {
    id: "mx-com-07",
    q: ["In '20 yards of linen = 1 coat', which commodity is in the equivalent form?", "Dans « 20 mètres de toile = 1 habit », quelle marchandise est sous la forme équivalent ?", "En «20 varas de lienzo = 1 chaqueta», ¿qué mercancía está en la forma de equivalente?"],
    a: ["The coat: its body serves to express the linen's value", "L'habit : son corps sert à exprimer la valeur de la toile", "La chaqueta: su cuerpo sirve para expresar el valor del lienzo"],
    w: [["The linen, since it comes first", "La toile, puisqu'elle vient en premier", "El lienzo, pues va primero"], ["Both equally, since the equation is symmetric", "Les deux également, puisque l'équation est symétrique", "Ambas por igual, pues la ecuación es simétrica"], ["Neither: only money can be an equivalent", "Aucune : seule la monnaie peut être un équivalent", "Ninguna: solo el dinero puede ser equivalente"]],
    e: [
      "The linen is in the relative form: its value is expressed. The coat is in the equivalent form: it counts as value in its natural shape. The expression is not symmetric; reading it backwards gives a different expression, of the coat's value (Volume I, chapter 1, section 3).",
      "La toile est sous la forme relative : sa valeur est exprimée. L'habit est sous la forme équivalent : il compte comme valeur dans sa forme naturelle. L'expression n'est pas symétrique ; la lire à l'envers donne une autre expression, celle de la valeur de l'habit (Livre I, chapitre 1, section 3).",
      "El lienzo está en la forma relativa: su valor se expresa. La chaqueta está en la forma de equivalente: cuenta como valor en su forma natural. La expresión no es simétrica; leída al revés da otra expresión, la del valor de la chaqueta (Libro I, capítulo 1, sección 3).",
    ],
  },
  {
    id: "mx-com-08",
    q: ["What do value-form readings of Capital, such as Michael Heinrich's, stress?", "Que soulignent les lectures du Capital centrées sur la forme-valeur, comme celle de Michael Heinrich ?", "¿Qué subrayan las lecturas de El capital centradas en la forma de valor, como la de Michael Heinrich?"],
    a: ["That value exists only in the exchange of commodities through money, not as a quantity fixed before the market", "Que la valeur n'existe que dans l'échange des marchandises par la monnaie, et non comme une quantité fixée avant le marché", "Que el valor solo existe en el intercambio de mercancías a través del dinero, no como una cantidad fijada antes del mercado"],
    w: [["That value can be measured by stopwatch in each factory", "Que la valeur peut se mesurer au chronomètre dans chaque usine", "Que el valor puede medirse con cronómetro en cada fábrica"], ["That Marx's theory is the same as Ricardo's", "Que la théorie de Marx est la même que celle de Ricardo", "Que la teoría de Marx es la misma que la de Ricardo"], ["That money plays no part in Marx's theory of value", "Que la monnaie ne joue aucun rôle dans la théorie de la valeur de Marx", "Que el dinero no desempeña ningún papel en la teoría del valor de Marx"]],
    e: [
      "These readings, in the line of Rubin and Backhaus, call Marx's a monetary theory of value: private labour becomes social only in exchange, and money is the necessary form of value. Others read value as embodied labour time computable before exchange; the debate is open.",
      "Ces lectures, dans la lignée de Roubine et Backhaus, voient chez Marx une théorie monétaire de la valeur : le travail privé ne devient social que dans l'échange, et la monnaie est la forme nécessaire de la valeur. D'autres lisent la valeur comme du temps de travail incorporé, calculable avant l'échange ; le débat est ouvert.",
      "Estas lecturas, en la línea de Rubin y Backhaus, ven en Marx una teoría monetaria del valor: el trabajo privado solo se vuelve social en el intercambio, y el dinero es la forma necesaria del valor. Otros leen el valor como tiempo de trabajo incorporado, calculable antes del intercambio; el debate está abierto.",
    ],
  },
  {
    id: "mx-com-09",
    q: ["How is skilled labour counted in value, according to Marx?", "Comment le travail qualifié compte-t-il dans la valeur, selon Marx ?", "¿Cómo cuenta el trabajo cualificado en el valor, según Marx?"],
    a: ["As multiplied simple labour, the ratio being set by a social process behind the producers' backs", "Comme du travail simple multiplié, le rapport étant fixé par un processus social dans le dos des producteurs", "Como trabajo simple multiplicado, la proporción la fija un proceso social a espaldas de los productores"],
    w: [["It does not count: only simple labour creates value", "Il ne compte pas : seul le travail simple crée de la valeur", "No cuenta: solo el trabajo simple crea valor"], ["At the same rate as simple labour, hour for hour", "Au même titre que le travail simple, heure pour heure", "Igual que el trabajo simple, hora por hora"], ["By the wage the skilled worker receives", "Par le salaire que reçoit l'ouvrier qualifié", "Por el salario que recibe el obrero cualificado"]],
    e: [
      "An hour of complex labour counts as several hours of simple labour, reduced by custom and exchange, not by a calculation anyone makes. How to determine the ratio, and whether training costs explain it, became a long debate (Böhm-Bawerk, Hilferding, Rowthorn).",
      "Une heure de travail complexe compte pour plusieurs heures de travail simple, réduites par l'usage et l'échange, non par un calcul que quelqu'un ferait. Comment déterminer ce rapport, et si les coûts de formation l'expliquent, a donné lieu à un long débat (Böhm-Bawerk, Hilferding, Rowthorn).",
      "Una hora de trabajo complejo cuenta como varias horas de trabajo simple, reducidas por la costumbre y el intercambio, no por un cálculo que alguien haga. Cómo determinar esa proporción, y si los costes de formación la explican, dio lugar a un largo debate (Böhm-Bawerk, Hilferding, Rowthorn).",
    ],
  },
];

const moneyDebates: MarxQuestion[] = [
  {
    id: "mx-mon-07",
    q: ["Paper money issued in excess of the gold needed in circulation: what happens, according to Marx?", "Du papier-monnaie émis au-delà de l'or nécessaire à la circulation : que se passe-t-il, selon Marx ?", "Papel moneda emitido por encima del oro necesario en la circulación: ¿qué ocurre, según Marx?"],
    a: ["Each note represents less gold, so prices expressed in paper rise", "Chaque billet représente moins d'or, donc les prix exprimés en papier montent", "Cada billete representa menos oro, así que los precios expresados en papel suben"],
    w: [["The value of all commodities falls", "La valeur de toutes les marchandises baisse", "El valor de todas las mercancías baja"], ["Nothing: paper money cannot be issued in excess", "Rien : le papier-monnaie ne peut pas être émis en excès", "Nada: el papel moneda no puede emitirse en exceso"], ["The excess is hoarded as gold is", "L'excédent est thésaurisé comme l'or", "El excedente se atesora como el oro"]],
    e: [
      "Inconvertible paper is only a symbol of the gold it replaces in circulation. Issued beyond that quantity, it stands for less gold each, and prices in paper rise though values have not changed: here, unlike gold, a quantity effect holds (Volume I, chapter 3, section 2c).",
      "Le papier inconvertible n'est qu'un signe de l'or qu'il remplace dans la circulation. Émis au-delà de cette quantité, chaque billet représente moins d'or, et les prix en papier montent sans que les valeurs aient changé : ici, contrairement à l'or, un effet de quantité joue (Livre I, chapitre 3, section 2c).",
      "El papel inconvertible es solo un signo del oro al que sustituye en la circulación. Emitido por encima de esa cantidad, cada billete representa menos oro y los precios en papel suben sin que los valores hayan cambiado: aquí, a diferencia del oro, hay un efecto de cantidad (Libro I, capítulo 3, sección 2c).",
    ],
  },
  {
    id: "mx-mon-08",
    q: ["In what form does money act as world money?", "Sous quelle forme la monnaie agit-elle comme monnaie universelle ?", "¿En qué forma actúa el dinero como dinero mundial?"],
    a: ["In its bullion form, as gold and silver by weight, to settle international balances", "Sous sa forme de lingot, l'or et l'argent au poids, pour solder les comptes internationaux", "En su forma de lingote, oro y plata a peso, para saldar las cuentas internacionales"],
    w: [["As each country's coins, accepted everywhere at face value", "Sous forme des pièces de chaque pays, acceptées partout à leur valeur faciale", "Como las monedas de cada país, aceptadas en todas partes por su valor nominal"], ["As bills of exchange only, never as metal", "Seulement sous forme de lettres de change, jamais de métal", "Solo como letras de cambio, nunca como metal"], ["It does not: Marx denies any world money", "Ce n'est pas le cas : Marx nie toute monnaie universelle", "No lo hace: Marx niega todo dinero mundial"]],
    e: [
      "Leaving the national sphere, money sheds its local uniforms of coin and token and returns to precious metal, the universal means of payment and purchase and the embodiment of wealth (Volume I, chapter 3, section 3c).",
      "En sortant de la sphère nationale, la monnaie dépouille ses uniformes locaux de pièce et de signe et redevient métal précieux, moyen universel de paiement et d'achat et incarnation de la richesse (Livre I, chapitre 3, section 3c).",
      "Al salir de la esfera nacional, el dinero se despoja de sus uniformes locales de moneda y signo y vuelve a ser metal precioso, medio universal de pago y de compra y encarnación de la riqueza (Libro I, capítulo 3, sección 3c).",
    ],
  },
  {
    id: "mx-mon-09",
    q: ["What does Marx's critique of Say's law claim?", "Que soutient la critique de la loi de Say par Marx ?", "¿Qué sostiene la crítica de Marx a la ley de Say?"],
    a: ["That money lets sale and purchase separate, so a general glut of commodities is possible", "Que la monnaie permet de séparer vente et achat, si bien qu'une surabondance générale de marchandises est possible", "Que el dinero permite separar venta y compra, de modo que es posible una sobreabundancia general de mercancías"],
    w: [["That supply always creates its own demand", "Que l'offre crée toujours sa propre demande", "Que la oferta siempre crea su propia demanda"], ["That crises come only from bad harvests", "Que les crises viennent seulement des mauvaises récoltes", "Que las crisis vienen solo de las malas cosechas"], ["That money is neutral and only a veil", "Que la monnaie est neutre et n'est qu'un voile", "Que el dinero es neutral y solo un velo"]],
    e: [
      "Say's law treats exchange as barter: every sale is a purchase. Marx answers that in C–M–C the two halves can split: whoever has sold need not buy at once. That gives crises their abstract possibility; their actual causes lie in capital's accumulation (Volume I, chapter 3; Volume III).",
      "La loi de Say traite l'échange comme un troc : toute vente est un achat. Marx répond que dans M–A–M les deux moitiés peuvent se séparer : celui qui a vendu n'est pas forcé d'acheter aussitôt. Cela donne aux crises leur possibilité abstraite ; leurs causes effectives tiennent à l'accumulation du capital (Livre I, chapitre 3 ; Livre III).",
      "La ley de Say trata el intercambio como trueque: toda venta es una compra. Marx responde que en M–D–M las dos mitades pueden separarse: quien ha vendido no está obligado a comprar enseguida. Eso da a las crisis su posibilidad abstracta; sus causas efectivas están en la acumulación del capital (Libro I, capítulo 3; Libro III).",
    ],
  },
];

const surplusDebates: MarxQuestion[] = [
  {
    id: "mx-sv-07",
    q: ["How does the value of the means of production reappear in the product, according to Marx?", "Comment la valeur des moyens de production réapparaît-elle dans le produit, selon Marx ?", "¿Cómo reaparece el valor de los medios de producción en el producto, según Marx?"],
    a: ["Concrete labour preserves and transfers it while abstract labour adds new value, in the same act", "Le travail concret la conserve et la transmet pendant que le travail abstrait ajoute une valeur nouvelle, dans le même acte", "El trabajo concreto lo conserva y transfiere mientras el trabajo abstracto añade valor nuevo, en el mismo acto"],
    w: [["The machine adds a value of its own, separate from labour", "La machine ajoute une valeur propre, distincte du travail", "La máquina añade un valor propio, distinto del trabajo"], ["It does not reappear: only new value is in the product", "Elle ne réapparaît pas : seule la valeur nouvelle est dans le produit", "No reaparece: solo el valor nuevo está en el producto"], ["The capitalist adds it when setting the price", "Le capitaliste l'ajoute en fixant le prix", "El capitalista lo añade al fijar el precio"]],
    e: [
      "Spinning uses up cotton and spindles and so carries their value into the yarn: preserving old value is a free gift of living labour to capital. The same hour, as abstract labour, adds new value. A machine idle for a year rots and loses value (Volume I, chapter 8).",
      "Filer use le coton et les broches et fait ainsi passer leur valeur dans le fil : conserver la valeur ancienne est un don gratuit du travail vivant au capital. La même heure, comme travail abstrait, ajoute une valeur nouvelle. Une machine inactive pendant un an se rouille et perd sa valeur (Livre I, chapitre 8).",
      "Hilar consume el algodón y los husos y así pasa su valor al hilo: conservar el valor viejo es un don gratuito del trabajo vivo al capital. La misma hora, como trabajo abstracto, añade valor nuevo. Una máquina parada un año se oxida y pierde su valor (Libro I, capítulo 8).",
    ],
  },
  {
    id: "mx-sv-08",
    q: ["Why is the movement M–C–M′ endless, unlike C–M–C?", "Pourquoi le mouvement A–M–A′ est-il sans fin, contrairement à M–A–M ?", "¿Por qué el movimiento D–M–D′ es interminable, a diferencia de M–D–M?"],
    a: ["Its end, money, is the same in kind as its start, so it can only aim at more", "Son terme, l'argent, est de même nature que son point de départ, donc il ne peut viser que davantage", "Su final, el dinero, es de la misma naturaleza que su comienzo, así que solo puede aspirar a más"],
    w: [["Because the law forbids capitalists to stop", "Parce que la loi interdit aux capitalistes de s'arrêter", "Porque la ley prohíbe a los capitalistas detenerse"], ["Because consumers' needs are infinite", "Parce que les besoins des consommateurs sont infinis", "Porque las necesidades de los consumidores son infinitas"], ["It is not: it ends once the capitalist is rich", "Il ne l'est pas : il s'arrête quand le capitaliste est riche", "No lo es: termina cuando el capitalista es rico"]],
    e: [
      "C–M–C ends in a use value consumed: its aim lies outside circulation and limits it. In M–C–M′ the result is just a larger sum of the same thing, which starts the movement again: capital is self-valorising value, and the capitalist its conscious bearer (Volume I, chapter 4).",
      "M–A–M aboutit à une valeur d'usage consommée : son but est hors de la circulation et la limite. Dans A–M–A′, le résultat n'est qu'une somme plus grande de la même chose, qui relance le mouvement : le capital est une valeur qui se valorise, et le capitaliste son support conscient (Livre I, chapitre 4).",
      "M–D–M termina en un valor de uso consumido: su fin está fuera de la circulación y la limita. En D–M–D′ el resultado es solo una suma mayor de lo mismo, que reinicia el movimiento: el capital es valor que se valoriza, y el capitalista su portador consciente (Libro I, capítulo 4).",
    ],
  },
  {
    id: "mx-sv-09",
    q: ["Marx calls the capitalist a 'personification of capital'. What does that imply?", "Marx appelle le capitaliste une « personnification du capital ». Qu'est-ce que cela implique ?", "Marx llama al capitalista una «personificación del capital». ¿Qué implica eso?"],
    a: ["That capitalists are analysed as bearers of a social role whose aims are capital's, not as individuals to blame", "Que les capitalistes sont analysés comme porteurs d'un rôle social dont les buts sont ceux du capital, et non comme des individus à blâmer", "Que los capitalistas se analizan como portadores de un papel social cuyos fines son los del capital, no como individuos a culpar"],
    w: [["That every capitalist is personally greedy", "Que chaque capitaliste est personnellement avide", "Que cada capitalista es personalmente codicioso"], ["That capital is a living being with a will of its own", "Que le capital est un être vivant doté d'une volonté propre", "Que el capital es un ser vivo con voluntad propia"], ["That capitalists own their workers as persons", "Que les capitalistes possèdent leurs ouvriers comme des personnes", "Que los capitalistas poseen a sus obreros como personas"]],
    e: [
      "The 1867 preface says individuals are dealt with as personifications of economic categories; the individual cannot be held responsible for relations he remains socially the creature of. Competition imposes capital's laws on each capitalist as external coercive laws.",
      "La préface de 1867 dit que les individus n'interviennent que comme personnifications de catégories économiques ; l'individu ne peut être rendu responsable de rapports dont il reste socialement la créature. La concurrence impose à chaque capitaliste les lois du capital comme des lois coercitives externes.",
      "El prólogo de 1867 dice que los individuos solo cuentan como personificaciones de categorías económicas; no se puede hacer responsable al individuo de relaciones de las que socialmente sigue siendo criatura. La competencia impone a cada capitalista las leyes del capital como leyes coercitivas externas.",
    ],
  },
];

const dayDebates: MarxQuestion[] = [
  {
    id: "mx-wd-07",
    q: ["Why is the rate of surplus value computed on $v$ and not on $c + v$?", "Pourquoi le taux de plus-value se calcule-t-il sur $v$ et non sur $c + v$ ?", "¿Por qué la tasa de plusvalor se calcula sobre $v$ y no sobre $c + v$?"],
    a: ["Because only variable capital produces new value; $c$ merely reappears", "Parce que seul le capital variable produit de la valeur nouvelle ; $c$ ne fait que réapparaître", "Porque solo el capital variable produce valor nuevo; $c$ solo reaparece"],
    w: [["Because $c$ is too hard to measure", "Parce que $c$ est trop difficile à mesurer", "Porque $c$ es demasiado difícil de medir"], ["Because $c$ is always zero in Marx's examples", "Parce que $c$ est toujours nul dans les exemples de Marx", "Porque $c$ siempre es cero en los ejemplos de Marx"], ["Because capitalists ignore their machines in accounts", "Parce que les capitalistes ignorent leurs machines dans leurs comptes", "Porque los capitalistas ignoran sus máquinas en sus cuentas"]],
    e: [
      "To see how much new value labour adds beyond its own price, Marx sets $c = 0$ in the analysis: Marx's mill, $410c + 90v + 90s$, has $s' = 100\\%$ though $s/(c+v)$ is only 18%. The capitalist's view, profit on the whole capital, hides this.",
      "Pour voir combien de valeur nouvelle le travail ajoute au-delà de son propre prix, Marx pose $c = 0$ dans l'analyse : la filature de Marx, $410c + 90v + 90s$, a $s' = 100\\%$ alors que $s/(c+v)$ n'est que de 18 %. Le point de vue du capitaliste, le profit sur tout le capital, le cache.",
      "Para ver cuánto valor nuevo añade el trabajo por encima de su propio precio, Marx pone $c = 0$ en el análisis: la hilandería de Marx, $410c + 90v + 90s$, tiene $s' = 100\\%$ aunque $s/(c+v)$ sea solo un 18 %. El punto de vista del capitalista, la ganancia sobre todo el capital, lo oculta.",
    ],
  },
  {
    id: "mx-wd-08",
    q: ["What was the 'relay system' that the English Factory Act of 1850 ended?", "Qu'était le « système des relais » auquel la loi anglaise sur les fabriques de 1850 a mis fin ?", "¿Qué era el «sistema de relevos» al que puso fin la ley fabril inglesa de 1850?"],
    a: ["Shifting protected workers in and out over a long day, so the legal limit could not be checked", "Faire entrer et sortir les ouvriers protégés au fil d'une longue journée, si bien que la limite légale était incontrôlable", "Hacer entrar y salir a los obreros protegidos a lo largo de una jornada larga, de modo que el límite legal era incontrolable"],
    w: [["A system of shift work that reduced total hours", "Un système de travail en équipes qui réduisait la durée totale", "Un sistema de turnos que reducía la duración total"], ["The rotation of factory inspectors between districts", "La rotation des inspecteurs de fabrique entre districts", "La rotación de los inspectores de fábrica entre distritos"], ["A relay race organised by trade unions", "Une course de relais organisée par les syndicats", "Una carrera de relevos organizada por los sindicatos"]],
    e: [
      "Employers kept mills open fifteen hours and moved children and women between shifts, so each worked within the limit on paper. The 1850 Act fixed a 'normal working day' between 6 a.m. and 6 p.m. for them (Volume I, chapter 10, section 6).",
      "Les employeurs gardaient les fabriques ouvertes quinze heures et déplaçaient enfants et femmes d'une équipe à l'autre, de sorte que chacun restait dans la limite sur le papier. La loi de 1850 a fixé pour eux une « journée normale » entre 6 heures et 18 heures (Livre I, chapitre 10, section 6).",
      "Los patronos mantenían las fábricas abiertas quince horas y movían a niños y mujeres de un turno a otro, de modo que cada uno quedaba dentro del límite sobre el papel. La ley de 1850 fijó para ellos una «jornada normal» entre las 6 y las 18 horas (Libro I, capítulo 10, sección 6).",
    ],
  },
  {
    id: "mx-wd-09",
    q: ["Why does Marx say legal limits on the working day also served capital as a whole?", "Pourquoi Marx dit-il que la limitation légale de la journée servait aussi le capital dans son ensemble ?", "¿Por qué dice Marx que la limitación legal de la jornada también servía al capital en su conjunto?"],
    a: ["Unlimited exploitation exhausted the labour force capital itself depends on", "L'exploitation sans limite épuisait la force de travail dont le capital lui-même dépend", "La explotación sin límite agotaba la fuerza de trabajo de la que depende el propio capital"],
    w: [["Shorter days always raise each firm's profit", "Des journées plus courtes augmentent toujours le profit de chaque entreprise", "Jornadas más cortas siempre aumentan la ganancia de cada empresa"], ["Capitalists drafted the laws themselves", "Les capitalistes ont rédigé les lois eux-mêmes", "Los capitalistas redactaron las leyes ellos mismos"], ["Workers produce more value in fewer hours", "Les ouvriers produisent plus de valeur en moins d'heures", "Los obreros producen más valor en menos horas"]],
    e: [
      "Each capitalist, pushed by competition, prolongs the day ('après moi le déluge!'), but together they wear out the working population, as recruiters found with shorter soldiers. The state, compelled by workers' pressure, imposed limits no single capitalist would choose.",
      "Chaque capitaliste, poussé par la concurrence, prolonge la journée (« après moi le déluge ! »), mais ensemble ils usent la population ouvrière, comme le constataient les recruteurs avec des soldats plus petits. L'État, contraint par la pression ouvrière, a imposé des limites qu'aucun capitaliste isolé n'aurait choisies.",
      "Cada capitalista, empujado por la competencia, prolonga la jornada («après moi le déluge!»), pero juntos agotan a la población obrera, como comprobaban los reclutadores con soldados más bajos. El Estado, forzado por la presión obrera, impuso límites que ningún capitalista aislado habría elegido.",
    ],
  },
];

const relativeDebates: MarxQuestion[] = [
  {
    id: "mx-rel-07",
    q: ["What is the difference between the formal and the real subsumption of labour under capital?", "Quelle est la différence entre la subsomption formelle et la subsomption réelle du travail sous le capital ?", "¿Qué diferencia hay entre la subsunción formal y la subsunción real del trabajo en el capital?"],
    a: ["Formal: capital takes over existing methods; real: capital reshapes the labour process itself", "Formelle : le capital reprend les méthodes existantes ; réelle : le capital transforme le procès de travail lui-même", "Formal: el capital asume los métodos existentes; real: el capital transforma el propio proceso de trabajo"],
    w: [["Formal: by contract; real: by force", "Formelle : par contrat ; réelle : par la force", "Formal: por contrato; real: por la fuerza"], ["Formal: in agriculture; real: in industry", "Formelle : dans l'agriculture ; réelle : dans l'industrie", "Formal: en la agricultura; real: en la industria"], ["They are two names for the same thing", "Ce sont deux noms pour la même chose", "Son dos nombres para lo mismo"]],
    e: [
      "Under formal subsumption, a former artisan works for wages with the same tools; surplus value is mainly absolute. Real subsumption, through co-operation, manufacture and machinery, gives capital its own mode of production and relative surplus value. The terms are developed in the 'Results of the Immediate Process of Production'.",
      "Sous la subsomption formelle, un ancien artisan travaille pour un salaire avec les mêmes outils ; la plus-value est surtout absolue. La subsomption réelle, par la coopération, la manufacture et le machinisme, donne au capital son mode de production propre et la plus-value relative. Les termes sont développés dans le « Chapitre VI inédit » (Résultats du procès de production immédiat).",
      "Bajo la subsunción formal, un antiguo artesano trabaja por un salario con las mismas herramientas; el plusvalor es sobre todo absoluto. La subsunción real, mediante la cooperación, la manufactura y la maquinaria, da al capital su propio modo de producción y el plusvalor relativo. Los términos se desarrollan en el «Capítulo VI inédito» (Resultados del proceso inmediato de producción).",
    ],
  },
  {
    id: "mx-rel-08",
    q: ["When does it pay a capitalist to use a machine, according to Marx?", "Quand l'emploi d'une machine est-il rentable pour un capitaliste, selon Marx ?", "¿Cuándo le conviene a un capitalista usar una máquina, según Marx?"],
    a: ["When it costs less than the wages of the labour-power it replaces, a narrower limit than the labour it saves", "Quand elle coûte moins que les salaires de la force de travail qu'elle remplace, une limite plus étroite que le travail qu'elle économise", "Cuando cuesta menos que los salarios de la fuerza de trabajo que sustituye, un límite más estrecho que el trabajo que ahorra"],
    w: [["Whenever it saves any labour at all", "Dès qu'elle économise du travail", "Siempre que ahorre algo de trabajo"], ["Only when wages are above the value of labour-power", "Seulement quand les salaires dépassent la valeur de la force de travail", "Solo cuando los salarios superan el valor de la fuerza de trabajo"], ["Never: machines only reduce profit", "Jamais : les machines ne font que réduire le profit", "Nunca: las máquinas solo reducen la ganancia"]],
    e: [
      "Society would gain from any machine that costs less labour than it saves. The capitalist pays only for necessary labour, so he gains only if the machine costs less than the wages saved. Where labour is cheap, machines that would save labour are not used (Volume I, chapter 15, section 2).",
      "La société gagnerait à toute machine qui coûte moins de travail qu'elle n'en économise. Le capitaliste ne paie que le travail nécessaire, donc il ne gagne que si la machine coûte moins que les salaires économisés. Là où le travail est bon marché, des machines qui économiseraient du travail ne sont pas employées (Livre I, chapitre 15, section 2).",
      "La sociedad ganaría con toda máquina que cueste menos trabajo del que ahorra. El capitalista solo paga el trabajo necesario, así que solo gana si la máquina cuesta menos que los salarios ahorrados. Donde el trabajo es barato, no se usan máquinas que ahorrarían trabajo (Libro I, capítulo 15, sección 2).",
    ],
  },
  {
    id: "mx-rel-09",
    q: ["Does higher productivity in the production of luxury yachts create relative surplus value?", "Une productivité plus élevée dans la production de yachts de luxe crée-t-elle de la plus-value relative ?", "¿Crea plusvalor relativo una mayor productividad en la producción de yates de lujo?"],
    a: ["No: yachts do not enter the value of labour-power", "Non : les yachts n'entrent pas dans la valeur de la force de travail", "No: los yates no entran en el valor de la fuerza de trabajo"],
    w: [["Yes: any productivity gain raises the rate of surplus value", "Oui : tout gain de productivité élève le taux de plus-value", "Sí: toda ganancia de productividad eleva la tasa de plusvalor"], ["Yes, because yacht workers are paid more", "Oui, parce que les ouvriers des yachts sont mieux payés", "Sí, porque los obreros de los yates cobran más"], ["Only if yachts are exported", "Seulement si les yachts sont exportés", "Solo si los yates se exportan"]],
    e: [
      "Relative surplus value comes from cheapening the goods workers consume, or the means of production used to make them. Productivity in other branches lowers their goods' values and may bring an individual capitalist extra surplus value, but leaves necessary labour unchanged (Volume I, chapter 12).",
      "La plus-value relative vient de la baisse du prix des biens que consomment les ouvriers, ou des moyens de production qui servent à les fabriquer. La productivité dans d'autres branches abaisse la valeur de leurs biens et peut valoir une plus-value extra à un capitaliste, mais ne change pas le travail nécessaire (Livre I, chapitre 12).",
      "El plusvalor relativo viene del abaratamiento de los bienes que consumen los obreros, o de los medios de producción con que se fabrican. La productividad en otras ramas rebaja el valor de sus bienes y puede dar a un capitalista un plusvalor extraordinario, pero no cambia el trabajo necesario (Libro I, capítulo 12).",
    ],
  },
];

const wagesDebates: MarxQuestion[] = [
  {
    id: "mx-wag-07",
    q: ["With hourly pay set low, workers ask for overtime. What does Marx conclude?", "Avec un salaire horaire bas, les ouvriers réclament des heures supplémentaires. Qu'en conclut Marx ?", "Con un salario por hora bajo, los obreros piden horas extra. ¿Qué concluye Marx?"],
    a: ["A low price of labour itself pushes the day longer, which lowers the price of labour further", "Un prix du travail bas pousse lui-même à allonger la journée, ce qui abaisse encore le prix du travail", "Un precio del trabajo bajo empuja por sí mismo a alargar la jornada, lo que rebaja aún más el precio del trabajo"],
    w: [["Overtime proves that workers are well paid", "Les heures supplémentaires prouvent que les ouvriers sont bien payés", "Las horas extra prueban que los obreros están bien pagados"], ["Overtime is always paid above the value of labour-power", "Les heures supplémentaires sont toujours payées au-dessus de la valeur de la force de travail", "Las horas extra siempre se pagan por encima del valor de la fuerza de trabajo"], ["Long days have no effect on the price of labour", "Les longues journées n'ont pas d'effet sur le prix du travail", "Las jornadas largas no influyen en el precio del trabajo"]],
    e: [
      "To earn a bare daily wage at a low hourly price, workers must work long hours; the longer day increases the supply of labour and presses the hourly price down again. Marx shows this vicious circle in the trades of his time (Volume I, chapter 20).",
      "Pour gagner un salaire journalier à peine suffisant à un prix horaire bas, les ouvriers doivent faire de longues journées ; la journée plus longue accroît l'offre de travail et pèse à nouveau sur le prix horaire. Marx montre ce cercle vicieux dans les métiers de son temps (Livre I, chapitre 20).",
      "Para ganar un salario diario apenas suficiente con un precio por hora bajo, los obreros deben hacer jornadas largas; la jornada más larga aumenta la oferta de trabajo y vuelve a presionar a la baja el precio por hora. Marx muestra este círculo vicioso en los oficios de su tiempo (Libro I, capítulo 20).",
    ],
  },
  {
    id: "mx-wag-08",
    q: ["Why is the piece wage 'most in harmony' with capitalism, rather than a step beyond it?", "Pourquoi le salaire aux pièces est-il la forme la plus conforme au capitalisme, plutôt qu'un pas au-delà ?", "¿Por qué el salario a destajo es la forma más adecuada al capitalismo, y no un paso más allá?"],
    a: ["It seems to pay the product but still pays labour-power, while making workers police their own intensity", "Il semble payer le produit mais paie toujours la force de travail, tout en faisant contrôler aux ouvriers leur propre intensité", "Parece pagar el producto pero sigue pagando la fuerza de trabajo, y hace que los obreros vigilen su propia intensidad"],
    w: [["It gives workers the whole value of their product", "Il donne aux ouvriers toute la valeur de leur produit", "Da a los obreros todo el valor de su producto"], ["It turns workers into independent producers", "Il fait des ouvriers des producteurs indépendants", "Convierte a los obreros en productores independientes"], ["It abolishes the wage form", "Il abolit la forme salaire", "Suprime la forma salario"]],
    e: [
      "The appearance that workers sell their product, not their labour-power, is stronger with piece rates, yet the rate is set so an average day earns the value of labour-power. Individuality and competition among workers serve intensification (Volume I, chapter 21).",
      "L'apparence que les ouvriers vendent leur produit, et non leur force de travail, est plus forte avec le salaire aux pièces, alors que le tarif est fixé pour qu'une journée moyenne rapporte la valeur de la force de travail. L'individualité et la concurrence entre ouvriers servent l'intensification (Livre I, chapitre 21).",
      "La apariencia de que los obreros venden su producto, y no su fuerza de trabajo, es más fuerte con el destajo, aunque la tarifa se fije para que una jornada media rinda el valor de la fuerza de trabajo. La individualidad y la competencia entre obreros sirven a la intensificación (Libro I, capítulo 21).",
    ],
  },
  {
    id: "mx-wag-09",
    q: ["In the Critique of the Gotha Programme (1875), why does Marx reject the 'iron law of wages'?", "Dans la Critique du programme de Gotha (1875), pourquoi Marx rejette-t-il la « loi d'airain des salaires » ?", "En la Crítica del programa de Gotha (1875), ¿por qué rechaza Marx la «ley de bronce de los salarios»?"],
    a: ["It rests on Malthus's population theory and treats wages as the value of labour instead of labour-power", "Elle repose sur la théorie de la population de Malthus et traite le salaire comme valeur du travail au lieu de la force de travail", "Se basa en la teoría de la población de Malthus y trata el salario como valor del trabajo en vez de la fuerza de trabajo"],
    w: [["It underestimates how high wages can rise under capitalism", "Elle sous-estime à quel point les salaires peuvent monter sous le capitalisme", "Subestima cuánto pueden subir los salarios bajo el capitalismo"], ["It was proposed by Engels, with whom he disagreed", "Elle avait été proposée par Engels, avec qui il était en désaccord", "La había propuesto Engels, con quien discrepaba"], ["He accepts it, and only rejects its name", "Il l'accepte, et n'en rejette que le nom", "La acepta y solo rechaza su nombre"]],
    e: [
      "Lassalle's law held wages to the subsistence minimum by population growth. Marx answers that wages are the disguised value of labour-power, regulated by accumulation and the reserve army, and that wage labour is a system of slavery however high the pay.",
      "La loi de Lassalle ramenait les salaires au minimum vital par la croissance de la population. Marx répond que le salaire est la valeur déguisée de la force de travail, réglée par l'accumulation et l'armée de réserve, et que le salariat est un système d'esclavage quel que soit le niveau du salaire.",
      "La ley de Lassalle reducía los salarios al mínimo vital por el crecimiento de la población. Marx responde que el salario es el valor disfrazado de la fuerza de trabajo, regulado por la acumulación y el ejército de reserva, y que el trabajo asalariado es un sistema de esclavitud sea cual sea el salario.",
    ],
  },
];

const accumulationDebates: MarxQuestion[] = [
  {
    id: "mx-acc-07",
    q: ["What is the difference between the concentration and the centralisation of capital?", "Quelle est la différence entre la concentration et la centralisation du capital ?", "¿Qué diferencia hay entre la concentración y la centralización del capital?"],
    a: ["Concentration: growth by accumulating one's own surplus value; centralisation: merging existing capitals", "Concentration : croissance par accumulation de sa propre plus-value ; centralisation : fusion de capitaux existants", "Concentración: crecimiento acumulando el propio plusvalor; centralización: fusión de capitales existentes"],
    w: [["Concentration: in cities; centralisation: in the state", "Concentration : dans les villes ; centralisation : dans l'État", "Concentración: en las ciudades; centralización: en el Estado"], ["They are the same process", "C'est le même processus", "Son el mismo proceso"], ["Concentration: by banks; centralisation: by merchants", "Concentration : par les banques ; centralisation : par les marchands", "Concentración: por los bancos; centralización: por los comerciantes"]],
    e: [
      "Concentration is limited by the growth of social wealth; centralisation redistributes capitals already there, through competition (big capitals beat small) and credit, and can be rapid (Volume I, chapter 25, section 2). Chapter 32 sums it up: 'one capitalist always kills many'.",
      "La concentration est limitée par la croissance de la richesse sociale ; la centralisation redistribue des capitaux déjà là, par la concurrence (les gros capitaux battent les petits) et le crédit, et peut être rapide (Livre I, chapitre 25, section 2). Le chapitre 32 le résume : un capitaliste en tue toujours beaucoup d'autres.",
      "La concentración está limitada por el crecimiento de la riqueza social; la centralización redistribuye capitales ya existentes, por la competencia (los grandes capitales vencen a los pequeños) y el crédito, y puede ser rápida (Libro I, capítulo 25, sección 2). El capítulo 32 lo resume: un capitalista mata siempre a muchos.",
    ],
  },
  {
    id: "mx-acc-08",
    q: ["How do most readers today interpret Marx's general law of capitalist accumulation?", "Comment la plupart des lecteurs interprètent-ils aujourd'hui la loi générale de l'accumulation capitaliste ?", "¿Cómo interpretan hoy la mayoría de los lectores la ley general de la acumulación capitalista?"],
    a: ["As a relative law: poverty grows relative to wealth, with absolute effects for parts of the working class", "Comme une loi relative : la pauvreté croît par rapport à la richesse, avec des effets absolus pour une partie de la classe ouvrière", "Como una ley relativa: la pobreza crece en relación con la riqueza, con efectos absolutos para partes de la clase obrera"],
    w: [["As a prediction that real wages must fall forever", "Comme une prédiction que les salaires réels doivent baisser indéfiniment", "Como una predicción de que los salarios reales deben bajar para siempre"], ["As a law that disappeared with the welfare state", "Comme une loi disparue avec l'État-providence", "Como una ley que desapareció con el Estado de bienestar"], ["As Malthus's population law restated", "Comme une reformulation de la loi de population de Malthus", "Como una reformulación de la ley de población de Malthus"]],
    e: [
      "The 'immiseration' thesis was long read as absolute impoverishment and refuted by rising real wages. Many readers, Harvey among them, stress the relative growth of the reserve army and of insecurity, and its absolute effects in parts of the world; the debate continues.",
      "La thèse de la « paupérisation » a longtemps été lue comme un appauvrissement absolu, démenti par la hausse des salaires réels. Beaucoup de lecteurs, dont Harvey, insistent sur la croissance relative de l'armée de réserve et de la précarité, et sur ses effets absolus dans certaines parties du monde ; le débat continue.",
      "La tesis de la «pauperización» se leyó mucho tiempo como empobrecimiento absoluto, desmentido por la subida de los salarios reales. Muchos lectores, Harvey entre ellos, insisten en el crecimiento relativo del ejército de reserva y de la precariedad, y en sus efectos absolutos en partes del mundo; el debate sigue.",
    ],
  },
  {
    id: "mx-acc-09",
    q: ["What does Marx mean by 'Accumulate, accumulate! That is Moses and the prophets!'?", "Que veut dire Marx par « Accumulez, accumulez ! C'est la loi et les prophètes ! » ?", "¿Qué quiere decir Marx con «¡Acumulad, acumulad! ¡Esa es la ley y los profetas!»?"],
    a: ["That accumulation for its own sake is the law imposed on the capitalist, as political economy itself proclaimed", "Que l'accumulation pour elle-même est la loi imposée au capitaliste, comme l'économie politique le proclamait elle-même", "Que la acumulación por sí misma es la ley impuesta al capitalista, como proclamaba la propia economía política"],
    w: [["That capitalists are driven by religious belief", "Que les capitalistes sont mus par la croyance religieuse", "Que a los capitalistas los mueve la fe religiosa"], ["That workers should save to become capitalists", "Que les ouvriers devraient épargner pour devenir capitalistes", "Que los obreros deberían ahorrar para hacerse capitalistas"], ["That accumulation is a moral virtue to imitate", "Que l'accumulation est une vertu morale à imiter", "Que la acumulación es una virtud moral que imitar"]],
    e: [
      "Marx mocks classical economy's 'abstinence' while showing its core: accumulation for accumulation's sake, production for production's sake, is the historical mission of the capitalist as a personification of capital (Volume I, chapter 24, section 3).",
      "Marx se moque de l'« abstinence » de l'économie classique tout en en montrant le cœur : l'accumulation pour l'accumulation, la production pour la production, est la mission historique du capitaliste comme personnification du capital (Livre I, chapitre 24, section 3).",
      "Marx se burla de la «abstinencia» de la economía clásica a la vez que muestra su núcleo: la acumulación por la acumulación, la producción por la producción, es la misión histórica del capitalista como personificación del capital (Libro I, capítulo 24, sección 3).",
    ],
  },
];

const primitiveDebates: MarxQuestion[] = [
  {
    id: "mx-pri-07",
    q: ["In chapter 32, how does Marx describe the end of capitalist private property?", "Au chapitre 32, comment Marx décrit-il la fin de la propriété privée capitaliste ?", "En el capítulo 32, ¿cómo describe Marx el fin de la propiedad privada capitalista?"],
    a: ["As the negation of the negation: 'the expropriators are expropriated'", "Comme la négation de la négation : « les expropriateurs sont expropriés »", "Como la negación de la negación: «los expropiadores son expropiados»"],
    w: [["As a gradual reform through cooperatives", "Comme une réforme graduelle par les coopératives", "Como una reforma gradual mediante cooperativas"], ["As a return to small peasant property", "Comme un retour à la petite propriété paysanne", "Como un regreso a la pequeña propiedad campesina"], ["He does not discuss it in Capital", "Il n'en parle pas dans Le Capital", "No lo trata en El capital"]],
    e: [
      "Private property based on one's own labour is negated by capitalist property; capital's centralisation and the socialisation of labour then burst the 'integument', a negation of the negation that restores individual property on the basis of common ownership of the means of production, not small private property.",
      "La propriété privée fondée sur le travail personnel est niée par la propriété capitaliste ; la centralisation du capital et la socialisation du travail font ensuite éclater l'« enveloppe », négation de la négation qui rétablit la propriété individuelle sur la base de la possession commune des moyens de production, et non la petite propriété privée.",
      "La propiedad privada basada en el trabajo propio es negada por la propiedad capitalista; la centralización del capital y la socialización del trabajo hacen luego estallar la «envoltura», negación de la negación que restablece la propiedad individual sobre la base de la posesión común de los medios de producción, no la pequeña propiedad privada.",
    ],
  },
  {
    id: "mx-pri-08",
    q: ["What does David Harvey mean by 'accumulation by dispossession'?", "Qu'entend David Harvey par « accumulation par dépossession » ?", "¿Qué entiende David Harvey por «acumulación por desposesión»?"],
    a: ["That the methods of primitive accumulation continue today: privatisation, enclosures, debt", "Que les méthodes de l'accumulation primitive continuent aujourd'hui : privatisations, enclosures, dette", "Que los métodos de la acumulación originaria continúan hoy: privatizaciones, cercamientos, deuda"],
    w: [["That capitalism began with the dispossession of the nobility", "Que le capitalisme a commencé par la dépossession de la noblesse", "Que el capitalismo empezó con la desposesión de la nobleza"], ["That workers dispossess capitalists through strikes", "Que les ouvriers dépossèdent les capitalistes par la grève", "Que los obreros desposeen a los capitalistas mediante huelgas"], ["That primitive accumulation was a myth", "Que l'accumulation primitive était un mythe", "Que la acumulación originaria fue un mito"]],
    e: [
      "Harvey (The New Imperialism, 2003) argues that capital keeps creating new fields of investment by seizing common or public assets, not only at its origin. The Companion's chapter on primitive accumulation develops the point; critics ask whether this stretches Marx's concept.",
      "Harvey (Le Nouvel Impérialisme, 2003) soutient que le capital continue de se créer de nouveaux champs d'investissement en s'emparant de biens communs ou publics, pas seulement à son origine. Le chapitre du Companion sur l'accumulation primitive développe ce point ; ses critiques demandent si cela n'étire pas trop le concept de Marx.",
      "Harvey (El nuevo imperialismo, 2003) sostiene que el capital sigue creándose nuevos campos de inversión apoderándose de bienes comunes o públicos, no solo en su origen. El capítulo del Companion sobre la acumulación originaria desarrolla la idea; sus críticos preguntan si no estira demasiado el concepto de Marx.",
    ],
  },
  {
    id: "mx-pri-09",
    q: ["What did Rosa Luxemburg argue in The Accumulation of Capital (1913)?", "Que soutenait Rosa Luxemburg dans L'Accumulation du capital (1913) ?", "¿Qué sostenía Rosa Luxemburg en La acumulación del capital (1913)?"],
    a: ["That capital needs non-capitalist buyers and regions to realise surplus value, hence imperialism", "Que le capital a besoin d'acheteurs et de régions non capitalistes pour réaliser la plus-value, d'où l'impérialisme", "Que el capital necesita compradores y regiones no capitalistas para realizar el plusvalor, de ahí el imperialismo"],
    w: [["That capitalism can accumulate forever in a closed system", "Que le capitalisme peut accumuler indéfiniment en système fermé", "Que el capitalismo puede acumular indefinidamente en un sistema cerrado"], ["That primitive accumulation never happened", "Que l'accumulation primitive n'a jamais eu lieu", "Que la acumulación originaria nunca ocurrió"], ["That wages determine the rate of profit alone", "Que les salaires déterminent seuls le taux de profit", "Que los salarios determinan por sí solos la tasa de ganancia"]],
    e: [
      "Reading Marx's schemes, Luxemburg found no buyer inside a pure capitalism for the surplus product to be accumulated, and argued that capital must absorb non-capitalist milieus. Bukharin and others replied that the schemes balance; her link between accumulation and imperialism remains influential.",
      "En lisant les schémas de Marx, Luxemburg ne trouvait pas, dans un capitalisme pur, d'acheteur pour le surproduit à accumuler, et soutenait que le capital doit absorber des milieux non capitalistes. Boukharine et d'autres ont répondu que les schémas s'équilibrent ; son lien entre accumulation et impérialisme reste influent.",
      "Leyendo los esquemas de Marx, Luxemburg no encontraba, en un capitalismo puro, comprador para el plusproducto que se acumula, y sostenía que el capital debe absorber medios no capitalistas. Bujarin y otros respondieron que los esquemas se equilibran; su vínculo entre acumulación e imperialismo sigue siendo influyente.",
    ],
  },
];

const circulationDebates: MarxQuestion[] = [
  {
    id: "mx-cir-07",
    q: ["Why must an industrial capital exist in all three forms of its circuit at once?", "Pourquoi un capital industriel doit-il exister à la fois sous les trois formes de son cycle ?", "¿Por qué un capital industrial debe existir a la vez en las tres formas de su ciclo?"],
    a: ["So that production is continuous: while one part is sold, another is producing and another buys", "Pour que la production soit continue : pendant qu'une partie est vendue, une autre produit et une autre achète", "Para que la producción sea continua: mientras una parte se vende, otra produce y otra compra"],
    w: [["Because the law requires reserves in each form", "Parce que la loi exige des réserves sous chaque forme", "Porque la ley exige reservas en cada forma"], ["It need not: it passes through them one after another", "Il n'en a pas besoin : il les traverse l'une après l'autre", "No lo necesita: pasa por ellas una tras otra"], ["To spread risk across three kinds of investor", "Pour répartir le risque entre trois types d'investisseurs", "Para repartir el riesgo entre tres tipos de inversores"]],
    e: [
      "If the whole capital passed through the stages in turn, production would stop while goods were being sold. Continuity requires portions in each form simultaneously; any stoppage, unsold stock or a lack of money, interrupts the whole (Volume II, chapter 4).",
      "Si tout le capital passait par les étapes à tour de rôle, la production s'arrêterait pendant la vente des marchandises. La continuité exige des portions sous chaque forme en même temps ; tout arrêt, stock invendu ou manque d'argent, interrompt l'ensemble (Livre II, chapitre 4).",
      "Si todo el capital pasara por las etapas por turnos, la producción se detendría mientras se venden las mercancías. La continuidad exige porciones en cada forma a la vez; cualquier parada, existencias sin vender o falta de dinero, interrumpe el conjunto (Libro II, capítulo 4).",
    ],
  },
  {
    id: "mx-cir-08",
    q: ["Two capitals have the same rate of surplus value; A's variable capital turns over 10 times a year, B's once. What follows?", "Deux capitaux ont le même taux de plus-value ; le capital variable de A tourne 10 fois par an, celui de B une fois. Qu'en résulte-t-il ?", "Dos capitales tienen la misma tasa de plusvalor; el capital variable de A rota 10 veces al año, el de B una vez. ¿Qué se sigue?"],
    a: ["A needs a tenth of B's advance to employ the same workers, so its annual rate of surplus value is ten times higher", "A a besoin d'un dixième de l'avance de B pour employer les mêmes ouvriers, donc son taux annuel de plus-value est dix fois plus élevé", "A necesita una décima parte del adelanto de B para emplear a los mismos obreros, así que su tasa anual de plusvalor es diez veces mayor"],
    w: [["A exploits its workers ten times more", "A exploite dix fois plus ses ouvriers", "A explota diez veces más a sus obreros"], ["Both produce the same annual surplus value on the same advance", "Les deux produisent la même plus-value annuelle sur la même avance", "Ambos producen el mismo plusvalor anual con el mismo adelanto"], ["B's annual rate is higher, since its capital stays longer", "Le taux annuel de B est plus élevé, puisque son capital reste plus longtemps", "La tasa anual de B es mayor, pues su capital permanece más tiempo"]],
    e: [
      "Marx's example: 500 turning over ten times does what 5,000 turning over once does. The rate of exploitation is the same; the annual rate, $s' \\cdot n$, differs because less capital is advanced. This puzzled economists who saw only the annual figures (Volume II, chapter 16).",
      "L'exemple de Marx : 500 qui tournent dix fois font ce que font 5 000 qui tournent une fois. Le taux d'exploitation est le même ; le taux annuel, $s' \\cdot n$, diffère parce qu'on avance moins de capital. Cela déroutait les économistes qui ne voyaient que les chiffres annuels (Livre II, chapitre 16).",
      "El ejemplo de Marx: 500 que rotan diez veces hacen lo que 5000 que rotan una vez. La tasa de explotación es la misma; la tasa anual, $s' \\cdot n$, difiere porque se adelanta menos capital. Esto desconcertaba a los economistas que solo veían las cifras anuales (Libro II, capítulo 16).",
    ],
  },
  {
    id: "mx-cir-09",
    q: ["What has the publication of Marx's manuscripts in the MEGA² edition shown about Volumes II and III?", "Qu'a montré la publication des manuscrits de Marx dans l'édition MEGA² sur les Livres II et III ?", "¿Qué ha mostrado la publicación de los manuscritos de Marx en la edición MEGA² sobre los Libros II y III?"],
    a: ["That Engels edited and reorganised the drafts substantially, which matters for some debates", "Qu'Engels a fortement édité et réorganisé les brouillons, ce qui compte pour certains débats", "Que Engels editó y reorganizó mucho los borradores, lo que importa para algunos debates"],
    w: [["That Marx had finished both volumes before 1867", "Que Marx avait achevé les deux livres avant 1867", "Que Marx había terminado ambos libros antes de 1867"], ["That Engels wrote them himself from scratch", "Qu'Engels les a écrits lui-même de A à Z", "Que Engels los escribió él mismo desde cero"], ["That the volumes were translated from French", "Que les livres ont été traduits du français", "Que los libros se tradujeron del francés"]],
    e: [
      "The drafts show changes in emphasis, for example on credit in Volume III, Part 5, and on the falling rate of profit, where Engels's headings and wording strengthen some readings (Heinrich). Volume II draws on eight manuscripts. Engels's work remains indispensable, but it is an edition.",
      "Les brouillons montrent des différences d'accent, par exemple sur le crédit dans la cinquième section du Livre III, ou sur la baisse du taux de profit, où les titres et la formulation d'Engels renforcent certaines lectures (Heinrich). Le Livre II s'appuie sur huit manuscrits. Le travail d'Engels reste indispensable, mais c'est une édition.",
      "Los borradores muestran diferencias de énfasis, por ejemplo sobre el crédito en la sección quinta del Libro III, o sobre la caída de la tasa de ganancia, donde los títulos y la redacción de Engels refuerzan ciertas lecturas (Heinrich). El Libro II se apoya en ocho manuscritos. El trabajo de Engels sigue siendo indispensable, pero es una edición.",
    ],
  },
];

const reproductionDebates: MarxQuestion[] = [
  {
    id: "mx-rep-07",
    q: ["What conclusion did Mikhail Tugan-Baranovsky draw from the reproduction schemes?", "Quelle conclusion Mikhaïl Tougan-Baranovski a-t-il tirée des schémas de reproduction ?", "¿Qué conclusión sacó Mijaíl Tugán-Baranovski de los esquemas de reproducción?"],
    a: ["That accumulation can go on indefinitely if proportions are kept; crises come from disproportion", "Que l'accumulation peut se poursuivre indéfiniment si les proportions sont respectées ; les crises viennent des disproportions", "Que la acumulación puede proseguir indefinidamente si se respetan las proporciones; las crisis vienen de las desproporciones"],
    w: [["That capitalism must collapse when the schemes stop balancing", "Que le capitalisme doit s'effondrer quand les schémas ne s'équilibrent plus", "Que el capitalismo debe hundirse cuando los esquemas dejan de equilibrarse"], ["That Department II always grows faster", "Que le secteur II croît toujours plus vite", "Que el sector II siempre crece más deprisa"], ["That the schemes prove Say's law false", "Que les schémas prouvent que la loi de Say est fausse", "Que los esquemas demuestran que la ley de Say es falsa"]],
    e: [
      "Tugan-Baranovsky (1895, 1901) argued that production of means of production for further production can absorb any surplus, so the limit is only proportionality. Luxemburg answered with her realisation problem; Grossman later built a breakdown theory on the falling rate of profit.",
      "Tougan-Baranovski (1895, 1901) soutenait que la production de moyens de production pour produire davantage peut absorber tout surplus, si bien que la seule limite est la proportionnalité. Luxemburg lui a répondu par son problème de la réalisation ; Grossmann a ensuite fondé une théorie de l'effondrement sur la baisse du taux de profit.",
      "Tugán-Baranovski (1895, 1901) sostenía que la producción de medios de producción para producir más puede absorber todo excedente, de modo que el único límite es la proporcionalidad. Luxemburg le respondió con su problema de la realización; Grossmann fundó después una teoría del derrumbe en la caída de la tasa de ganancia.",
    ],
  },
  {
    id: "mx-rep-08",
    q: ["Which later tools of economics descend from Marx's two-department schemes?", "Quels outils ultérieurs de l'économie descendent des schémas à deux secteurs de Marx ?", "¿Qué herramientas posteriores de la economía descienden de los esquemas de dos sectores de Marx?"],
    a: ["Input–output analysis and two-sector growth models, such as Feldman's", "L'analyse entrées-sorties et les modèles de croissance à deux secteurs, comme celui de Feldman", "El análisis input-output y los modelos de crecimiento de dos sectores, como el de Feldman"],
    w: [["The quantity theory of money", "La théorie quantitative de la monnaie", "La teoría cuantitativa del dinero"], ["Marginal utility theory", "La théorie de l'utilité marginale", "La teoría de la utilidad marginal"], ["The efficient market hypothesis", "L'hypothèse des marchés efficients", "La hipótesis de los mercados eficientes"]],
    e: [
      "Leontief's input–output tables generalise the exchange between sectors; Feldman (1928) and later Mahalanobis built planning models in which the share of investment going to the sector producing means of production governs growth.",
      "Les tableaux entrées-sorties de Leontief généralisent l'échange entre secteurs ; Feldman (1928) puis Mahalanobis ont bâti des modèles de planification où la part de l'investissement allant au secteur des moyens de production règle la croissance.",
      "Las tablas input-output de Leontief generalizan el intercambio entre sectores; Feldman (1928) y luego Mahalanobis construyeron modelos de planificación en los que la parte de la inversión que va al sector de medios de producción rige el crecimiento.",
    ],
  },
  {
    id: "mx-rep-09",
    q: ["In Marx's expanded scheme, Department I accumulates 500 at a composition $c/v = 4$. How is it split?", "Dans le schéma élargi de Marx, le secteur I accumule 500 avec une composition $c/v = 4$. Comment se répartissent-ils ?", "En el esquema ampliado de Marx, el sector I acumula 500 con una composición $c/v = 4$. ¿Cómo se reparten?"],
    a: ["400 additional constant capital, 100 additional variable capital", "400 de capital constant supplémentaire, 100 de capital variable supplémentaire", "400 de capital constante adicional, 100 de capital variable adicional"],
    w: [["250 constant, 250 variable", "250 de constant, 250 de variable", "250 constante, 250 variable"], ["100 constant, 400 variable", "100 de constant, 400 de variable", "100 constante, 400 variable"], ["500 constant, no variable", "500 de constant, aucun variable", "500 constante, nada variable"]],
    e: [
      "At $c/v = 4$, four fifths go to means of production and one fifth to labour-power. Department I then starts the next year with $4400c + 1100v$; Department II must adjust its accumulation to buy the extra means of production and supply the extra workers (Volume II, chapter 21).",
      "À $c/v = 4$, les quatre cinquièmes vont aux moyens de production et un cinquième à la force de travail. Le secteur I commence alors l'année suivante avec $4400c + 1100v$ ; le secteur II doit ajuster son accumulation pour acheter les moyens de production en plus et approvisionner les ouvriers en plus (Livre II, chapitre 21).",
      "Con $c/v = 4$, cuatro quintos van a medios de producción y un quinto a fuerza de trabajo. El sector I empieza entonces el año siguiente con $4400c + 1100v$; el sector II debe ajustar su acumulación para comprar los medios de producción adicionales y abastecer a los obreros adicionales (Libro II, capítulo 21).",
    ],
  },
];

const profitDebates: MarxQuestion[] = [
  {
    id: "mx-pro-07",
    q: ["What did Ladislaus von Bortkiewicz show about Marx's transformation of values into prices (1907)?", "Qu'a montré Ladislaus von Bortkiewicz sur la transformation des valeurs en prix chez Marx (1907) ?", "¿Qué mostró Ladislaus von Bortkiewicz sobre la transformación de valores en precios de Marx (1907)?"],
    a: ["That once inputs are also transformed, total prices = total values and total profit = total surplus value cannot both hold in general", "Qu'une fois les intrants aussi transformés, prix total = valeur totale et profit total = plus-value totale ne peuvent en général tenir ensemble", "Que, una vez transformados también los insumos, precio total = valor total y ganancia total = plusvalor total no pueden en general cumplirse a la vez"],
    w: [["That Marx's table was perfectly consistent as it stood", "Que le tableau de Marx était parfaitement cohérent tel quel", "Que la tabla de Marx era perfectamente coherente tal cual"], ["That prices of production cannot be computed at all", "Que les prix de production ne peuvent pas du tout être calculés", "Que los precios de producción no pueden calcularse en absoluto"], ["That the rate of profit is always equal to the rate of surplus value", "Que le taux de profit est toujours égal au taux de plus-value", "Que la tasa de ganancia es siempre igual a la tasa de plusvalor"]],
    e: [
      "Marx counted the inputs c and v at values though they are bought at prices of production, as he noted himself. Bortkiewicz's simultaneous solution keeps one invariance and generally loses the other, and changes the profit rate. Later answers (New Interpretation, temporal single-system) redefine what is invariant.",
      "Marx comptait les intrants c et v en valeurs alors qu'ils s'achètent aux prix de production, comme il le notait lui-même. La solution simultanée de Bortkiewicz garde une invariance et perd en général l'autre, et modifie le taux de profit. Des réponses ultérieures (Nouvelle interprétation, interprétation temporelle à système unique) redéfinissent ce qui est invariant.",
      "Marx contaba los insumos c y v en valores aunque se compran a precios de producción, como él mismo señalaba. La solución simultánea de Bortkiewicz conserva una invariancia y en general pierde la otra, y cambia la tasa de ganancia. Respuestas posteriores (Nueva interpretación, interpretación temporal de sistema único) redefinen lo que es invariante.",
    ],
  },
  {
    id: "mx-pro-08",
    q: ["What does the Okishio theorem (1961) state?", "Que dit le théorème d'Okishio (1961) ?", "¿Qué dice el teorema de Okishio (1961)?"],
    a: ["A cost-reducing technique adopted at given real wages cannot lower the general rate of profit", "Une technique qui réduit les coûts, adoptée à salaires réels donnés, ne peut pas abaisser le taux général de profit", "Una técnica que reduce costes, adoptada con salarios reales dados, no puede bajar la tasa general de ganancia"],
    w: [["The rate of profit must fall whenever machines are used", "Le taux de profit doit baisser dès qu'on emploie des machines", "La tasa de ganancia debe caer siempre que se usan máquinas"], ["Prices of production always equal values", "Les prix de production sont toujours égaux aux valeurs", "Los precios de producción siempre son iguales a los valores"], ["Real wages always rise with productivity", "Les salaires réels montent toujours avec la productivité", "Los salarios reales siempre suben con la productividad"]],
    e: [
      "If capitalists only adopt methods that cut their costs at current prices, the new equilibrium rate of profit is at least as high. Defenders of the law reply with rising real wages, fixed capital and non-equilibrium (temporal) accounts; the empirical record is debated.",
      "Si les capitalistes n'adoptent que des méthodes qui réduisent leurs coûts aux prix courants, le nouveau taux de profit d'équilibre est au moins aussi élevé. Les défenseurs de la loi répondent par la hausse des salaires réels, le capital fixe et des analyses hors équilibre (temporelles) ; le bilan empirique est discuté.",
      "Si los capitalistas solo adoptan métodos que reducen sus costes a los precios corrientes, la nueva tasa de ganancia de equilibrio es al menos igual de alta. Los defensores de la ley responden con la subida de los salarios reales, el capital fijo y análisis fuera del equilibrio (temporales); el balance empírico se discute.",
    ],
  },
  {
    id: "mx-pro-09",
    q: ["What was Ian Steedman's argument in Marx after Sraffa (1977)?", "Quel était l'argument d'Ian Steedman dans Marx after Sraffa (1977) ?", "¿Cuál era el argumento de Ian Steedman en Marx after Sraffa (1977)?"],
    a: ["That prices and the profit rate follow from physical data and real wages, making values redundant", "Que les prix et le taux de profit découlent des données physiques et des salaires réels, ce qui rend les valeurs superflues", "Que los precios y la tasa de ganancia se derivan de los datos físicos y los salarios reales, lo que vuelve superfluos los valores"],
    w: [["That Marx's theory of value is the basis of Sraffa's system", "Que la théorie de la valeur de Marx est la base du système de Sraffa", "Que la teoría del valor de Marx es la base del sistema de Sraffa"], ["That labour values must be measured with a stopwatch", "Que les valeurs-travail doivent se mesurer au chronomètre", "Que los valores trabajo deben medirse con cronómetro"], ["That profit comes from the productivity of machines alone", "Que le profit vient de la seule productivité des machines", "Que la ganancia viene solo de la productividad de las máquinas"]],
    e: [
      "With Sraffa's equations, the technique of production and the real wage determine prices and the profit rate directly; values add nothing and can even be negative with joint production. Replies argue that Marx's values are not meant as a step in computing prices but explain where profit comes from.",
      "Avec les équations de Sraffa, la technique de production et le salaire réel déterminent directement les prix et le taux de profit ; les valeurs n'ajoutent rien et peuvent même être négatives en production jointe. Les réponses soutiennent que les valeurs de Marx ne sont pas une étape du calcul des prix mais expliquent d'où vient le profit.",
      "Con las ecuaciones de Sraffa, la técnica de producción y el salario real determinan directamente los precios y la tasa de ganancia; los valores no añaden nada e incluso pueden ser negativos con producción conjunta. Las réplicas sostienen que los valores de Marx no son un paso para calcular precios sino que explican de dónde viene la ganancia.",
    ],
  },
];

const creditDebates: MarxQuestion[] = [
  {
    id: "mx-cre-07",
    q: ["Why does Marx call the joint-stock company 'the abolition of capital as private property within the framework of capitalist production itself'?", "Pourquoi Marx dit-il que la société par actions est « la suppression du capital comme propriété privée à l'intérieur même de la production capitaliste » ?", "¿Por qué dice Marx que la sociedad por acciones es «la abolición del capital como propiedad privada dentro de la propia producción capitalista»?"],
    a: ["Ownership separates from management: capital becomes social capital run by salaried managers", "La propriété se sépare de la direction : le capital devient capital social géré par des directeurs salariés", "La propiedad se separa de la dirección: el capital se vuelve capital social gestionado por directivos asalariados"],
    w: [["Shareholders lose all right to dividends", "Les actionnaires perdent tout droit aux dividendes", "Los accionistas pierden todo derecho a dividendos"], ["The state owns all joint-stock companies", "L'État possède toutes les sociétés par actions", "El Estado posee todas las sociedades por acciones"], ["Workers own the shares of their firm", "Les ouvriers possèdent les actions de leur entreprise", "Los obreros poseen las acciones de su empresa"]],
    e: [
      "The capitalist as functioning manager and the capitalist as mere owner of money capital split; profit appears as interest on shares. Marx sees in this, and in cooperative factories, transitional forms within capitalism, while noting the new swindles credit makes possible (Volume III, chapter 27).",
      "Le capitaliste dirigeant et le capitaliste simple propriétaire de capital-argent se séparent ; le profit apparaît comme intérêt des actions. Marx y voit, comme dans les fabriques coopératives, des formes de transition à l'intérieur du capitalisme, tout en notant les nouvelles escroqueries que le crédit rend possibles (Livre III, chapitre 27).",
      "El capitalista en funciones y el capitalista mero propietario de capital dinerario se separan; la ganancia aparece como interés de las acciones. Marx ve en ello, como en las fábricas cooperativas, formas de transición dentro del capitalismo, a la vez que señala las nuevas estafas que el crédito hace posibles (Libro III, capítulo 27).",
    ],
  },
  {
    id: "mx-cre-08",
    q: ["What is absolute rent, according to Marx?", "Qu'est-ce que la rente absolue, selon Marx ?", "¿Qué es la renta absoluta, según Marx?"],
    a: ["Rent paid even on the worst land, because landed property bars investment unless it is paid", "La rente payée même sur la plus mauvaise terre, parce que la propriété foncière fait obstacle à l'investissement si elle n'est pas payée", "La renta que se paga incluso por la peor tierra, porque la propiedad territorial impide la inversión si no se paga"],
    w: [["The rent of the most fertile land", "La rente de la terre la plus fertile", "La renta de la tierra más fértil"], ["Rent fixed by law in absolute terms", "Une rente fixée par la loi en valeur absolue", "Una renta fijada por ley en valor absoluto"], ["Rent from mines only", "La rente des seules mines", "La renta de las minas solamente"]],
    e: [
      "Differential rent alone would leave the worst land rent-free. Marx argues that no owner lets land for nothing, and that agriculture's lower composition lets its products sell above price of production, up to their value: the difference forms absolute rent (Volume III, chapter 45).",
      "La seule rente différentielle laisserait la plus mauvaise terre sans rente. Marx soutient qu'aucun propriétaire ne loue sa terre pour rien, et que la composition plus faible de l'agriculture permet à ses produits de se vendre au-dessus du prix de production, jusqu'à leur valeur : la différence forme la rente absolue (Livre III, chapitre 45).",
      "La renta diferencial sola dejaría sin renta la peor tierra. Marx sostiene que ningún propietario arrienda su tierra por nada, y que la composición más baja de la agricultura permite vender sus productos por encima del precio de producción, hasta su valor: la diferencia forma la renta absoluta (Libro III, capítulo 45).",
    ],
  },
  {
    id: "mx-cre-09",
    q: ["How does differential rent II differ from differential rent I?", "En quoi la rente différentielle II diffère-t-elle de la rente différentielle I ?", "¿En qué se diferencia la renta diferencial II de la renta diferencial I?"],
    a: ["It comes from successive investments of capital on the same land, with different productivity", "Elle vient d'investissements successifs de capital sur la même terre, de productivité différente", "Viene de inversiones sucesivas de capital en la misma tierra, con productividad diferente"],
    w: [["It comes from differences in location rather than fertility", "Elle vient des différences de situation plutôt que de fertilité", "Viene de las diferencias de ubicación más que de fertilidad"], ["It is paid only in kind, never in money", "Elle n'est payée qu'en nature, jamais en argent", "Solo se paga en especie, nunca en dinero"], ["It is the rent on buildings rather than land", "C'est la rente des bâtiments plutôt que de la terre", "Es la renta de los edificios más que de la tierra"]],
    e: [
      "Differential rent I compares equal capitals on lands of unequal fertility or location. Differential rent II arises when more capital is applied to the same land: if the extra output costs less than on the regulating land, the difference becomes rent, which is why leases and improvements are contested (Volume III, chapters 40–43).",
      "La rente différentielle I compare des capitaux égaux sur des terres de fertilité ou de situation inégales. La rente différentielle II naît quand on applique plus de capital à la même terre : si le produit en plus coûte moins que sur la terre régulatrice, la différence devient rente, d'où les conflits sur les baux et les améliorations (Livre III, chapitres 40–43).",
      "La renta diferencial I compara capitales iguales en tierras de fertilidad o ubicación desiguales. La renta diferencial II surge cuando se aplica más capital a la misma tierra: si el producto adicional cuesta menos que en la tierra reguladora, la diferencia se vuelve renta, de ahí los conflictos sobre los arriendos y las mejoras (Libro III, capítulos 40–43).",
    ],
  },
];

export const commodity = { commodityDebates };
export const money = { moneyDebates };
export const surplus = { surplusDebates };
export const workingDay = { dayDebates };
export const relative = { relativeDebates };
export const wages = { wagesDebates };
export const accumulation = { accumulationDebates };
export const primitive = { primitiveDebates };
export const circulation = { circulationDebates };
export const reproduction = { reproductionDebates };
export const profit = { profitDebates };
export const credit = { creditDebates };
