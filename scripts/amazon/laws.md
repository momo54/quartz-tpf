Study of parallelized query and repartition law of dataset
===============

Here we study load balancing of our SPARQL queries by looking the repartition law of each triple pattern in the graph.
We only consider load balancing of TPF with Quartz (**TQ**).

Queries with unbalanced load are likely to contains joins with triple patterns distributed using a non-uniform law.
However, if this triple pattern is a *virtual triple pattern*, i.e. the first triple pattern evaluated, this does not matter as Quartz will divide the set of matching triples in *semi-equal* partitions.

**Note**: Keep in mind that partitions designed by Quartz are not of the same size, i.e. the last partition can be smaller or larger than the others, to easily maintain answer completeness.
This has an impact on the number of http calls to the last servers.

# Query 2
calls: 112@E1 39@E2

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
calls: 63@E1 31@E2

query:
```
SELECT DISTINCT ?v0 ?v1 ?v2 WHERE {
  ?v0 <http://schema.org/email> ?v1 . DEFAULT
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/gender> ?v2 . UNIFORM
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/subscribes> <http://db.uwaterloo.ca/~galuc/wsdbm/Website4970> . (vtp) UNIFORM
}
```

# Query 10
calls: 1069@E1 1094@E2

query:
```
SELECT DISTINCT ?v0 ?v2 ?v3 WHERE {
  ?v0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://db.uwaterloo.ca/~galuc/wsdbm/ProductCategory7> . (vtp) UNIFORM
  ?v0 <http://schema.org/caption> ?v2 . DEFAULT
  ?v0 <http://schema.org/contentRating> ?v3 .DEFAULT
}
```


# Query 12
calls: 1657@E1 1657@E2

query:
```
SELECT DISTINCT ?v0 ?v1 ?v2 ?v4 WHERE {
  ?v0 <http://ogp.me/ns#title> ?v1 . DEFAULT
  ?v0 <http://ogp.me/ns#title> ?v2 . DEFAULT
  ?v0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://db.uwaterloo.ca/~galuc/wsdbm/ProductCategory4> . (vtp) UNIFORM
  ?v0 <http://db.uwaterloo.ca/~galuc/wsdbm/hasGenre> ?v4 . NORMAL
}
```

# Query 17
**load balancing deteriorated by a non uniform law**

calls: 3601@E1 5099@E2

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
calls: 5175@E1 3162@E2

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
calls: 1687@E1 1685@E2

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

calls: 485@E1 220@E2

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
calls: 746@E1 737@E2

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

calls: 3805@E1 4637@E2

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

calls: 4245@E1 2183@E2

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

calls: 76@E1 39@E2

query:
```
SELECT DISTINCT ?v0 ?v2 ?v3 WHERE {
  ?v0 <http://purl.org/dc/terms/Location> <http://db.uwaterloo.ca/~galuc/wsdbm/City109> . (vtp)
  ?v0 <http://schema.org/jobTitle> ?v2 . DEFAULT
  ?v0 <http://schema.org/nationality> ?v3 . ZIPFIAN
}
```

# Query 59
calls: 1051@E1 1051@E2

query:
```
SELECT DISTINCT ?v0 ?v2 ?v3 WHERE {
  ?v0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://db.uwaterloo.ca/~galuc/wsdbm/ProductCategory12> . (vtp)
  ?v0 <http://schema.org/caption> ?v2 . DEFAULT
  ?v0 <http://schema.org/contentRating> ?v3 . DEFAULT
}
```

# Query 60
calls: 11@E1 6@E2

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

calls: 357@E1 32@E2

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

calls: 10@E1 2@E2

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

calls: 82@E1 27@E2

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

calls: 798@E1 1372@E2

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

calls: 3971@E1 1986@E2

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
calls: 2010@E1 2044@E2

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

calls: 623@E1 872@E2

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

calls: 199@E1 136@E2

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

calls: 70@E1 35@E2

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

calls: 7058@E1 5837@E2

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

calls: 1150@E1 952@E2

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

calls: 613@E1 888@E2

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
