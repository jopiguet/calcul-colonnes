/**
 * Public economics, Débutant and Expert: written questions added with the four
 * levels (QUIZ_VERSION 5). The concept questions of Intermédiaire and Avancé
 * come from the question bank; these do not need it.
 */
import type { LinuxQuestion as Q } from "../linux/types";

type Pair = { beginner: Q[]; expert: Q[] };

const welfare: Pair = {
  beginner: [
    {
      id: "ec-wel-b01",
      since: 5,
      q: ["When is an allocation Pareto efficient?", "Quand une allocation est-elle efficace au sens de Pareto ?", "¿Cuándo es eficiente en el sentido de Pareto una asignación?"],
      a: ["When nobody can be made better off without making someone worse off", "Quand on ne peut améliorer le sort de personne sans dégrader celui de quelqu'un", "Cuando no se puede mejorar a nadie sin empeorar a alguien"],
      w: [["When everybody has the same income", "Quand tout le monde a le même revenu", "Cuando todos tienen la misma renta"], ["When total income is as high as it can be", "Quand le revenu total est aussi élevé que possible", "Cuando la renta total es la más alta posible"], ["When the poorest person is as well off as possible", "Quand le plus pauvre est aussi bien loti que possible", "Cuando el más pobre está lo mejor posible"]],
      e: ["Efficiency says nothing about fairness: giving everything to one person is Pareto efficient too. Choosing among efficient allocations needs a judgement about distribution, a social welfare function.", "L'efficacité ne dit rien de l'équité : tout donner à une seule personne est aussi efficace au sens de Pareto. Choisir entre allocations efficaces demande un jugement sur la répartition, une fonction de bien-être social.", "La eficiencia no dice nada de la equidad: darlo todo a una sola persona también es eficiente en el sentido de Pareto. Elegir entre asignaciones eficientes exige un juicio sobre el reparto, una función de bienestar social."],
    },
    {
      id: "ec-wel-b02",
      since: 5,
      q: ["What does the first fundamental theorem of welfare economics say?", "Que dit le premier théorème fondamental de l'économie du bien-être ?", "¿Qué dice el primer teorema fundamental de la economía del bienestar?"],
      a: ["Under its assumptions, a competitive market equilibrium is Pareto efficient", "Sous ses hypothèses, un équilibre de marché concurrentiel est efficace au sens de Pareto", "Bajo sus supuestos, un equilibrio de mercado competitivo es eficiente en el sentido de Pareto"],
      w: [["Markets always produce a fair distribution", "Les marchés produisent toujours une répartition juste", "Los mercados siempre producen un reparto justo"], ["Government must set prices for markets to work", "L'État doit fixer les prix pour que les marchés fonctionnent", "El Estado debe fijar los precios para que los mercados funcionen"], ["Every efficient allocation is a market equilibrium", "Toute allocation efficace est un équilibre de marché", "Toda asignación eficiente es un equilibrio de mercado"]],
      e: ["The assumptions are strong: no externalities, no public goods, full information, price-taking. Where they fail, public economics looks for corrections. The last option is close to the second theorem, which needs lump-sum transfers.", "Les hypothèses sont fortes : pas d'externalités, pas de biens publics, information complète, prix donnés. Là où elles tombent, l'économie publique cherche des corrections. La dernière option ressemble au second théorème, qui demande des transferts forfaitaires.", "Los supuestos son fuertes: sin externalidades, sin bienes públicos, información completa, precios dados. Donde fallan, la economía pública busca correcciones. La última opción se parece al segundo teorema, que exige transferencias de suma fija."],
    },
    {
      id: "ec-wel-b03",
      since: 5,
      q: ["What does a utilitarian social welfare function maximise?", "Que maximise une fonction de bien-être social utilitariste ?", "¿Qué maximiza una función de bienestar social utilitarista?"],
      a: ["The sum of everyone's utilities", "La somme des utilités de tous", "La suma de las utilidades de todos"],
      w: [["The utility of the worst-off person", "L'utilité de la personne la plus mal lotie", "La utilidad de la persona peor situada"], ["The product of everyone's incomes", "Le produit des revenus de tous", "El producto de las rentas de todos"], ["Total income, whatever its distribution", "Le revenu total, quelle que soit sa répartition", "La renta total, sea cual sea su reparto"]],
      e: ["With diminishing marginal utility, a utilitarian still favours some redistribution, because a euro is worth more to the poor. The worst-off person's utility is the Rawlsian criterion.", "Avec une utilité marginale décroissante, un utilitariste favorise quand même une certaine redistribution, car un euro vaut plus pour le pauvre. L'utilité du plus mal loti est le critère de Rawls.", "Con utilidad marginal decreciente, un utilitarista favorece aun así cierta redistribución, porque un euro vale más para el pobre. La utilidad del peor situado es el criterio de Rawls."],
    },
  ],
  expert: [
    {
      id: "ec-wel-x01",
      since: 5,
      q: ["What does Arrow's impossibility theorem rule out?", "Qu'exclut le théorème d'impossibilité d'Arrow ?", "¿Qué excluye el teorema de imposibilidad de Arrow?"],
      a: ["A rule ranking social states from individual rankings that is Pareto, independent of irrelevant alternatives, defined on all preferences and not dictatorial", "Une règle qui classerait les états sociaux à partir des classements individuels, en respectant Pareto, l'indépendance des alternatives non pertinentes, tous les profils de préférences, sans dictateur", "Una regla que ordene los estados sociales a partir de los órdenes individuales y sea de Pareto, independiente de alternativas irrelevantes, definida para todas las preferencias y no dictatorial"],
      w: [["Any vote with more than two candidates", "Tout vote à plus de deux candidats", "Toda votación con más de dos candidatos"], ["Any social welfare function using cardinal utilities", "Toute fonction de bien-être social à utilités cardinales", "Toda función de bienestar social con utilidades cardinales"], ["Pareto efficient market outcomes", "Les résultats de marché efficaces au sens de Pareto", "Los resultados de mercado eficientes en el sentido de Pareto"]],
      e: ["The theorem concerns ordinal information only. With interpersonal comparisons of utility (cardinal, comparable), utilitarian or Rawlsian functions escape it; restricting preferences (single-peaked ones) also does, as with the median voter.", "Le théorème ne porte que sur une information ordinale. Avec des comparaisons interpersonnelles d'utilité (cardinales, comparables), les fonctions utilitaristes ou rawlsiennes y échappent ; restreindre les préférences (unimodales) aussi, comme avec l'électeur médian.", "El teorema trata solo información ordinal. Con comparaciones interpersonales de utilidad (cardinales, comparables), las funciones utilitaristas o rawlsianas lo eluden; restringir las preferencias (unimodales) también, como con el votante mediano."],
    },
    {
      id: "ec-wel-x02",
      since: 5,
      q: ["Why is the second welfare theorem hard to use as a policy rule?", "Pourquoi le second théorème du bien-être est-il difficile à appliquer en politique ?", "¿Por qué es difícil usar el segundo teorema del bienestar como regla de política?"],
      a: ["It needs lump-sum transfers based on traits people cannot change, which governments cannot observe", "Il demande des transferts forfaitaires fondés sur des traits que les gens ne peuvent pas changer, et que l'État n'observe pas", "Exige transferencias de suma fija basadas en rasgos que la gente no puede cambiar y que el Estado no observa"],
      w: [["It holds only for monopolies", "Il ne vaut que pour les monopoles", "Solo vale para los monopolios"], ["It forbids any redistribution", "Il interdit toute redistribution", "Prohíbe toda redistribución"], ["It needs prices to be set by the government", "Il demande que l'État fixe les prix", "Exige que el Estado fije los precios"]],
      e: ["Taxes on income or spending change behaviour and cost efficiency; transfers tied to ability would not, but ability is hidden. This trade-off between equity and efficiency is what optimal taxation (Mirrlees) studies.", "Les impôts sur le revenu ou la dépense changent les comportements et coûtent en efficacité ; des transferts liés à la capacité ne le feraient pas, mais la capacité est cachée. Cet arbitrage entre équité et efficacité est l'objet de la fiscalité optimale (Mirrlees).", "Los impuestos sobre la renta o el gasto cambian el comportamiento y cuestan eficiencia; las transferencias ligadas a la capacidad no lo harían, pero la capacidad está oculta. Ese dilema entre equidad y eficiencia es lo que estudia la fiscalidad óptima (Mirrlees)."],
    },
    {
      id: "ec-wel-x03",
      since: 5,
      q: ["Behind Rawls's veil of ignorance, why would people choose the maximin rule, on his account?", "Derrière le voile d'ignorance de Rawls, pourquoi choisirait-on la règle du maximin, selon lui ?", "Tras el velo de ignorancia de Rawls, ¿por qué se elegiría la regla maximin, según él?"],
      a: ["Facing a choice of basic structure once and for all, without probabilities, they would secure the best worst position", "Face à un choix de structure de base fait une fois pour toutes, sans probabilités, on assurerait la meilleure position la plus défavorable", "Ante una elección de estructura básica de una vez por todas, sin probabilidades, se aseguraría la mejor posición peor"],
      w: [["Because people are assumed to love risk", "Parce qu'on suppose que les gens aiment le risque", "Porque se supone que a la gente le gusta el riesgo"], ["Because it maximises expected utility", "Parce qu'elle maximise l'utilité espérée", "Porque maximiza la utilidad esperada"], ["Because everyone knows their own talents", "Parce que chacun connaît ses propres talents", "Porque cada uno conoce sus propios talentos"]],
      e: ["Harsanyi answered that a rational chooser behind the veil maximises expected utility, which leads to utilitarianism; the disagreement is over extreme risk aversion and the use of probabilities.", "Harsanyi a répondu qu'un choix rationnel derrière le voile maximise l'utilité espérée, ce qui mène à l'utilitarisme ; le désaccord porte sur l'aversion extrême au risque et l'usage des probabilités.", "Harsanyi respondió que quien elige racionalmente tras el velo maximiza la utilidad esperada, lo que lleva al utilitarismo; el desacuerdo está en la aversión extrema al riesgo y el uso de probabilidades."],
    },
  ],
};

const marketFailure: Pair = {
  beginner: [
    {
      id: "ec-mf-b01",
      since: 5,
      q: ["What is a negative externality?", "Qu'est-ce qu'une externalité négative ?", "¿Qué es una externalidad negativa?"],
      a: ["A cost that an activity imposes on others without being paid for, such as a factory's pollution", "Un coût qu'une activité impose à d'autres sans le payer, comme la pollution d'une usine", "Un coste que una actividad impone a otros sin pagarlo, como la contaminación de una fábrica"],
      w: [["A tax on imported goods", "Une taxe sur les biens importés", "Un impuesto sobre los bienes importados"], ["A loss a firm makes in a bad year", "Une perte qu'une entreprise fait une mauvaise année", "Una pérdida que una empresa tiene en un mal año"], ["A cost paid by the buyer of a good", "Un coût payé par l'acheteur d'un bien", "Un coste pagado por el comprador de un bien"]],
      e: ["Because the producer ignores that cost, the market produces more than is efficient. Taxes, regulation, or tradable permits make the cost count.", "Comme le producteur ignore ce coût, le marché produit plus que l'efficacité ne le voudrait. Taxes, réglementation ou permis échangeables le font compter.", "Como el productor ignora ese coste, el mercado produce más de lo eficiente. Los impuestos, la regulación o los permisos negociables hacen que cuente."],
    },
    {
      id: "ec-mf-b02",
      since: 5,
      q: ["Which pair of features makes a good a pure public good?", "Quelles deux caractéristiques font d'un bien un bien public pur ?", "¿Qué dos rasgos hacen de un bien un bien público puro?"],
      a: ["Non-rival (one person's use does not reduce another's) and non-excludable (nobody can be kept from using it)", "Non rival (l'usage de l'un ne réduit pas celui de l'autre) et non excluable (on ne peut empêcher personne d'en profiter)", "No rival (el uso de uno no reduce el de otro) y no excluible (no se puede impedir que nadie lo use)"],
      w: [["Produced by the state and free of charge", "Produit par l'État et gratuit", "Producido por el Estado y gratuito"], ["Rival and excludable", "Rival et excluable", "Rival y excluible"], ["Cheap and used by many people", "Bon marché et utilisé par beaucoup", "Barato y usado por mucha gente"]],
      e: ["National defence or a lighthouse are classic examples. Because nobody can be excluded, people can free ride, and private markets supply too little. Who produces it is a separate question.", "La défense nationale ou un phare sont des exemples classiques. Comme personne ne peut être exclu, chacun peut profiter sans payer, et le marché en fournit trop peu. Qui le produit est une autre question.", "La defensa nacional o un faro son ejemplos clásicos. Como no se puede excluir a nadie, cada uno puede aprovecharse sin pagar, y el mercado lo ofrece en cantidad insuficiente. Quién lo produce es otra cuestión."],
    },
    {
      id: "ec-mf-b03",
      since: 5,
      q: ["What is a Pigouvian tax?", "Qu'est-ce qu'une taxe pigouvienne ?", "¿Qué es un impuesto pigouviano?"],
      a: ["A tax on an activity equal to the external damage it causes at the efficient level", "Une taxe sur une activité égale au dommage externe qu'elle cause au niveau efficace", "Un impuesto sobre una actividad igual al daño externo que causa en el nivel eficiente"],
      w: [["A tax on profits above a threshold", "Un impôt sur les bénéfices au-delà d'un seuil", "Un impuesto sobre los beneficios por encima de un umbral"], ["A tax paid by those who suffer the pollution", "Une taxe payée par ceux qui subissent la pollution", "Un impuesto pagado por quienes sufren la contaminación"], ["A tax that funds a public good", "Un impôt qui finance un bien public", "Un impuesto que financia un bien público"]],
      e: ["Named after Arthur Pigou: the tax makes the private cost equal the social cost, so producers choose the efficient quantity. A carbon tax is the best-known case.", "D'après Arthur Pigou : la taxe égalise le coût privé et le coût social, et les producteurs choisissent la quantité efficace. La taxe carbone en est l'exemple le plus connu.", "Por Arthur Pigou: el impuesto iguala el coste privado y el social, de modo que los productores eligen la cantidad eficiente. El impuesto al carbono es el caso más conocido."],
    },
  ],
  expert: [
    {
      id: "ec-mf-x01",
      since: 5,
      q: ["When does the Coase theorem say bargaining fixes an externality, whoever holds the rights?", "Quand le théorème de Coase dit-il que la négociation corrige une externalité, quel que soit le détenteur des droits ?", "¿Cuándo dice el teorema de Coase que la negociación corrige una externalidad, tenga quien tenga los derechos?"],
      a: ["When property rights are clear, transaction costs are negligible and there are no income effects on the valuation", "Quand les droits de propriété sont clairs, les coûts de transaction négligeables et qu'il n'y a pas d'effet revenu sur les évaluations", "Cuando los derechos de propiedad están claros, los costes de transacción son despreciables y no hay efectos renta en las valoraciones"],
      w: [["Whenever the government sets a tax", "Chaque fois que l'État fixe une taxe", "Siempre que el Estado fije un impuesto"], ["Only when many parties are involved", "Seulement quand de nombreuses parties sont en jeu", "Solo cuando intervienen muchas partes"], ["Only when the polluter holds the rights", "Seulement quand le pollueur détient les droits", "Solo cuando el contaminador tiene los derechos"]],
      e: ["The allocation of rights then changes who pays, not the outcome. With many affected parties, free riding and holdouts raise transaction costs, which is why air pollution is regulated or taxed rather than bargained over.", "L'attribution des droits change alors qui paie, pas le résultat. Avec beaucoup de parties touchées, le passager clandestin et les blocages élèvent les coûts de transaction, d'où la réglementation ou la taxation de la pollution de l'air plutôt qu'une négociation.", "La asignación de derechos cambia entonces quién paga, no el resultado. Con muchas partes afectadas, el polizón y los bloqueos elevan los costes de transacción; por eso la contaminación del aire se regula o se grava en vez de negociarse."],
    },
    {
      id: "ec-mf-x02",
      since: 5,
      q: ["Under uncertainty about abatement costs, when does Weitzman's argument favour a price instrument (a tax) over a quantity one (a cap)?", "Sous incertitude sur les coûts de dépollution, quand l'argument de Weitzman favorise-t-il un instrument prix (une taxe) plutôt qu'un instrument quantité (un plafond) ?", "Con incertidumbre sobre los costes de reducción, ¿cuándo favorece el argumento de Weitzman un instrumento de precio (un impuesto) frente a uno de cantidad (un tope)?"],
      a: ["When the marginal damage curve is flatter than the marginal abatement cost curve", "Quand la courbe du dommage marginal est plus plate que celle du coût marginal de dépollution", "Cuando la curva de daño marginal es más plana que la de coste marginal de reducción"],
      w: [["When the marginal damage curve is steeper than the abatement cost curve", "Quand la courbe du dommage marginal est plus pentue que celle du coût de dépollution", "Cuando la curva de daño marginal es más pronunciada que la de coste de reducción"], ["Always, since taxes raise revenue", "Toujours, puisqu'une taxe rapporte des recettes", "Siempre, porque un impuesto recauda"], ["Never: with uncertainty a cap is always better", "Jamais : sous incertitude, un plafond est toujours meilleur", "Nunca: con incertidumbre un tope siempre es mejor"]],
      e: ["If damage rises slowly with emissions, getting the quantity wrong costs little, while a cap could force very costly abatement: a tax is better. With a damage threshold (steep curve), a cap is better. Stock pollutants such as CO₂ have fairly flat damage per year.", "Si le dommage croît lentement avec les émissions, se tromper de quantité coûte peu, alors qu'un plafond pourrait imposer une dépollution très coûteuse : la taxe vaut mieux. Avec un seuil de dommage (courbe pentue), le plafond vaut mieux. Les polluants de stock comme le CO₂ ont un dommage annuel assez plat.", "Si el daño crece despacio con las emisiones, equivocarse de cantidad cuesta poco, mientras que un tope podría forzar una reducción muy cara: mejor el impuesto. Con un umbral de daño (curva pronunciada), mejor el tope. Los contaminantes de stock como el CO₂ tienen un daño anual bastante plano."],
    },
    {
      id: "ec-mf-x03",
      since: 5,
      q: ["What does the Samuelson condition require for the efficient amount of a public good?", "Qu'exige la condition de Samuelson pour la quantité efficace d'un bien public ?", "¿Qué exige la condición de Samuelson para la cantidad eficiente de un bien público?"],
      a: ["The sum of everyone's marginal benefits equals the marginal cost", "La somme des bénéfices marginaux de tous égale le coût marginal", "La suma de los beneficios marginales de todos iguala el coste marginal"],
      w: [["Each person's marginal benefit equals the marginal cost", "Le bénéfice marginal de chacun égale le coût marginal", "El beneficio marginal de cada uno iguala el coste marginal"], ["The average benefit equals the average cost", "Le bénéfice moyen égale le coût moyen", "El beneficio medio iguala el coste medio"], ["The largest marginal benefit equals the marginal cost", "Le plus grand bénéfice marginal égale le coût marginal", "El mayor beneficio marginal iguala el coste marginal"]],
      e: ["Because everyone consumes the same unit, benefits add up vertically. Each person's own marginal benefit equal to cost is the private good's rule, which leads to under-provision when people contribute voluntarily.", "Comme tous consomment la même unité, les bénéfices s'additionnent verticalement. Le bénéfice marginal de chacun égal au coût est la règle du bien privé, qui mène à une sous-provision quand chacun contribue volontairement.", "Como todos consumen la misma unidad, los beneficios se suman verticalmente. Que el beneficio marginal de cada uno iguale el coste es la regla del bien privado, que lleva a una provisión insuficiente cuando cada uno contribuye voluntariamente."],
    },
  ],
};

const publicChoice: Pair = {
  beginner: [
    {
      id: "ec-pc-b01",
      since: 5,
      q: ["Under majority voting with single-peaked preferences, whose favourite option wins?", "Au vote majoritaire avec des préférences unimodales, quelle option préférée l'emporte ?", "En la votación por mayoría con preferencias unimodales, ¿qué opción preferida gana?"],
      a: ["The median voter's", "Celle de l'électeur médian", "La del votante mediano"],
      w: [["The richest voter's", "Celle de l'électeur le plus riche", "La del votante más rico"], ["The average of all favourites", "La moyenne des options préférées", "La media de las opciones preferidas"], ["The most extreme voter's", "Celle de l'électeur le plus extrême", "La del votante más extremo"]],
      e: ["Lined up on one dimension, the median's favourite beats any other option in a pairwise vote, since at least half of the voters are on each side. The mean can differ from the median when preferences are skewed.", "Rangées sur une seule dimension, l'option préférée du médian bat toute autre option en vote deux à deux, puisqu'au moins la moitié des électeurs est de chaque côté. La moyenne peut différer de la médiane quand les préférences sont asymétriques.", "Ordenadas en una sola dimensión, la opción preferida del mediano vence a cualquier otra en una votación por pares, pues al menos la mitad de los votantes está a cada lado. La media puede diferir de la mediana cuando las preferencias son asimétricas."],
    },
    {
      id: "ec-pc-b02",
      since: 5,
      q: ["What is rent-seeking?", "Qu'est-ce que la recherche de rente ?", "¿Qué es la búsqueda de rentas?"],
      a: ["Spending resources to obtain a transfer or a privilege, such as a licence or a tariff, rather than to create value", "Dépenser des ressources pour obtenir un transfert ou un privilège, comme une licence ou un droit de douane, plutôt que pour créer de la valeur", "Gastar recursos para obtener una transferencia o un privilegio, como una licencia o un arancel, en vez de para crear valor"],
      w: [["Looking for a cheaper flat to rent", "Chercher un logement moins cher à louer", "Buscar un piso más barato para alquilar"], ["Investing in a new factory", "Investir dans une nouvelle usine", "Invertir en una fábrica nueva"], ["Collecting the rent on land one owns", "Percevoir le loyer d'une terre qu'on possède", "Cobrar la renta de una tierra propia"]],
      e: ["Lobbying for protection moves income from consumers to producers; the resources spent competing for it are a social cost on top of the deadweight loss of the protection itself (Tullock, Krueger).", "Faire pression pour une protection transfère du revenu des consommateurs aux producteurs ; les ressources dépensées pour l'obtenir sont un coût social qui s'ajoute à la perte sèche de la protection elle-même (Tullock, Krueger).", "Presionar por protección transfiere renta de los consumidores a los productores; los recursos gastados en conseguirla son un coste social que se suma a la pérdida irrecuperable de la propia protección (Tullock, Krueger)."],
    },
    {
      id: "ec-pc-b03",
      since: 5,
      q: ["What is the Condorcet paradox?", "Qu'est-ce que le paradoxe de Condorcet ?", "¿Qué es la paradoja de Condorcet?"],
      a: ["Majority preferences can be cyclical: A beats B, B beats C, and C beats A", "Les préférences majoritaires peuvent être cycliques : A bat B, B bat C et C bat A", "Las preferencias mayoritarias pueden ser cíclicas: A vence a B, B vence a C y C vence a A"],
      w: [["The candidate with most votes always loses", "Le candidat qui a le plus de voix perd toujours", "El candidato con más votos siempre pierde"], ["Voters always vote against their interests", "Les électeurs votent toujours contre leurs intérêts", "Los votantes siempre votan contra sus intereses"], ["A majority can never be reached", "Une majorité ne peut jamais être atteinte", "Nunca se puede alcanzar una mayoría"]],
      e: ["With three voters ranking A>B>C, B>C>A and C>A>B, every option loses to another. The agenda, the order of votes, then decides the outcome. Single-peaked preferences rule cycles out.", "Avec trois électeurs classant A>B>C, B>C>A et C>A>B, chaque option perd contre une autre. L'ordre du jour, l'ordre des votes, décide alors du résultat. Des préférences unimodales excluent les cycles.", "Con tres votantes que ordenan A>B>C, B>C>A y C>A>B, cada opción pierde ante otra. El orden del día, el orden de las votaciones, decide entonces el resultado. Las preferencias unimodales excluyen los ciclos."],
    },
  ],
  expert: [
    {
      id: "ec-pc-x01",
      since: 5,
      q: ["What does the Tiebout model claim about local public goods?", "Qu'affirme le modèle de Tiebout sur les biens publics locaux ?", "¿Qué afirma el modelo de Tiebout sobre los bienes públicos locales?"],
      a: ["People 'vote with their feet', choosing among towns with different tax-and-service bundles, which can provide local public goods efficiently", "Les gens « votent avec leurs pieds » en choisissant entre des communes aux paniers impôts-services différents, ce qui peut fournir efficacement les biens publics locaux", "La gente «vota con los pies» eligiendo entre municipios con distintas combinaciones de impuestos y servicios, lo que puede proveer eficientemente los bienes públicos locales"],
      w: [["Local public goods should always be financed by the central state", "Les biens publics locaux doivent toujours être financés par l'État central", "Los bienes públicos locales siempre deben financiarlos el Estado central"], ["Mobility makes local taxation impossible", "La mobilité rend toute fiscalité locale impossible", "La movilidad hace imposible todo impuesto local"], ["Every town ends up offering the same services", "Toutes les communes finissent par offrir les mêmes services", "Todos los municipios acaban ofreciendo los mismos servicios"]],
      e: ["It needs many jurisdictions, free mobility, no spillovers between towns and taxes like user fees. Its critics point to sorting by income and to capitalisation of services into house prices.", "Il suppose de nombreuses juridictions, une mobilité libre, pas de débordements entre communes et des impôts proches de redevances. Ses critiques soulignent le tri par revenu et la capitalisation des services dans les prix des logements.", "Supone muchas jurisdicciones, movilidad libre, sin efectos entre municipios e impuestos parecidos a tasas. Sus críticos señalan la segregación por renta y la capitalización de los servicios en el precio de la vivienda."],
    },
    {
      id: "ec-pc-x02",
      since: 5,
      q: ["Why can small, concentrated groups win policies that cost a large group more than they gain (Olson)?", "Pourquoi de petits groupes concentrés peuvent-ils obtenir des politiques qui coûtent à un grand groupe plus qu'elles ne leur rapportent (Olson) ?", "¿Por qué grupos pequeños y concentrados pueden lograr políticas que cuestan a un grupo grande más de lo que les dan (Olson)?"],
      a: ["Each member of the small group gains a lot and organises; each member of the large group loses little and free rides", "Chaque membre du petit groupe gagne beaucoup et s'organise ; chaque membre du grand groupe perd peu et ne bouge pas", "Cada miembro del grupo pequeño gana mucho y se organiza; cada miembro del grupo grande pierde poco y no se mueve"],
      w: [["Because the large group is always misinformed on purpose", "Parce que le grand groupe est toujours désinformé exprès", "Porque al grupo grande siempre se le desinforma a propósito"], ["Because majority voting favours minorities", "Parce que le vote majoritaire favorise les minorités", "Porque la votación mayoritaria favorece a las minorías"], ["Because the policies raise total welfare", "Parce que ces politiques augmentent le bien-être total", "Porque esas políticas aumentan el bienestar total"]],
      e: ["Collective action is itself a public good for a group: concentrated benefits and diffuse costs explain farm subsidies or sugar quotas. Rational ignorance of voters adds to it.", "L'action collective est elle-même un bien public pour un groupe : bénéfices concentrés et coûts diffus expliquent les subventions agricoles ou les quotas sucriers. L'ignorance rationnelle des électeurs s'y ajoute.", "La acción colectiva es en sí un bien público para un grupo: beneficios concentrados y costes difusos explican las subvenciones agrícolas o las cuotas de azúcar. La ignorancia racional de los votantes se suma."],
    },
    {
      id: "ec-pc-x03",
      since: 5,
      q: ["What does Oates's decentralisation theorem say?", "Que dit le théorème de décentralisation d'Oates ?", "¿Qué dice el teorema de descentralización de Oates?"],
      a: ["Without spillovers or economies of scale, local provision suited to local preferences is at least as efficient as a uniform central one", "Sans débordements ni économies d'échelle, une fourniture locale adaptée aux préférences locales est au moins aussi efficace qu'une fourniture centrale uniforme", "Sin efectos externos ni economías de escala, una provisión local adaptada a las preferencias locales es al menos tan eficiente como una central uniforme"],
      w: [["Every public good should be provided by the smallest unit", "Tout bien public doit être fourni par la plus petite unité", "Todo bien público debe proveerlo la unidad más pequeña"], ["Central provision is always cheaper", "La fourniture centrale coûte toujours moins", "La provisión central siempre es más barata"], ["Taxes should be set locally, spending centrally", "Les impôts doivent être fixés localement, les dépenses au centre", "Los impuestos deben fijarse localmente y el gasto en el centro"]],
      e: ["Spillovers (a road used by neighbours) and scale economies (defence) argue for higher levels; diversity of preferences argues for lower ones. Fiscal federalism weighs the two.", "Les débordements (une route utilisée par les voisins) et les économies d'échelle (la défense) plaident pour les niveaux supérieurs ; la diversité des préférences, pour les niveaux inférieurs. Le fédéralisme budgétaire pèse les deux.", "Los efectos externos (una carretera usada por los vecinos) y las economías de escala (la defensa) abogan por niveles superiores; la diversidad de preferencias, por niveles inferiores. El federalismo fiscal sopesa ambos."],
    },
  ],
};

const incidence: Pair = {
  beginner: [
    {
      id: "ec-inc-b01",
      since: 5,
      q: ["A tax is levied on sellers. Who bears it?", "Une taxe est prélevée sur les vendeurs. Qui la supporte ?", "Se grava a los vendedores con un impuesto. ¿Quién lo soporta?"],
      a: ["It depends on the elasticities of supply and demand, not on who pays it to the state", "Cela dépend des élasticités de l'offre et de la demande, pas de qui la verse à l'État", "Depende de las elasticidades de la oferta y la demanda, no de quién lo paga al Estado"],
      w: [["The sellers, since they pay it", "Les vendeurs, puisqu'ils la versent", "Los vendedores, pues lo pagan"], ["The buyers, always", "Les acheteurs, toujours", "Los compradores, siempre"], ["Half each, always", "Moitié-moitié, toujours", "La mitad cada uno, siempre"]],
      e: ["The side that can less easily adjust, the less elastic one, bears more of the tax. Statutory incidence (who writes the cheque) and economic incidence (whose income falls) differ.", "Le côté qui s'adapte le moins facilement, le moins élastique, supporte la plus grande part. L'incidence légale (qui fait le chèque) et l'incidence économique (dont le revenu baisse) diffèrent.", "El lado que menos puede adaptarse, el menos elástico, soporta la mayor parte. La incidencia legal (quién firma el cheque) y la económica (cuya renta baja) difieren."],
    },
    {
      id: "ec-inc-b02",
      since: 5,
      q: ["What is the deadweight loss of a tax?", "Qu'est-ce que la perte sèche d'un impôt ?", "¿Qué es la pérdida irrecuperable de un impuesto?"],
      a: ["The loss of surplus from trades that no longer happen, beyond the revenue collected", "La perte de surplus due aux échanges qui n'ont plus lieu, au-delà des recettes perçues", "La pérdida de excedente por los intercambios que ya no se hacen, más allá de lo recaudado"],
      w: [["The tax revenue itself", "Les recettes fiscales elles-mêmes", "La propia recaudación"], ["The cost of collecting the tax", "Le coût de collecte de l'impôt", "El coste de recaudar el impuesto"], ["The fall in the price sellers receive", "La baisse du prix reçu par les vendeurs", "La bajada del precio que reciben los vendedores"]],
      e: ["Revenue moves from taxpayers to the state; the deadweight loss is lost to everyone. It is the triangle between demand and supply over the units no longer traded, and grows roughly with the square of the tax.", "Les recettes passent des contribuables à l'État ; la perte sèche est perdue pour tous. C'est le triangle entre la demande et l'offre sur les unités qui ne s'échangent plus, et elle croît à peu près avec le carré de la taxe.", "La recaudación pasa de los contribuyentes al Estado; la pérdida irrecuperable se pierde para todos. Es el triángulo entre la demanda y la oferta sobre las unidades que ya no se intercambian, y crece más o menos con el cuadrado del impuesto."],
    },
    {
      id: "ec-inc-b03",
      since: 5,
      q: ["Demand for cigarettes is very inelastic. Who bears most of a tobacco tax?", "La demande de cigarettes est très peu élastique. Qui supporte l'essentiel d'une taxe sur le tabac ?", "La demanda de cigarrillos es muy inelástica. ¿Quién soporta la mayor parte de un impuesto al tabaco?"],
      a: ["The smokers, through higher prices", "Les fumeurs, par des prix plus élevés", "Los fumadores, mediante precios más altos"],
      w: [["The tobacco companies", "Les fabricants de tabac", "Las tabacaleras"], ["The shops that sell cigarettes", "Les bureaux de tabac", "Los estancos"], ["Nobody: the tax is not passed on", "Personne : la taxe n'est pas répercutée", "Nadie: el impuesto no se traslada"]],
      e: ["Buyers who keep buying whatever the price cannot avoid the tax, so the price rises by almost the whole tax. Low elasticity also keeps the deadweight loss small, which is why such goods are taxed.", "Des acheteurs qui achètent quel que soit le prix ne peuvent éviter la taxe : le prix monte de presque toute la taxe. Une faible élasticité garde aussi la perte sèche petite, ce qui explique qu'on taxe ces biens.", "Unos compradores que compran sea cual sea el precio no pueden evitar el impuesto, así que el precio sube casi todo el impuesto. La baja elasticidad también mantiene pequeña la pérdida irrecuperable, por eso se gravan esos bienes."],
    },
  ],
  expert: [
    {
      id: "ec-inc-x01",
      since: 5,
      q: ["In Harberger's two-sector model, who can end up bearing a tax on capital in the corporate sector?", "Dans le modèle à deux secteurs de Harberger, qui peut finir par supporter un impôt sur le capital du secteur des sociétés ?", "En el modelo de dos sectores de Harberger, ¿quién puede acabar soportando un impuesto sobre el capital del sector societario?"],
      a: ["All capital owners in the economy, as capital moves out of the taxed sector and returns fall everywhere", "Tous les détenteurs de capital de l'économie, car le capital quitte le secteur taxé et les rendements baissent partout", "Todos los propietarios de capital de la economía, porque el capital sale del sector gravado y los rendimientos bajan en todas partes"],
      w: [["Only the shareholders of taxed firms", "Seuls les actionnaires des entreprises taxées", "Solo los accionistas de las empresas gravadas"], ["Only consumers of corporate goods", "Seuls les consommateurs des biens des sociétés", "Solo los consumidores de los bienes de las sociedades"], ["Nobody, since capital is fixed in the long run", "Personne, puisque le capital est fixe à long terme", "Nadie, porque el capital es fijo a largo plazo"]],
      e: ["In a closed economy with fixed total capital, Harberger found capital as a whole bears roughly the tax. In an open economy with mobile capital, much of it can shift to immobile labour through lower wages.", "Dans une économie fermée au capital total fixe, Harberger trouvait que le capital dans son ensemble supporte à peu près la taxe. En économie ouverte avec un capital mobile, une grande part peut passer au travail immobile, par des salaires plus bas.", "En una economía cerrada con capital total fijo, Harberger halló que el capital en conjunto soporta más o menos el impuesto. En una economía abierta con capital móvil, gran parte puede pasar al trabajo inmóvil mediante salarios más bajos."],
    },
    {
      id: "ec-inc-x02",
      since: 5,
      q: ["Under perfect competition, a unit tax raises the consumer price by $t\\,\\varepsilon_S/(\\varepsilon_S+\\varepsilon_D)$. How can a monopolist's price rise by more than the tax?", "En concurrence parfaite, une taxe unitaire élève le prix au consommateur de $t\\,\\varepsilon_S/(\\varepsilon_S+\\varepsilon_D)$. Comment le prix d'un monopole peut-il monter de plus que la taxe ?", "En competencia perfecta, un impuesto unitario sube el precio al consumidor $t\\,\\varepsilon_S/(\\varepsilon_S+\\varepsilon_D)$. ¿Cómo puede el precio de un monopolio subir más que el impuesto?"],
      a: ["With demand convex enough (constant elasticity, for instance), the monopolist marks the tax up like any cost", "Avec une demande assez convexe (à élasticité constante, par exemple), le monopole majore la taxe comme tout coût", "Con una demanda lo bastante convexa (de elasticidad constante, por ejemplo), el monopolio aplica su margen al impuesto como a cualquier coste"],
      w: [["It cannot: a price never rises by more than the tax", "C'est impossible : un prix ne monte jamais de plus que la taxe", "No puede: un precio nunca sube más que el impuesto"], ["Only if demand is linear", "Seulement si la demande est linéaire", "Solo si la demanda es lineal"], ["Only if supply is perfectly elastic", "Seulement si l'offre est parfaitement élastique", "Solo si la oferta es perfectamente elástica"]],
      e: ["With constant-elasticity demand $\\varepsilon$, the monopoly price is $c\\,\\varepsilon/(\\varepsilon-1)$, so a tax $t$ raises it by $t\\,\\varepsilon/(\\varepsilon-1) > t$. With linear demand, it rises by half the tax. Incidence under imperfect competition depends on the curvature of demand.", "Avec une demande à élasticité constante $\\varepsilon$, le prix de monopole vaut $c\\,\\varepsilon/(\\varepsilon-1)$ : une taxe $t$ l'élève de $t\\,\\varepsilon/(\\varepsilon-1) > t$. Avec une demande linéaire, il monte de la moitié de la taxe. L'incidence en concurrence imparfaite dépend de la courbure de la demande.", "Con una demanda de elasticidad constante $\\varepsilon$, el precio de monopolio es $c\\,\\varepsilon/(\\varepsilon-1)$, así que un impuesto $t$ lo sube $t\\,\\varepsilon/(\\varepsilon-1) > t$. Con demanda lineal, sube la mitad del impuesto. La incidencia en competencia imperfecta depende de la curvatura de la demanda."],
    },
    {
      id: "ec-inc-x03",
      since: 5,
      q: ["Why does the deadweight loss of a tax rise roughly with the square of the tax rate?", "Pourquoi la perte sèche d'un impôt croît-elle à peu près avec le carré du taux ?", "¿Por qué la pérdida irrecuperable de un impuesto crece más o menos con el cuadrado del tipo?"],
      a: ["The lost triangle's height (the tax) and its base (the fall in quantity, proportional to the tax) both grow with the tax", "La hauteur du triangle perdu (la taxe) et sa base (la baisse des quantités, proportionnelle à la taxe) croissent toutes deux avec la taxe", "La altura del triángulo perdido (el impuesto) y su base (la caída de la cantidad, proporcional al impuesto) crecen ambas con el impuesto"],
      w: [["Because revenue falls as the rate rises", "Parce que les recettes baissent quand le taux monte", "Porque la recaudación baja al subir el tipo"], ["Because collection costs are quadratic", "Parce que les coûts de collecte sont quadratiques", "Porque los costes de recaudación son cuadráticos"], ["It does not: it rises in proportion to the rate", "Ce n'est pas le cas : elle croît en proportion du taux", "No es así: crece en proporción al tipo"]],
      e: ["Harberger's approximation: $DWL \\approx \\tfrac12\\,t\\,\\Delta Q$ with $\\Delta Q$ proportional to $t$. Hence many small taxes on broad bases cost less than one large tax, a reason for smoothing taxes over time and goods.", "L'approximation de Harberger : $DWL \\approx \\tfrac12\\,t\\,\\Delta Q$ avec $\\Delta Q$ proportionnel à $t$. Donc plusieurs petites taxes sur des assiettes larges coûtent moins qu'une grosse, d'où l'intérêt de lisser les impôts dans le temps et entre biens.", "La aproximación de Harberger: $DWL \\approx \\tfrac12\\,t\\,\\Delta Q$ con $\\Delta Q$ proporcional a $t$. Por eso muchos impuestos pequeños sobre bases amplias cuestan menos que uno grande, una razón para suavizar los impuestos en el tiempo y entre bienes."],
    },
  ],
};

const optimalTax: Pair = {
  beginner: [
    {
      id: "ec-ot-b01",
      since: 5,
      q: ["Which two goals does optimal tax theory weigh against each other?", "Quels deux objectifs la théorie de la fiscalité optimale met-elle en balance ?", "¿Qué dos objetivos sopesa la teoría de la imposición óptima?"],
      a: ["Raising revenue fairly (equity) and keeping the distortions of taxes small (efficiency)", "Lever des recettes équitablement (équité) et limiter les distorsions des impôts (efficacité)", "Recaudar de forma justa (equidad) y reducir las distorsiones de los impuestos (eficiencia)"],
      w: [["Low inflation and low unemployment", "Une inflation faible et un chômage faible", "Baja inflación y bajo desempleo"], ["Balanced budgets and low debt", "Des budgets équilibrés et une dette faible", "Presupuestos equilibrados y poca deuda"], ["Exports and imports", "Les exportations et les importations", "Las exportaciones y las importaciones"]],
      e: ["A tax that changed no behaviour would be efficient but cannot be targeted on ability to pay; progressive taxes help equity but discourage work and saving. The theory finds the best compromise for given values.", "Un impôt qui ne changerait aucun comportement serait efficace mais ne pourrait viser la capacité contributive ; les impôts progressifs aident l'équité mais découragent travail et épargne. La théorie cherche le meilleur compromis pour des valeurs données.", "Un impuesto que no cambiara ningún comportamiento sería eficiente pero no podría dirigirse a la capacidad de pago; los impuestos progresivos ayudan a la equidad pero desincentivan trabajo y ahorro. La teoría busca el mejor compromiso para unos valores dados."],
    },
    {
      id: "ec-ot-b02",
      since: 5,
      q: ["What is a lump-sum tax?", "Qu'est-ce qu'un impôt forfaitaire ?", "¿Qué es un impuesto de suma fija?"],
      a: ["A fixed amount owed whatever one does, so it changes no decision at the margin", "Un montant fixe dû quoi qu'on fasse, qui ne change donc aucune décision à la marge", "Una cantidad fija que se debe se haga lo que se haga, así que no cambia ninguna decisión en el margen"],
      w: [["A tax paid in one payment at the end of the year", "Un impôt payé en une fois en fin d'année", "Un impuesto pagado de una vez a fin de año"], ["A tax on large purchases only", "Un impôt sur les gros achats seulement", "Un impuesto solo sobre las grandes compras"], ["A tax whose rate rises with income", "Un impôt dont le taux monte avec le revenu", "Un impuesto cuyo tipo sube con la renta"]],
      e: ["Because nothing changes it, it has no deadweight loss, but it ignores ability to pay; the poll tax in Britain (1989–1990) showed how unpopular that is.", "Comme rien ne le fait varier, il n'a pas de perte sèche, mais il ignore la capacité contributive ; la poll tax britannique (1989-1990) a montré combien c'est impopulaire.", "Como nada lo hace variar, no tiene pérdida irrecuperable, pero ignora la capacidad de pago; la poll tax británica (1989-1990) mostró lo impopular que es."],
    },
    {
      id: "ec-ot-b03",
      since: 5,
      q: ["What is the difference between a marginal and an average tax rate?", "Quelle différence entre taux marginal et taux moyen d'imposition ?", "¿Qué diferencia hay entre el tipo marginal y el tipo medio?"],
      a: ["The marginal rate applies to the next euro earned; the average rate is total tax divided by income", "Le taux marginal s'applique au prochain euro gagné ; le taux moyen est l'impôt total divisé par le revenu", "El tipo marginal se aplica al próximo euro ganado; el tipo medio es el impuesto total dividido por la renta"],
      w: [["They are the same in every tax system", "Ils sont égaux dans tout système fiscal", "Son iguales en todo sistema fiscal"], ["The average rate is always higher", "Le taux moyen est toujours plus élevé", "El tipo medio siempre es más alto"], ["The marginal rate applies to the whole income", "Le taux marginal s'applique à tout le revenu", "El tipo marginal se aplica a toda la renta"]],
      e: ["Under a progressive schedule the average rate is below the marginal one. Work decisions respond to the marginal rate; who pays how much is read from the average rate.", "Dans un barème progressif, le taux moyen est inférieur au taux marginal. Les décisions de travail réagissent au taux marginal ; qui paie combien se lit sur le taux moyen.", "En una escala progresiva el tipo medio es inferior al marginal. Las decisiones de trabajo responden al tipo marginal; quién paga cuánto se lee en el tipo medio."],
    },
  ],
  expert: [
    {
      id: "ec-ot-x01",
      since: 5,
      q: ["What does the Atkinson–Stiglitz theorem say about taxing goods differently?", "Que dit le théorème d'Atkinson-Stiglitz sur la taxation différenciée des biens ?", "¿Qué dice el teorema de Atkinson-Stiglitz sobre gravar los bienes de forma distinta?"],
      a: ["With an optimal non-linear income tax and preferences separable between goods and leisure, uniform commodity taxes suffice", "Avec un impôt sur le revenu non linéaire optimal et des préférences séparables entre biens et loisir, des taxes uniformes sur les biens suffisent", "Con un impuesto óptimo no lineal sobre la renta y preferencias separables entre bienes y ocio, bastan impuestos uniformes sobre los bienes"],
      w: [["Necessities should always be taxed more", "Les biens de première nécessité doivent toujours être plus taxés", "Los bienes de primera necesidad siempre deben gravarse más"], ["Luxuries should never be taxed", "Les biens de luxe ne doivent jamais être taxés", "Los bienes de lujo nunca deben gravarse"], ["Income should not be taxed at all", "Le revenu ne doit pas être taxé du tout", "La renta no debe gravarse en absoluto"]],
      e: ["Differentiated commodity taxes then add no redistribution the income tax cannot do more cheaply. Applied to saving (future consumption), it argues against capital taxes; departures from separability or unobserved heterogeneity reopen the question.", "Des taxes différenciées sur les biens n'ajoutent alors aucune redistribution que l'impôt sur le revenu ne fasse à moindre coût. Appliqué à l'épargne (consommation future), il plaide contre l'imposition du capital ; s'écarter de la séparabilité ou une hétérogénéité non observée rouvrent la question.", "Los impuestos diferenciados sobre bienes no añaden entonces redistribución que el impuesto sobre la renta no haga más barato. Aplicado al ahorro (consumo futuro), argumenta contra los impuestos al capital; salirse de la separabilidad o una heterogeneidad no observada reabren la cuestión."],
    },
    {
      id: "ec-ot-x02",
      since: 5,
      q: ["In Mirrlees's model, what marginal tax rate does the very top earner face in the optimum, with a bounded skill distribution?", "Dans le modèle de Mirrlees, quel taux marginal subit le revenu le plus élevé à l'optimum, avec une distribution des compétences bornée ?", "En el modelo de Mirrlees, ¿qué tipo marginal soporta el mayor perceptor en el óptimo, con una distribución de habilidades acotada?"],
      a: ["Zero", "Zéro", "Cero"],
      w: [["The highest rate of the schedule", "Le taux le plus élevé du barème", "El tipo más alto de la escala"], ["One hundred per cent", "Cent pour cent", "Cien por ciento"], ["The average rate of the economy", "Le taux moyen de l'économie", "El tipo medio de la economía"]],
      e: ["Taxing the last euro of the top person raises nothing (nobody is above) but distorts their effort, so a cut makes them better off at no cost. The result is fragile: with a Pareto-shaped upper tail (Saez), the top rate is $1/(1+a\\,e)$, well above zero.", "Taxer le dernier euro du plus haut revenu ne rapporte rien (personne n'est au-dessus) mais fausse son effort : une baisse l'avantage sans coût. Le résultat est fragile : avec une queue de distribution de Pareto (Saez), le taux supérieur vaut $1/(1+a\\,e)$, bien au-dessus de zéro.", "Gravar el último euro del mayor perceptor no recauda nada (no hay nadie por encima) pero distorsiona su esfuerzo, así que bajarlo le beneficia sin coste. El resultado es frágil: con una cola de Pareto (Saez), el tipo superior es $1/(1+a\\,e)$, muy por encima de cero."],
    },
    {
      id: "ec-ot-x03",
      since: 5,
      q: ["What does the inverse elasticity rule (Ramsey) recommend?", "Que recommande la règle de l'inverse des élasticités (Ramsey) ?", "¿Qué recomienda la regla de la elasticidad inversa (Ramsey)?"],
      a: ["Tax goods with independent demands at rates inversely proportional to their demand elasticities", "Taxer les biens à demandes indépendantes à des taux inversement proportionnels à leurs élasticités de la demande", "Gravar los bienes de demandas independientes a tipos inversamente proporcionales a sus elasticidades de demanda"],
      w: [["Tax the most elastic goods most", "Taxer le plus les biens les plus élastiques", "Gravar más los bienes más elásticos"], ["Tax every good at the same rate", "Taxer tous les biens au même taux", "Gravar todos los bienes al mismo tipo"], ["Tax only goods with zero elasticity", "Ne taxer que les biens d'élasticité nulle", "Gravar solo los bienes de elasticidad nula"]],
      e: ["It minimises the total deadweight loss for a given revenue, but taxes necessities, whose demand is inelastic, most: an efficiency rule that is regressive, and why equity concerns temper it.", "Elle minimise la perte sèche totale pour des recettes données, mais taxe le plus les biens nécessaires, à demande peu élastique : une règle d'efficacité régressive, d'où les correctifs d'équité.", "Minimiza la pérdida irrecuperable total para una recaudación dada, pero grava más los bienes necesarios, de demanda inelástica: una regla de eficiencia regresiva, de ahí los correctivos de equidad."],
    },
  ],
};

const taxDesign: Pair = {
  beginner: [
    {
      id: "ec-td-b01",
      since: 5,
      q: ["How does a value added tax (VAT) collect tax along the chain of production?", "Comment une taxe sur la valeur ajoutée (TVA) perçoit-elle l'impôt le long de la chaîne de production ?", "¿Cómo recauda un impuesto sobre el valor añadido (IVA) a lo largo de la cadena de producción?"],
      a: ["Each firm charges VAT on its sales and deducts the VAT paid on its purchases, so the final consumer bears it", "Chaque entreprise facture la TVA sur ses ventes et déduit celle payée sur ses achats : le consommateur final la supporte", "Cada empresa cobra el IVA sobre sus ventas y deduce el pagado en sus compras, así que lo soporta el consumidor final"],
      w: [["Each firm pays tax on its whole turnover", "Chaque entreprise paie l'impôt sur tout son chiffre d'affaires", "Cada empresa paga impuesto sobre toda su facturación"], ["Only the retailer pays it, on its profit", "Seul le détaillant la paie, sur son bénéfice", "Solo el minorista lo paga, sobre su beneficio"], ["Only importers pay it", "Seuls les importateurs la paient", "Solo la pagan los importadores"]],
      e: ["Taxing only the value each stage adds avoids the cascading of turnover taxes, and the invoices create a paper trail that helps enforcement.", "Ne taxer que la valeur que chaque étape ajoute évite l'effet cascade des taxes sur le chiffre d'affaires, et les factures laissent une trace qui aide au contrôle.", "Gravar solo el valor que añade cada etapa evita el efecto cascada de los impuestos sobre la facturación, y las facturas dejan un rastro que ayuda al control."],
    },
    {
      id: "ec-td-b02",
      since: 5,
      q: ["What makes an income tax progressive?", "Qu'est-ce qui rend un impôt sur le revenu progressif ?", "¿Qué hace progresivo un impuesto sobre la renta?"],
      a: ["The average tax rate rises with income", "Le taux moyen d'imposition augmente avec le revenu", "El tipo medio aumenta con la renta"],
      w: [["Everyone pays the same amount", "Tout le monde paie le même montant", "Todos pagan la misma cantidad"], ["Richer people pay more euros, whatever the rate", "Les plus riches paient plus d'euros, quel que soit le taux", "Los más ricos pagan más euros, sea cual sea el tipo"], ["The tax is collected progressively during the year", "L'impôt est prélevé progressivement dans l'année", "El impuesto se cobra progresivamente durante el año"]],
      e: ["A flat tax with a tax-free allowance is already progressive, because the average rate rises from zero towards the flat rate. Paying more euros alone is also true of a proportional tax.", "Un impôt à taux unique avec un abattement est déjà progressif, car le taux moyen monte de zéro vers le taux unique. Payer plus d'euros, à lui seul, vaut aussi pour un impôt proportionnel.", "Un impuesto de tipo único con un mínimo exento ya es progresivo, porque el tipo medio sube de cero hacia el tipo único. Pagar más euros, por sí solo, también ocurre con un impuesto proporcional."],
    },
    {
      id: "ec-td-b03",
      since: 5,
      q: ["What is tax evasion, as opposed to tax avoidance?", "Qu'est-ce que la fraude fiscale, par opposition à l'optimisation fiscale ?", "¿Qué es la evasión fiscal, frente a la elusión fiscal?"],
      a: ["Evasion breaks the law (hiding income); avoidance uses the law's rules to pay less", "La fraude enfreint la loi (cacher des revenus) ; l'optimisation utilise les règles de la loi pour payer moins", "La evasión incumple la ley (ocultar renta); la elusión usa las reglas de la ley para pagar menos"],
      w: [["They are two names for the same thing", "Ce sont deux noms pour la même chose", "Son dos nombres para lo mismo"], ["Avoidance is illegal, evasion is legal", "L'optimisation est illégale, la fraude légale", "La elusión es ilegal y la evasión legal"], ["Evasion concerns firms, avoidance individuals", "La fraude concerne les entreprises, l'optimisation les particuliers", "La evasión afecta a las empresas y la elusión a los particulares"]],
      e: ["Avoidance can still be fought with anti-abuse rules. Third-party reporting (employers declaring wages) explains why evasion is low on wages and high on self-employed income.", "L'optimisation peut être combattue par des règles anti-abus. La déclaration par des tiers (l'employeur déclare les salaires) explique pourquoi la fraude est faible sur les salaires et forte sur les revenus des indépendants.", "La elusión puede combatirse con normas antiabuso. La declaración por terceros (el empleador declara los salarios) explica por qué la evasión es baja en salarios y alta en las rentas de autónomos."],
    },
  ],
  expert: [
    {
      id: "ec-td-x01",
      since: 5,
      q: ["Why does *Tax by Design* favour a land value tax?", "Pourquoi *Tax by Design* recommande-t-il un impôt sur la valeur foncière ?", "¿Por qué *Tax by Design* recomienda un impuesto sobre el valor del suelo?"],
      a: ["The supply of land is fixed, so taxing its value distorts no decision and falls on owners", "L'offre de terrain est fixe : taxer sa valeur ne fausse aucune décision et retombe sur les propriétaires", "La oferta de suelo es fija, así que gravar su valor no distorsiona ninguna decisión y recae en los propietarios"],
      w: [["Land is easy to hide from the tax authority", "La terre est facile à cacher au fisc", "El suelo es fácil de ocultar al fisco"], ["Land taxes raise rents by the full tax", "Les impôts fonciers font monter les loyers de toute la taxe", "Los impuestos sobre el suelo suben los alquileres en todo el impuesto"], ["It encourages building on every plot", "Il pousse à construire sur chaque terrain", "Empuja a construir en cada parcela"]],
      e: ["Unlike buildings, land is not produced, so the tax is capitalised into lower land prices at its introduction. The difficulty is valuing land apart from what stands on it.", "Contrairement aux bâtiments, la terre n'est pas produite : la taxe se capitalise dans des prix fonciers plus bas lors de son introduction. La difficulté est d'évaluer le terrain indépendamment de ce qui est construit dessus.", "A diferencia de los edificios, el suelo no se produce, así que el impuesto se capitaliza en precios del suelo más bajos al introducirlo. La dificultad es valorar el suelo aparte de lo construido encima."],
    },
    {
      id: "ec-td-x02",
      since: 5,
      q: ["What does an allowance for corporate equity (ACE) change in a corporate tax?", "Que change une déduction pour fonds propres (ACE) dans l'impôt sur les sociétés ?", "¿Qué cambia una deducción por fondos propios (ACE) en el impuesto de sociedades?"],
      a: ["It deducts a normal return on equity, as interest on debt is deducted, so only above-normal profits are taxed", "Elle déduit un rendement normal des fonds propres, comme les intérêts de la dette, si bien que seuls les profits supérieurs à la normale sont taxés", "Deduce un rendimiento normal de los fondos propios, como se deducen los intereses de la deuda, de modo que solo se gravan los beneficios superiores a lo normal"],
      w: [["It taxes equity more than debt", "Elle taxe plus les fonds propres que la dette", "Grava más los fondos propios que la deuda"], ["It abolishes the deduction of interest", "Elle supprime la déduction des intérêts", "Suprime la deducción de intereses"], ["It taxes shareholders instead of firms", "Elle taxe les actionnaires au lieu des entreprises", "Grava a los accionistas en vez de a las empresas"]],
      e: ["It removes the bias towards debt finance and leaves the marginal investment untaxed. Belgium and Italy used versions of it; its cost is a narrower base, so a higher rate for the same revenue.", "Elle supprime le biais en faveur de l'endettement et laisse l'investissement marginal non taxé. La Belgique et l'Italie en ont appliqué des versions ; son coût est une assiette plus étroite, donc un taux plus élevé pour les mêmes recettes.", "Elimina el sesgo a favor de la deuda y deja sin gravar la inversión marginal. Bélgica e Italia aplicaron versiones; su coste es una base más estrecha, y así un tipo más alto para la misma recaudación."],
    },
    {
      id: "ec-td-x03",
      since: 5,
      q: ["What does the Allingham–Sandmo model predict about tax evasion?", "Que prédit le modèle d'Allingham-Sandmo sur la fraude fiscale ?", "¿Qué predice el modelo de Allingham-Sandmo sobre la evasión fiscal?"],
      a: ["People evade more when the chance of audit or the fine is lower, weighing expected gains against the risk", "On fraude davantage quand la probabilité de contrôle ou l'amende est plus faible, en pesant le gain espéré contre le risque", "Se evade más cuando la probabilidad de inspección o la multa son menores, sopesando la ganancia esperada contra el riesgo"],
      w: [["Evasion does not depend on audits", "La fraude ne dépend pas des contrôles", "La evasión no depende de las inspecciones"], ["Higher fines always raise evasion", "Des amendes plus fortes augmentent toujours la fraude", "Multas más altas siempre aumentan la evasión"], ["Only firms evade, never individuals", "Seules les entreprises fraudent, jamais les particuliers", "Solo evaden las empresas, nunca los particulares"]],
      e: ["Its gamble predicts far more evasion than observed with real audit rates, which points to third-party reporting, social norms and tax morale as the main deterrents.", "Ce pari prédit bien plus de fraude qu'on n'en observe avec les taux de contrôle réels, ce qui désigne la déclaration par des tiers, les normes sociales et le civisme fiscal comme principaux freins.", "Esa apuesta predice mucha más evasión de la observada con las tasas reales de inspección, lo que señala la declaración por terceros, las normas sociales y la moral fiscal como frenos principales."],
    },
  ],
};

const socialInsurance: Pair = {
  beginner: [
    {
      id: "ec-si-b01",
      since: 5,
      q: ["What is adverse selection in insurance?", "Qu'est-ce que l'antisélection en assurance ?", "¿Qué es la selección adversa en los seguros?"],
      a: ["People who know they are high risks buy more insurance, so premiums rise and low risks leave", "Les personnes qui se savent à haut risque s'assurent davantage : les primes montent et les faibles risques partent", "Quienes saben que son de alto riesgo se aseguran más, así que las primas suben y los de bajo riesgo se van"],
      w: [["Insurers choose the worst clients on purpose", "Les assureurs choisissent exprès les pires clients", "Las aseguradoras eligen a propósito a los peores clientes"], ["Insured people take more risks", "Les assurés prennent plus de risques", "Los asegurados asumen más riesgos"], ["The state forbids insurance for some people", "L'État interdit l'assurance à certaines personnes", "El Estado prohíbe asegurar a algunas personas"]],
      e: ["It comes from hidden information before the contract and can unravel a market. Mandatory insurance is one answer. Taking more risk once insured is moral hazard.", "Elle vient d'une information cachée avant le contrat et peut faire s'effondrer un marché. L'assurance obligatoire est une réponse. Prendre plus de risques une fois assuré, c'est l'aléa moral.", "Viene de información oculta antes del contrato y puede deshacer un mercado. El seguro obligatorio es una respuesta. Asumir más riesgo una vez asegurado es el riesgo moral."],
    },
    {
      id: "ec-si-b02",
      since: 5,
      q: ["What is moral hazard?", "Qu'est-ce que l'aléa moral ?", "¿Qué es el riesgo moral?"],
      a: ["Being insured changes behaviour, for example less care or more claims, because others bear the cost", "Être assuré change les comportements, par exemple moins de prudence ou plus de demandes, parce que d'autres en paient le coût", "Estar asegurado cambia el comportamiento, por ejemplo menos cuidado o más reclamaciones, porque otros pagan el coste"],
      w: [["Insurers lying about their contracts", "Les assureurs qui mentent sur leurs contrats", "Las aseguradoras que mienten sobre sus contratos"], ["High-risk people buying more insurance", "Les personnes à haut risque qui s'assurent plus", "Las personas de alto riesgo que se aseguran más"], ["Governments refusing to insure", "Les États qui refusent d'assurer", "Los Estados que se niegan a asegurar"]],
      e: ["It comes from hidden actions after the contract. Deductibles and co-payments keep part of the cost on the insured; unemployment insurance faces it through job-search requirements.", "Il vient d'actions cachées après le contrat. Franchises et tickets modérateurs laissent une part du coût à l'assuré ; l'assurance chômage y répond par des exigences de recherche d'emploi.", "Viene de acciones ocultas tras el contrato. Las franquicias y los copagos dejan parte del coste al asegurado; el seguro de desempleo lo afronta con requisitos de búsqueda de empleo."],
    },
    {
      id: "ec-si-b03",
      since: 5,
      q: ["How does a pay-as-you-go pension system pay pensions?", "Comment un système de retraite par répartition paie-t-il les pensions ?", "¿Cómo paga las pensiones un sistema de reparto?"],
      a: ["Today's workers' contributions pay today's pensioners", "Les cotisations des actifs d'aujourd'hui paient les retraités d'aujourd'hui", "Las cotizaciones de los trabajadores de hoy pagan a los pensionistas de hoy"],
      w: [["Each worker's own savings are invested and paid back later", "L'épargne de chaque travailleur est placée et lui est rendue plus tard", "El ahorro de cada trabajador se invierte y se le devuelve después"], ["The state prints money each year", "L'État imprime de la monnaie chaque année", "El Estado imprime dinero cada año"], ["Pensioners pay one another", "Les retraités se paient entre eux", "Los pensionistas se pagan entre sí"]],
      e: ["Its return depends on the growth of the wage bill, so ageing populations strain it. A funded system invests each cohort's contributions; most countries mix both.", "Son rendement dépend de la croissance de la masse salariale : le vieillissement le met sous tension. Un système par capitalisation place les cotisations de chaque génération ; la plupart des pays mélangent les deux.", "Su rendimiento depende del crecimiento de la masa salarial, así que el envejecimiento lo tensiona. Un sistema de capitalización invierte las cotizaciones de cada generación; la mayoría de los países mezclan ambos."],
    },
  ],
  expert: [
    {
      id: "ec-si-x01",
      since: 5,
      q: ["What does the Baily–Chetty formula weigh to set unemployment benefits?", "Que met en balance la formule de Baily-Chetty pour fixer les allocations chômage ?", "¿Qué sopesa la fórmula de Baily-Chetty para fijar las prestaciones por desempleo?"],
      a: ["The consumption-smoothing gain, from the drop in consumption on job loss and risk aversion, against the moral hazard cost, from the elasticity of unemployment duration", "Le gain de lissage de la consommation, selon la chute de consommation au chômage et l'aversion au risque, contre le coût d'aléa moral, selon l'élasticité de la durée du chômage", "La ganancia de suavizar el consumo, por la caída del consumo al perder el empleo y la aversión al riesgo, frente al coste de riesgo moral, por la elasticidad de la duración del desempleo"],
      w: [["The unemployment rate against the inflation rate", "Le taux de chômage contre le taux d'inflation", "La tasa de paro frente a la de inflación"], ["Wages of employed against unemployed workers only", "Seulement les salaires des actifs contre ceux des chômeurs", "Solo los salarios de ocupados frente a parados"], ["The state budget against the number of claimants", "Le budget de l'État contre le nombre d'allocataires", "El presupuesto del Estado frente al número de beneficiarios"]],
      e: ["Benefits should rise while the marginal value of smoothing exceeds the cost of longer unemployment spells. Chetty showed that part of the duration response is a liquidity effect, which is not a pure efficiency loss.", "Les allocations doivent augmenter tant que la valeur marginale du lissage dépasse le coût de périodes de chômage plus longues. Chetty a montré qu'une part de la réaction de la durée est un effet de liquidité, qui n'est pas une pure perte d'efficacité.", "Las prestaciones deben subir mientras el valor marginal de suavizar supere el coste de periodos de paro más largos. Chetty mostró que parte de la respuesta de la duración es un efecto de liquidez, que no es una pura pérdida de eficiencia."],
    },
    {
      id: "ec-si-x02",
      since: 5,
      q: ["In the Rothschild–Stiglitz model, what can a competitive insurance market with two risk types offer?", "Dans le modèle de Rothschild-Stiglitz, que peut offrir un marché d'assurance concurrentiel avec deux types de risque ?", "En el modelo de Rothschild-Stiglitz, ¿qué puede ofrecer un mercado de seguros competitivo con dos tipos de riesgo?"],
      a: ["At best a separating equilibrium: full cover for high risks, partial cover for low risks, and sometimes no equilibrium at all", "Au mieux un équilibre séparateur : couverture complète pour les hauts risques, partielle pour les faibles, et parfois aucun équilibre", "Como mucho un equilibrio separador: cobertura total para los de alto riesgo, parcial para los de bajo riesgo, y a veces ningún equilibrio"],
      w: [["A pooling contract with full cover for all", "Un contrat commun à couverture complète pour tous", "Un contrato común con cobertura total para todos"], ["Full cover for low risks only", "Une couverture complète pour les faibles risques seulement", "Cobertura total solo para los de bajo riesgo"], ["The same as with full information", "La même chose qu'en information complète", "Lo mismo que con información completa"]],
      e: ["Low risks signal their type by accepting less cover, which is the welfare cost of adverse selection. A pooling contract would be undercut by one that attracts only the low risks.", "Les faibles risques révèlent leur type en acceptant moins de couverture, ce qui est le coût en bien-être de l'antisélection. Un contrat commun serait battu par un autre qui n'attire que les faibles risques.", "Los de bajo riesgo revelan su tipo aceptando menos cobertura, que es el coste en bienestar de la selección adversa. Un contrato común sería superado por otro que solo atraiga a los de bajo riesgo."],
    },
    {
      id: "ec-si-x03",
      since: 5,
      q: ["What is the implicit return of a pay-as-you-go pension in a steady state, according to Samuelson and Aaron?", "Quel est le rendement implicite d'une retraite par répartition en régime permanent, selon Samuelson et Aaron ?", "¿Cuál es el rendimiento implícito de una pensión de reparto en estado estacionario, según Samuelson y Aaron?"],
      a: ["The growth rate of the wage bill: population growth plus productivity growth", "Le taux de croissance de la masse salariale : croissance de la population plus croissance de la productivité", "La tasa de crecimiento de la masa salarial: crecimiento de la población más crecimiento de la productividad"],
      w: [["The interest rate on government bonds", "Le taux d'intérêt des obligations d'État", "El tipo de interés de los bonos del Estado"], ["Zero, always", "Zéro, toujours", "Cero, siempre"], ["The inflation rate", "Le taux d'inflation", "La tasa de inflación"]],
      e: ["When that growth exceeds the interest rate (dynamic inefficiency), pay-as-you-go beats funding for every generation; otherwise the first generations' windfall is paid back by lower returns later.", "Quand cette croissance dépasse le taux d'intérêt (inefficacité dynamique), la répartition vaut mieux que la capitalisation pour toutes les générations ; sinon, l'aubaine des premières générations se paie par des rendements plus faibles ensuite.", "Cuando ese crecimiento supera el tipo de interés (ineficiencia dinámica), el reparto supera a la capitalización para todas las generaciones; si no, la ganancia de las primeras generaciones se paga con rendimientos menores después."],
    },
  ],
};

const redistribution: Pair = {
  beginner: [
    {
      id: "ec-red-b01",
      since: 5,
      q: ["A Gini coefficient of 0 means…", "Un coefficient de Gini de 0 signifie…", "Un coeficiente de Gini de 0 significa…"],
      a: ["Perfect equality: everyone has the same income", "L'égalité parfaite : tout le monde a le même revenu", "Igualdad perfecta: todos tienen la misma renta"],
      w: [["One person has all the income", "Une seule personne a tout le revenu", "Una sola persona tiene toda la renta"], ["Nobody has any income", "Personne n'a de revenu", "Nadie tiene renta"], ["Income is spread like a normal curve", "Le revenu suit une courbe en cloche", "La renta se reparte como una curva normal"]],
      e: ["The Gini goes from 0 (equality) to 1 (one person has everything); it is twice the area between the Lorenz curve and the diagonal. Disposable-income Ginis are around 0.25–0.35 in Europe.", "Le Gini va de 0 (égalité) à 1 (une personne a tout) ; c'est deux fois l'aire entre la courbe de Lorenz et la diagonale. Les Gini du revenu disponible sont autour de 0,25–0,35 en Europe.", "El Gini va de 0 (igualdad) a 1 (una persona lo tiene todo); es el doble del área entre la curva de Lorenz y la diagonal. Los Gini de la renta disponible rondan 0,25–0,35 en Europa."],
    },
    {
      id: "ec-red-b02",
      since: 5,
      q: ["What does a Lorenz curve show?", "Que montre une courbe de Lorenz ?", "¿Qué muestra una curva de Lorenz?"],
      a: ["The share of total income held by the poorest x % of people, for every x", "La part du revenu total que détiennent les x % les plus pauvres, pour chaque x", "La parte de la renta total que tiene el x % más pobre, para cada x"],
      w: [["Average income over the years", "Le revenu moyen au fil des années", "La renta media a lo largo de los años"], ["How many people earn each income", "Combien de personnes gagnent chaque revenu", "Cuánta gente gana cada renta"], ["Tax rates by income", "Les taux d'impôt selon le revenu", "Los tipos impositivos según la renta"]],
      e: ["The diagonal is perfect equality; the further the curve sags below it, the more unequal the distribution. If one curve lies wholly above another, it is more equal for every inequality measure that respects transfers from rich to poor.", "La diagonale est l'égalité parfaite ; plus la courbe s'en écarte vers le bas, plus la répartition est inégale. Si une courbe est entièrement au-dessus d'une autre, elle est plus égale pour toute mesure d'inégalité qui respecte les transferts des riches vers les pauvres.", "La diagonal es la igualdad perfecta; cuanto más se hunde la curva bajo ella, más desigual es el reparto. Si una curva está entera por encima de otra, es más igualitaria para toda medida de desigualdad que respete las transferencias de ricos a pobres."],
    },
    {
      id: "ec-red-b03",
      since: 5,
      q: ["What is a means-tested benefit?", "Qu'est-ce qu'une prestation sous condition de ressources ?", "¿Qué es una prestación sujeta a comprobación de recursos?"],
      a: ["A benefit paid only to people whose income or wealth is below a threshold", "Une prestation versée seulement à ceux dont le revenu ou le patrimoine est sous un seuil", "Una prestación pagada solo a quienes tienen renta o patrimonio por debajo de un umbral"],
      w: [["A benefit paid to everyone of a certain age", "Une prestation versée à tous à partir d'un certain âge", "Una prestación pagada a todos a partir de cierta edad"], ["A benefit financed by contributions", "Une prestation financée par des cotisations", "Una prestación financiada por cotizaciones"], ["A benefit paid in goods rather than money", "Une prestation versée en nature plutôt qu'en argent", "Una prestación pagada en especie y no en dinero"]],
      e: ["Targeting saves money, but withdrawing the benefit as income rises acts like a tax on extra earnings, which can create poverty traps. Take-up is also lower than for universal benefits.", "Le ciblage économise de l'argent, mais retirer la prestation quand le revenu monte agit comme un impôt sur les gains en plus, ce qui peut créer des trappes à pauvreté. Le recours est aussi plus faible que pour les prestations universelles.", "La focalización ahorra dinero, pero retirar la prestación al subir la renta actúa como un impuesto sobre las ganancias adicionales, lo que puede crear trampas de pobreza. Además se solicita menos que las prestaciones universales."],
    },
  ],
  expert: [
    {
      id: "ec-red-x01",
      since: 5,
      q: ["What does Okun's 'leaky bucket' measure?", "Que mesure le « seau percé » d'Okun ?", "¿Qué mide el «cubo agujereado» de Okun?"],
      a: ["How much of each euro taken from the rich is lost, through distortions and administration, before reaching the poor, and how much loss one accepts", "Combien de chaque euro pris aux riches se perd, en distorsions et en frais, avant d'arriver aux pauvres, et quelle perte on accepte", "Cuánto de cada euro quitado a los ricos se pierde, en distorsiones y administración, antes de llegar a los pobres, y cuánta pérdida se acepta"],
      w: [["How fast money circulates in the economy", "La vitesse de circulation de la monnaie", "La velocidad de circulación del dinero"], ["The share of income saved by the poor", "La part du revenu épargnée par les pauvres", "La parte de la renta que ahorran los pobres"], ["The output lost when unemployment rises", "La production perdue quand le chômage monte", "La producción perdida cuando sube el paro"]],
      e: ["The leak stands for the efficiency cost of redistribution; how big a leak one tolerates reveals one's inequality aversion. Okun's law about output and unemployment is a different idea.", "La fuite représente le coût en efficacité de la redistribution ; la fuite qu'on tolère révèle son aversion pour l'inégalité. La loi d'Okun sur production et chômage est une autre idée.", "La fuga representa el coste en eficiencia de la redistribución; la fuga que se tolera revela la aversión a la desigualdad. La ley de Okun sobre producción y paro es otra idea."],
    },
    {
      id: "ec-red-x02",
      since: 5,
      q: ["Why can two Lorenz curves that cross give opposite answers on which distribution is more unequal?", "Pourquoi deux courbes de Lorenz qui se croisent peuvent-elles donner des réponses opposées sur la répartition la plus inégale ?", "¿Por qué dos curvas de Lorenz que se cruzan pueden dar respuestas opuestas sobre qué reparto es más desigual?"],
      a: ["Each is more equal over part of the population, so the ranking depends on the weight a measure gives the bottom or the top", "Chacune est plus égale sur une partie de la population : le classement dépend du poids que la mesure donne au bas ou au haut", "Cada una es más igualitaria en una parte de la población, así que el orden depende del peso que la medida dé a la parte baja o alta"],
      w: [["Because the Gini is wrong when curves cross", "Parce que le Gini est faux quand les courbes se croisent", "Porque el Gini es erróneo cuando las curvas se cruzan"], ["Because average incomes differ", "Parce que les revenus moyens diffèrent", "Porque las rentas medias difieren"], ["They cannot: crossing curves have equal Ginis", "C'est impossible : des courbes qui se croisent ont le même Gini", "No pueden: las curvas que se cruzan tienen el mismo Gini"]],
      e: ["Atkinson showed that Lorenz dominance means agreement among all inequality-averse measures; without it, the Gini, Theil or Atkinson index with high aversion can rank differently. Lorenz curves ignore the mean, which generalised Lorenz curves add.", "Atkinson a montré que la dominance de Lorenz signifie l'accord de toutes les mesures averses à l'inégalité ; sans elle, Gini, Theil ou un indice d'Atkinson à forte aversion peuvent classer autrement. Les courbes de Lorenz ignorent la moyenne, que les courbes de Lorenz généralisées ajoutent.", "Atkinson mostró que la dominancia de Lorenz significa acuerdo entre todas las medidas aversas a la desigualdad; sin ella, Gini, Theil o un índice de Atkinson de alta aversión pueden ordenar distinto. Las curvas de Lorenz ignoran la media, que añaden las curvas de Lorenz generalizadas."],
    },
    {
      id: "ec-red-x03",
      since: 5,
      q: ["A household on benefits earns 100 € more; it pays 20 € in income tax and loses 65 € of benefit. What is its effective marginal tax rate?", "Un ménage allocataire gagne 100 € de plus ; il paie 20 € d'impôt et perd 65 € de prestation. Quel est son taux marginal effectif ?", "Un hogar con prestaciones gana 100 € más; paga 20 € de impuesto y pierde 65 € de prestación. ¿Cuál es su tipo marginal efectivo?"],
      a: ["85 %", "85 %", "85 %"],
      w: [["20 %", "20 %", "20 %"], ["65 %", "65 %", "65 %"], ["72 %", "72 %", "72 %"]],
      e: ["Tax and benefit withdrawal add up: of 100 € earned, 85 € go, so only 15 € are kept. Such rates are what welfare reforms (tapers, in-work credits) try to bring down; 72 % is what multiplying the rates would give.", "Impôt et retrait de prestation s'additionnent : sur 100 € gagnés, 85 € partent, il n'en reste que 15. Ce sont ces taux que les réformes (taux de retrait, crédits d'impôt pour l'emploi) cherchent à réduire ; 72 % serait le résultat d'une multiplication des taux.", "El impuesto y la retirada de la prestación se suman: de 100 € ganados se van 85 €, solo quedan 15. Son esos tipos los que las reformas (tasas de retirada, créditos por empleo) intentan bajar; 72 % sería el resultado de multiplicar los tipos."],
    },
  ],
};

const labour: Pair = {
  beginner: [
    {
      id: "ec-lab-b01",
      since: 5,
      q: ["In a competitive labour market, what does a minimum wage above the market wage do, in the basic model?", "Sur un marché du travail concurrentiel, que fait un salaire minimum supérieur au salaire de marché, dans le modèle de base ?", "En un mercado laboral competitivo, ¿qué hace un salario mínimo superior al salario de mercado, en el modelo básico?"],
      a: ["It lowers employment: firms hire fewer workers at the higher wage", "Il réduit l'emploi : les entreprises embauchent moins à ce salaire plus élevé", "Reduce el empleo: las empresas contratan menos a ese salario más alto"],
      w: [["It raises employment", "Il augmente l'emploi", "Aumenta el empleo"], ["It changes nothing", "Il ne change rien", "No cambia nada"], ["It lowers the wage", "Il fait baisser le salaire", "Baja el salario"]],
      e: ["In the competitive model, quantity demanded falls along the demand curve. With monopsony, a moderate minimum wage can raise both pay and employment, one reason why empirical studies (Card and Krueger) find small effects.", "Dans le modèle concurrentiel, la quantité demandée baisse le long de la courbe de demande. Avec un monopsone, un salaire minimum modéré peut augmenter à la fois la paie et l'emploi, ce qui explique en partie les effets faibles trouvés empiriquement (Card et Krueger).", "En el modelo competitivo, la cantidad demandada baja a lo largo de la curva de demanda. Con monopsonio, un salario mínimo moderado puede subir a la vez el sueldo y el empleo, una razón de los efectos pequeños hallados empíricamente (Card y Krueger)."],
    },
    {
      id: "ec-lab-b02",
      since: 5,
      q: ["What is human capital?", "Qu'est-ce que le capital humain ?", "¿Qué es el capital humano?"],
      a: ["The skills and knowledge people acquire, through schooling and training, that raise their productivity", "Les compétences et connaissances acquises, par l'école et la formation, qui augmentent la productivité", "Las habilidades y conocimientos adquiridos, mediante la escuela y la formación, que aumentan la productividad"],
      w: [["The machines a worker uses", "Les machines qu'un ouvrier utilise", "Las máquinas que usa un trabajador"], ["The number of workers in a country", "Le nombre de travailleurs d'un pays", "El número de trabajadores de un país"], ["A worker's savings", "L'épargne d'un travailleur", "Los ahorros de un trabajador"]],
      e: ["Becker treated education as an investment: costs now (fees, forgone earnings) for higher wages later. The signalling view (Spence) holds that diplomas partly show ability rather than create it.", "Becker traitait l'éducation comme un investissement : des coûts maintenant (frais, salaires perdus) pour des salaires plus élevés ensuite. La théorie du signal (Spence) voit dans les diplômes en partie la preuve d'une capacité plutôt que sa création.", "Becker trató la educación como una inversión: costes ahora (matrícula, salarios perdidos) por salarios más altos después. La teoría de la señal (Spence) sostiene que los títulos en parte muestran la capacidad más que crearla."],
    },
    {
      id: "ec-lab-b03",
      since: 5,
      q: ["A wage rise has a substitution effect and an income effect on hours worked. What does the income effect do?", "Une hausse de salaire a un effet de substitution et un effet revenu sur les heures travaillées. Que fait l'effet revenu ?", "Una subida salarial tiene un efecto sustitución y un efecto renta sobre las horas trabajadas. ¿Qué hace el efecto renta?"],
      a: ["Pushes towards fewer hours, since being richer one buys more leisure", "Pousse vers moins d'heures, car plus riche on s'offre plus de loisir", "Empuja hacia menos horas, porque más rico se compra más ocio"],
      w: [["Pushes towards more hours, since leisure costs more", "Pousse vers plus d'heures, car le loisir coûte plus cher", "Empuja hacia más horas, porque el ocio cuesta más"], ["Has no effect on hours", "N'a aucun effet sur les heures", "No tiene efecto en las horas"], ["Always outweighs the substitution effect", "L'emporte toujours sur l'effet de substitution", "Siempre supera al efecto sustitución"]],
      e: ["The substitution effect (leisure now costs more) pushes towards more work; the net effect is an empirical question. Labour supply of second earners responds more than that of prime-age men.", "L'effet de substitution (le loisir coûte plus) pousse à travailler plus ; l'effet net est une question empirique. L'offre de travail des seconds apporteurs de revenu réagit plus que celle des hommes d'âge actif.", "El efecto sustitución (el ocio cuesta más) empuja a trabajar más; el efecto neto es una cuestión empírica. La oferta laboral de los segundos perceptores responde más que la de los hombres en edad activa."],
    },
  ],
  expert: [
    {
      id: "ec-lab-x01",
      since: 5,
      q: ["Why do union wage premiums estimated by comparing members and non-members tend to be biased?", "Pourquoi les primes salariales syndicales estimées en comparant syndiqués et non-syndiqués sont-elles souvent biaisées ?", "¿Por qué las primas salariales sindicales estimadas comparando afiliados y no afiliados suelen estar sesgadas?"],
      a: ["Workers sort into unionised jobs by unobserved traits, and union wages spill over to non-union firms (threat effects)", "Les travailleurs se répartissent dans les emplois syndiqués selon des traits non observés, et les salaires syndicaux débordent sur les entreprises non syndiquées (effets de menace)", "Los trabajadores se reparten en empleos sindicados según rasgos no observados, y los salarios sindicales se trasladan a empresas no sindicadas (efectos de amenaza)"],
      w: [["Unions never change wages", "Les syndicats ne changent jamais les salaires", "Los sindicatos nunca cambian los salarios"], ["Members always lie about their wages", "Les syndiqués mentent toujours sur leur salaire", "Los afiliados siempre mienten sobre su salario"], ["Only public employees can join unions", "Seuls les fonctionnaires peuvent se syndiquer", "Solo los empleados públicos pueden afiliarse"]],
      e: ["Selection can bias the gap either way; threat and spillover effects lower it, since non-union pay rises too. Panel data and close union elections (regression discontinuity) are used to get closer to causal effects.", "La sélection peut biaiser l'écart dans un sens ou l'autre ; les effets de menace et de débordement le réduisent, puisque la paie des non-syndiqués monte aussi. Données de panel et élections syndicales serrées (régression sur discontinuité) servent à approcher l'effet causal.", "La selección puede sesgar la diferencia en uno u otro sentido; los efectos de amenaza y de arrastre la reducen, pues el salario de los no afiliados también sube. Se usan datos de panel y elecciones sindicales ajustadas (regresión discontinua) para acercarse al efecto causal."],
    },
    {
      id: "ec-lab-x02",
      since: 5,
      q: ["In a monopsony, why is the marginal cost of labour above the wage?", "Dans un monopsone, pourquoi le coût marginal du travail dépasse-t-il le salaire ?", "En un monopsonio, ¿por qué el coste marginal del trabajo supera el salario?"],
      a: ["To hire one more worker the firm must raise the wage for all its workers, not only the new one", "Pour embaucher un travailleur de plus, l'entreprise doit augmenter le salaire de tous, pas seulement du nouveau", "Para contratar a un trabajador más, la empresa debe subir el salario a todos, no solo al nuevo"],
      w: [["Because of payroll taxes", "À cause des cotisations sociales", "Por las cotizaciones sociales"], ["Because hiring costs are high", "Parce que les coûts d'embauche sont élevés", "Porque los costes de contratación son altos"], ["It is not: in monopsony it is below the wage", "Ce n'est pas le cas : en monopsone il est inférieur au salaire", "No es así: en monopsonio es inferior al salario"]],
      e: ["With an upward-sloping labour supply $w(L)$, the cost is $w(L)L$ and its derivative $w + L\\,w'(L)$ exceeds $w$. The firm hires where this equals the marginal revenue product, so it pays less and employs fewer than a competitive market.", "Avec une offre de travail croissante $w(L)$, le coût vaut $w(L)L$ et sa dérivée $w + L\\,w'(L)$ dépasse $w$. L'entreprise embauche là où elle égale la recette marginale du travail : elle paie moins et emploie moins qu'un marché concurrentiel.", "Con una oferta de trabajo creciente $w(L)$, el coste es $w(L)L$ y su derivada $w + L\\,w'(L)$ supera $w$. La empresa contrata donde esto iguala el ingreso marginal del trabajo, así que paga menos y emplea menos que un mercado competitivo."],
    },
    {
      id: "ec-lab-x03",
      since: 5,
      q: ["What does the Diamond–Mortensen–Pissarides search model explain that the competitive model cannot?", "Qu'explique le modèle d'appariement de Diamond-Mortensen-Pissarides que le modèle concurrentiel ne peut pas expliquer ?", "¿Qué explica el modelo de búsqueda de Diamond-Mortensen-Pissarides que el modelo competitivo no puede explicar?"],
      a: ["Unemployment and vacancies existing together, because finding a match takes time and effort", "La coexistence du chômage et d'emplois vacants, parce que trouver un appariement prend du temps et des efforts", "La coexistencia de paro y vacantes, porque encontrar un emparejamiento lleva tiempo y esfuerzo"],
      w: [["Why wages never change", "Pourquoi les salaires ne changent jamais", "Por qué los salarios nunca cambian"], ["Why there is never any unemployment", "Pourquoi il n'y a jamais de chômage", "Por qué nunca hay paro"], ["Why minimum wages always raise employment", "Pourquoi le salaire minimum augmente toujours l'emploi", "Por qué el salario mínimo siempre aumenta el empleo"]],
      e: ["A matching function turns job seekers and vacancies into hires; wages are bargained over the surplus of a match. The Beveridge curve, vacancies against unemployment, comes from it, as do analyses of benefits and hiring subsidies.", "Une fonction d'appariement transforme demandeurs d'emploi et postes vacants en embauches ; les salaires se négocient sur le surplus d'un appariement. La courbe de Beveridge, postes vacants contre chômage, en découle, comme les analyses des allocations et des aides à l'embauche.", "Una función de emparejamiento convierte demandantes y vacantes en contrataciones; los salarios se negocian sobre el excedente del emparejamiento. De ahí sale la curva de Beveridge, vacantes frente a paro, y los análisis de las prestaciones y las ayudas a la contratación."],
    },
  ],
};

const byTopic = { econWelfare: welfare, econMarketFailure: marketFailure, econPublicChoice: publicChoice, econIncidence: incidence, econOptimalTax: optimalTax, econTaxDesign: taxDesign, econSocialInsurance: socialInsurance, econRedistribution: redistribution, econLabour: labour };

/** Débutant (0) and Expert (3) lists of each economics topic. */
export const ECON_LEVEL_LISTS = Object.fromEntries(
  Object.entries(byTopic).map(([topic, pair]) => [topic, { 0: { basics: pair.beginner }, 3: { expert: pair.expert } }]),
) as Record<keyof typeof byTopic, { 0: { basics: Q[] }; 3: { expert: Q[] } }>;
