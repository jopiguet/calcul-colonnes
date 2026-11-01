# Rust — the essentials of the test

## How to use this course

This course goes with the Rust test. Most questions show a short program and ask what it prints or why it does not compile; the wrong options are what a reader coming from another language would expect. Run the examples on the [Rust Playground](https://play.rust-lang.org/).

| Level | What it asks |
|---|---|
| Beginner | Variables, types, control flow, strings |
| Intermediate | Ownership and borrowing, structs and enums, `Result`, vectors and iterators |
| Advanced | Lifetimes, traits, smart pointers, closures, threads, Cargo features |
| Expert | Interior mutability, trait objects, async, `unsafe`, macros, FFI |

## Part 1 — The basics

Variables are immutable unless declared `mut`. `let x = x + 1;` **shadows** `x` with a new variable, which may even change type. Integers have fixed sizes (`i32` by default, `u8`, `usize`…); overflow panics in a debug build and wraps in release, so use `checked_add` or `wrapping_add` to choose. Integer division truncates toward zero.

`if`, `match` and blocks are expressions: their last line without a semicolon is the value. `String` owns its text, `&str` borrows it. `len()` counts bytes, not characters: `"é".len()` is 2, `"é".chars().count()` is 1.

## Part 2 — Ownership and borrowing

Each value has one owner; when the owner goes out of scope, the value is dropped. Assigning a `String` **moves** it, and the old name can no longer be used; types that are `Copy`, like integers, are copied instead.

```rust
let a = String::from("hi");
let b = a;            // a is moved into b
println!("{b}");      // fine; using a here would not compile
```

A reference borrows without taking ownership. At any time you may have either many `&T` or one `&mut T`, never both. A lifetime such as `'a` says how long a reference stays valid; `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str` returns something that lives as long as the shorter of the two. `Box<T>` puts a value on the heap, `Rc<T>` shares it with a reference count, and `RefCell<T>` moves the borrow check to run time. Values are dropped in reverse order of declaration.

## Part 3 — Types and traits

A `struct` groups fields; an `enum` is one of several variants, each with its own data. `match` must cover every variant — `_` catches the rest. `Option<T>` replaces null: `Some(v)` or `None`, with combinators such as `map`, `and_then` and `unwrap_or`.

A trait declares behaviour, and generics with bounds (`fn show<T: Display>(t: T)`) are resolved at compile time. A trait object, `Box<dyn Trait>`, is resolved at run time through a vtable and only works for object-safe traits. Associated types, default methods and `impl Trait` in argument or return position complete the picture.

## Part 4 — Errors

`panic!` stops the thread for a bug; `Result<T, E>` reports an error the caller can handle. The `?` operator returns the error early and converts it with `From`.

```rust
fn read_port(text: &str) -> Result<u16, std::num::ParseIntError> {
    let port = text.trim().parse::<u16>()?;
    Ok(port)
}
```

A library defines its own error enum; an application often uses one boxed error type. `unwrap` and `expect` panic on an error: fine in tests and examples, rarely in library code.

## Part 5 — Collections, iterators, closures

`Vec<T>` grows on the heap; indexing out of bounds panics, `get` returns an `Option`. `HashMap` with `entry(key).or_insert(0)` counts in one line. Iterators are lazy: `map` and `filter` do nothing until a consumer such as `collect`, `sum` or `for` runs them. `iter()` borrows, `iter_mut()` borrows mutably, `into_iter()` takes ownership.

A closure captures its environment by reference, by mutable reference or by value (`move`); that decides whether it is `Fn`, `FnMut` or `FnOnce`. `sort` then `dedup` removes repeated values, since `dedup` only removes consecutive ones.

## Part 6 — Cargo and modules

`cargo new`, `cargo build`, `cargo run`, `cargo test`, and `cargo build --release` for an optimised build. Dependencies go in `Cargo.toml`, and `Cargo.lock` pins their exact versions. A module is private by default; `pub` exposes an item, `use` brings a path into scope. Unit tests live next to the code in a `#[cfg(test)]` module, integration tests in `tests/`. Features turn optional code on, and `clippy` and `rustfmt` lint and format.

## Part 7 — Concurrency

`std::thread::spawn` starts a thread and returns a handle to `join`. To share data, wrap it: `Arc<T>` for shared ownership across threads, `Mutex<T>` or `RwLock<T>` for mutation. The `Send` and `Sync` traits mark what may cross threads, so a data race does not compile. Channels (`mpsc`) pass messages instead of sharing. `async fn` returns a future that does nothing until awaited by a runtime such as Tokio.

## Part 8 — Macros, unsafe, FFI

`macro_rules!` matches patterns of tokens and expands them at compile time; `println!` and `vec!` are macros. An `unsafe` block allows five extra things — dereferencing a raw pointer, calling an `unsafe` function, accessing a mutable static, implementing an `unsafe` trait, accessing a union field — and the programmer guarantees they are sound. `extern "C"` declares or exports functions for C, with `#[repr(C)]` for compatible layouts.

## Sources

| Topic | Free reference |
|---|---|
| The language | [The Rust Programming Language](https://doc.rust-lang.org/book/) |
| By example | [Rust by Example](https://doc.rust-lang.org/rust-by-example/) |
| The standard library | [std documentation](https://doc.rust-lang.org/std/) |
| Unsafe Rust | [The Rustonomicon](https://doc.rust-lang.org/nomicon/) |
