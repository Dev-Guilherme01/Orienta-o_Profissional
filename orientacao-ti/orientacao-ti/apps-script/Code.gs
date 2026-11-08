/**
 * Integração com Google Sheets. Cole este código no Apps Script
 * aberto a partir da própria planilha (Extensões > Apps Script).
 */
const SHEET_NAME = 'Participantes';
const HEADERS = ['ID do participante', 'Nome completo', 'Telefone', 'E-mail',
  'Área de identificação', 'Data e horário'];

const AREAS = ['Desenvolvimento de Software', 'Gestão e Tecnologia', 'Inteligência Artificial e Dados'];

// Regra de identificação (mantenha igual à do index.html):
// cada letra soma 1 ponto para uma área; vence a área com mais respostas.
// Empate (uma resposta para cada área): vale a área da resposta da pergunta 1.
const AREA_POR_LETRA = { A: 0, B: 1, C: 2 };

function identificarArea_(respostas) {
  const pontos = [0, 0, 0];
  respostas.forEach(function (l) { pontos[AREA_POR_LETRA[l]]++; });
  const max = Math.max.apply(null, pontos);
  const empatadas = [];
  pontos.forEach(function (p, i) { if (p === max) empatadas.push(i); });
  return AREAS[empatadas.length === 1 ? empatadas[0] : AREA_POR_LETRA[respostas[0]]];
}

function doGet() {
  return json_({ ok: true, status: 'online' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    const erro = validar_(d);
    if (erro) return json_({ ok: false, error: erro });

    const area = identificarArea_(d.respostas);
    const sheet = getSheet_();
    const ultima = sheet.getLastRow();
    if (ultima > 1) {
      const ids = sheet.getRange(2, 1, ultima - 1, 1).getValues().flat();
      if (ids.indexOf(d.id) !== -1) return json_({ ok: true, duplicado: true, area: area });
    }

    const linha = [
      d.id, d.nome.trim(), d.telefone.trim(), d.email.trim(), area,
      Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm:ss')
    ];
    const destino = sheet.getRange(ultima + 1, 1, 1, HEADERS.length);
    destino.setNumberFormat('@');   // tudo como texto: evita fórmulas injetadas
    destino.setValues([linha]);
    SpreadsheetApp.flush();
    return json_({ ok: true, area: area });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Erro ao salvar os dados. Tente novamente.' });
  } finally {
    lock.releaseLock();
  }
}

function validar_(d) {
  if (!d || typeof d !== 'object') return 'Requisição inválida.';
  if (typeof d.id !== 'string' || !/^[A-Za-z0-9-]{8,64}$/.test(d.id)) return 'ID inválido.';
  const nome = String(d.nome || '').trim(), tel = String(d.telefone || '').trim(), email = String(d.email || '').trim();
  if (nome.length < 5 || nome.length > 120) return 'Nome inválido.';
  const dig = tel.replace(/\D/g, '');
  if (dig.length < 10 || dig.length > 13 || tel.length > 20) return 'Telefone inválido.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return 'E-mail inválido.';
  if (!Array.isArray(d.respostas) || d.respostas.length !== 3) return 'Respostas incompletas.';
  for (let i = 0; i < 3; i++) {
    if (!Object.prototype.hasOwnProperty.call(AREA_POR_LETRA, d.respostas[i])) return 'Resposta inválida.';
  }
  return null;
}

function cabecalhoOk_(sheet) {
  const atual = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  return atual.join('|') === HEADERS.join('|');
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  // Aba com a estrutura antiga: é preservada com outro nome e uma nova aba é criada.
  if (sheet && sheet.getLastRow() > 0 && !cabecalhoOk_(sheet)) {
    sheet.setName(SHEET_NAME + ' (antigo ' + Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd HHmm') + ')');
    sheet = null;
  }
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
