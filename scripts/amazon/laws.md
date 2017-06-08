Study of parallelized query and repartition law of dataset
===============

Here we study load balancing, in terms of number of HTTP calls per server, of our SPARQL queries by looking to the repartition law of each triple pattern in the graph.
We only consider load balancing of TPF with Quartz (**TQ**).

Queries with unbalanced load are likely to contains joins with triple patterns distributed using a non-uniform law.
However, if this triple pattern is a *virtual triple pattern*, i.e. the first triple pattern evaluated, this does not matter as Quartz will divide the set of matching triples in *equal* partitions.

**Note**: Keep in mind that partitions designed by Quartz are not of the same size: the last partition can be smaller or larger than the others, to easily maintain answer completeness.
This has an impact on the number of http calls to the last servers.

# Query 2
execution time: 9.325s with TPF / 7.226s with TQ / 7.113s with TQP

calls: 112@E1 39@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v1 ?v2 ?v4 WHERE {
  ?v0 <http://ogp.me/ns#title> ?v1 . DEFAULT
  ?v0 <http://schema.org/caption> ?v2 . DEFAULT
  ?v0 <http://schema.org/language> <http://db.uwaterloo.ca/~galuc/wsdbm/Language19> . (vtp) ZIPFIAN
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/hasGenre> ?v4 . UNIFORM
}
```

# Query 5
execution time: 5.889s with TPF / 3.859s with TQ / 3.834s with TQP

calls: 63@E1 31@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v1 ?v2 WHERE {
  ?v0 <http://schema.org/email> ?v1 . DEFAULT
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/gender> ?v2 . UNIFORM
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/subscribes> <http://db.uwaterloo.ca/~galuc/wsdbm/Website4970> . (vtp) UNIFORM
}
```

# Query 10
execution time: 224.102s with TPF / 112.699s with TQ / 111.81s with TQP

calls: 1069@E1 1094@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v2 ?v3 WHERE {
  ?v0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://db.uwaterloo.ca/~galuc/wsdbm/ProductCategory7> . (vtp) UNIFORM
  ?v0 <http://schema.org/caption> ?v2 . DEFAULT
  ?v0 <http://schema.org/contentRating> ?v3 .DEFAULT
}
```


# Query 12
execution time: 435.626s with TPF / 142.99s with TQ / 147.433s with TQP

calls: 1657@E1 1657@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v1 ?v2 ?v4 WHERE {
  ?v0 <http://ogp.me/ns#title> ?v1 . DEFAULT
  ?v0 <http://ogp.me/ns#title> ?v2 . DEFAULT
  ?v0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://db.uwaterloo.ca/~galuc/wsdbm/ProductCategory4> . (vtp) UNIFORM
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/hasGenre> ?v4 . NORMAL/UNIFORM
}
```

# Query 17
**load balancing deteriorated by a non uniform law**

execution time: 525.132s with TPF / 425.283s with TQ / 423.906s with TQP

calls: 3601@E1 5099@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v1 ?v2 ?v3 ?v4 ?v5 ?v7 ?v8 WHERE {
  ?v0 <http://xmlns.com/foaf/age> ?v1 . NORMAL
  ?v0 <http://xmlns.com/foaf/homepage> ?v2 . UNIFORM
  ?v3 <http://purl.org/goodrelations/price> ?v4 . DEFAULT
  ?v5 <http://ogp.me/ns#tag> <http://db.uwaterloo.ca/~galuc/wsdbm/Topic196> .(vtp) UNIFORM
  ?v5 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?v7 . UNIFORM
  ?v5 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?v7 . UNIFORM
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/makesPurchase> ?v3 . UNIFORM
  ?v3 <http://db.uwaterloo.ca/~galuc/wsdbm/purchaseDate> ?v8 . DEFAULT
  ?v3 <http://db.uwaterloo.ca/~galuc/wsdbm/purchaseFor> ?v5 . ZIPFIAN
}
```

# Query 21
execution time: 244.207s with TPF / 188.188 with TQ / 186.872s with TQP

calls: 5175@E1 3162@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v1 ?v2 ?v4 ?v5 ?v6 WHERE {
  ?v0 <http://xmlns.com/foaf/homepage> ?v1 . UNIFORM
  ?v0 <http://ogp.me/ns#tag> ?v2 . UNIFORM/NORMAL
  <http://db.uwaterloo.ca/~galuc/wsdbm/SubGenre114> <http://ogp.me/ns#tag> ?v2 . (vtp) UNIFORM
  ?v0 <http://schema.org/contentRating> ?v4 . DEFAULT
  ?v0 <http://schema.org/description> ?v5 . DEFAULT
  ?v0 <http://schema.org/text> ?v6 . DEFAULT
}
```

# Query 23
execution time: 432.274s with TPF / 150.928s with TQ / 147.182s with TQP

calls: 1687@E1 1685@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v1 ?v2 ?v4 WHERE {
  ?v0 <http://ogp.me/ns#title> ?v1 . DEFAULT
  ?v0 <http://ogp.me/ns#title> ?v2 . DEFAULT
  ?v0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://db.uwaterloo.ca/~galuc/wsdbm/ProductCategory6> . (vtp)
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/hasGenre> ?v4 . NORMAL/UNIFORM
}
```

# Query 43
**load balancing deteriorated by a non uniform law**

execution time: 49.046s with TPF / 26.519s with TQ / 26.062s with TQP

calls: 485@E1 220@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v1 ?v3 ?v4 ?v5 ?v6 ?v7 ?v8 ?v9 WHERE {
  ?v0 <http://purl.org/goodrelations/includes> ?v1 . UNIFORM
  <http://db.uwaterloo.ca/~galuc/wsdbm/Retailer1074> <http://purl.org/goodrelations/offers> ?v0 . (vtp) ZIPFIAN/NORMAL/UNIFORM
  ?v3 <http://purl.org/goodrelations/price> ?v4 . DEFAULT
  ?v3 <http://purl.org/goodrelations/price> ?v5 . DEFAULT
  ?v1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?v6 . UNIFORM
  ?v1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?v6 . UNIFORM
  ?v7 <http://purl.org/stuff/rev#reviewer> ?v8 . UNIFORM
  ?v1 <http://schema.org/editor> ?v8 . UNIFORM
  ?v3 <http://db.uwaterloo.ca/~galuc/wsdbm/purchaseDate> ?v9 . DEFAULT
  ?v3 <http://db.uwaterloo.ca/~galuc/wsdbm/purchaseFor> ?v1 . ZIPFIAN
}
```

# Query 45
execution time: 97.931s with TPF / 74.122s with TQ / 76.288s with TQP

calls: 746@E1 737@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v1 ?v2 WHERE {
  ?v0 <http://ogp.me/ns#tag> ?v1 . UNIFORM
  ?v0 <http://schema.org/caption> ?v2 . DEFAULT
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/hasGenre> <http://db.uwaterloo.ca/~galuc/wsdbm/SubGenre67> . (vtp) NORMAL
}
```

# Query 54
**load balancing deteriorated by a non uniform law**

execution time: 530.254s with TPF / 407.896s with TQ / 412.75s with TQP

calls: 3805@E1 4637@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v1 ?v2 ?v3 ?v4 ?v5 ?v7 ?v8 WHERE {
  ?v0 <http://xmlns.com/foaf/age> ?v1 . NORMAL
  ?v0 <http://xmlns.com/foaf/homepage> ?v2 . UNIFORM
  ?v3 <http://purl.org/goodrelations/price> ?v4 . DEFAULT
  ?v5 <http://ogp.me/ns#tag> <http://db.uwaterloo.ca/~galuc/wsdbm/Topic241> . (vtp) UNIFORM
  ?v5 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?v7 . UNIFORM
  ?v5 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?v7 . UNIFORM
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/makesPurchase> ?v3 . UNIFORM
  ?v3 <http://db.uwaterloo.ca/~galuc/wsdbm/purchaseDate> ?v8 . DEFAULT
  ?v3 <http://db.uwaterloo.ca/~galuc/wsdbm/purchaseFor> ?v5 . ZIPFIAN
}
```

# Query 55
**load balancing deteriorated by a non uniform law**

execution time: 326.946s with TPF / 212.816s with TQ / 214.365s with TQP

calls: 4245@E1 2183@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v1 ?v3 ?v4 ?v5 ?v6 WHERE {
  ?v0 <http://ogp.me/ns#tag> ?v1 . UNIFORM
  ?v0 <http://ogp.me/ns#tag> ?v1 . UNIFORM
  <http://db.uwaterloo.ca/~galuc/wsdbm/SubGenre96> <http://ogp.me/ns#tag> ?v1 . (vtp)
  ?v0 <http://ogp.me/ns#title> ?v3 . DEFAULT
  ?v0 <http://schema.org/contentRating> ?v4 . DEFAULT
  ?v0 <http://schema.org/keywords> ?v5 . DEFAULT
  ?v6 <http://db.uwaterloo.ca/~galuc/wsdbm/purchaseFor> ?v0 . ZIPFIAN
}
```

# Query 58
**load balancing deteriorated by a non uniform law**

execution time: 8.578s with TPF / 5.28s with TQ / 5.278s with TQP

calls: 76@E1 39@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v2 ?v3 WHERE {
  ?v0 <http://purl.org/dc/terms/Location> <http://db.uwaterloo.ca/~galuc/wsdbm/City109> . (vtp)
  ?v0 <http://schema.org/jobTitle> ?v2 . DEFAULT
  ?v0 <http://schema.org/nationality> ?v3 . ZIPFIAN
}
```

# Query 59
execution time: 214.716s with TPF / 108.155s with TQ / 108.583s with TQP

calls: 1051@E1 1051@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v2 ?v3 WHERE {
  ?v0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://db.uwaterloo.ca/~galuc/wsdbm/ProductCategory12> . (vtp)
  ?v0 <http://schema.org/caption> ?v2 . DEFAULT
  ?v0 <http://schema.org/contentRating> ?v3 . DEFAULT
}
```

# Query 60
execution time: 2.027s with TPF / 1.728s with TQ / 1.774s with TQP

calls: 11@E1 6@E2 with TQ

query:
```
SELECT DISTINCT ?v1 ?v2 ?v3 WHERE {
  <http://db.uwaterloo.ca/~galuc/wsdbm/User12412> <http://db.uwaterloo.ca/~galuc/wsdbm/makesPurchase> ?v1 . (vtp)
  ?v1 <http://db.uwaterloo.ca/~galuc/wsdbm/purchaseDate> ?v2 . DEFAULT
  ?v1 <http://db.uwaterloo.ca/~galuc/wsdbm/purchaseDate> ?v3 . DEFAULT
}
```

# Query 63
**load balancing deteriorated by a non uniform law**

execution time: 104.003s with TPF / 101.139s with TQ / 102.453s with TQP

calls: 357@E1 32@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v2 ?v3 ?v4 ?v5 ?v6 ?v7 ?v8 WHERE {
  ?v0 <http://purl.org/dc/terms/Location> <http://db.uwaterloo.ca/~galuc/wsdbm/City239> . (vtp)
  ?v2 <http://ogp.me/ns#tag> ?v3 . UNIFORM
  ?v2 <http://ogp.me/ns#tag> ?v3 . UNIFORM
  ?v4 <http://ogp.me/ns#tag> ?v3 . UNIFORM
  ?v2 <http://schema.org/description> ?v5 . DEFAULT
  ?v0 <http://schema.org/email> ?v6 . DEFAULT
  ?v2 <http://schema.org/keywords> ?v7 . DEFAULT
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/gender> ?v8 . UNIFORM
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/likes> ?v2 . ZIPFIAN
}
```

# Query 65
**load balancing deteriorated by a non uniform law**

execution time: 2.411s with TPF / 2.383s with TQ / 2.42s with TQP

calls: 10@E1 2@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v2 ?v3 ?v4 ?v5 WHERE {
  ?v0 <http://xmlns.com/foaf/homepage> <http://db.uwaterloo.ca/~galuc/wsdbm/Website2357> . (vtp)
  ?v2 <http://purl.org/goodrelations/includes> ?v0 . UNIFORM
  ?v0 <http://ogp.me/ns#title> ?v3 . DEFAULT
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/hasGenre> ?v4 . NORMAL
  ?v5 <http://db.uwaterloo.ca/~galuc/wsdbm/likes> ?v0 . ZIPFIAN
}
```

# Query 69
**load balancing deteriorated by a non uniform law**

execution time: 7.143s with TPF / 7.173s with TQ / 6.216s with TQP

calls: 82@E1 27@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v1 ?v2 ?v4 WHERE {
  ?v0 <http://ogp.me/ns#title> ?v1 . DEFAULT
  ?v0 <http://schema.org/caption> ?v2 . DEFAULT
  ?v0 <http://schema.org/language> <http://db.uwaterloo.ca/~galuc/wsdbm/Language28> . (vtp)
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/hasGenre> ?v4 . NORMAL
}
```

# Query 70
**load balancing deteriorated by a non uniform law**

execution time: 161.259 with TPF / 155.693 with TQ / 128.463s with TQP

calls: 798@E1 1372@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v1 ?v10 ?v11 ?v2 ?v4 ?v5 ?v6 ?v7 ?v8 ?v9 WHERE {
  ?v0 <http://purl.org/goodrelations/includes> ?v1 . UNIFORM
  ?v2 <http://purl.org/goodrelations/offers> ?v0 . ZIPFIAN/NORMAL/UNIFORM
  ?v2 <http://purl.org/goodrelations/offers> ?v0 . ZIPFIAN/NORMAL/UNIFORM
  ?v1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://db.uwaterloo.ca/~galuc/wsdbm/ProductCategory4> . (vtp)
  ?v2 <http://schema.org/aggregateRating> ?v4 . DEFAULT
  ?v2 <http://schema.org/aggregateRating> ?v5 . DEFAULT
  ?v2 <http://schema.org/contactPoint> ?v6 . UNIFORM
  ?v2 <http://schema.org/email> ?v7 . DEFAULT
  ?v2 <http://schema.org/email> ?v8 . DEFAULT
  ?v2 <http://schema.org/faxNumber> ?v9 . DEFAULT
  ?v2 <http://schema.org/legalName> ?v10 . DEFAULT
  ?v2 <http://schema.org/paymentAccepted> ?v11 . DEFAULT
}
```

# Query 77
**load balancing deteriorated by a non uniform law**

execution time: 172.29s with TPF / 170.173s with TQ / 164.95s with TQP

calls: 3971@E1 1986@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v1 ?v2 ?v4 ?v5 ?v6 WHERE {
  ?v0 <http://xmlns.com/foaf/homepage> ?v1 . UNIFORM
  ?v0 <http://ogp.me/ns#tag> ?v2 . UNIFORM/NORMAL
  <http://db.uwaterloo.ca/~galuc/wsdbm/SubGenre98> <http://ogp.me/ns#tag> ?v2 . (vtp)
  ?v0 <http://schema.org/contentRating> ?v4 . DEFAULT
  ?v0 <http://schema.org/description> ?v5 . DEFAULT
  ?v0 <http://schema.org/text> ?v6 . DEFAULT
}
```

# Query 78
execution time: 419.188s with TPF / 468.265s with TQ / 232.645s with TQP

calls: 2010@E1 2044@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v1 ?v2 ?v3 ?v5 WHERE {
  ?v0 <http://xmlns.com/foaf/homepage> ?v1 . UNIFORM
  ?v2 <http://purl.org/goodrelations/includes> ?v0 . UNIFORM
  ?v0 <http://ogp.me/ns#tag> ?v3 . UNIFORM/NORMAL
  ?v0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://db.uwaterloo.ca/~galuc/wsdbm/ProductCategory12> . (vtp)
  ?v0 <http://schema.org/description> ?v5 . DEFAULT
}
```

# Query 80
**load balancing deteriorated by a non uniform law**

execution time: 138.384s with TPF / 127.702s with TQ / 96.636s with TQP

calls: 623@E1 872@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v2 ?v3 ?v4 ?v5 ?v6 WHERE {
  ?v0 <http://ogp.me/ns#tag> <http://db.uwaterloo.ca/~galuc/wsdbm/Topic31> . (vtp)
  ?v2 <http://schema.org/contentSize> ?v3 . DEFAULT
  ?v2 <http://schema.org/text> ?v4 . DEFAULT
  ?v2 <http://schema.org/text> ?v5 . DEFAULT
  ?v2 <http://db.uwaterloo.ca/~galuc/wsdbm/hasGenre> ?v0 . NORMAL
  ?v6 <http://db.uwaterloo.ca/~galuc/wsdbm/likes> ?v2 . ZIPFIAN/UNIFORM
}
```

# Query 83
**load balancing deteriorated by a non uniform law**

execution time: 45.785s with TPF / 48.917s with TQ / 44.696s with TQP

calls: 199@E1 136@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v2 ?v3 ?v4 ?v5 ?v6 ?v7 ?v8 WHERE {
  ?v0 <http://purl.org/dc/terms/Location> <http://db.uwaterloo.ca/~galuc/wsdbm/City227> . (vtp)
  ?v2 <http://ogp.me/ns#tag> ?v3 . UNIFORM
  ?v2 <http://ogp.me/ns#tag> ?v3 . UNIFORM
  ?v4 <http://ogp.me/ns#tag> ?v3 . UNIFORM
  ?v2 <http://schema.org/description> ?v5 . DEFAULT
  ?v0 <http://schema.org/email> ?v6 . DEFAULT
  ?v2 <http://schema.org/keywords> ?v7 . DEFAULT
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/gender> ?v8 . UNIFORM
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/likes> ?v2 . ZIPFIAN/UNIFORM
}
```

# Query 87
**load balancing deteriorated by a non uniform law**

execution time: 8.193s with TPF / 7.612s with TQ / 5.373s with TQP

calls: 70@E1 35@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v1 ?v2 ?v3 ?v4 ?v6 WHERE {
  ?v0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?v1 . ZIPFIAN
  ?v0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?v1 . ZIPFIAN
  ?v0 <http://schema.org/telephone> ?v2 . DEFAULT
  ?v0 <http://schema.org/telephone> ?v3 . DEFAULT
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/gender> ?v4 . UNIFORM
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/gender> ?v4 . UNIFORM
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/subscribes> <http://db.uwaterloo.ca/~galuc/wsdbm/Website2705> . (vtp)
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/userId> ?v6 . DEFAULT
}
```

# Query 90
**load balancing deteriorated by a non uniform law**

execution time: 594.608s with TPF / 625.957s with TQ / 417.236s with TQP

calls: 7058@E1 5837@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v1 ?v2 ?v3 WHERE {
  ?v0 <http://purl.org/goodrelations/includes> ?v1 . UNIFORM
  ?v2 <http://purl.org/goodrelations/offers> ?v0 . ZIPFIAN/NORMAL/UNIFORM
  ?v1 <http://schema.org/contentSize> ?v3 . DEFAULT
  ?v0 <http://schema.org/eligibleRegion> <http://db.uwaterloo.ca/~galuc/wsdbm/Country21> . (vtp)
}
```

# Query 91
**load balancing deteriorated by a non uniform law**

execution time: 551.971s with TPF / 550.136s with TQ / 293.518s with TQP

calls: 1150@E1 952@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v2 ?v3 ?v4 ?v5 ?v6 ?v7 ?v8 WHERE {
  ?v0 <http://purl.org/dc/terms/Location> <http://db.uwaterloo.ca/~galuc/wsdbm/City33> . (vtp)
  ?v2 <http://ogp.me/ns#tag> ?v3 . UNIFORM
  ?v2 <http://ogp.me/ns#tag> ?v3 . UNIFORM
  ?v4 <http://ogp.me/ns#tag> ?v3 . UNIFORM
  ?v2 <http://schema.org/description> ?v5 . DEFAULT
  ?v0 <http://schema.org/email> ?v6 . DEFAULT
  ?v2 <http://schema.org/keywords> ?v7 . DEFAULT
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/gender> ?v8 . UNIFORM
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/likes> ?v2 . ZIPFIAN/UNIFORM
}
```

# Query 92
**load balancing deteriorated by a non uniform law**

execution time: 148.103s with TPF / 131.544s with TQ / 106.757s with TQP

calls: 613@E1 888@E2 with TQ

query:
```
SELECT DISTINCT ?v0 ?v2 ?v3 ?v4 ?v5 ?v6 WHERE {
  ?v0 <http://ogp.me/ns#tag> <http://db.uwaterloo.ca/~galuc/wsdbm/Topic151> . (vtp)
  ?v2 <http://schema.org/contentSize> ?v3 . DEFAULT
  ?v2 <http://schema.org/text> ?v4 . DEFAULT
  ?v2 <http://schema.org/text> ?v5 . DEFAULT
  ?v2 <http://db.uwaterloo.ca/~galuc/wsdbm/hasGenre> ?v0 . UNIFORM
  ?v6 <http://db.uwaterloo.ca/~galuc/wsdbm/likes> ?v2 .  ZIPFIAN/UNIFORM
}
```
