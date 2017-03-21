'use strict';

const processor = require('../src/analyzer/processor.js');
const ldf = require('../../Client.js/ldf-client.js');
ldf.Logger.setLevel('EMERGENCY');

const all = 'SELECT * WHERE { ?s ?p ?o . }';
const q1 = 'SELECT * WHERE { ?s <http://purl.org/dc/elements/1.1/creator> ?author . ?author <http://www.w3.org/2001/vcard-rdf/3.0#FN> ?fn . }';
const q2 = 'SELECT * WHERE { ?s <http://purl.org/dc/elements/1.1/creator> ?author . ?author <http://www.w3.org/2001/vcard-rdf/3.0#N> ?n . ?n <http://www.w3.org/2001/vcard-rdf/3.0#Family> ?fname . }';
const q3 = `PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT *
WHERE {
  {?city rdfs:label "Shoshone"@en.}
  UNION { ?alias <http://dbpedia.org/property/redirect> ?city;  rdfs:label "Shoshone"@en. }
  UNION { ?alias <http://dbpedia.org/property/disambiguates> ?city;  rdfs:label "Shoshone"@en. }
  OPTIONAL { ?city <http://dbpedia.org/ontology/abstract> ?abstract}
  OPTIONAL { ?city geo:lat ?latitude; geo:long ?longitude}
  OPTIONAL { ?city foaf:depiction ?image }
  OPTIONAL { ?city rdfs:label ?name }
  OPTIONAL { ?city foaf:homepage ?home }
  OPTIONAL { ?city <http://dbpedia.org/ontology/populationTotal> ?population }
  OPTIONAL { ?city <http://dbpedia.org/ontology/thumbnail> ?thumbnail }
  FILTER (langMatches( lang(?abstract), "fr"))}`;
// const q4 = 'PREFIX wikidata: <http://www.wikidata.org/prop/statement/> PREFIX wikiba: <http://wikiba.se/ontology#> SELECT * WHERE { ?s wikidata:P3222 ?p . }';
// const q5 = 'PREFIX wikidata: <http://www.wikidata.org/prop/statement/> PREFIX wikiba: <http://wikiba.se/ontology#> SELECT * WHERE { ?s wikidata:P3222 ?p . ?s wikiba:rank ?r . }';
// const q6 = 'PREFIX wikidata: <http://www.wikidata.org/prop/statement/> PREFIX wikiba: <http://wikiba.se/ontology#> SELECT * WHERE { ?s wikidata:P31 ?p . ?p <http://schema.org/description> ?d . }';
const q4 = 'PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX dbpedia-owl:<http://dbpedia.org/ontology/> PREFIX dbprop:<http://dbpedia.org/property/> SELECT * WHERE { ?s rdf:type dbpedia-owl:Architect . ?s dbprop:birthPlace ?place . }';
const q5 = 'SELECT * WHERE { ?s <http://dbpedia.org/property/newspaper> ?o .}';

const e1 = [ 'http://localhost:5000/books', 'http://localhost:5000/books' ];
// const e2 = [ 'http://fragments.mementodepot.org/dbpedia_3_9', 'http://curiosiphi.lina.sciences.univ-nantes.prive:5000/dbpedia_3_9' ];
const e2 = [ 'http://fragments.dbpedia.org/2016-04/en', 'http://fragments.dbpedia.org/2016-04/en' ];
const e3 = [ 'http://172.16.9.3:5000/dbpedia_3_9', 'http://172.16.9.3:5000/dbpedia_3_9' ];

const queryPlan = processor(q4, e2);
// console.log(JSON.stringify(queryPlan, false, 2));
const fragmentsClient = new ldf.FragmentsClient(e2[0], {});
// const op = new ldf.SparqlIterator(queryPlan, {
//   fragmentsClient,
//   virtualClients: {
//     'http://fragments.dbpedia.org/2016-04/en': new ldf.FragmentsClient('http://fragments.dbpedia.org/2016-04/en', {}),
//     // 'http://curiosiphi.lina.sciences.univ-nantes.prive:5000/dbpedia_3_9': new ldf.FragmentsClient('http://curiosiphi.lina.sciences.univ-nantes.prive:5000/dbpedia_3_9', {})
//   }
// });
const op = new ldf.SparqlIterator(queryPlan, {
  fragmentsClient,
  virtualClients: [
    new ldf.FragmentsClient(e2[0], {}),
    new ldf.FragmentsClient(e2[1], {})
  ]
});
let cpt = 0;
// op.on('data', () => cpt++);
op.on('data', x => console.log(JSON.stringify(x)));
