export const POLIZEIREVIERE = [
  // Stuttgart
  { id: 'pr-stuttgart-mitte', name: 'Polizeirevier Stuttgart-Mitte', praesidium: 'Stuttgart', lat: 48.7758, lng: 9.1829, adresse: 'Theodor-Heuss-Straße 11, 70174 Stuttgart', tel: '0711 8990-3100' },
  { id: 'pr-stuttgart-west', name: 'Polizeirevier Stuttgart-West', praesidium: 'Stuttgart', lat: 48.7700, lng: 9.1539, adresse: 'Gutenbergstraße 109/111, 70197 Stuttgart', tel: '0711 8990-3300' },
  { id: 'pr-stuttgart-nord', name: 'Polizeirevier Stuttgart-Nord', praesidium: 'Stuttgart', lat: 48.7922, lng: 9.1830, adresse: 'Wolframstraße 36, 70191 Stuttgart', tel: '0711 8990-3200' },
  { id: 'pr-stuttgart-ost', name: 'Polizeirevier Stuttgart-Ost', praesidium: 'Stuttgart', lat: 48.7837, lng: 9.2079, adresse: 'Ostendstraße 88, 70188 Stuttgart', tel: '0711 8990-3500' },
  { id: 'pr-stuttgart-sued', name: 'Polizeirevier Stuttgart-Süd', praesidium: 'Stuttgart', lat: 48.7299, lng: 9.1427, adresse: 'Balinger Straße 31, 70567 Stuttgart', tel: '0711 8990-3400' },
  
  // Karlsruhe
  { id: 'pr-karlsruhe-marktplatz', name: 'Polizeirevier Karlsruhe-Marktplatz', praesidium: 'Karlsruhe', lat: 49.0078, lng: 8.4040, adresse: 'Karl-Friedrich-Straße 15, 76133 Karlsruhe', tel: '0721 666-3311' },
  { id: 'pr-karlsruhe-west', name: 'Polizeirevier Karlsruhe-West', praesidium: 'Karlsruhe', lat: 49.0151, lng: 8.3757, adresse: 'Moltkestraße 68, 76133 Karlsruhe', tel: '0721 666-3611' },
  { id: 'pr-karlsruhe-durlach', name: 'Polizeirevier Karlsruhe-Durlach', praesidium: 'Karlsruhe', lat: 48.9983, lng: 8.4715, adresse: 'Amthausstraße 11-13, 76227 Karlsruhe', tel: '0721 4907-0' },
  
  // Mannheim
  { id: 'pr-mannheim-innenstadt', name: 'Polizeirevier Mannheim-Innenstadt', praesidium: 'Mannheim', lat: 49.4910, lng: 8.4656, adresse: 'H4 1, 68159 Mannheim', tel: '0621 1258-0' },
  { id: 'pr-mannheim-oststadt', name: 'Polizeirevier Mannheim-Oststadt', praesidium: 'Mannheim', lat: 49.4832, lng: 8.4671, adresse: 'L6 1, 68161 Mannheim', tel: '0621 174-3310' },
  
  // Freiburg
  { id: 'pr-freiburg-nord', name: 'Polizeirevier Freiburg-Nord', praesidium: 'Freiburg', lat: 47.9962, lng: 7.8454, adresse: 'Bertoldstraße 43a, 79098 Freiburg', tel: '0761 882-4221' },
  { id: 'pr-freiburg-sued', name: 'Polizeirevier Freiburg-Süd', praesidium: 'Freiburg', lat: 47.9876, lng: 7.8364, adresse: 'Heinrich-von-Stephan-Straße 4, 79100 Freiburg', tel: '0761 882-0' },
  
  // Weitere wichtige Städte
  { id: 'pr-heidelberg-mitte', name: 'Polizeirevier Heidelberg-Mitte', praesidium: 'Mannheim', lat: 49.4065, lng: 8.6930, adresse: 'Römerstraße 2-4, 69115 Heidelberg', tel: '06221 1857-0' },
  { id: 'pr-heilbronn', name: 'Polizeirevier Heilbronn', praesidium: 'Heilbronn', lat: 49.1234, lng: 9.2213, adresse: 'John-F.-Kennedy-Straße 14, 74074 Heilbronn', tel: '07131 7479-0' },
  { id: 'pr-ulm-mitte', name: 'Polizeirevier Ulm-Mitte', praesidium: 'Ulm', lat: 48.3976, lng: 9.9916, adresse: 'Münsterplatz 47, 89073 Ulm', tel: '0731 188-0' },
  { id: 'pr-reutlingen', name: 'Polizeirevier Reutlingen', praesidium: 'Reutlingen', lat: 48.4906, lng: 9.2213, adresse: 'Burgstraße 27-29, 72764 Reutlingen', tel: '07121 942-3333' },
  { id: 'pr-pforzheim-nord', name: 'Polizeirevier Pforzheim-Nord', praesidium: 'Pforzheim', lat: 48.8931, lng: 8.7009, adresse: 'Bahnhofstraße 13, 75172 Pforzheim', tel: '07231 186-3211' },
]

export const PRAESIDIEN = [...new Set(POLIZEIREVIERE.map(r => r.praesidium))].sort() 