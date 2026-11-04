import json,sys
V=[("അ","a","അമ്മ ammā"),("ആ","ā","ആന āna"),("ഇ","i","ഇല ila"),("ഈ","ī","ഈച്ച īcca"),("ഉ","u","ഉപ്പ് uppŭ"),("ഊ","ū","ഊഞ്ഞാൽ ūññāl"),("ഋ","r̥","ഋഷി r̥ṣi"),
   ("എ","e","എലി eli"),("ഏ","ē","ഏണി ēṇi"),("ഐ","ai","ഐക്യം aikyaṁ"),("ഒ","o","ഒട്ടകം oṭṭakaṁ"),("ഓ","ō","ഓണം ōṇaṁ"),("ഔ","au","ഔഷധം auṣadhaṁ")]
C=[[("ക","ka","കടൽ kaṭal"),("ഖ","kha","ഖനി khani"),("ഗ","ga","ഗുഹ guha"),("ഘ","gha","ഘടികാരം ghaṭikāraṁ"),("ങ","ṅa","മാങ്ങ māṅṅa")],
   [("ച","ca","ചക്ക cakka"),("ഛ","cha","ഛായ chāya"),("ജ","ja","ജനൽ janal"),("ഝ","jha",""),("ഞ","ña","ഞണ്ട് ñaṇṭŭ")],
   [("ട","ṭa","പട്ടം paṭṭaṁ"),("ഠ","ṭha","കഠിനം kaṭhinaṁ"),("ഡ","ḍa","ഡോക്ടർ ḍōkṭar"),("ഢ","ḍha",""),("ണ","ṇa","പണം paṇaṁ")],
   [("ത","ta","തല tala"),("ഥ","tha","കഥ katha"),("ദ","da","ദൈവം daivaṁ"),("ധ","dha","ധനം dhanaṁ"),("ന","na","നദി nadi")],
   [("പ","pa","പൂവ് pūvŭ"),("ഫ","pha","ഫലം phalaṁ"),("ബ","ba","ബസ് bas"),("ഭ","bha","ഭാഷ bhāṣa"),("മ","ma","മരം maraṁ")],
   [("യ","ya","യാത്ര yātra"),("ര","ra","രാജാവ് rājāvŭ"),("ല","la","ലോകം lōkaṁ"),("വ","va","വീട് vīṭŭ")],
   [("ശ","śa","ശബ്ദം śabdaṁ"),("ഷ","ṣa","ഷർട്ട് ṣarṭṭŭ"),("സ","sa","സമയം samayaṁ"),("ഹ","ha","ഹൃദയം hr̥dayaṁ")],
   [("ള","ḷa","വെള്ളം veḷḷaṁ"),("ഴ","ḻa / zha","മഴ maḻa"),("റ","ṟa","കറി kaṟi")]]
S=[[("കാ","kā",""),("കി","ki",""),("കീ","kī",""),("കു","ku",""),("കൂ","kū",""),("കൃ","kr̥","")],
   [("കെ","ke",""),("കേ","kē",""),("കൈ","kai",""),("കൊ","ko",""),("കോ","kō",""),("കൗ","kau","")],
   [("ക്","k","ഉപ്പ് uppŭ"),("കം","kaṁ","മരം maraṁ"),("കഃ","kaḥ","ദുഃഖം duḥkhaṁ")]]
CH=[[("ൺ","ṇ","കൺ kaṇ"),("ൻ","n","അവൻ avan"),("ർ","r","അവർ avar"),("ൽ","l","കടൽ kaṭal"),("ൾ","ḷ","അവൾ avaḷ")]]
K=[[("ക്ക","kka","ചക്ക cakka"),("ങ്ങ","ṅṅa","മാങ്ങ māṅṅa"),("ച്ച","cca","പൂച്ച pūcca"),("ഞ്ഞ","ñña","മഞ്ഞ mañña"),("ട്ട","ṭṭa","പട്ടം paṭṭaṁ"),("ണ്ണ","ṇṇa","കണ്ണ് kaṇṇŭ")],
   [("ത്ത","tta","പത്ത് pattŭ"),("ന്ന","nna","ഒന്ന് onnŭ"),("പ്പ","ppa","ഉപ്പ് uppŭ"),("മ്മ","mma","അമ്മ ammā"),("ല്ല","lla","ഇല്ല illa"),("ള്ള","ḷḷa","വെള്ളം veḷḷaṁ")],
   [("റ്റ","ṯṯa","കാറ്റ് kāṯṯŭ"),("ന്റ","nṯa","എന്റെ enṯe"),("ങ്ക","ṅka","അങ്കം aṅkaṁ"),("ഞ്ച","ñca","അഞ്ച് añcŭ"),("ണ്ട","ṇṭa","രണ്ട് raṇṭŭ"),("ന്ത","nta","ചന്ത canta")],
   [("മ്പ","mpa","പാമ്പ് pāmpŭ"),("ന്ദ","nda","ആനന്ദം ānandaṁ"),("ക്ഷ","kṣa","പക്ഷി pakṣi"),("ജ്ഞ","jña","ജ്ഞാനം jñānaṁ"),("സ്ത","sta","പുസ്തകം pustakaṁ"),("ത്ര","tra","യാത്ര yātra")],
   [("ദ്യ","dya","വിദ്യ vidya"),("ക്ര","kra","ക്രമം kramaṁ"),("സ്വ","sva","സ്വരം svaraṁ")]]
def sec(items):
    return {"title":" ".join(t for t,_,_ in items),"subtitle":" ".join(m.split(" / ")[0] for _,m,_ in items),
            "entries":[dict(term=t,meaning=m,**({"note":n} if n else {})) for t,m,n in items]}
def chunks(xs,n): return [xs[i:i+n] for i in range(0,len(xs),n)]
book={"book":{"title":"Malayalam letters","credit":"Written for Luma's Malayalam course (docs/language-courses.md)"},
 "lessons":[
  {"title":"സ്വരങ്ങൾ","subtitle":"svaraṅṅaḷ","sections":[sec(x) for x in [V[:7],V[7:]]]},
  {"title":"വ്യഞ്ജനങ്ങൾ","subtitle":"vyañjanaṅṅaḷ","sections":[sec(x) for x in C]},
  {"title":"സ്വരചിഹ്നങ്ങൾ","subtitle":"svaracihnaṅṅaḷ","sections":[sec(x) for x in S]},
  {"title":"ചില്ലക്ഷരങ്ങൾ","subtitle":"cillakṣaraṅṅaḷ","sections":[sec(x) for x in CH]},
  {"title":"കൂട്ടക്ഷരങ്ങൾ","subtitle":"kūṭṭakṣaraṅṅaḷ","sections":[sec(x) for x in K]}]}
n=sum(len(s["entries"]) for l in book["lessons"] for s in l["sections"])
json.dump(book,open(sys.argv[1],'w'),ensure_ascii=False,indent=1)
print(n,"letters")
