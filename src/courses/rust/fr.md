# Rust — l'essentiel du test

## Comment utiliser ce cours

Ce cours accompagne le test Rust. La plupart des questions montrent un court programme et demandent ce qu'il affiche ou pourquoi il ne compile pas ; les mauvaises réponses sont ce qu'attendrait un lecteur venu d'un autre langage. Lancez les exemples sur le [Rust Playground](https://play.rust-lang.org/).

| Niveau | Ce qu'il demande |
|---|---|
| Débutant | Variables, types, structures de contrôle, chaînes |
| Intermédiaire | Possession et emprunt, structs et enums, `Result`, vecteurs et itérateurs |
| Avancé | Durées de vie, traits, pointeurs intelligents, closures, threads, features de Cargo |
| Expert | Mutabilité intérieure, objets trait, async, `unsafe`, macros, FFI |

## Partie 1 — Les bases

Les variables sont immuables sauf si elles sont déclarées `mut`. `let x = x + 1;` **masque** `x` par une nouvelle variable, qui peut même changer de type. Les entiers ont une taille fixe (`i32` par défaut, `u8`, `usize`…) ; un dépassement provoque une panique en debug et boucle en release, utilisez donc `checked_add` ou `wrapping_add` pour choisir. La division entière tronque vers zéro.

`if`, `match` et les blocs sont des expressions : leur dernière ligne sans point-virgule est la valeur. `String` possède son texte, `&str` l'emprunte. `len()` compte des octets, pas des caractères : `"é".len()` vaut 2, `"é".chars().count()` vaut 1.

## Partie 2 — Possession et emprunt

Chaque valeur a un seul propriétaire ; quand le propriétaire sort de portée, la valeur est libérée. Affecter une `String` la **déplace**, et l'ancien nom n'est plus utilisable ; les types `Copy`, comme les entiers, sont copiés à la place.

```rust
let a = String::from("hi");
let b = a;            // a est déplacé dans b
println!("{b}");      // correct ; utiliser a ici ne compilerait pas
```

Une référence emprunte sans prendre possession. À tout moment, vous pouvez avoir soit plusieurs `&T`, soit un seul `&mut T`, jamais les deux. Une durée de vie comme `'a` dit combien de temps une référence reste valide ; `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str` renvoie quelque chose qui vit aussi longtemps que la plus courte des deux. `Box<T>` place une valeur sur le tas, `Rc<T>` la partage avec un compteur de références, et `RefCell<T>` déplace la vérification d'emprunt à l'exécution. Les valeurs sont libérées dans l'ordre inverse de leur déclaration.

## Partie 3 — Types et traits

Une `struct` regroupe des champs ; un `enum` est l'une de plusieurs variantes, chacune avec ses données. `match` doit couvrir chaque variante — `_` attrape le reste. `Option<T>` remplace null : `Some(v)` ou `None`, avec des combinateurs comme `map`, `and_then` et `unwrap_or`.

Un trait déclare un comportement, et les génériques bornés (`fn show<T: Display>(t: T)`) sont résolus à la compilation. Un objet trait, `Box<dyn Trait>`, est résolu à l'exécution par une vtable et ne fonctionne qu'avec des traits compatibles objet. Les types associés, les méthodes par défaut et `impl Trait` en argument ou en retour complètent le tableau.

## Partie 4 — Les erreurs

`panic!` arrête le thread pour un bug ; `Result<T, E>` signale une erreur que l'appelant peut traiter. L'opérateur `?` renvoie l'erreur au plus tôt et la convertit avec `From`.

```rust
fn read_port(text: &str) -> Result<u16, std::num::ParseIntError> {
    let port = text.trim().parse::<u16>()?;
    Ok(port)
}
```

Une bibliothèque définit son propre enum d'erreurs ; une application utilise souvent un seul type d'erreur en boîte. `unwrap` et `expect` paniquent sur une erreur : très bien dans les tests et les exemples, rarement dans le code d'une bibliothèque.

## Partie 5 — Collections, itérateurs, closures

`Vec<T>` grandit sur le tas ; un indice hors limites provoque une panique, `get` renvoie une `Option`. `HashMap` avec `entry(key).or_insert(0)` compte en une ligne. Les itérateurs sont paresseux : `map` et `filter` ne font rien tant qu'un consommateur comme `collect`, `sum` ou `for` ne les exécute pas. `iter()` emprunte, `iter_mut()` emprunte en mutable, `into_iter()` prend possession.

Une closure capture son environnement par référence, par référence mutable ou par valeur (`move`) ; cela décide si elle est `Fn`, `FnMut` ou `FnOnce`. `sort` puis `dedup` retire les valeurs répétées, car `dedup` ne retire que les doublons consécutifs.

## Partie 6 — Cargo et les modules

`cargo new`, `cargo build`, `cargo run`, `cargo test`, et `cargo build --release` pour une compilation optimisée. Les dépendances vont dans `Cargo.toml`, et `Cargo.lock` fige leurs versions exactes. Un module est privé par défaut ; `pub` expose un élément, `use` amène un chemin dans la portée. Les tests unitaires vivent à côté du code dans un module `#[cfg(test)]`, les tests d'intégration dans `tests/`. Les features activent du code optionnel, et `clippy` et `rustfmt` vérifient et formatent.

## Partie 7 — La concurrence

`std::thread::spawn` lance un thread et renvoie un handle à `join`. Pour partager des données, enveloppez-les : `Arc<T>` pour une possession partagée entre threads, `Mutex<T>` ou `RwLock<T>` pour les modifier. Les traits `Send` et `Sync` marquent ce qui peut passer d'un thread à l'autre, si bien qu'une course de données ne compile pas. Les canaux (`mpsc`) passent des messages au lieu de partager. `async fn` renvoie un future qui ne fait rien tant qu'un runtime comme Tokio ne l'attend pas.

## Partie 8 — Macros, unsafe, FFI

`macro_rules!` reconnaît des motifs de jetons et les développe à la compilation ; `println!` et `vec!` sont des macros. Un bloc `unsafe` permet cinq choses de plus — déréférencer un pointeur brut, appeler une fonction `unsafe`, accéder à une variable statique mutable, implémenter un trait `unsafe`, accéder à un champ d'union — et le programmeur garantit qu'elles sont correctes. `extern "C"` déclare ou exporte des fonctions pour le C, avec `#[repr(C)]` pour des dispositions compatibles.

## Sources

| Thème | Référence gratuite |
|---|---|
| Le langage | [The Rust Programming Language](https://doc.rust-lang.org/book/) |
| Par l'exemple | [Rust by Example](https://doc.rust-lang.org/rust-by-example/) |
| La bibliothèque standard | [Documentation de std](https://doc.rust-lang.org/std/) |
| Rust unsafe | [The Rustonomicon](https://doc.rust-lang.org/nomicon/) |
