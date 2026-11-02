#!/usr/bin/env python3
"""
POS-aware German lemmatisation and corpus-frequency analysis for the Nietzsche
Vocabulary project.

Requires:
    python3 -m pip install spacy beautifulsoup4 pandas openpyxl   (or: -r tools/requirements.txt)
    python3 -m spacy download de_core_news_sm

Run (docs/vocabulary.md#nietzsche-the-vocabulary-of-six-works-germanenglish):
    python3 tools/vocab-lemmatize-nietzsche.py \
      --vocab data/Nietzsche_Vocabulary_Master_2026-10-29_v12.csv \
      --corpus-dir data/nietzsche-corpus \
      --output-dir data/nietzsche-lemmas

Expected corpus filenames:
    pg7207-images-3.epub  Menschliches, Allzumenschliches
    pg7206-images-3.epub  Die Geburt der Tragödie
    pg7204-images-3.epub  Jenseits von Gut und Böse
    pg7203-images-3.epub  Götzen-Dämmerung
    pg7202-images-3.epub  Ecce homo
    pg7205-images-3.epub  Also sprach Zarathustra

This script deliberately keeps strict surface counts and lemma/POS counts apart.
It does not silently infer a lemma when the NLP model returns an uncertain parse.
"""
from __future__ import annotations
import argparse, collections, re, zipfile
from pathlib import Path
import pandas as pd
import spacy
from bs4 import BeautifulSoup

WORKS = {
    "Menschliches, Allzumenschliches": "pg7207-images-3.epub",
    "Die Geburt der Tragödie": "pg7206-images-3.epub",
    "Jenseits von Gut und Böse": "pg7204-images-3.epub",
    "Götzen-Dämmerung": "pg7203-images-3.epub",
    "Ecce homo": "pg7202-images-3.epub",
    "Also sprach Zarathustra": "pg7205-images-3.epub",
}
ARTICLES = {"der","die","das","den","dem","des","ein","eine","einer","einem","einen"}
TOKEN_RE = re.compile(r"[A-Za-zÄÖÜäöüß]+(?:[-’'][A-Za-zÄÖÜäöüß]+)*")

def epub_text(path: Path) -> str:
    chunks=[]
    with zipfile.ZipFile(path) as zf:
        for name in zf.namelist():
            if name.lower().endswith((".xhtml",".html",".htm")):
                soup=BeautifulSoup(zf.read(name),"html.parser")
                for tag in soup(["script","style"]): tag.decompose()
                chunks.append(soup.get_text(" ",strip=True))
    return "\n".join(chunks)

def content_tokens(doc):
    return [t for t in doc if not t.is_space and not t.is_punct]

def parse_headword(nlp, headword: str):
    # Remove a leading German article only when it is a separate first token.
    words=TOKEN_RE.findall(str(headword))
    if words and words[0].casefold() in ARTICLES:
        words=words[1:]
    if not words:
        return [], "", "UNRESOLVED"
    doc=nlp(" ".join(words))
    toks=content_tokens(doc)
    lemmas=[t.lemma_.casefold() for t in toks]
    upos=";".join(t.pos_ or "X" for t in toks)
    return lemmas, upos, "OK" if all(t.lemma_ and t.pos_ not in ("", "X") for t in toks) else "CHECK"

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--vocab",required=True)
    ap.add_argument("--corpus-dir",required=True)
    ap.add_argument("--output-dir",required=True)
    ap.add_argument("--model",default="de_core_news_sm")
    ap.add_argument("--batch-size",type=int,default=500)
    args=ap.parse_args()
    nlp=spacy.load(args.model)
    vocab=pd.read_csv(args.vocab).fillna("")
    out=Path(args.output_dir); out.mkdir(parents=True,exist_ok=True)

    # Build lemma/POS target signatures from each vocabulary headword.
    signatures=[]
    for _,row in vocab.iterrows():
        lemmas,upos,status=parse_headword(nlp,row["German"])
        signatures.append((lemmas,upos,status))
    vocab["Lemma signature (spaCy)"]=[" ".join(x[0]) for x in signatures]
    vocab["UPOS signature (spaCy)"]=[x[1] for x in signatures]
    vocab["Lemmatisation status"]=[x[2] for x in signatures]

    # Count corpus tokens by (lemma, UPOS) and by ordered lemma sequences.
    counts=collections.Counter()
    work_counts=collections.defaultdict(collections.Counter)
    phrase_counts=collections.Counter()
    phrase_work=collections.defaultdict(collections.Counter)
    for work,filename in WORKS.items():
        path=Path(args.corpus_dir)/filename
        if not path.exists():
            raise FileNotFoundError(path)
        text=epub_text(path)
        docs=nlp.pipe((text[i:i+100000] for i in range(0,len(text),100000)),
                      batch_size=1)
        # Chunking is memory-conscious but may split a sentence at chunk boundaries.
        for doc in docs:
            toks=content_tokens(doc)
            for tok in toks:
                if tok.pos_ in ("PUNCT","SPACE"): continue
                key=(tok.lemma_.casefold(),tok.pos_)
                counts[key]+=1
                work_counts[key][work]+=1
            # phrase windows for 2-5 lexical tokens, with punctuation excluded
            lem=[t.lemma_.casefold() for t in toks]
            for n in range(2,6):
                for i in range(len(lem)-n+1):
                    phrase_counts[tuple(lem[i:i+n])]+=1
                    phrase_work[tuple(lem[i:i+n])][work]+=1

    lemma_total=[]; lemma_coverage=[]
    for lemmas,upos,status in signatures:
        if status!="OK" or not lemmas:
            lemma_total.append(""); lemma_coverage.append(""); continue
        if len(lemmas)==1:
            key=(lemmas[0],upos)
            lemma_total.append(counts.get(key,0))
            lemma_coverage.append("; ".join(w for w,c in work_counts.get(key,{}).items() if c))
        else:
            key=tuple(lemmas)
            lemma_total.append(phrase_counts.get(key,0))
            lemma_coverage.append("; ".join(w for w,c in phrase_work.get(key,{}).items() if c))
    vocab["Lemma/POS frequency (spaCy; corpus)"]=lemma_total
    vocab["Lemma/POS work coverage (spaCy; corpus)"]=lemma_coverage
    vocab["Frequency method"]="Lemma + UPOS count for single tokens; contiguous lemma sequence for multiword entries."
    vocab["Lemmatisation caveat"]="Automatic model output; inspect ambiguous, historical, poetic and homographic forms manually."
    vocab.to_csv(out/"Nietzsche_Vocabulary_Lemma_POS.csv",index=False,encoding="utf-8-sig")

    # Full lemma frequency table supports auditing independently of vocabulary headwords.
    rows=[]
    for (lemma,pos),count in counts.most_common():
        rows.append({"Lemma":lemma,"UPOS":pos,"Corpus token count":count,
                     "Works":"; ".join(w for w,c in work_counts[(lemma,pos)].items() if c),
                     "Number of works":sum(1 for c in work_counts[(lemma,pos)].values() if c)})
    pd.DataFrame(rows).to_csv(out/"Corpus_Lemma_POS_Frequencies.csv",index=False,encoding="utf-8-sig")
    print(f"Processed {len(vocab)} vocabulary entries. Outputs: {out}")

if __name__=="__main__":
    main()
