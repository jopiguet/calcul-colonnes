/**
 * Marx's Capital, Intermédiaire: the arguments behind the concepts, and the
 * distinctions most often confused. One list per part (src/courses/marx).
 */
import type { LinuxQuestion as MarxQuestion } from "../linux/types";

const commodityDeeper: MarxQuestion[] = [
  {
    id: "mx-com-04",
    q: ["Which labour creates value, according to the two-fold character of labour?", "Quel travail crée la valeur, selon le double caractère du travail ?", "¿Qué trabajo crea valor, según el doble carácter del trabajo?"],
    a: ["Abstract human labour; concrete useful labour creates use values", "Le travail humain abstrait ; le travail concret et utile crée des valeurs d'usage", "El trabajo humano abstracto; el trabajo concreto y útil crea valores de uso"],
    w: [["Concrete labour; abstract labour only exists in theory", "Le travail concret ; le travail abstrait n'existe qu'en théorie", "El trabajo concreto; el trabajo abstracto solo existe en teoría"], ["Skilled labour; simple labour creates no value", "Le travail qualifié ; le travail simple ne crée pas de valeur", "El trabajo cualificado; el trabajo simple no crea valor"], ["Only labour in agriculture, as the physiocrats held", "Seulement le travail agricole, comme le pensaient les physiocrates", "Solo el trabajo agrícola, como sostenían los fisiócratas"]],
    e: [
      "The same hour of tailoring is concrete labour that makes a coat and an expenditure of human labour-power in general that forms value. Marx claimed this distinction as his own; Smith and Ricardo had not asked why labour takes the form of value (Volume I, chapter 1, section 2).",
      "La même heure de couture est un travail concret qui fait un habit, et une dépense de force de travail humaine en général qui forme de la valeur. Marx revendiquait cette distinction comme sienne ; Smith et Ricardo ne s'étaient pas demandé pourquoi le travail prend la forme de la valeur (Livre I, chapitre 1, section 2).",
      "La misma hora de sastrería es un trabajo concreto que hace una chaqueta y un gasto de fuerza de trabajo humana en general que forma valor. Marx reivindicaba esta distinción como suya; Smith y Ricardo no se habían preguntado por qué el trabajo toma la forma del valor (Libro I, capítulo 1, sección 2).",
    ],
  },
  {
    id: "mx-com-05",
    q: ["What is the fetishism of commodities?", "Qu'est-ce que le fétichisme de la marchandise ?", "¿Qué es el fetichismo de la mercancía?"],
    a: ["Social relations between producers appearing as relations between things", "Des rapports sociaux entre producteurs qui apparaissent comme des rapports entre des choses", "Relaciones sociales entre productores que aparecen como relaciones entre cosas"],
    w: [["Consumers' irrational love of brands", "L'amour irrationnel des consommateurs pour les marques", "El amor irracional de los consumidores por las marcas"], ["The worship of gold in pre-capitalist societies", "Le culte de l'or dans les sociétés précapitalistes", "El culto al oro en las sociedades precapitalistas"], ["A mistake economists make that a better theory removes", "Une erreur des économistes qu'une meilleure théorie supprime", "Un error de los economistas que una teoría mejor suprime"]],
    e: [
      "Private producers relate to each other only through their products, so the social character of their labour appears as a property of things: value, prices moving by themselves. It is not a mere illusion: it is how social labour really works in this society (Volume I, chapter 1, section 4).",
      "Les producteurs privés n'entrent en rapport que par leurs produits, donc le caractère social de leur travail apparaît comme une propriété des choses : la valeur, des prix qui bougent tout seuls. Ce n'est pas une simple illusion : c'est ainsi que le travail social fonctionne réellement dans cette société (Livre I, chapitre 1, section 4).",
      "Los productores privados solo se relacionan a través de sus productos, así que el carácter social de su trabajo aparece como una propiedad de las cosas: el valor, precios que se mueven solos. No es una simple ilusión: es como funciona realmente el trabajo social en esta sociedad (Libro I, capítulo 1, sección 4).",
    ],
  },
  {
    id: "mx-com-06",
    q: ["When the power loom halved the time needed to weave cloth, what happened to the hand-loom weaver's hour of work?", "Quand le métier mécanique a réduit de moitié le temps nécessaire pour tisser, qu'est-il arrivé à l'heure de travail du tisserand à la main ?", "Cuando el telar mecánico redujo a la mitad el tiempo necesario para tejer, ¿qué pasó con la hora de trabajo del tejedor a mano?"],
    a: ["It produced only half an hour of social labour, half as much value", "Elle ne produisait plus qu'une demi-heure de travail social, deux fois moins de valeur", "Solo producía media hora de trabajo social, la mitad de valor"],
    w: [["It produced the same value, since he worked as hard", "Elle produisait la même valeur, puisqu'il travaillait autant", "Producía el mismo valor, pues trabajaba lo mismo"], ["It produced twice the value, as cloth became scarce", "Elle produisait deux fois plus de valeur, le tissu devenant rare", "Producía el doble de valor, al escasear la tela"], ["Its value was set by the price of his loom", "Sa valeur était fixée par le prix de son métier", "Su valor lo fijaba el precio de su telar"]],
    e: [
      "Value is socially necessary time. Once the new method is the norm, the weaver's individual hour counts as half an hour of social labour, and his cloth sells for half: Marx's own example in chapter 1.",
      "La valeur est le temps socialement nécessaire. Une fois la nouvelle méthode devenue la norme, l'heure individuelle du tisserand compte pour une demi-heure de travail social, et son tissu se vend moitié moins cher : c'est l'exemple de Marx au chapitre 1.",
      "El valor es tiempo socialmente necesario. Una vez que el nuevo método se vuelve la norma, la hora individual del tejedor cuenta como media hora de trabajo social, y su tela se vende a la mitad: es el ejemplo del propio Marx en el capítulo 1.",
    ],
  },
];

const moneyDeeper: MarxQuestion[] = [
  {
    id: "mx-mon-04",
    q: ["How does Marx's view of the quantity of money in circulation differ from the quantity theory of Hume and Ricardo?", "En quoi la vue de Marx sur la quantité de monnaie en circulation diffère-t-elle de la théorie quantitative de Hume et Ricardo ?", "¿En qué difiere la visión de Marx sobre la cantidad de dinero en circulación de la teoría cuantitativa de Hume y Ricardo?"],
    a: ["For Marx, prices determine the quantity of money needed, not the reverse", "Pour Marx, les prix déterminent la quantité de monnaie nécessaire, et non l'inverse", "Para Marx, los precios determinan la cantidad de dinero necesaria, y no al revés"],
    w: [["For Marx, more money always raises prices proportionally", "Pour Marx, plus de monnaie fait toujours monter les prix proportionnellement", "Para Marx, más dinero siempre sube los precios en proporción"], ["For Marx, the quantity of money is fixed by the state at will", "Pour Marx, la quantité de monnaie est fixée par l'État à volonté", "Para Marx, la cantidad de dinero la fija el Estado a voluntad"], ["They do not differ: Marx adopts Ricardo's theory", "Elles ne diffèrent pas : Marx adopte la théorie de Ricardo", "No difieren: Marx adopta la teoría de Ricardo"]],
    e: [
      "With commodity money, values are given by labour and expressed in gold; the money needed is the sum of prices divided by velocity. Surplus gold leaves circulation as hoards. Only paper money issued beyond that need loses value and raises prices in paper.",
      "Avec une monnaie-marchandise, les valeurs sont données par le travail et exprimées en or ; la monnaie nécessaire est la somme des prix divisée par la vitesse. L'or en trop sort de la circulation sous forme de trésor. Seul le papier-monnaie émis au-delà de ce besoin perd de la valeur et fait monter les prix en papier.",
      "Con dinero mercancía, los valores vienen dados por el trabajo y se expresan en oro; el dinero necesario es la suma de precios dividida por la velocidad. El oro sobrante sale de la circulación como tesoro. Solo el papel moneda emitido por encima de esa necesidad pierde valor y sube los precios en papel.",
    ],
  },
  {
    id: "mx-mon-05",
    q: ["When money serves as means of payment, what relation appears between buyer and seller?", "Quand la monnaie sert de moyen de paiement, quel rapport apparaît entre acheteur et vendeur ?", "Cuando el dinero sirve como medio de pago, ¿qué relación aparece entre comprador y vendedor?"],
    a: ["They become debtor and creditor, and a broken chain of payments can trigger a monetary crisis", "Ils deviennent débiteur et créancier, et une chaîne de paiements rompue peut déclencher une crise monétaire", "Se convierten en deudor y acreedor, y una cadena de pagos rota puede desatar una crisis monetaria"],
    w: [["They become partners sharing the profit", "Ils deviennent associés et partagent le profit", "Se convierten en socios que reparten la ganancia"], ["None: payment and sale happen at the same moment", "Aucun : le paiement et la vente ont lieu au même moment", "Ninguna: el pago y la venta ocurren en el mismo momento"], ["The seller becomes a wage earner of the buyer", "Le vendeur devient le salarié de l'acheteur", "El vendedor se convierte en asalariado del comprador"]],
    e: [
      "Sale on credit separates the transfer of the commodity from payment. Debts form chains; when one link fails, everyone suddenly needs cash, and money 'alone is a commodity'. Marx distinguishes this monetary crisis from crises of production (Volume I, chapter 3, section 3).",
      "La vente à crédit sépare la remise de la marchandise du paiement. Les dettes forment des chaînes ; quand un maillon cède, chacun a soudain besoin d'argent comptant, et seul l'argent est marchandise. Marx distingue cette crise monétaire des crises de production (Livre I, chapitre 3, section 3).",
      "La venta a crédito separa la entrega de la mercancía del pago. Las deudas forman cadenas; cuando un eslabón falla, todos necesitan de repente dinero contante, y solo el dinero es mercancía. Marx distingue esta crisis monetaria de las crisis de producción (Libro I, capítulo 3, sección 3).",
    ],
  },
  {
    id: "mx-mon-06",
    q: ["Why does Marx compare the hoarder's labour to that of Sisyphus?", "Pourquoi Marx compare-t-il le travail du thésauriseur à celui de Sisyphe ?", "¿Por qué compara Marx el trabajo del atesorador con el de Sísifo?"],
    a: ["Money is unlimited in quality but every sum is limited, so no hoard is ever enough", "La monnaie est illimitée en qualité mais toute somme est limitée, donc aucun trésor ne suffit jamais", "El dinero es ilimitado en calidad pero toda suma es limitada, así que ningún tesoro basta nunca"],
    w: [["Gold is heavy and hard to carry", "L'or est lourd et difficile à porter", "El oro es pesado y difícil de transportar"], ["Hoards are always stolen in the end", "Les trésors finissent toujours par être volés", "Los tesoros siempre acaban robados"], ["The state taxes hoards every year", "L'État taxe les trésors chaque année", "El Estado grava los tesoros cada año"]],
    e: [
      "Money can buy anything, so it has no qualitative limit, yet any actual sum is finite. This contradiction drives endless accumulation; the hoarder, unlike the capitalist, keeps money out of circulation (Volume I, chapter 3).",
      "La monnaie peut tout acheter, donc elle n'a pas de limite qualitative, mais toute somme réelle est finie. Cette contradiction pousse à une accumulation sans fin ; le thésauriseur, à la différence du capitaliste, garde l'argent hors de la circulation (Livre I, chapitre 3).",
      "El dinero puede comprarlo todo, así que no tiene límite cualitativo, pero toda suma real es finita. Esta contradicción empuja a una acumulación sin fin; el atesorador, a diferencia del capitalista, mantiene el dinero fuera de la circulación (Libro I, capítulo 3).",
    ],
  },
];

const surplusDeeper: MarxQuestion[] = [
  {
    id: "mx-sv-04",
    q: ["What does the value of labour-power contain besides the bare physical minimum?", "Que contient la valeur de la force de travail au-delà du strict minimum physique ?", "¿Qué contiene el valor de la fuerza de trabajo además del mínimo físico?"],
    a: ["A historical and moral element, plus the costs of raising children and of training", "Un élément historique et moral, plus les frais d'élever les enfants et de se former", "Un elemento histórico y moral, más los costes de criar a los hijos y formarse"],
    w: [["Nothing: it is always the physical minimum", "Rien : c'est toujours le minimum physique", "Nada: siempre es el mínimo físico"], ["A share of the profit fixed by custom", "Une part du profit fixée par la coutume", "Una parte de la ganancia fijada por la costumbre"], ["The value of everything the worker produces", "La valeur de tout ce que l'ouvrier produit", "El valor de todo lo que produce el obrero"]],
    e: [
      "What counts as necessary depends on a country's level of civilisation and on the habits won by past struggles. Labour-power must also be reproduced across generations and with its skills (Volume I, chapter 6).",
      "Ce qui compte comme nécessaire dépend du niveau de civilisation d'un pays et des habitudes conquises par les luttes passées. La force de travail doit aussi se reproduire d'une génération à l'autre, avec ses qualifications (Livre I, chapitre 6).",
      "Lo que cuenta como necesario depende del nivel de civilización de un país y de los hábitos conquistados por las luchas pasadas. La fuerza de trabajo debe reproducirse también de una generación a otra, con sus cualificaciones (Libro I, capítulo 6).",
    ],
  },
  {
    id: "mx-sv-05",
    q: ["The worker who sells labour-power is 'free in the double sense'. What are the two senses?", "L'ouvrier qui vend sa force de travail est « libre dans un double sens ». Quels sont ces deux sens ?", "El obrero que vende su fuerza de trabajo es «libre en un doble sentido». ¿Cuáles son los dos sentidos?"],
    a: ["Free to sell it as their own property, and free of any means of production of their own", "Libre de la vendre comme sa propriété, et libre de tout moyen de production à lui", "Libre de venderla como propiedad suya, y libre de todo medio de producción propio"],
    w: [["Free to choose an employer, and free to strike", "Libre de choisir un employeur, et libre de faire grève", "Libre de elegir patrón, y libre de hacer huelga"], ["Free of taxes, and free of guild rules", "Libre d'impôts, et libre des règles corporatives", "Libre de impuestos, y libre de las reglas gremiales"], ["Free to vote, and free to emigrate", "Libre de voter, et libre d'émigrer", "Libre de votar, y libre de emigrar"]],
    e: [
      "A serf or slave cannot sell their own labour-power; a peasant with land need not. Wage labour requires both freedoms at once, a historical result, not a natural condition (Volume I, chapter 6, and Part 8 of the course).",
      "Un serf ou un esclave ne peut pas vendre sa propre force de travail ; un paysan qui a une terre n'en a pas besoin. Le salariat exige les deux libertés à la fois, un résultat historique, pas une condition naturelle (Livre I, chapitre 6, et partie 8 du cours).",
      "Un siervo o un esclavo no puede vender su propia fuerza de trabajo; un campesino con tierra no lo necesita. El trabajo asalariado exige ambas libertades a la vez, un resultado histórico, no una condición natural (Libro I, capítulo 6, y parte 8 del curso).",
    ],
  },
  {
    id: "mx-sv-06",
    q: ["Why can surplus value not arise from everyone selling 10% above value?", "Pourquoi la plus-value ne peut-elle pas venir de ce que chacun vend 10 % au-dessus de la valeur ?", "¿Por qué el plusvalor no puede surgir de que todos vendan un 10 % por encima del valor?"],
    a: ["Everyone is also a buyer and loses as buyer what they gain as seller", "Chacun est aussi acheteur et perd comme acheteur ce qu'il gagne comme vendeur", "Cada uno es también comprador y pierde como comprador lo que gana como vendedor"],
    w: [["Because the state forbids prices above value", "Parce que l'État interdit les prix au-dessus de la valeur", "Porque el Estado prohíbe los precios por encima del valor"], ["Because 10% is too little to matter", "Parce que 10 % est trop peu pour compter", "Porque un 10 % es demasiado poco para contar"], ["It can: that is the origin of profit", "C'est possible : c'est l'origine du profit", "Sí puede: ese es el origen de la ganancia"]],
    e: [
      "A general markup changes only the names of values. A cheat gains what the other loses: the total value in society stays the same. Surplus value must therefore come from a commodity whose use creates more value than it costs (Volume I, chapter 5).",
      "Une majoration générale ne change que le nom des valeurs. Un tricheur gagne ce que l'autre perd : la valeur totale de la société ne change pas. La plus-value doit donc venir d'une marchandise dont l'usage crée plus de valeur qu'elle ne coûte (Livre I, chapitre 5).",
      "Un recargo general solo cambia el nombre de los valores. Un tramposo gana lo que el otro pierde: el valor total de la sociedad no cambia. El plusvalor debe venir, pues, de una mercancía cuyo uso crea más valor del que cuesta (Libro I, capítulo 5).",
    ],
  },
];

const dayDeeper: MarxQuestion[] = [
  {
    id: "mx-wd-04",
    q: ["What does Marx mean by 'between equal rights force decides' about the working day?", "Que veut dire Marx par « entre deux droits égaux, c'est la force qui tranche » à propos de la journée de travail ?", "¿Qué quiere decir Marx con «entre derechos iguales decide la fuerza» sobre la jornada de trabajo?"],
    a: ["Buyer and seller of labour-power both appeal to the law of exchange; the length of the day is settled by class struggle", "L'acheteur et le vendeur de la force de travail invoquent tous deux la loi de l'échange ; la durée de la journée se règle par la lutte des classes", "Comprador y vendedor de la fuerza de trabajo invocan ambos la ley del intercambio; la duración de la jornada la decide la lucha de clases"],
    w: [["The strongest workers should work the longest", "Les ouvriers les plus forts doivent travailler le plus longtemps", "Los obreros más fuertes deben trabajar más tiempo"], ["The state should decide by force alone", "L'État doit trancher par la seule force", "El Estado debe decidir solo por la fuerza"], ["Contracts are void, so there is no law at all", "Les contrats sont nuls, donc il n'y a aucun droit", "Los contratos son nulos, así que no hay derecho alguno"]],
    e: [
      "The capitalist claims the full use of the day he bought; the worker claims to keep the means to work again tomorrow. Both rights follow from commodity exchange, so exchange cannot settle the conflict: struggle and legislation do (Volume I, chapter 10).",
      "Le capitaliste réclame le plein usage de la journée qu'il a achetée ; l'ouvrier réclame de garder de quoi travailler encore demain. Les deux droits découlent de l'échange marchand, donc l'échange ne peut pas trancher le conflit : la lutte et la législation le font (Livre I, chapitre 10).",
      "El capitalista reclama el pleno uso de la jornada que compró; el obrero reclama conservar los medios para trabajar mañana. Ambos derechos se derivan del intercambio de mercancías, así que el intercambio no puede zanjar el conflicto: lo hacen la lucha y la legislación (Libro I, capítulo 10).",
    ],
  },
  {
    id: "mx-wd-05",
    q: ["What limits the working day, according to Marx?", "Qu'est-ce qui limite la journée de travail, selon Marx ?", "¿Qué limita la jornada de trabajo, según Marx?"],
    a: ["A physical limit (rest, food) and a moral one, both elastic", "Une limite physique (repos, nourriture) et une limite morale, toutes deux élastiques", "Un límite físico (descanso, comida) y uno moral, ambos elásticos"],
    w: [["Only the hours of daylight", "Seulement les heures de jour", "Solo las horas de luz"], ["The time machines can run before overheating", "Le temps que les machines peuvent tourner sans surchauffe", "El tiempo que las máquinas pueden funcionar sin recalentarse"], ["Nothing: it can be extended at will", "Rien : on peut l'allonger à volonté", "Nada: se puede alargar a voluntad"]],
    e: [
      "The day cannot exceed what a body can bear and must leave time for intellectual and social needs, but both limits stretch. Between them, the length is set by struggle; the factory reports Marx quotes show how far it was stretched.",
      "La journée ne peut dépasser ce qu'un corps supporte et doit laisser du temps aux besoins intellectuels et sociaux, mais les deux limites s'étirent. Entre elles, la durée se fixe par la lutte ; les rapports des inspecteurs que cite Marx montrent jusqu'où on l'a étirée.",
      "La jornada no puede superar lo que un cuerpo aguanta y debe dejar tiempo para necesidades intelectuales y sociales, pero ambos límites se estiran. Entre ellos, la duración la fija la lucha; los informes de los inspectores que cita Marx muestran hasta dónde se estiró.",
    ],
  },
  {
    id: "mx-wd-06",
    q: ["How is the mass of surplus value related to the rate?", "Comment la masse de plus-value est-elle liée au taux ?", "¿Cómo se relaciona la masa de plusvalor con la tasa?"],
    a: ["Mass = rate × variable capital; fewer workers can be offset by a higher rate, within the limit of the day", "Masse = taux × capital variable ; moins d'ouvriers peuvent être compensés par un taux plus élevé, dans la limite de la journée", "Masa = tasa × capital variable; menos obreros pueden compensarse con una tasa mayor, dentro del límite de la jornada"],
    w: [["Mass = rate × total capital, with no limit", "Masse = taux × capital total, sans limite", "Masa = tasa × capital total, sin límite"], ["The mass does not depend on the number of workers", "La masse ne dépend pas du nombre d'ouvriers", "La masa no depende del número de obreros"], ["The mass is fixed by the rate of profit", "La masse est fixée par le taux de profit", "La masa la fija la tasa de ganancia"]],
    e: [
      "$S = s' \\cdot V$: the surplus value per worker times the number of workers. A higher rate can make up for fewer workers only up to a point: no worker's day can exceed 24 hours less necessary labour (Volume I, chapter 11).",
      "$S = s' \\cdot V$ : la plus-value par ouvrier fois le nombre d'ouvriers. Un taux plus élevé ne compense moins d'ouvriers que jusqu'à un certain point : la journée d'un ouvrier ne peut dépasser 24 heures moins le travail nécessaire (Livre I, chapitre 11).",
      "$S = s' \\cdot V$: el plusvalor por obrero por el número de obreros. Una tasa mayor solo compensa menos obreros hasta cierto punto: la jornada de un obrero no puede superar 24 horas menos el trabajo necesario (Libro I, capítulo 11).",
    ],
  },
];

const relativeDeeper: MarxQuestion[] = [
  {
    id: "mx-rel-04",
    q: ["A capitalist introduces a better machine before his rivals. What does he gain?", "Un capitaliste introduit une meilleure machine avant ses concurrents. Que gagne-t-il ?", "Un capitalista introduce una máquina mejor antes que sus competidores. ¿Qué gana?"],
    a: ["An extra surplus value, selling at the social value goods he produces below it, until the method spreads", "Une plus-value extra, en vendant à la valeur sociale des biens qu'il produit au-dessous, jusqu'à ce que la méthode se répande", "Un plusvalor extraordinario, vendiendo al valor social bienes que produce por debajo de él, hasta que el método se difunde"],
    w: [["A permanent monopoly profit protected by law", "Un profit de monopole permanent protégé par la loi", "Una ganancia de monopolio permanente protegida por la ley"], ["Nothing, since machines create no value", "Rien, puisque les machines ne créent pas de valeur", "Nada, pues las máquinas no crean valor"], ["Higher wages for his workers", "Des salaires plus élevés pour ses ouvriers", "Salarios más altos para sus obreros"]],
    e: [
      "His individual value is below the social value, so he gains even selling a little below the market. Competition then forces others to adopt the method; the extra gain vanishes and only the lower value remains. This is how relative surplus value spreads without anyone aiming at it (Volume I, chapter 12).",
      "Sa valeur individuelle est inférieure à la valeur sociale, donc il gagne même en vendant un peu sous le marché. La concurrence force ensuite les autres à adopter la méthode ; le gain extra disparaît et seule reste la valeur abaissée. C'est ainsi que la plus-value relative se répand sans que personne ne la vise (Livre I, chapitre 12).",
      "Su valor individual está por debajo del valor social, así que gana incluso vendiendo algo por debajo del mercado. La competencia obliga luego a los demás a adoptar el método; la ganancia extra desaparece y queda solo el valor rebajado. Así se difunde el plusvalor relativo sin que nadie lo persiga (Libro I, capítulo 12).",
    ],
  },
  {
    id: "mx-rel-05",
    q: ["How does the division of labour inside a manufacture differ from the division of labour in society?", "En quoi la division du travail dans une manufacture diffère-t-elle de la division du travail dans la société ?", "¿En qué difiere la división del trabajo dentro de una manufactura de la división del trabajo en la sociedad?"],
    a: ["Inside, it is planned under the capitalist's authority; in society, it is ruled by the anarchy of the market", "À l'intérieur, elle est planifiée sous l'autorité du capitaliste ; dans la société, elle est réglée par l'anarchie du marché", "Dentro, se planifica bajo la autoridad del capitalista; en la sociedad, la rige la anarquía del mercado"],
    w: [["They are the same: both are planned by the state", "Elles sont identiques : toutes deux planifiées par l'État", "Son iguales: ambas las planifica el Estado"], ["Inside, workers exchange their products as commodities", "À l'intérieur, les ouvriers échangent leurs produits comme des marchandises", "Dentro, los obreros intercambian sus productos como mercancías"], ["In society, it is fixed by castes and guilds", "Dans la société, elle est fixée par les castes et les corporations", "En la sociedad, la fijan las castas y los gremios"]],
    e: [
      "Detail workers do not sell partial products to each other; the capitalist assigns tasks by plan. Between firms, only exchange coordinates. Marx notes that the same bourgeoisie that praises despotism in the workshop denounces any planning of society (Volume I, chapter 14).",
      "Les ouvriers parcellaires ne se vendent pas leurs produits partiels ; le capitaliste répartit les tâches selon un plan. Entre entreprises, seul l'échange coordonne. Marx note que la bourgeoisie qui loue le despotisme dans l'atelier dénonce toute planification de la société (Livre I, chapitre 14).",
      "Los obreros parciales no se venden sus productos parciales; el capitalista reparte las tareas según un plan. Entre empresas, solo coordina el intercambio. Marx señala que la misma burguesía que alaba el despotismo en el taller denuncia toda planificación de la sociedad (Libro I, capítulo 14).",
    ],
  },
  {
    id: "mx-rel-06",
    q: ["Once the working day is limited by law, how does capital keep raising surplus value with machinery?", "Une fois la journée limitée par la loi, comment le capital continue-t-il d'accroître la plus-value avec les machines ?", "Una vez limitada por ley la jornada, ¿cómo sigue el capital aumentando el plusvalor con las máquinas?"],
    a: ["By intensifying labour: faster machines, more machines per worker, a denser hour", "En intensifiant le travail : des machines plus rapides, plus de machines par ouvrier, une heure plus dense", "Intensificando el trabajo: máquinas más rápidas, más máquinas por obrero, una hora más densa"],
    w: [["By paying workers in kind instead of money", "En payant les ouvriers en nature plutôt qu'en argent", "Pagando a los obreros en especie en vez de en dinero"], ["By stopping all investment in machines", "En arrêtant tout investissement en machines", "Dejando de invertir en máquinas"], ["It cannot: surplus value then stays constant", "Il ne le peut pas : la plus-value reste alors constante", "No puede: el plusvalor queda entonces constante"]],
    e: [
      "A shorter day prompts capital to fill each hour with more labour: speed-up, more looms per weaver. Intensity works like a longer day compressed into the same hours (Volume I, chapter 15, section 3c).",
      "Une journée plus courte pousse le capital à remplir chaque heure de plus de travail : accélération, plus de métiers par tisserand. L'intensité agit comme une journée plus longue comprimée dans les mêmes heures (Livre I, chapitre 15, section 3c).",
      "Una jornada más corta lleva al capital a llenar cada hora con más trabajo: aceleración, más telares por tejedor. La intensidad actúa como una jornada más larga comprimida en las mismas horas (Libro I, capítulo 15, sección 3c).",
    ],
  },
];

const wagesDeeper: MarxQuestion[] = [
  {
    id: "mx-wag-04",
    q: ["Under serfdom, slavery and wage labour, how does unpaid labour appear?", "Sous le servage, l'esclavage et le salariat, comment apparaît le travail non payé ?", "Bajo la servidumbre, la esclavitud y el trabajo asalariado, ¿cómo aparece el trabajo no pagado?"],
    a: ["Visible as corvée under serfdom; even paid labour seems unpaid under slavery; unpaid labour seems paid under wage labour", "Visible comme corvée sous le servage ; même le travail payé semble non payé sous l'esclavage ; le non payé semble payé sous le salariat", "Visible como prestación bajo la servidumbre; incluso el pagado parece no pagado bajo la esclavitud; el no pagado parece pagado bajo el salariado"],
    w: [["It does not exist under wage labour", "Il n'existe pas dans le salariat", "No existe en el trabajo asalariado"], ["It appears the same way in all three", "Il apparaît de la même manière dans les trois", "Aparece de la misma manera en los tres"], ["It is visible only under wage labour, through payslips", "Il n'est visible que dans le salariat, par les fiches de paie", "Solo es visible en el salariado, por las nóminas"]],
    e: [
      "The serf works his own land some days and the lord's on others: the division is in time and space. The slave seems to work wholly for the master, even for his own keep. The wage form makes the whole day look paid (Volume I, chapter 19).",
      "Le serf travaille sa propre terre certains jours et celle du seigneur d'autres jours : la division est dans le temps et l'espace. L'esclave semble travailler tout entier pour le maître, même pour son entretien. La forme salaire fait paraître payée toute la journée (Livre I, chapitre 19).",
      "El siervo trabaja su propia tierra unos días y la del señor otros: la división está en el tiempo y el espacio. El esclavo parece trabajar entero para el amo, incluso para su sustento. La forma salario hace parecer pagada toda la jornada (Libro I, capítulo 19).",
    ],
  },
  {
    id: "mx-wag-05",
    q: ["What does the piece wage do besides paying for output?", "Que fait le salaire aux pièces en plus de payer la production ?", "¿Qué hace el salario a destajo además de pagar la producción?"],
    a: ["It controls quality and intensity, and makes subcontracting and competition between workers easier", "Il contrôle la qualité et l'intensité, et facilite la sous-traitance et la concurrence entre ouvriers", "Controla la calidad y la intensidad, y facilita la subcontratación y la competencia entre obreros"],
    w: [["It guarantees each worker the full value of their product", "Il garantit à chaque ouvrier la pleine valeur de son produit", "Garantiza a cada obrero el valor íntegro de su producto"], ["It abolishes supervision and the working day", "Il abolit la surveillance et la journée de travail", "Suprime la vigilancia y la jornada de trabajo"], ["It always raises wages above the value of labour-power", "Il élève toujours les salaires au-dessus de la valeur de la force de travail", "Siempre eleva los salarios por encima del valor de la fuerza de trabajo"]],
    e: [
      "Pieces of poor quality are not paid, so the wage polices the work; workers push their own pace and hours, and middlemen can take a cut between capitalist and worker. The rate per piece is lowered when output rises (Volume I, chapter 21).",
      "Les pièces de mauvaise qualité ne sont pas payées, donc le salaire contrôle le travail ; les ouvriers poussent eux-mêmes leur cadence et leurs heures, et des intermédiaires peuvent prélever leur part entre capitaliste et ouvrier. Le tarif par pièce baisse quand la production monte (Livre I, chapitre 21).",
      "Las piezas de mala calidad no se pagan, así que el salario vigila el trabajo; los obreros fuerzan su propio ritmo y sus horas, y los intermediarios pueden quedarse con una parte entre capitalista y obrero. La tarifa por pieza baja cuando sube la producción (Libro I, capítulo 21).",
    ],
  },
  {
    id: "mx-wag-06",
    q: ["Comparing two countries, the one with higher money wages may still have a higher rate of surplus value. Why?", "En comparant deux pays, celui qui a les salaires en argent les plus élevés peut quand même avoir un taux de plus-value plus élevé. Pourquoi ?", "Comparando dos países, el de salarios monetarios más altos puede tener aun así una tasa de plusvalor mayor. ¿Por qué?"],
    a: ["Its labour may be more intense and productive, producing more value per hour", "Son travail peut être plus intense et plus productif, et produire plus de valeur par heure", "Su trabajo puede ser más intenso y productivo, y producir más valor por hora"],
    w: [["Because higher wages always mean lower exploitation", "Parce que des salaires plus élevés signifient toujours moins d'exploitation", "Porque salarios más altos siempre significan menos explotación"], ["Because money has the same value everywhere", "Parce que l'argent a la même valeur partout", "Porque el dinero tiene el mismo valor en todas partes"], ["It cannot: the statement is a contradiction", "C'est impossible : l'énoncé est contradictoire", "No puede: la afirmación es contradictoria"]],
    e: [
      "More intense, more productive national labour counts as more value on the world market, so money wages can be higher while the share of the day that is unpaid is also higher (Volume I, chapter 22).",
      "Un travail national plus intense et plus productif compte comme davantage de valeur sur le marché mondial, si bien que les salaires en argent peuvent être plus élevés alors que la part non payée de la journée l'est aussi (Livre I, chapitre 22).",
      "Un trabajo nacional más intenso y productivo cuenta como más valor en el mercado mundial, de modo que los salarios monetarios pueden ser más altos mientras la parte no pagada de la jornada también lo es (Libro I, capítulo 22).",
    ],
  },
];

const accumulationDeeper: MarxQuestion[] = [
  {
    id: "mx-acc-04",
    q: ["A capital of 1,000 yields 200 of surplus value a year, all consumed by its owner. After five years, what is the capital, in Marx's analysis?", "Un capital de 1 000 rapporte 200 de plus-value par an, entièrement consommée par son propriétaire. Après cinq ans, qu'est le capital, selon l'analyse de Marx ?", "Un capital de 1000 rinde 200 de plusvalor al año, consumido entero por su dueño. Al cabo de cinco años, ¿qué es el capital, según el análisis de Marx?"],
    a: ["Capitalised surplus value: the owner has consumed the equivalent of the original capital", "De la plus-value capitalisée : le propriétaire a consommé l'équivalent du capital initial", "Plusvalor capitalizado: el dueño ha consumido el equivalente del capital inicial"],
    w: [["Still the owner's original savings", "Toujours l'épargne initiale du propriétaire", "Sigue siendo el ahorro inicial del dueño"], ["A debt the owner owes to the workers' bank", "Une dette du propriétaire envers la banque des ouvriers", "Una deuda del dueño con el banco de los obreros"], ["Nothing: the capital has disappeared", "Rien : le capital a disparu", "Nada: el capital ha desaparecido"]],
    e: [
      "5 × 200 = 1,000 consumed: the value still functioning as capital must have come from unpaid labour. Even simple reproduction turns all capital, sooner or later, into accumulated surplus value (Volume I, chapter 23).",
      "5 × 200 = 1 000 consommés : la valeur qui fonctionne encore comme capital doit venir de travail non payé. Même la reproduction simple transforme tout capital, tôt ou tard, en plus-value accumulée (Livre I, chapitre 23).",
      "5 × 200 = 1000 consumidos: el valor que sigue funcionando como capital ha de venir de trabajo no pagado. Incluso la reproducción simple convierte todo capital, tarde o temprano, en plusvalor acumulado (Libro I, capítulo 23).",
    ],
  },
  {
    id: "mx-acc-05",
    q: ["Which form of the relative surplus population consists of rural workers ready to move into industry?", "Quelle forme de la surpopulation relative est faite de travailleurs ruraux prêts à passer dans l'industrie ?", "¿Qué forma de la sobrepoblación relativa la forman trabajadores rurales listos para pasar a la industria?"],
    a: ["The latent form", "La forme latente", "La forma latente"],
    w: [["The floating form", "La forme flottante", "La forma flotante"], ["The stagnant form", "La forme stagnante", "La forma estancada"], ["Pauperism", "Le paupérisme", "El pauperismo"]],
    e: [
      "Floating: workers repelled and attracted by industry with the cycle. Latent: the rural population that capitalist agriculture makes superfluous. Stagnant: casual, irregular work. Pauperism: those unable to work, the 'hospital' of the labour army (Volume I, chapter 25, section 4).",
      "Flottante : les ouvriers repoussés et attirés par l'industrie selon le cycle. Latente : la population rurale que l'agriculture capitaliste rend superflue. Stagnante : le travail occasionnel et irrégulier. Paupérisme : ceux qui ne peuvent pas travailler, l'« hôpital » de l'armée active (Livre I, chapitre 25, section 4).",
      "Flotante: los obreros repelidos y atraídos por la industria según el ciclo. Latente: la población rural que la agricultura capitalista vuelve superflua. Estancada: el trabajo ocasional e irregular. Pauperismo: quienes no pueden trabajar, el «hospital» del ejército activo (Libro I, capítulo 25, sección 4).",
    ],
  },
  {
    id: "mx-acc-06",
    q: ["How does the industrial reserve army regulate wages?", "Comment l'armée industrielle de réserve règle-t-elle les salaires ?", "¿Cómo regula los salarios el ejército industrial de reserva?"],
    a: ["It is absorbed in booms and swells in slumps, pressing on the employed", "Elle est absorbée dans l'expansion et grossit dans la crise, en pesant sur les actifs", "Se absorbe en la expansión y crece en la crisis, presionando sobre los ocupados"],
    w: [["Through the number of children workers decide to have", "Par le nombre d'enfants que les ouvriers décident d'avoir", "Por el número de hijos que los obreros deciden tener"], ["It plays no role: wages are set by law", "Elle ne joue aucun rôle : les salaires sont fixés par la loi", "No desempeña ningún papel: los salarios los fija la ley"], ["By keeping wages always at the physical minimum", "En maintenant toujours les salaires au minimum physique", "Manteniendo siempre los salarios en el mínimo físico"]],
    e: [
      "General movements of wages follow the expansion and contraction of the reserve army with the industrial cycle, not population growth as Malthus argued. Capital makes the supply of labour it needs (Volume I, chapter 25, section 3).",
      "Les mouvements généraux des salaires suivent l'expansion et la contraction de l'armée de réserve au fil du cycle industriel, et non la croissance de la population comme le disait Malthus. Le capital fabrique l'offre de travail dont il a besoin (Livre I, chapitre 25, section 3).",
      "Los movimientos generales de los salarios siguen la expansión y contracción del ejército de reserva con el ciclo industrial, no el crecimiento de la población como decía Malthus. El capital fabrica la oferta de trabajo que necesita (Libro I, capítulo 25, sección 3).",
    ],
  },
];

const primitiveDeeper: MarxQuestion[] = [
  {
    id: "mx-pri-04",
    q: ["How does Marx treat political economy's story of a thrifty elite and lazy others at the origin of capitalism?", "Comment Marx traite-t-il le récit de l'économie politique d'une élite économe et d'autres paresseux à l'origine du capitalisme ?", "¿Cómo trata Marx el relato de la economía política de una élite ahorradora y otros perezosos en el origen del capitalismo?"],
    a: ["As a nursery tale: in real history conquest, enslavement and robbery played the great part", "Comme une fable : dans l'histoire réelle, la conquête, l'asservissement et le vol ont joué le grand rôle", "Como un cuento infantil: en la historia real, la conquista, el sometimiento y el robo desempeñaron el gran papel"],
    w: [["As essentially true, if simplified", "Comme essentiellement vrai, quoique simplifié", "Como esencialmente cierto, aunque simplificado"], ["As true for England but not for the colonies", "Comme vrai pour l'Angleterre mais pas pour les colonies", "Como cierto para Inglaterra pero no para las colonias"], ["He does not discuss it", "Il n'en parle pas", "No lo trata"]],
    e: [
      "Marx compares the story to original sin: it explains wealth and poverty by virtue and vice. His chapters show expropriation by force and law instead (Volume I, chapter 26).",
      "Marx compare ce récit au péché originel : il explique richesse et pauvreté par la vertu et le vice. Ses chapitres montrent au contraire une expropriation par la force et par la loi (Livre I, chapitre 26).",
      "Marx compara este relato con el pecado original: explica la riqueza y la pobreza por la virtud y el vicio. Sus capítulos muestran en cambio una expropiación por la fuerza y la ley (Libro I, capítulo 26).",
    ],
  },
  {
    id: "mx-pri-05",
    q: ["Which of these does Marx count among the levers of primitive accumulation in chapter 31?", "Lequel de ces éléments Marx compte-t-il parmi les leviers de l'accumulation primitive au chapitre 31 ?", "¿Cuál de estos cuenta Marx entre las palancas de la acumulación originaria en el capítulo 31?"],
    a: ["The colonial system, the slave trade, the public debt and modern taxation", "Le système colonial, la traite des esclaves, la dette publique et la fiscalité moderne", "El sistema colonial, la trata de esclavos, la deuda pública y el sistema tributario moderno"],
    w: [["The invention of double-entry bookkeeping", "L'invention de la comptabilité en partie double", "La invención de la contabilidad por partida doble"], ["The free trade treaties of the 19th century", "Les traités de libre-échange du XIXe siècle", "Los tratados de libre comercio del siglo XIX"], ["The savings banks of the workers", "Les caisses d'épargne des ouvriers", "Las cajas de ahorro de los obreros"]],
    e: [
      "Treasure seized abroad by plunder and enslavement flowed back to Europe and turned into capital; the public debt and taxes created financiers and a market for securities. Hence capital comes into the world 'dripping … with blood and dirt' (chapter 31).",
      "Les trésors captés au loin par le pillage et l'esclavage refluaient vers l'Europe et s'y transformaient en capital ; la dette publique et l'impôt ont créé des financiers et un marché des titres. D'où le capital qui vient au monde « suant le sang et la boue par tous les pores » (chapitre 31).",
      "Los tesoros obtenidos fuera por el saqueo y la esclavitud refluían a Europa y se convertían allí en capital; la deuda pública y los impuestos crearon financieros y un mercado de títulos. De ahí que el capital venga al mundo chorreando sangre y lodo por todos los poros (capítulo 31).",
    ],
  },
  {
    id: "mx-pri-06",
    q: ["What did Wakefield's theory of colonisation reveal, according to Marx?", "Qu'a révélé la théorie de la colonisation de Wakefield, selon Marx ?", "¿Qué reveló la teoría de la colonización de Wakefield, según Marx?"],
    a: ["That capital is a social relation: where land is free, workers cannot be kept as wage labourers", "Que le capital est un rapport social : là où la terre est libre, on ne peut pas garder les ouvriers salariés", "Que el capital es una relación social: donde la tierra es libre, no se puede retener a los obreros como asalariados"],
    w: [["That colonies are always unprofitable", "Que les colonies ne sont jamais rentables", "Que las colonias nunca son rentables"], ["That workers prefer wages to land", "Que les ouvriers préfèrent le salaire à la terre", "Que los obreros prefieren el salario a la tierra"], ["That free trade solves the labour shortage", "Que le libre-échange résout la pénurie de main-d'œuvre", "Que el libre comercio resuelve la escasez de mano de obra"]],
    e: [
      "Mr. Peel took means of production and 3,000 workers to Western Australia and was left 'without a servant to make his bed': they left to farm free land. Wakefield proposed a high price on land to create a working class: the secret of the old world laid bare in the new (chapter 33).",
      "M. Peel emmena en Australie occidentale des moyens de production et 3 000 ouvriers, et resta sans un domestique pour faire son lit : ils partirent cultiver des terres libres. Wakefield proposa un prix élevé de la terre pour créer une classe ouvrière : le secret du vieux monde mis à nu dans le nouveau (chapitre 33).",
      "El señor Peel llevó a Australia occidental medios de producción y 3000 obreros, y se quedó sin un criado que le hiciera la cama: se marcharon a cultivar tierras libres. Wakefield propuso un precio alto de la tierra para crear una clase obrera: el secreto del viejo mundo puesto al desnudo en el nuevo (capítulo 33).",
    ],
  },
];

const circulationDeeper: MarxQuestion[] = [
  {
    id: "mx-cir-04",
    q: ["Which costs of circulation are productive, according to Marx?", "Quels frais de circulation sont productifs, selon Marx ?", "¿Qué gastos de circulación son productivos, según Marx?"],
    a: ["Storage and transport, in so far as they are needed for the use of the product", "Le stockage et le transport, dans la mesure où ils sont nécessaires à l'usage du produit", "El almacenamiento y el transporte, en la medida en que son necesarios para el uso del producto"],
    w: [["Bookkeeping and advertising", "La comptabilité et la publicité", "La contabilidad y la publicidad"], ["Buying and selling, since without them nothing is realised", "L'achat et la vente, puisque sans eux rien n'est réalisé", "La compra y la venta, pues sin ellas nada se realiza"], ["None: all costs of circulation are unproductive", "Aucun : tous les frais de circulation sont improductifs", "Ninguno: todos los gastos de circulación son improductivos"]],
    e: [
      "Pure costs of circulation only change the form of value, from commodity to money, and are paid out of surplus value. Moving goods to where they are used, and keeping them in usable state, continue production and add value (Volume II, chapter 6).",
      "Les frais purs de circulation ne font que changer la forme de la valeur, de marchandise en argent, et sont payés sur la plus-value. Amener les biens là où on les utilise, et les garder en état, prolonge la production et ajoute de la valeur (Livre II, chapitre 6).",
      "Los gastos puros de circulación solo cambian la forma del valor, de mercancía a dinero, y se pagan con plusvalor. Llevar los bienes adonde se usan, y conservarlos en buen estado, prolonga la producción y añade valor (Libro II, capítulo 6).",
    ],
  },
  {
    id: "mx-cir-05",
    q: ["Why can the time of production be longer than the working time?", "Pourquoi le temps de production peut-il être plus long que le temps de travail ?", "¿Por qué el tiempo de producción puede ser más largo que el tiempo de trabajo?"],
    a: ["Because some processes run without labour: wine fermenting, grain growing, wood drying", "Parce que certains processus se déroulent sans travail : le vin qui fermente, le grain qui pousse, le bois qui sèche", "Porque algunos procesos transcurren sin trabajo: el vino que fermenta, el grano que crece, la madera que se seca"],
    w: [["Because workers take breaks", "Parce que les ouvriers prennent des pauses", "Porque los obreros hacen pausas"], ["Because machines are slower than people", "Parce que les machines sont plus lentes que les gens", "Porque las máquinas son más lentas que las personas"], ["It cannot: the two are always equal", "C'est impossible : les deux sont toujours égaux", "No puede: ambos son siempre iguales"]],
    e: [
      "During such natural processes, capital is tied up but no labour is applied, so no value or surplus value is created. Capital tries to shorten them, one reason it reshapes agriculture (Volume II, chapter 13).",
      "Pendant ces processus naturels, le capital est immobilisé mais aucun travail n'est appliqué, donc ni valeur ni plus-value ne sont créées. Le capital cherche à les raccourcir, l'une des raisons pour lesquelles il transforme l'agriculture (Livre II, chapitre 13).",
      "Durante esos procesos naturales, el capital está inmovilizado pero no se aplica trabajo, así que no se crea valor ni plusvalor. El capital intenta acortarlos, una de las razones por las que transforma la agricultura (Libro II, capítulo 13).",
    ],
  },
  {
    id: "mx-cir-06",
    q: ["Raw cotton in a spinning mill is constant capital. Is it fixed or circulating capital?", "Le coton brut d'une filature est du capital constant. Est-il du capital fixe ou circulant ?", "El algodón en bruto de una hilandería es capital constante. ¿Es capital fijo o circulante?"],
    a: ["Circulating: its whole value passes into each batch of yarn", "Circulant : toute sa valeur passe dans chaque lot de fil", "Circulante: todo su valor pasa a cada lote de hilo"],
    w: [["Fixed, since all constant capital is fixed", "Fixe, puisque tout capital constant est fixe", "Fijo, pues todo capital constante es fijo"], ["Variable, since it changes form", "Variable, puisqu'il change de forme", "Variable, pues cambia de forma"], ["Neither: raw materials are not capital", "Ni l'un ni l'autre : les matières premières ne sont pas du capital", "Ninguno: las materias primas no son capital"]],
    e: [
      "Constant/variable is about creating value; fixed/circulating about how value turns over. Cotton is constant (it creates no value) and circulating (it is used up in each product). Mixing the two pairs, as Smith and Ricardo did, hides where surplus value comes from (Volume II, chapters 8–11).",
      "Constant/variable porte sur la création de valeur ; fixe/circulant sur la façon dont la valeur tourne. Le coton est constant (il ne crée pas de valeur) et circulant (il est consommé dans chaque produit). Mêler les deux couples, comme Smith et Ricardo, cache d'où vient la plus-value (Livre II, chapitres 8–11).",
      "Constante/variable trata de la creación de valor; fijo/circulante, de cómo rota el valor. El algodón es constante (no crea valor) y circulante (se consume en cada producto). Mezclar ambos pares, como Smith y Ricardo, oculta de dónde viene el plusvalor (Libro II, capítulos 8–11).",
    ],
  },
];

const reproductionDeeper: MarxQuestion[] = [
  {
    id: "mx-rep-04",
    q: ["Why must Department I's $v + s$ be exchanged with Department II's $c$ in simple reproduction?", "Pourquoi le $v + s$ du secteur I doit-il s'échanger contre le $c$ du secteur II dans la reproduction simple ?", "¿Por qué el $v + s$ del sector I debe intercambiarse con el $c$ del sector II en la reproducción simple?"],
    a: ["I's workers and capitalists need consumer goods but hold means of production; II needs means of production to replace its c", "Les ouvriers et capitalistes de I ont besoin de biens de consommation mais détiennent des moyens de production ; II a besoin de moyens de production pour remplacer son c", "Los obreros y capitalistas de I necesitan bienes de consumo pero tienen medios de producción; II necesita medios de producción para reponer su c"],
    w: [["Because the state requires the two departments to trade", "Parce que l'État oblige les deux secteurs à commercer", "Porque el Estado obliga a ambos sectores a comerciar"], ["Because Department I's c is always larger than II's", "Parce que le c du secteur I est toujours plus grand que celui de II", "Porque el c del sector I es siempre mayor que el de II"], ["Because surplus value must stay within its own department", "Parce que la plus-value doit rester dans son propre secteur", "Porque el plusvalor debe quedarse en su propio sector"]],
    e: [
      "Each department can use part of its own product: I its means of production to replace Ic, II its consumer goods for IIv and IIs. What remains in each is useless to its owners and needed by the other; the two must be equal in value.",
      "Chaque secteur peut utiliser une partie de son propre produit : I ses moyens de production pour remplacer Ic, II ses biens de consommation pour IIv et IIs. Ce qui reste dans chacun est inutile à ses propriétaires et nécessaire à l'autre ; les deux doivent être égaux en valeur.",
      "Cada sector puede usar parte de su propio producto: I sus medios de producción para reponer Ic, II sus bienes de consumo para IIv y IIs. Lo que queda en cada uno es inútil para sus dueños y necesario para el otro; ambos deben ser iguales en valor.",
    ],
  },
  {
    id: "mx-rep-05",
    q: ["Which earlier economic model inspired Marx's reproduction schemes?", "Quel modèle économique antérieur a inspiré les schémas de reproduction de Marx ?", "¿Qué modelo económico anterior inspiró los esquemas de reproducción de Marx?"],
    a: ["Quesnay's Tableau économique", "Le Tableau économique de Quesnay", "El Tableau économique de Quesnay"],
    w: [["Ricardo's corn model", "Le modèle du blé de Ricardo", "El modelo del trigo de Ricardo"], ["Walras's general equilibrium", "L'équilibre général de Walras", "El equilibrio general de Walras"], ["Smith's pin factory", "La manufacture d'épingles de Smith", "La fábrica de alfileres de Smith"]],
    e: [
      "Quesnay's Tableau (1758) traced the flows of a year's product between classes; Marx admired it as the first picture of the whole circulation. Walras's model came after Capital; Marx's schemes in turn anticipate input–output analysis.",
      "Le Tableau de Quesnay (1758) suivait les flux du produit annuel entre les classes ; Marx l'admirait comme le premier tableau de toute la circulation. Le modèle de Walras est postérieur au Capital ; les schémas de Marx annoncent à leur tour l'analyse entrées-sorties.",
      "El Tableau de Quesnay (1758) seguía los flujos del producto anual entre las clases; Marx lo admiraba como el primer cuadro de toda la circulación. El modelo de Walras es posterior a El capital; los esquemas de Marx anticipan a su vez el análisis input-output.",
    ],
  },
  {
    id: "mx-rep-06",
    q: ["In Marx's simple scheme, I: $4000c + 1000v + 1000s$. What must Department II's constant capital be?", "Dans le schéma simple de Marx, I : $4000c + 1000v + 1000s$. Que doit valoir le capital constant du secteur II ?", "En el esquema simple de Marx, I: $4000c + 1000v + 1000s$. ¿Cuánto debe valer el capital constante del sector II?"],
    a: ["2000", "2000", "2000"],
    w: [["4000", "4000", "4000"], ["1000", "1000", "1000"], ["6000", "6000", "6000"]],
    e: [
      "Simple reproduction needs IIc = I(v + s) = 1000 + 1000 = 2000. Marx's full scheme is I: 4000c + 1000v + 1000s = 6000; II: 2000c + 500v + 500s = 3000.",
      "La reproduction simple exige IIc = I(v + s) = 1000 + 1000 = 2000. Le schéma complet de Marx est I : 4000c + 1000v + 1000s = 6000 ; II : 2000c + 500v + 500s = 3000.",
      "La reproducción simple exige IIc = I(v + s) = 1000 + 1000 = 2000. El esquema completo de Marx es I: 4000c + 1000v + 1000s = 6000; II: 2000c + 500v + 500s = 3000.",
    ],
  },
];

const profitDeeper: MarxQuestion[] = [
  {
    id: "mx-pro-04",
    q: ["What is a price of production?", "Qu'est-ce qu'un prix de production ?", "¿Qué es un precio de producción?"],
    a: ["The cost price plus the general rate of profit on the capital advanced", "Le prix de revient plus le taux général de profit sur le capital avancé", "El precio de coste más la tasa general de ganancia sobre el capital adelantado"],
    w: [["The value of the commodity, $c + v + s$", "La valeur de la marchandise, $c + v + s$", "El valor de la mercancía, $c + v + s$"], ["The cost price plus the branch's own surplus value", "Le prix de revient plus la plus-value propre à la branche", "El precio de coste más el plusvalor propio de la rama"], ["The price fixed by a monopoly", "Le prix fixé par un monopole", "El precio fijado por un monopolio"]],
    e: [
      "With competition, each capital earns the average rate on its size, whatever surplus value its own workers produced. Prices of production lie above values where the composition is high and below where it is low (Volume III, chapter 9).",
      "Avec la concurrence, chaque capital gagne le taux moyen sur sa taille, quelle que soit la plus-value produite par ses propres ouvriers. Les prix de production sont au-dessus des valeurs là où la composition est élevée et au-dessous là où elle est faible (Livre III, chapitre 9).",
      "Con la competencia, cada capital obtiene la tasa media sobre su tamaño, sea cual sea el plusvalor producido por sus propios obreros. Los precios de producción están por encima de los valores donde la composición es alta y por debajo donde es baja (Libro III, capítulo 9).",
    ],
  },
  {
    id: "mx-pro-05",
    q: ["Why does a rising organic composition tend to lower the rate of profit?", "Pourquoi une composition organique croissante tend-elle à faire baisser le taux de profit ?", "¿Por qué una composición orgánica creciente tiende a bajar la tasa de ganancia?"],
    a: ["$p' = s'/(c/v + 1)$: at a given $s'$, a larger $c/v$ means a smaller $p'$", "$p' = s'/(c/v + 1)$ : à $s'$ donné, un $c/v$ plus grand donne un $p'$ plus petit", "$p' = s'/(c/v + 1)$: con $s'$ dado, un $c/v$ mayor da un $p'$ menor"],
    w: [["Because machines wear out faster than workers", "Parce que les machines s'usent plus vite que les ouvriers", "Porque las máquinas se desgastan más deprisa que los obreros"], ["Because wages always rise with productivity", "Parce que les salaires montent toujours avec la productivité", "Porque los salarios siempre suben con la productividad"], ["Because competition lowers the rate of surplus value", "Parce que la concurrence fait baisser le taux de plus-value", "Porque la competencia baja la tasa de plusvalor"]],
    e: [
      "Only living labour creates surplus value; if each unit of capital employs relatively less of it, profit per unit of capital falls, unless exploitation rises enough. Example: $s' = 100\\%$, $c/v$ from 4 to 9, $p'$ from 20% to 10% (Volume III, chapter 13).",
      "Seul le travail vivant crée de la plus-value ; si chaque unité de capital en emploie relativement moins, le profit par unité de capital baisse, à moins que l'exploitation n'augmente assez. Exemple : $s' = 100\\%$, $c/v$ de 4 à 9, $p'$ de 20 % à 10 % (Livre III, chapitre 13).",
      "Solo el trabajo vivo crea plusvalor; si cada unidad de capital emplea relativamente menos, la ganancia por unidad de capital baja, salvo que la explotación aumente lo bastante. Ejemplo: $s' = 100\\%$, $c/v$ de 4 a 9, $p'$ del 20 % al 10 % (Libro III, capítulo 13).",
    ],
  },
  {
    id: "mx-pro-06",
    q: ["Which of these is NOT one of the counteracting influences Marx lists against the falling rate of profit?", "Lequel de ces éléments n'est PAS l'une des causes qui contrarient la baisse du taux de profit selon Marx ?", "¿Cuál de estos NO es una de las causas que contrarrestan la caída de la tasa de ganancia según Marx?"],
    a: ["A rising rate of interest", "La hausse du taux d'intérêt", "La subida del tipo de interés"],
    w: [["The cheapening of the elements of constant capital", "La baisse du prix des éléments du capital constant", "El abaratamiento de los elementos del capital constante"], ["Depression of wages below the value of labour-power", "La réduction du salaire au-dessous de la valeur de la force de travail", "La reducción del salario por debajo del valor de la fuerza de trabajo"], ["Foreign trade", "Le commerce extérieur", "El comercio exterior"]],
    e: [
      "Chapter 14 lists six: a rising intensity of exploitation, wages pressed below value, cheaper constant capital, relative over-population, foreign trade, and the growth of share capital. Interest divides profit; it does not raise the rate of profit.",
      "Le chapitre 14 en énumère six : l'augmentation du degré d'exploitation, la réduction du salaire au-dessous de sa valeur, la baisse du prix du capital constant, la surpopulation relative, le commerce extérieur et l'accroissement du capital par actions. L'intérêt partage le profit ; il n'élève pas le taux de profit.",
      "El capítulo 14 enumera seis: el aumento del grado de explotación, la reducción del salario por debajo de su valor, el abaratamiento del capital constante, la sobrepoblación relativa, el comercio exterior y el aumento del capital por acciones. El interés reparte la ganancia; no eleva la tasa de ganancia.",
    ],
  },
];

const creditDeeper: MarxQuestion[] = [
  {
    id: "mx-cre-04",
    q: ["Is there a 'natural' rate of interest, according to Marx?", "Existe-t-il un taux d'intérêt « naturel », selon Marx ?", "¿Existe un tipo de interés «natural», según Marx?"],
    a: ["No: it is set by supply and demand for loan capital, between zero and the whole profit", "Non : il est fixé par l'offre et la demande de capital de prêt, entre zéro et le profit entier", "No: lo fijan la oferta y la demanda de capital de préstamo, entre cero y la ganancia entera"],
    w: [["Yes: it equals the rate of surplus value", "Oui : il est égal au taux de plus-value", "Sí: es igual a la tasa de plusvalor"], ["Yes: it equals the general rate of profit", "Oui : il est égal au taux général de profit", "Sí: es igual a la tasa general de ganancia"], ["Yes: it is fixed by the labour time of bankers", "Oui : il est fixé par le temps de travail des banquiers", "Sí: lo fija el tiempo de trabajo de los banqueros"]],
    e: [
      "Unlike the general rate of profit, which competition forms around values and prices of production, the division of profit into interest and profit of enterprise has no law of its own: it is a matter of the money market (Volume III, chapter 22).",
      "Contrairement au taux général de profit, que la concurrence forme autour des valeurs et des prix de production, le partage du profit entre intérêt et profit d'entreprise n'a pas de loi propre : c'est une affaire de marché monétaire (Livre III, chapitre 22).",
      "A diferencia de la tasa general de ganancia, que la competencia forma en torno a los valores y los precios de producción, el reparto de la ganancia entre interés y ganancia empresarial no tiene ley propia: es cosa del mercado de dinero (Libro III, capítulo 22).",
    ],
  },
  {
    id: "mx-cre-05",
    q: ["What is fictitious capital?", "Qu'est-ce que le capital fictif ?", "¿Qué es el capital ficticio?"],
    a: ["Titles to future income, such as shares and bonds, priced by capitalising that income", "Des titres à un revenu futur, comme actions et obligations, dont le prix capitalise ce revenu", "Títulos sobre ingresos futuros, como acciones y bonos, cuyo precio capitaliza esos ingresos"],
    w: [["Counterfeit money in circulation", "De la fausse monnaie en circulation", "Dinero falso en circulación"], ["Capital that exists only in the accounts of bankrupt firms", "Du capital qui n'existe que dans les comptes des entreprises en faillite", "Capital que solo existe en las cuentas de empresas en quiebra"], ["The value of machines not yet used", "La valeur des machines pas encore utilisées", "El valor de máquinas aún no utilizadas"]],
    e: [
      "A government bond's price is its yearly payment divided by the rate of interest, though the money lent was spent long ago; shares double the real capital on paper. Their prices move with interest rates and expectations, feeding speculation (Volume III, chapter 29).",
      "Le prix d'une obligation d'État est son paiement annuel divisé par le taux d'intérêt, alors que l'argent prêté a été dépensé depuis longtemps ; les actions dédoublent sur le papier le capital réel. Leurs prix suivent les taux d'intérêt et les anticipations, ce qui nourrit la spéculation (Livre III, chapitre 29).",
      "El precio de un bono del Estado es su pago anual dividido por el tipo de interés, aunque el dinero prestado se gastó hace mucho; las acciones duplican sobre el papel el capital real. Sus precios siguen los tipos de interés y las expectativas, lo que alimenta la especulación (Libro III, capítulo 29).",
    ],
  },
  {
    id: "mx-cre-06",
    q: ["What does Marx call the 'trinity formula'?", "Qu'est-ce que Marx appelle la « formule trinitaire » ?", "¿Qué llama Marx la «fórmula trinitaria»?"],
    a: ["The appearance that capital yields profit, land rent and labour wages, as three separate sources", "L'apparence que le capital rapporte le profit, la terre la rente et le travail le salaire, comme trois sources séparées", "La apariencia de que el capital rinde ganancia, la tierra renta y el trabajo salario, como tres fuentes separadas"],
    w: [["The three volumes of Capital", "Les trois livres du Capital", "Los tres libros de El capital"], ["The three functions of money", "Les trois fonctions de la monnaie", "Las tres funciones del dinero"], ["The three circuits of industrial capital", "Les trois cycles du capital industriel", "Los tres ciclos del capital industrial"]],
    e: [
      "On the surface, each class seems to draw its revenue from its own factor of production. Marx shows that profit, interest and rent are all parts of the surplus value created by labour (Volume III, chapter 48).",
      "En surface, chaque classe semble tirer son revenu de son propre facteur de production. Marx montre que profit, intérêt et rente sont tous des parties de la plus-value créée par le travail (Livre III, chapitre 48).",
      "En la superficie, cada clase parece obtener su ingreso de su propio factor de producción. Marx muestra que la ganancia, el interés y la renta son todos partes del plusvalor creado por el trabajo (Libro III, capítulo 48).",
    ],
  },
];

export const commodity = { commodityDeeper };
export const money = { moneyDeeper };
export const surplus = { surplusDeeper };
export const workingDay = { dayDeeper };
export const relative = { relativeDeeper };
export const wages = { wagesDeeper };
export const accumulation = { accumulationDeeper };
export const primitive = { primitiveDeeper };
export const circulation = { circulationDeeper };
export const reproduction = { reproductionDeeper };
export const profit = { profitDeeper };
export const credit = { creditDeeper };
