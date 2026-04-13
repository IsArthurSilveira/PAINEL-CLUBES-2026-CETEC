// FUNCAO DE TESTE - Copie no Apps Script e execute
// Esta funcao testa o login sem fazer requisicao HTTP
function testarLoginLocal() {
  const payload = {
    acao: 'login',
    email: 'usuario@example.com',  // 👈 MUDE PARA UM EMAIL QUE EXISTE NO SHEETS
    senha: 'senha123'               // 👈 MUDE PARA A SENHA CORRETA
  };
  
  console.log('='.repeat(60));
  console.log('TESTE DE LOGIN LOCAL');
  console.log('='.repeat(60));
  console.log('Payload enviado:', JSON.stringify(payload, null, 2));
  console.log('');
  
  const sheet = SpreadsheetApp.openById(SHEET_ID);
  const resultado = executarAcao(sheet, payload);
  
  console.log('');
  console.log('Resultado:', JSON.stringify(resultado, null, 2));
  console.log('='.repeat(60));
}

// EXECUTE: testarLoginLocal()
// (vai aparecer nos Logs do Apps Script)
