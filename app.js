'use strict';

// Elimino las tildes, los espacios y los signos cuando necesito comparar textos.
function normalizarTexto(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function limpiarParaPalindromo(texto) {
  return normalizarTexto(texto).replace(/[^\p{L}\p{N}]/gu, '');
}

function esPalindromo(texto) {
  const limpio = limpiarParaPalindromo(texto);
  return limpio.length > 0 && limpio === Array.from(limpio).reverse().join('');
}

function compararNumeros(valorUno, valorDos) {
  if (!String(valorUno).trim() || !String(valorDos).trim()) {
    return 'Debo escribir los dos números.';
  }
  const uno = Number(valorUno);
  const dos = Number(valorDos);
  if (!Number.isFinite(uno) || !Number.isFinite(dos)) {
    return 'Debo ingresar números válidos.';
  }
  if (uno > dos) return `${uno} es mayor que ${dos}.`;
  if (dos > uno) return `${dos} es mayor que ${uno}.`;
  return `Los dos números son iguales: ${uno}.`;
}

function extraerVocales(frase) {
  return Array.from(normalizarTexto(frase)).filter(letra => 'aeiou'.includes(letra));
}

function contarVocales(frase) {
  const cantidades = { a: 0, e: 0, i: 0, o: 0, u: 0 };
  for (const vocal of extraerVocales(frase)) cantidades[vocal]++;
  return cantidades;
}

function mostrarResultado(id, mensaje, tipo = 'success') {
  const elemento = document.getElementById(id);
  elemento.textContent = mensaje;
  elemento.classList.remove('success', 'error');
  elemento.classList.add(tipo);
}

// Eventos de los cuatro ejercicios JavaScript.
document.getElementById('form-palindromo').addEventListener('submit', (evento) => {
  evento.preventDefault();
  const texto = document.getElementById('texto-palindromo').value.trim();
  mostrarResultado('resultado-palindromo',
    esPalindromo(texto) ? `«${texto}» sí es un palíndromo.` : `«${texto}» no es un palíndromo.`,
    esPalindromo(texto) ? 'success' : 'error');
});

document.getElementById('form-mayor').addEventListener('submit', (evento) => {
  evento.preventDefault();
  const valorUno = document.getElementById('numero-uno').value;
  const valorDos = document.getElementById('numero-dos').value;
  mostrarResultado('resultado-mayor', compararNumeros(valorUno, valorDos));
});

document.getElementById('form-encontrar').addEventListener('submit', (evento) => {
  evento.preventDefault();
  const frase = document.getElementById('frase-encontrar').value;
  const vocales = extraerVocales(frase);
  const mensaje = vocales.length
    ? `Vocales encontradas (en orden): ${vocales.join(', ')}.\nTotal: ${vocales.length}.`
    : 'La frase no contiene vocales.';
  mostrarResultado('resultado-encontrar', mensaje, vocales.length ? 'success' : 'error');
});

document.getElementById('form-contar').addEventListener('submit', (evento) => {
  evento.preventDefault();
  const cantidades = contarVocales(document.getElementById('frase-contar').value);
  const total = Object.values(cantidades).reduce((a, b) => a + b, 0);
  const detalle = Object.entries(cantidades).map(([letra, numero]) => `${letra}: ${numero}`).join('  |  ');
  mostrarResultado('resultado-contar', `${detalle}\nTotal de vocales: ${total}.`, total ? 'success' : 'error');
});

// AJAX: URL inicial, solicitud, estado, cabeceras y código HTTP.
const urlEntrada = document.getElementById('url-ajax');
const estadoSalida = document.getElementById('ajax-estado');
const codigoSalida = document.getElementById('ajax-codigo');
const contenidoSalida = document.getElementById('ajax-contenido');
const cabecerasSalida = document.getElementById('ajax-cabeceras');
const historialSalida = document.getElementById('ajax-historial');
const botonAjax = document.getElementById('boton-ajax');
urlEntrada.value = window.location.href;

const nombresEstado = ['No iniciada', 'Conexión establecida', 'Solicitud enviada', 'Recibiendo respuesta', 'Completada'];
let historial = [];
function escribirEstado(texto) {
  estadoSalida.textContent = texto;
  if (historial[historial.length - 1] !== texto) historial.push(texto);
  historialSalida.textContent = historial.join(' → ');
}

function indicarErrorAjax(mensaje) {
  escribirEstado('Error: ' + mensaje);
  codigoSalida.textContent = 'Sin respuesta HTTP disponible';
  contenidoSalida.textContent = mensaje;
  cabecerasSalida.textContent = 'No fue posible leer las cabeceras.';
  botonAjax.disabled = false;
}

document.getElementById('form-ajax').addEventListener('submit', (evento) => {
  evento.preventDefault();
  let url;
  try {
    url = new URL(urlEntrada.value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Protocolo no permitido');
  } catch (_) {
    historial = [];
    indicarErrorAjax('Debo ingresar una URL válida que empiece con http:// o https://.');
    return;
  }

  const solicitud = new XMLHttpRequest();
  historial = [];
  botonAjax.disabled = true;
  escribirEstado(nombresEstado[0]);
  contenidoSalida.textContent = 'Esperando contenido del servidor…';
  cabecerasSalida.textContent = 'Esperando cabeceras…';
  codigoSalida.textContent = 'Esperando respuesta…';
  solicitud.timeout = 10000;

  solicitud.onreadystatechange = () => {
    escribirEstado(nombresEstado[solicitud.readyState] || 'Estado desconocido');
    if (solicitud.readyState === XMLHttpRequest.DONE) {
      botonAjax.disabled = false;
      if (solicitud.status === 0) return;
      contenidoSalida.textContent = solicitud.responseText || '(La respuesta no contiene texto)';
      cabecerasSalida.textContent = solicitud.getAllResponseHeaders().trim() || '(No hay cabeceras accesibles)';
      codigoSalida.textContent = `${solicitud.status} ${solicitud.statusText || '(sin texto de estado)'}`;
    }
  };
  solicitud.onerror = () => indicarErrorAjax('La petición falló. Puede deberse a la red o a restricciones CORS del sitio consultado.');
  solicitud.ontimeout = () => indicarErrorAjax('Se agotó el tiempo de espera de la petición.');

  try {
    solicitud.open('GET', url.href, true);
    solicitud.send();
  } catch (_) {
    indicarErrorAjax('No fue posible iniciar la petición a esta URL.');
  }
});

// Dejo las funciones disponibles para pruebas de lógica con Node.js.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { normalizarTexto, limpiarParaPalindromo, esPalindromo, compararNumeros, extraerVocales, contarVocales };
}
