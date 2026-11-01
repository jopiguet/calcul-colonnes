# Public economics — the essentials of the test

## How to use this course

This course goes with the public economics test: what the state does, why, and what it costs. Each part gives the model, the formula the test computes with and the intuition behind it.

| Level | What it asks |
|---|---|
| Beginner | Definitions: efficiency, public goods, externalities, who pays a tax |
| Intermediate | The standard models with numbers: Samuelson, Pigou, incidence, Gini |
| Advanced | Optimal taxation, social insurance, the median voter, labour supply |
| Expert | The limits of each model: second best, moral hazard, tax avoidance, empirical estimates |

## Part 1 — Welfare and efficiency

An allocation is **Pareto efficient** if no one can be made better off without making someone worse off. The two welfare theorems: a competitive equilibrium is Pareto efficient, and any efficient allocation can be reached by competition after lump-sum transfers. Choosing among efficient allocations needs a social welfare function:

| Function | Form | Cares about |
|---|---|---|
| Utilitarian | $W = \sum u_i$ | The total |
| Rawlsian | $W = \min u_i$ | The worst-off |

With diminishing marginal utility, a utilitarian prefers equal incomes when total income is fixed.

## Part 2 — Market failures

A **public good** is non-rival and non-excludable. Its efficient quantity sets the **sum** of marginal benefits equal to the marginal cost (Samuelson): $\sum_i MB_i = MC$. Each person free-rides on the others, so the market provides too little.

An **externality** is a cost or benefit falling on others. With a marginal external damage $D$, a Pigouvian tax $t = D$ at the efficient quantity makes the polluter face the full social cost. Coase: if property rights are clear and bargaining is cheap, the parties reach the efficient outcome without a tax, whoever holds the right.

Example: three residents value a streetlight at 20, 30 and 50; it costs 90. The sum, 100, exceeds the cost, so it should be built.

## Part 3 — Public choice

With single-peaked preferences on one dimension, majority voting picks the **median voter's** favourite. With several dimensions, majority voting can cycle (Condorcet paradox), and Arrow showed no voting rule meets all of a short list of reasonable conditions. Politicians and agencies have their own goals; concentrated interests lobby harder than dispersed ones, which explains policies with small groups of winners and many losers.

## Part 4 — Tax incidence

Who pays a tax does not depend on who writes the cheque. The less elastic side of the market bears more:

$$
\frac{\text{share paid by buyers}}{\text{share paid by sellers}} = \frac{\varepsilon_S}{|\varepsilon_D|}
$$

The **deadweight loss** is the surplus lost on trades that no longer happen, about $\frac12 t\,\Delta Q$, and it grows with the square of the tax rate. Example: with linear demand $Q = 100 - P$ and supply $Q = P$, a tax of 10 cuts the quantity from 50 to 45; buyers pay 5 more, sellers receive 5 less, and the loss is $\frac12 \times 10 \times 5 = 25$.

## Part 5 — Optimal taxation

The **Ramsey rule**: to raise a given revenue with least loss, tax goods in inverse proportion to their price elasticity, $\frac{t_i}{p_i} \propto \frac{1}{\varepsilon_i}$. That taxes necessities more, which conflicts with equity.

For top incomes, the Saez formula gives the rate that maximises revenue from the top bracket:

$$
\tau^* = \frac{1}{1 + a\,e}
$$

with $a$ the Pareto parameter of the income distribution and $e$ the elasticity of taxable income. With $a = 1.5$ and $e = 0.25$, $\tau^* = \frac{1}{1.375} \approx 73\ \%$.

## Part 6 — Tax design

The **marginal** rate applies to the next franc earned; the **average** rate is total tax divided by income. Under a bracket schedule only the part above a threshold is taxed at the higher rate, so a raise never reduces income after tax. Broad bases with low rates reduce distortions and avoidance. Value-added tax is collected at each stage on the value added; a consumption tax spares saving, an income tax does not.

## Part 7 — Social insurance

Private insurance markets fail through **adverse selection**: when the insurer cannot tell risks apart, the price attracts the high risks and drives out the low ones. Compulsory public insurance pools everyone. **Moral hazard** remains: insured people take less care, which deductibles and co-payments limit. An actuarially fair premium equals the expected payout: a 10 % risk of losing 5 000 costs 500.

## Part 8 — Redistribution

The **Lorenz curve** plots the share of income held by the poorest fraction of the population; the **Gini coefficient** is twice the area between it and the line of equality, from 0 (equality) to 1. Means-tested benefits withdraw as income rises; the withdrawal rate adds to the tax rate, and when the total approaches 100 % earning more brings almost nothing — a **benefit trap**. In-work credits and slower withdrawal reduce it.

## Part 9 — Labour

A wage tax has an income effect (work more to keep income) and a substitution effect (leisure is cheaper, work less); the net effect on hours is an empirical question, and labour supply responds mostly at the margin of whether to work at all. Under **monopsony**, a single employer pays below the marginal product; a minimum wage set between that wage and the competitive wage can raise both pay and employment.

## Sources

| Topic | Free reference |
|---|---|
| Microeconomics, welfare, market failure | [OpenStax, Principles of Microeconomics](https://openstax.org/details/books/principles-microeconomics-3e) |
| Public economics lectures | [MIT OpenCourseWare, Public Economics](https://ocw.mit.edu/courses/14-41-public-finance-and-public-policy-fall-2010/) |
| Data on inequality | [World Inequality Database](https://wid.world/) |
| Tax statistics | [OECD tax database](https://www.oecd.org/en/data/datasets/oecd-tax-database.html) |
