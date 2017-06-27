#  Quartz

Quartz is [Triple Pattern Fragment](https://github.com/LinkedDataFragments/Client.js) client that enables parallel SPARQL query processing over replicated Triple Pattern Fragments.

# Table of contents
* [Abstract](#abstract)
* [Installation](#installation)
* [Experiments](#experiments)
* [Command line usage](#command-line-usage)
* [Library usage](#library-usage)
* [Documentation](#documentation)
* [References](#references)

# Abstract

Although Linked Data datasets made available billions of
triples, data availability is still an issue. While replicating datasets over
different linked data providers improves data availability, balancing the
load of query processing across replicas has not been considered yet in
the context of Linked Data.

In the context of the Triple Pattern Fragment [1] (TPF) approach, we tackle the problem of query optimization under presence of replicated RDF data and propose a cost-based query
optimizer named **Quartz**, which is able to generate plans that minimize execution time while maximize load balancing. Quartz is able to exploit meta-data about TPFs to produce parallelized query execution
plans against replicated TPFs servers. Moreover, a cost model is utilized by the **Quartz** optimizer to estimate the computation capability
of replicated TPF servers. Experimentations demonstrate that **Quartz**
significantly improves not only execution time of SPARQL queries, but
also load-balancing between replicated TPF servers.

# Installation

**Requirements**: [Node.js](https://nodejs.org/en/) v6.x or higher

using npm
```bash
npm i --save quartz-tpf
```

using git
```bash
git clone htpps://github.com/Callidon/virtual-decomposer.git
cd virtual-decomposer/
npm i --production
```

in the browser
```html
<script src="node_modules/quartz-tpf/quartz-tpf.bundle.js" type="text/javascript" />
```

# Experiments

## Datasets and [queries](https://github.com/Callidon/quartz-tpf/blob/master/scripts/queriesWatDiv100)

We use one instance of the Waterloo SPARQL Diversity Test Suite (WatDiv) synthetic dataset[2,3] with 10^7 triples, encoded in the HDT[4] format.
We generate 50,000 queries from 500 templates.

Next, we eliminate all duplicated queries and then pick 100 random queries to be executed against our dataset. Generated queries are STAR, PATH and SNOWFLAKE shaped queries, all using the DISTINCT modifier.

Queries used during the experiments are available [here](https://github.com/Callidon/quartz-tpf/blob/master/scripts/queriesWatDiv100).

## Execution time


We compare the average execution time with the reference TPF client (TPF), TPF with PeNeLoop operator[5] (TPF+PeN), TPF with query optimization using virtual triple patterns (TPF+VTP) and the QUaRTz client itself.

* **Configuration using equivalent servers** ([PDF version](https://github.com/Callidon/quartz-tpf/blob/master/scripts/amazon/execution_time_eq.pdf)):
![execution time eq](https://raw.githubusercontent.com/Callidon/quartz-tpf/master/scripts/amazon/execution_time_eq.png)
* **Configuration using non equivalent servers** ([PDF version](https://github.com/Callidon/quartz-tpf/blob/master/scripts/amazon/execution_time_neq.pdf)):
![execution time neq](https://raw.githubusercontent.com/Callidon/quartz-tpf/master/scripts/amazon/execution_time_neq.png)

We also run experiments for the ten most expensive queries to evaluate, using 1, 2, 3 and 4 equivalents servers ([PDF version](https://github.com/Callidon/quartz-tpf/blob/master/scripts/amazon/top10_many_servers.pdf))
![execution time top10](https://raw.githubusercontent.com/Callidon/quartz-tpf/master/scripts/amazon/top10_many_servers.png)

## Load balancing

[PDF version](https://github.com/Callidon/quartz-tpf/blob/master/scripts/amazon/http_calls.pdf)

We compare the number of HTTP calls done to each server per query for TPF+PeN, TPF+VTP and QUaRTz, with both configurations (equivalent and non equivalent servers). We use two servers in each configuration.

* **Configuration using equivalent servers** ([PDF version](https://github.com/Callidon/quartz-tpf/blob/master/scripts/amazon/http_calls_eq.pdf)):
![load balancing eq](https://raw.githubusercontent.com/Callidon/quartz-tpf/master/scripts/amazon/http_calls_eq.png)
* **Configuration using non equivalent servers** ([PDF version](https://github.com/Callidon/quartz-tpf/blob/master/scripts/amazon/http_calls_neq.pdf)):
![load balancing neq](https://raw.githubusercontent.com/Callidon/quartz-tpf/master/scripts/amazon/http_calls_neq.png)

## Answer completeness

[PDF version](https://github.com/Callidon/quartz-tpf/blob/master/scripts/amazon/completeness.pdf)

We compare the answer completeness with TPF, TPF+PeN, TPF+VTP and QUaRTz, with both configurations (equivalent and non equivalent servers)

![answer completeness](https://raw.githubusercontent.com/Callidon/quartz-tpf/master/scripts/amazon/completeness.png)

## Wilcoxon ranking test

Results from all the Wilcoxon ranking tests[6] performed are available [here](https://github.com/Callidon/quartz-tpf/blob/master/scripts/amazon/wilcoxon.md).

# Command line usage

Quartz can be used through command line if installed globally with `npm i -g quartz-tpf`:
```
Usage: quartz <servers...> [options]

  execute a SPARQL query against several endpoints

  Options:

    -h, --help              output usage information
    -p, --peneloop          use peneloop to process joins
    -q, --query <query>     evaluates the given SPARQL query
    -f, --file <file>       evaluates the SPARQL query in the given file
    -l, --limit <limit>     limit the number of triples to localize per BGP in the query (default to 1)
    -t, --type <mime-type>  determines the MIME type of the output (e.g., application/json)
    -m, --measure <output>  measure the query execution time (in seconds) & append it to a file
    -s, --silent            do not perform any measurement (silent mode)
```

# Library usage

Quartz can also be used as a library
```javascript
'use strict';
const QuartzClient = require('quartz-tpf');

const query = `
  PREFIX dbo: <http://dbpedia.org/ontology/>
  SELECT ?actor ?city
  WHERE {
    ?actor a dbo:Actor.                      
    ?actor dbo:birthPlace ?city.
    ?city dbo:country dbpedia:United_States.
  } LIMIT 3000
`

// all the TPF servers must replicate the same version of the same dataset !
const servers = [
  'http://exampleA.fragments.org/dbpedia',
  'http://exampleB.fragments.org/dbpedia'
]

// provide any TPF servers to calibrate the cost model
const client = new QuartzClient(servers[0]);

client.execute(query, servers)
.then(mappings => console.log(mappings))
.catch(error => console.error(error));
```

See more details by generating the [documentation](#documentation).

# Documentation

Generate the documentation by running `npm run doc`.

# References

1. Verborgh, R., Vander Sande, M., Hartig, O., Van Herwegen, J., De Vocht, L.,
De Meester, B., Haesendonck, G., Colpaert, P.: [Triple pattern fragments: A low-cost knowledge graph interface for the web](https://biblio.ugent.be/publication/8050661/file/8050671.pdf). Web Semantics: Science, Services and Agents on the World Wide Web 37, 184–206 (2016)
2. Aluc, G., Hartig, O., Ozsu, M.T., Daudjee, K.: [Diversified stress testing of rdf data management systems.](http://olafhartig.de/files/AlucEtAl_ISWC14_Preprint.pdf) In: International Semantic Web Conference. pp. 197–212. Springer (2014)
3. Aluç, G., Ozsu, M., Daudjee, K., Hartig, O.: [chameleon-db: a workload-aware robust rdf data management system](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.636.9612&rep=rep1&type=pdf). University of waterloo. Tech. rep., Tech. Rep.
CS-2013-10 (2013)
4. Fernández, J.D., Martínez-Prieto, M.A., Gutiérrez, C., Polleres, A., Arias, M.: [Binary rdf representation for publication and exchange (hdt)](http://www.imap.websemanticsjournal.org/preprints/index.php/ps/article/viewFile/328/333). Web Semantics: Science, Services and Agents on the World Wide Web 19, 22–41 (2013)
5. Minier, T., Montoya, G., Skaf-Molli, H., Molli, P.: PeNeLoop: Parallelizing federated SPARQL queries in presence of replicated fragments. In: QuWeDa 2017: Querying the Web of Data at ESWC 2017, Portorož, Slovenia, May 28 - June 1, 2017 (2017)
6. Wilcoxon, F.: [Individual comparisons by ranking methods](http://hbanaszak.mjr.uw.edu.pl/TempTxt/Wilcoxon_1946_IndividualComparisonByRankingMethods.pdf). In: Breakthroughs in Statistics, pp. 196–202. Springer (1992)
