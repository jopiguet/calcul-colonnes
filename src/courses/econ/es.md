# Economía pública — lo esencial del test

## Cómo usar este curso

Este curso acompaña al test de economía pública: lo que hace el Estado, por qué y cuánto cuesta. Cada parte da el modelo, la fórmula con la que calcula el test y la intuición que hay detrás.

| Nivel | Lo que pide |
|---|---|
| Principiante | Las definiciones: eficiencia, bienes públicos, externalidades, quién paga un impuesto |
| Intermedio | Los modelos clásicos con números: Samuelson, Pigou, incidencia, Gini |
| Avanzado | Imposición óptima, seguro social, votante mediano, oferta de trabajo |
| Experto | Los límites de cada modelo: segundo óptimo, riesgo moral, elusión fiscal, estimaciones empíricas |

## Parte 1 — Bienestar y eficiencia

Una asignación es **eficiente en el sentido de Pareto** si no se puede mejorar a nadie sin empeorar a alguien. Los dos teoremas del bienestar: un equilibrio competitivo es eficiente en el sentido de Pareto, y cualquier asignación eficiente puede alcanzarse por la competencia tras transferencias de suma fija. Elegir entre asignaciones eficientes requiere una función de bienestar social:

| Función | Forma | Lo que importa |
|---|---|---|
| Utilitarista | $W = \sum u_i$ | El total |
| Rawlsiana | $W = \min u_i$ | El más desfavorecido |

Con utilidad marginal decreciente, un utilitarista prefiere rentas iguales cuando la renta total está fijada.

## Parte 2 — Los fallos de mercado

Un **bien público** es no rival y no excluible. Su cantidad eficiente iguala la **suma** de los beneficios marginales con el coste marginal (Samuelson): $\sum_i MB_i = MC$. Cada uno se aprovecha de los demás sin pagar, así que el mercado ofrece demasiado poco.

Una **externalidad** es un coste o un beneficio que recae sobre otros. Con un daño externo marginal $D$, un impuesto pigouviano $t = D$ en la cantidad eficiente hace que quien contamina soporte todo el coste social. Coase: si los derechos de propiedad están claros y negociar es barato, las partes llegan al resultado eficiente sin impuesto, sea quien sea el titular del derecho.

Ejemplo: tres vecinos valoran una farola en 20, 30 y 50; cuesta 90. La suma, 100, supera el coste, así que debe construirse.

## Parte 3 — La elección pública

Con preferencias unimodales en una sola dimensión, el voto por mayoría elige la opción preferida del **votante mediano**. Con varias dimensiones, el voto por mayoría puede dar vueltas (paradoja de Condorcet), y Arrow demostró que ninguna regla de votación cumple todas las condiciones de una breve lista de condiciones razonables. Políticos y administraciones tienen sus propios objetivos; los intereses concentrados presionan más que los dispersos, lo que explica políticas con pocos ganadores y muchos perdedores.

## Parte 4 — La incidencia fiscal

Quién paga un impuesto no depende de quién firma el cheque. El lado menos elástico del mercado soporta la mayor parte:

$$
\frac{\text{parte pagada por los compradores}}{\text{parte pagada por los vendedores}} = \frac{\varepsilon_S}{|\varepsilon_D|}
$$

La **pérdida irrecuperable** es el excedente perdido en los intercambios que ya no ocurren, aproximadamente $\frac12 t\,\Delta Q$, y crece con el cuadrado del tipo. Ejemplo: con una demanda lineal $Q = 100 - P$ y una oferta $Q = P$, un impuesto de 10 reduce la cantidad de 50 a 45; los compradores pagan 5 más, los vendedores reciben 5 menos, y la pérdida es $\frac12 \times 10 \times 5 = 25$.

## Parte 5 — La imposición óptima

La **regla de Ramsey**: para recaudar un ingreso dado con la menor pérdida, grave los bienes en proporción inversa a su elasticidad precio, $\frac{t_i}{p_i} \propto \frac{1}{\varepsilon_i}$. Eso grava más los bienes de primera necesidad, lo que choca con la equidad.

Para las rentas altas, la fórmula de Saez da el tipo que maximiza la recaudación del tramo superior:

$$
\tau^* = \frac{1}{1 + a\,e}
$$

con $a$ el parámetro de Pareto de la distribución de la renta y $e$ la elasticidad de la renta imponible. Con $a = 1.5$ y $e = 0.25$, $\tau^* = \frac{1}{1.375} \approx 73\ \%$.

## Parte 6 — El diseño de los impuestos

El tipo **marginal** se aplica al siguiente franco ganado; el tipo **medio** es el impuesto total dividido por la renta. En una tarifa por tramos solo la parte por encima de un umbral tributa al tipo superior, así que un aumento de sueldo nunca reduce la renta después de impuestos. Bases amplias con tipos bajos reducen las distorsiones y la elusión. El IVA se recauda en cada etapa sobre el valor añadido; un impuesto sobre el consumo no grava el ahorro, uno sobre la renta sí.

## Parte 7 — El seguro social

Los mercados de seguros privados fallan por **selección adversa**: cuando la aseguradora no puede distinguir los riesgos, el precio atrae a los riesgos altos y expulsa a los bajos. El seguro público obligatorio agrupa a todos. Queda el **riesgo moral**: los asegurados tienen menos cuidado, lo que limitan las franquicias y los copagos. Una prima actuarialmente justa iguala el pago esperado: un riesgo del 10 % de perder 5 000 cuesta 500.

## Parte 8 — La redistribución

La **curva de Lorenz** representa la parte de la renta que tiene la fracción más pobre de la población; el **coeficiente de Gini** es el doble del área entre ella y la recta de igualdad, de 0 (igualdad) a 1. Las prestaciones sujetas a recursos se retiran al subir la renta; esa tasa de retirada se suma al tipo impositivo, y cuando el total se acerca al 100 % ganar más casi no aporta nada — una **trampa de la pobreza**. Los créditos fiscales por trabajo y una retirada más lenta la reducen.

## Parte 9 — El trabajo

Un impuesto sobre el salario tiene un efecto renta (trabajar más para mantener la renta) y un efecto sustitución (el ocio cuesta menos, trabajar menos); el efecto neto sobre las horas es una cuestión empírica, y la oferta de trabajo responde sobre todo en la decisión de trabajar o no. En **monopsonio**, un único empleador paga menos que el producto marginal; un salario mínimo fijado entre ese salario y el competitivo puede aumentar a la vez el sueldo y el empleo.

## Fuentes

| Tema | Referencia gratuita |
|---|---|
| Microeconomía, bienestar, fallos de mercado | [OpenStax, Principles of Microeconomics](https://openstax.org/details/books/principles-microeconomics-3e) |
| Curso de economía pública | [MIT OpenCourseWare, Public Economics](https://ocw.mit.edu/courses/14-41-public-finance-and-public-policy-fall-2010/) |
| Datos sobre desigualdad | [World Inequality Database](https://wid.world/) |
| Estadísticas fiscales | [Base de datos fiscal de la OCDE](https://www.oecd.org/en/data/datasets/oecd-tax-database.html) |
