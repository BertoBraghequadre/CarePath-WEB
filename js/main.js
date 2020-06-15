( function () {   // IIFE
  const map = L.map('mappa').setView([40.8462749, 14.1975387], 12.25);
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZ2FldGFub2lwcG9saXRvIiwiYSI6ImNrYXU1aDFuNjEwbG4ycG81Mjhucm40YzcifQ.FtK7hANUJfhmVSyvmA5y7g'
  }).addTo(map);

  let indirizzi = null;
  const apiUrl = "http://localhost:5000";
  /*const templateRiga = document.getElementById("template-riga");   // prendiamo il template, lo aggiungiamo in una variabile
  templateRiga.parentNode.removeChild(templateRiga);                         // e lo eliminiamo.
  const tabella = document.getElementById("tabella-risultati");
  const risultatiRicerca = document.getElementById('risultati-ricerca');
  const testoRisultati = document.getElementById('testo-risultati');

  function clonaTemplate(template){
    let tempTemplate = document.createElement("template");
    tempTemplate.innerHTML = template.innerHTML.trim();
    return tempTemplate.content.firstChild;
  }

  function inserisciRiga(indirizzo, nomeLocale) {
    const riga = clonaTemplate(templateRiga);
    riga.innerHTML = riga.innerHTML.replace("{indirizzo}", indirizzo);
    riga.innerHTML = riga.innerHTML.replace("{locale}", nomeLocale);

    tabella.appendChild(riga);
  }

  function pulisciRisultati() {
    const righe = tabella.querySelectorAll("tr:not(#tabella-intestazione)");

    for(let riga of righe){
      riga.parentNode.removeChild(riga);
    }
  }

  function aggiornaRisultati(data) {
    pulisciRisultati();

    const numeroRisultati = data.length;
    risultatiRicerca.style.display = '';
    testoRisultati.innerText = "Segnalazioni trovate: " + numeroRisultati;
    testoRisultati.style.display = '';
    tabella.style.display = (numeroRisultati > 0 ? '' : 'none');

    for (let datum of data) { // Loop su ogni elemento dell'array
      inserisciRiga(datum.Indirizzo, datum.NomeLocale);
    }
  }*/

  const markers = [];

  function pulisciRisultati() {
    for (let marker of markers) {
      marker.remove();
    }
  }

  function aggiornaRisultati(data) {
    pulisciRisultati();
    
    const markerRaggruppati = {};

    for (let datum of data) { // Loop su ogni elemento dell'array
      const lat = datum.Lat;
      const lon = datum.Lon;
      const key = lat + ',' + lon;
      let obj = markerRaggruppati[key];
      if (obj == null) {
        markerRaggruppati[key] = {
          indirizzi: [],
          nomiLocali: [],
          lat: lat,
          lon: lon
        };
        obj = markerRaggruppati[key];
      }

      let indirizzo = datum.Indirizzo.trim();
      let nomeLocale = datum.NomeLocale.trim();
      if (indirizzo !== '' && !obj.indirizzi.includes(indirizzo)) {
        obj.indirizzi.push(indirizzo);
      }

      if (nomeLocale !== '' && !obj.indirizzi.includes(nomeLocale)) {
        obj.indirizzi.push(nomeLocale);
      }
    }

    for (let key in markerRaggruppati) {
      if (markerRaggruppati.hasOwnProperty(key)) {
        const markerRaggruppato = markerRaggruppati[key];
        const marker = L.marker([markerRaggruppato.lat, markerRaggruppato.lon]).addTo(map);
        let popupText = '<strong>' + markerRaggruppato.indirizzi.join('<br>') + '</strong>';
        if (markerRaggruppato.nomiLocali.length > 0){
          popupText += '<br><br><em>Locali:</em><br>' + markerRaggruppato.nomiLocali.join('<br>')
        }
        marker.bindPopup(popupText);
        markers.push(marker);
      }
    }
  }

  function cerca() {
    const xhr = new XMLHttpRequest(); // Classe per inviare richieste HTTP https://developer.mozilla.org/it/docs/Web/API/XMLHttpRequest
    // Codici Stato HTTP: https://developer.mozilla.org/it/docs/Web/HTTP/Status

    xhr.onreadystatechange = function () { // Evento per il cambio di stato della richiesta
      if (xhr.readyState === XMLHttpRequest.DONE) { // DONE == Richiesta completat,a con successo o meno
        if (xhr.status === 200) { // 200 = OK
          let data = JSON.parse(xhr.response); // Prendiamo i dati JSON restituiti e li convertiamo in oggetto con JSON.parse

          aggiornaRisultati(data);
        }
        else if (xhr.status === 204) { // 204 = No Content --> Richiesta completata ma nessun contenuto restituito
          // Mostra risultati di ricerca vuoti
          aggiornaRisultati([]);
        }
        else if (xhr.status === 400) { // 400 = Bad Request --> Richiesta errata, solitamente perchè manca l'header content-type: application/json oppure un campo è vuoto
          alert("Dati errati");
        }
        else if (xhr.status === 404) { // 404 = Not Found --> In questo caso perchè la pagina non è stata trovata, può essere usato anche in caso di nessun risultato ma è sconsigliato tranne in caso di element singoli
          alert("Controlla la tua connessione");
        }
        else if (xhr.status === 500) {
          alert("Errore interno del server");
        }
      }
    };

    const form = document.forms["segnalazioni"];
    const inputIndirizzo = form["indirizzo"];
    const inputCivico = form["civico"];
    const inputNomeLocale = form["nomeLocale"];
    const inputData = form["data"];
    const inputOrarioInizio = form["orarioInizio"];
    const inputOrarioFine = form["orarioFine"];

    let indirizzo = inputIndirizzo.value.trim();
    let nomeLocale = inputNomeLocale.value.trim();
    let civico = inputCivico.value.trim();
    let data = inputData.value.trim();
    let orarioInizio = inputOrarioInizio.value;
    let orarioFine = inputOrarioFine.value;

    const oggettoDataInizio = new Date(data + "T" + orarioInizio);
    const oggettoDataFine = new Date(data + "T" + orarioFine);
    oggettoDataInizio.setTime(oggettoDataInizio.getTime() - (oggettoDataInizio.getTimezoneOffset() * 60 * 1000));
    oggettoDataFine.setTime(oggettoDataFine.getTime() - (oggettoDataFine.getTimezoneOffset() * 60 * 1000));

    if(oggettoDataFine < oggettoDataInizio) {
      oggettoDataFine.setDate(new Date(oggettoDataFine.getDate()+1));
    }

    let dataInizio = oggettoDataInizio.toISOString().slice(0, 19).replace('T', ' ');
    // slice(0, 19) prende tutti caratteri da 0 fino a 19. Siccome il tipo data ha "T", il database non ne ha bisogno
    // e lo sostiuiamo con lo spazio.
    let dataFine = oggettoDataFine.toISOString().slice(0, 19).replace('T', ' ');

    let queryString = '?';
    queryString += 'Indirizzo=' + encodeURIComponent(indirizzo) + '&';
    queryString += 'NomeLocale=' + encodeURIComponent(nomeLocale) + '&';
    queryString += 'Civico=' + encodeURIComponent(civico) + '&';
    queryString += 'DataInizio=' + encodeURIComponent(dataInizio) + '&';
    queryString += 'DataFine=' + encodeURIComponent(dataFine);

    xhr.open("GET", apiUrl + '/v1/segnalazioni' + queryString);
    //xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.send();
  }

  function invia() {
    const xhr = new XMLHttpRequest(); // Classe per inviare richieste HTTP https://developer.mozilla.org/it/docs/Web/API/XMLHttpRequest
    // Codici Stato HTTP: https://developer.mozilla.org/it/docs/Web/HTTP/Status

    xhr.onreadystatechange = function () { // Evento per il cambio di stato della richiesta
      if (xhr.readyState === XMLHttpRequest.DONE) { // DONE == Richiesta completat,a con successo o meno
        if (xhr.status === 200) { // 200 = OK
          //let data = JSON.parse(xhr.response); Ci viene restituito un oggetto corrispondente alla nostra segnalazione, ma non ci serve

          alert("Grazie per la tua segnalazione!");
        }
        else if (xhr.status === 400) { // 400 = Bad Request --> Richiesta errata, solitamente perchè manca l'header content-type: application/json oppure un campo è vuoto
          alert("Dati errati");
        }
        else if (xhr.status === 404) { // 404 = Not Found --> In questo caso perchè la pagina non è stata trovata, può essere usato anche in caso di nessun risultato ma è sconsigliato tranne in caso di element singoli
          alert("Controlla la tua connessione");
        }
        else if (xhr.status === 500) {
          alert("Errore interno del server");
        }
      }
    };

    const form = document.forms["segnalazioni"];
    const inputIndirizzo = form["indirizzo"];
    const inputCivico = form["civico"];
    const inputNomeLocale = form["nomeLocale"];
    const inputData = form["data"];
    const inputOrarioInizio = form["orarioInizio"];
    const inputOrarioFine = form["orarioFine"];

    let indirizzo = inputIndirizzo.value.trim();
    let nomeLocale = inputNomeLocale.value.trim();
    let civico = inputCivico.value.trim();
    let data = inputData.value.trim();
    let orarioInizio = inputOrarioInizio.value;
    let orarioFine = inputOrarioFine.value;

    const oggettoDataInizio = new Date(data + "T" + orarioInizio);
    const oggettoDataFine = new Date(data + "T" + orarioFine);
    oggettoDataInizio.setTime(oggettoDataInizio.getTime() - (oggettoDataInizio.getTimezoneOffset() * 60 * 1000));
    oggettoDataFine.setTime(oggettoDataFine.getTime() - (oggettoDataFine.getTimezoneOffset() * 60 * 1000));

    if(oggettoDataFine < oggettoDataInizio) {
      oggettoDataFine.setDate(new Date(oggettoDataFine.getDate()+1));
    }

    let dataInizio = oggettoDataInizio.toISOString().slice(0, 19).replace('T', ' ');
    // slice(0, 19) prende tutti caratteri da 0 fino a 19. Siccome il tipo data ha "T", il database non ne ha bisogno
    // e lo sostiuiamo con lo spazio.
    let dataFine = oggettoDataFine.toISOString().slice(0, 19).replace('T', ' ');

    const obj = {
      'Indirizzo' : indirizzo,
      'Civico' : civico,
      'NomeLocale' : nomeLocale,
      'DataInizio' : dataInizio,
      'DataFine' : dataFine
    };

    xhr.open("POST", apiUrl + '/v1/segnalazioni');
    xhr.setRequestHeader('Content-Type', 'application/json');     //serve per far capire che abbiamo inviato un json
    xhr.send(JSON.stringify(obj));      // fa la conversione in json
  }

  const pulsanteRicerca = document.getElementById('pulsante-cerca');
  const pulsanteInvia = document.getElementById('pulsante-invia');
  document.forms["segnalazioni"].addEventListener('submit', function (e) {
    e.preventDefault();
    const submitter = e.submitter;
    if (submitter === pulsanteRicerca) {
      cerca();
    }
    else if (submitter === pulsanteInvia) {
      invia();
    }
  });

  function loadLines(url) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    return new Promise(function (resolve, reject) {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status >= 200 && xhr.status < 300) {
            const content = xhr.response;
            if (content.trim() !== '') {
              const lines = content.split(/\r?\n/);
              const lineCount = lines.length;
              if (lineCount > 0) {
                resolve(lines);
              }
              else {
                resolve([]);
              }
            }
            else {
              resolve([]);
            }
          }
          else
          {
            reject('Impossibile caricare file');
          }
        }
      };

      xhr.send();
    });
  }

  function loadCSV(url, separator = ';') {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    return new Promise(function (resolve, reject) {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status >= 200 && xhr.status < 300) {
            const content = xhr.response;
            if (content.trim() !== '') {
              const lines = content.split(/\r?\n/);   // separa riga per riga il file con una regex
              const lineCount = lines.length;
              if (lineCount > 0) {
                let headerLine = lines[0];
                if (headerLine.length > 0) {
                  if (headerLine[headerLine.length - 1] === separator) {
                    headerLine = headerLine.substr(0, headerLine.length - 1);
                  }

                  if (headerLine.length > 0) {
                    const header = headerLine.split(separator);
                    const headerCount = header.length;
                    const data = {
                      header: header,
                      rows: []
                    };

                    for (let i = 1; i < lineCount - 1; i++) {
                      let rowLine = lines[i];
                      if (rowLine[rowLine.length - 1] === separator) {
                        rowLine = rowLine.substr(0, rowLine.length - 1);
                      }

                      const cells = rowLine.split(separator);
                      const cellCount = cells.length;
                      if (cellCount === headerCount) {
                        const rowCells = {};
                        for (let j = 0; j < cellCount; j++) {
                          rowCells[header[j]] = cells[j];
                        }
                        data.rows.push(rowCells);
                      }
                      else {
                        reject('Formato CSV non valido');
                      }
                    }

                    resolve(data);
                  }
                  else {
                    reject('Formato CSV non valido');
                  }
                }
                else
                {
                  reject('Formato CSV non valido');
                }
              }
              else {
                reject('Formato CSV non valido');
              }
            }
            else {
              reject('Formato CSV non valido');
            }
          }
          else
          {
            reject('Impossibile caricare file');
          }
        }
      };

      xhr.send();
    });
  }

  function caricaIndirizzi() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', apiUrl + '/v1/indirizzi');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        indirizzi = JSON.parse(xhr.responseText);

        const lista = document.getElementById('lista-indirizzi');
        let htmlOpzioni = '';
        for (let indirizzo of indirizzi) {
          htmlOpzioni += '<option value="' + indirizzo + '"></option>';
        }
        lista.innerHTML = htmlOpzioni;
      }
    };

    xhr.send();
  }

  caricaIndirizzi();
}) ();

