# Rust — lo esencial del test

## Cómo usar este curso

Este curso acompaña al test de Rust. La mayoría de las preguntas muestran un programa corto y preguntan qué imprime o por qué no compila; las opciones erróneas son lo que esperaría un lector que viene de otro lenguaje. Ejecute los ejemplos en el [Rust Playground](https://play.rust-lang.org/).

| Nivel | Lo que pide |
|---|---|
| Principiante | Variables, tipos, control de flujo, cadenas |
| Intermedio | Propiedad y préstamo, structs y enums, `Result`, vectores e iteradores |
| Avanzado | Tiempos de vida, traits, punteros inteligentes, closures, hilos, features de Cargo |
| Experto | Mutabilidad interior, objetos trait, async, `unsafe`, macros, FFI |

## Parte 1 — Lo básico

Las variables son inmutables salvo que se declaren `mut`. `let x = x + 1;` **sombrea** `x` con una variable nueva, que incluso puede cambiar de tipo. Los enteros tienen tamaño fijo (`i32` por defecto, `u8`, `usize`…); un desbordamiento provoca pánico en debug y da la vuelta en release, así que use `checked_add` o `wrapping_add` para elegir. La división entera trunca hacia cero.

`if`, `match` y los bloques son expresiones: su última línea sin punto y coma es el valor. `String` posee su texto, `&str` lo toma prestado. `len()` cuenta bytes, no caracteres: `"é".len()` es 2, `"é".chars().count()` es 1.

## Parte 2 — Propiedad y préstamo

Cada valor tiene un solo propietario; cuando el propietario sale de ámbito, el valor se libera. Asignar una `String` la **mueve**, y el nombre antiguo ya no puede usarse; los tipos `Copy`, como los enteros, se copian en su lugar.

```rust
let a = String::from("hi");
let b = a;            // a se mueve a b
println!("{b}");      // correcto; usar a aquí no compilaría
```

Una referencia toma prestado sin tomar la propiedad. En cada momento puede tener o bien muchos `&T`, o bien un solo `&mut T`, nunca ambos. Un tiempo de vida como `'a` dice cuánto tiempo sigue siendo válida una referencia; `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str` devuelve algo que vive tanto como la más corta de las dos. `Box<T>` pone un valor en el montón, `Rc<T>` lo comparte con un contador de referencias, y `RefCell<T>` lleva la comprobación de préstamos al tiempo de ejecución. Los valores se liberan en orden inverso a su declaración.

## Parte 3 — Tipos y traits

Un `struct` agrupa campos; un `enum` es una de varias variantes, cada una con sus datos. `match` debe cubrir todas las variantes — `_` recoge el resto. `Option<T>` sustituye a null: `Some(v)` o `None`, con combinadores como `map`, `and_then` y `unwrap_or`.

Un trait declara un comportamiento, y los genéricos con cotas (`fn show<T: Display>(t: T)`) se resuelven al compilar. Un objeto trait, `Box<dyn Trait>`, se resuelve en ejecución mediante una vtable y solo funciona con traits compatibles con objetos. Los tipos asociados, los métodos por defecto e `impl Trait` como argumento o retorno completan el cuadro.

## Parte 4 — Los errores

`panic!` detiene el hilo ante un bug; `Result<T, E>` informa de un error que el llamador puede tratar. El operador `?` devuelve el error en cuanto aparece y lo convierte con `From`.

```rust
fn read_port(text: &str) -> Result<u16, std::num::ParseIntError> {
    let port = text.trim().parse::<u16>()?;
    Ok(port)
}
```

Una biblioteca define su propio enum de errores; una aplicación suele usar un único tipo de error en caja. `unwrap` y `expect` provocan pánico ante un error: bien en tests y ejemplos, rara vez en el código de una biblioteca.

## Parte 5 — Colecciones, iteradores, closures

`Vec<T>` crece en el montón; un índice fuera de rango provoca pánico, `get` devuelve una `Option`. `HashMap` con `entry(key).or_insert(0)` cuenta en una línea. Los iteradores son perezosos: `map` y `filter` no hacen nada hasta que un consumidor como `collect`, `sum` o `for` los ejecuta. `iter()` toma prestado, `iter_mut()` toma prestado de forma mutable, `into_iter()` toma la propiedad.

Una closure captura su entorno por referencia, por referencia mutable o por valor (`move`); eso decide si es `Fn`, `FnMut` o `FnOnce`. `sort` y luego `dedup` elimina los valores repetidos, porque `dedup` solo elimina los consecutivos.

## Parte 6 — Cargo y los módulos

`cargo new`, `cargo build`, `cargo run`, `cargo test`, y `cargo build --release` para una compilación optimizada. Las dependencias van en `Cargo.toml`, y `Cargo.lock` fija sus versiones exactas. Un módulo es privado por defecto; `pub` expone un elemento, `use` trae una ruta al ámbito. Los tests unitarios viven junto al código en un módulo `#[cfg(test)]`, los de integración en `tests/`. Las features activan código opcional, y `clippy` y `rustfmt` revisan y formatean.

## Parte 7 — La concurrencia

`std::thread::spawn` lanza un hilo y devuelve un handle para `join`. Para compartir datos, envuélvalos: `Arc<T>` para una propiedad compartida entre hilos, `Mutex<T>` o `RwLock<T>` para modificarlos. Los traits `Send` y `Sync` marcan lo que puede pasar de un hilo a otro, así que una carrera de datos no compila. Los canales (`mpsc`) pasan mensajes en lugar de compartir. `async fn` devuelve un future que no hace nada hasta que un runtime como Tokio lo espera.

## Parte 8 — Macros, unsafe, FFI

`macro_rules!` reconoce patrones de tokens y los expande al compilar; `println!` y `vec!` son macros. Un bloque `unsafe` permite cinco cosas más — desreferenciar un puntero crudo, llamar a una función `unsafe`, acceder a una variable estática mutable, implementar un trait `unsafe`, acceder a un campo de unión — y el programador garantiza que son correctas. `extern "C"` declara o exporta funciones para C, con `#[repr(C)]` para disposiciones compatibles.

## Fuentes

| Tema | Referencia gratuita |
|---|---|
| El lenguaje | [The Rust Programming Language](https://doc.rust-lang.org/book/) |
| Con ejemplos | [Rust by Example](https://doc.rust-lang.org/rust-by-example/) |
| La biblioteca estándar | [Documentación de std](https://doc.rust-lang.org/std/) |
| Rust unsafe | [The Rustonomicon](https://doc.rust-lang.org/nomicon/) |
