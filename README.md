#  virtual-decomposer
[![Build Status](https://travis-ci.org/Callidon/virtual-decomposer.svg?branch=master)](https://travis-ci.org/Callidon/virtual-decomposer)

# Installation
```bash
git clone htpps://github.com/Callidon/virtual-decomposer.git
cd virtual-decomposer/
npm install --production
```

# Usage

Execute the script `tpf-client.js` located in `bin/`
```
Usage: tpf-client [options] [command]


  Commands:

    model [endpoints...]                  generate the cost model & save it in json format
    run [model] [endpoints...] [options]  execute a SPARQL query against several endpoints
    help [cmd]                            display help for [cmd]

  virtual-decomposer

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

## Generate a cost-model

```
Usage: tpf-client model [endpoints...] [options]

  generate the cost model & save it in json format

  Options:

    -h, --help             output usage information
    -o, --output <output>  save the model in the given file (default: model.json)
```
Example:
```bash
bin/tpf-client.js model http://example.fragments.server1/dbpedia_3.9 http://example.fragments.server2/dbpedia_3.9 -o model.json
```

## Run a query

```
Usage: tpf-client run [endpoints...] [options]

  execute a SPARQL query against several endpoints

  Options:

    -h, --help              output usage information
    -q, --query <query>     evaluates the given SPARQL query
    -f, --file <file>       evaluates the SPARQL query in the given file
    -l, --limit <limit>     limit the number of triples to localize per BGP in the query (default to 1)
    -t, --type <mime-type>  determines the MIME type of the output (e.g., application/json)
```

Example:
```bash
bin/tpf-client.js run ./model.json http://example.fragments.server1/dbpedia_3.9 http://example.fragments.server2/dbpedia_3.9 -q 'SELECT * WHERE { ?s rdf:type ?o . }'
```
