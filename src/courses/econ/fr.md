# Économie publique — l'essentiel du test

## Comment utiliser ce cours

Ce cours accompagne le test d'économie publique : ce que fait l'État, pourquoi, et ce que cela coûte. Chaque partie donne le modèle, la formule avec laquelle le test calcule et l'intuition qui la porte.

| Niveau | Ce qu'il demande |
|---|---|
| Débutant | Les définitions : efficacité, biens publics, externalités, qui paie un impôt |
| Intermédiaire | Les modèles classiques avec des chiffres : Samuelson, Pigou, incidence, Gini |
| Avancé | Fiscalité optimale, assurance sociale, électeur médian, offre de travail |
| Expert | Les limites de chaque modèle : second rang, aléa moral, évitement fiscal, estimations empiriques |

## Partie 1 — Bien-être et efficacité

Une allocation est **Pareto-efficace** si l'on ne peut améliorer la situation de personne sans détériorer celle de quelqu'un. Les deux théorèmes du bien-être : un équilibre concurrentiel est Pareto-efficace, et toute allocation efficace peut être atteinte par la concurrence après des transferts forfaitaires. Choisir entre allocations efficaces demande une fonction de bien-être social :

| Fonction | Forme | Ce qui compte |
|---|---|---|
| Utilitariste | $W = \sum u_i$ | Le total |
| Rawlsienne | $W = \min u_i$ | Le plus défavorisé |

Avec une utilité marginale décroissante, un utilitariste préfère des revenus égaux quand le revenu total est fixé.

## Partie 2 — Les défaillances du marché

Un **bien public** est non rival et non excluable. Sa quantité efficace égalise la **somme** des bénéfices marginaux et le coût marginal (Samuelson) : $\sum_i MB_i = MC$. Chacun profite des autres sans payer, et le marché en fournit trop peu.

Une **externalité** est un coût ou un bénéfice qui retombe sur d'autres. Avec un dommage externe marginal $D$, une taxe pigouvienne $t = D$ à la quantité efficace fait supporter au pollueur tout le coût social. Coase : si les droits de propriété sont clairs et la négociation peu coûteuse, les parties atteignent le résultat efficace sans taxe, quel que soit le détenteur du droit.

Exemple : trois habitants valorisent un lampadaire à 20, 30 et 50 ; il coûte 90. La somme, 100, dépasse le coût : il faut le construire.

## Partie 3 — Le choix public

Avec des préférences unimodales sur une seule dimension, le vote à la majorité retient le choix préféré de l'**électeur médian**. Avec plusieurs dimensions, le vote à la majorité peut tourner en rond (paradoxe de Condorcet), et Arrow a montré qu'aucune règle de vote ne remplit toutes les conditions d'une courte liste de conditions raisonnables. Politiciens et administrations ont leurs propres objectifs ; les intérêts concentrés font davantage pression que les intérêts dispersés, ce qui explique des politiques avec peu de gagnants et beaucoup de perdants.

## Partie 4 — L'incidence fiscale

Qui paie un impôt ne dépend pas de qui signe le chèque. Le côté le moins élastique du marché en supporte la plus grande part :

$$
\frac{\text{part payée par les acheteurs}}{\text{part payée par les vendeurs}} = \frac{\varepsilon_S}{|\varepsilon_D|}
$$

La **perte sèche** est le surplus perdu sur les échanges qui n'ont plus lieu, environ $\frac12 t\,\Delta Q$, et elle croît avec le carré du taux. Exemple : avec une demande linéaire $Q = 100 - P$ et une offre $Q = P$, une taxe de 10 fait passer la quantité de 50 à 45 ; les acheteurs paient 5 de plus, les vendeurs reçoivent 5 de moins, et la perte vaut $\frac12 \times 10 \times 5 = 25$.

## Partie 5 — La fiscalité optimale

La **règle de Ramsey** : pour lever une recette donnée avec le moins de pertes, taxez les biens en proportion inverse de leur élasticité-prix, $\frac{t_i}{p_i} \propto \frac{1}{\varepsilon_i}$. Cela taxe davantage les biens de première nécessité, ce qui heurte l'équité.

Pour les hauts revenus, la formule de Saez donne le taux qui maximise la recette de la tranche supérieure :

$$
\tau^* = \frac{1}{1 + a\,e}
$$

avec $a$ le paramètre de Pareto de la distribution des revenus et $e$ l'élasticité du revenu imposable. Avec $a = 1.5$ et $e = 0.25$, $\tau^* = \frac{1}{1.375} \approx 73\ \%$.

## Partie 6 — La conception des impôts

Le taux **marginal** s'applique au prochain franc gagné ; le taux **moyen** est l'impôt total divisé par le revenu. Dans un barème par tranches, seule la part au-dessus d'un seuil est taxée au taux supérieur : une augmentation ne réduit donc jamais le revenu après impôt. Des assiettes larges avec des taux bas réduisent les distorsions et l'évitement. La TVA est perçue à chaque étape sur la valeur ajoutée ; un impôt sur la consommation épargne l'épargne, un impôt sur le revenu non.

## Partie 7 — L'assurance sociale

Les marchés de l'assurance privée échouent par **antisélection** : quand l'assureur ne peut distinguer les risques, le prix attire les hauts risques et fait fuir les bas. L'assurance publique obligatoire mutualise tout le monde. L'**aléa moral** demeure : les assurés font moins attention, ce que franchises et quotes-parts limitent. Une prime actuariellement juste égale le paiement attendu : un risque de 10 % de perdre 5 000 coûte 500.

## Partie 8 — La redistribution

La **courbe de Lorenz** porte la part du revenu détenue par la fraction la plus pauvre de la population ; le **coefficient de Gini** vaut deux fois l'aire entre elle et la droite d'égalité, de 0 (égalité) à 1. Les prestations sous condition de ressources diminuent quand le revenu augmente ; ce taux de retrait s'ajoute au taux d'imposition, et quand le total approche 100 % gagner plus ne rapporte presque rien — une **trappe à inactivité**. Les crédits d'impôt pour les actifs et un retrait plus lent la réduisent.

## Partie 9 — Le travail

Un impôt sur le salaire a un effet revenu (travailler plus pour garder son revenu) et un effet substitution (le loisir coûte moins, travailler moins) ; l'effet net sur les heures est une question empirique, et l'offre de travail réagit surtout au choix de travailler ou non. En **monopsone**, un employeur unique paie moins que la productivité marginale ; un salaire minimum fixé entre ce salaire et le salaire concurrentiel peut augmenter à la fois la paie et l'emploi.

## Sources

| Thème | Référence gratuite |
|---|---|
| Microéconomie, bien-être, défaillances du marché | [OpenStax, Principles of Microeconomics](https://openstax.org/details/books/principles-microeconomics-3e) |
| Cours d'économie publique | [MIT OpenCourseWare, Public Economics](https://ocw.mit.edu/courses/14-41-public-finance-and-public-policy-fall-2010/) |
| Données sur les inégalités | [World Inequality Database](https://wid.world/) |
| Statistiques fiscales | [Base de données fiscales de l'OCDE](https://www.oecd.org/en/data/datasets/oecd-tax-database.html) |
