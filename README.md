# CarePath WEB
Parte web per interagire con CarePath-API

## Installazione
### Configurare URL API
Aprire ```main.js``` e modificare ```const apiUrl = "http://localhost:5000";``` col proprio URL dell'API
### Se si esegue in localhost
Eseguendo questa web app in localhost si andrà sempre in contro al problema delle CORS bloccate dal browser. Questo è risolvibile utilizzando Google Chrome e disattivando la web security. Per fare ciò semplicemente creare un collegamento a Google Chrome coi parametri ```--disable-web-security --disable-gpu --user-data-dir=~/chromeTemp```, ed eseguirlo come amministratore
