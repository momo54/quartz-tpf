#  virtual-decomposer
[![Build Status](https://travis-ci.org/Callidon/tpf-client-light.svg?branch=master)](https://travis-ci.org/Callidon/tpf-client-light)

# Installation
```bash
git clone htpps://github.com/Callidon/virtual-decomposer.git
cd virtual-decomposer/
npm install
```

# Usage

Execute the script `tpf-client.js` located in `bin/`
```
Usage: tpf-client [options] [endpoints...]

  virtual-decomposer

  Options:

    -h, --help              output usage information
    -V, --version           output the version number
    -q, --query <query>     evaluates the given SPARQL query
    -f, --file <file>       evaluates the SPARQL query in the given file
    -t, --type <mime-type>  determines the MIME type of the output (e.g., application/json)
```

Example:
```bash
bin/tpf-client.js -q 'SELECT * WHERE { ?s rdf:type ?o . }' http://example.fragments.server1/dbpedia_3.9 http://example.fragments.server2/dbpedia_3.9
```
