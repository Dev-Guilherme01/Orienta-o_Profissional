# Orientação Profissional em TI

## Estrutura
```
orientacao-ti/
├── index.html          # questionário: HTML, estilos, lógica JS e bloco CONFIG
├── qr.html             # gerador do QR Code (PNG para impressão)
├── img/fundo-tecnologia.svg  # imagem de fundo da tela inicial
└── apps-script/Code.gs # código colado no Apps Script (não vai para o site)
```

## 1. Criar a planilha
1. Acesse sheets.google.com e crie uma planilha em branco (ex.: "Orientação TI").
2. Não precisa criar a aba nem o cabeçalho: o script cria a aba `Participantes` automaticamente no primeiro envio.

## 2. Configurar o Apps Script
1. Na planilha: **Extensões > Apps Script**.
2. Apague o conteúdo e cole o `apps-script/Code.gs`. Salve.
3. **Implantar > Nova implantação > Tipo: App da Web**.
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
4. Autorize o acesso quando solicitado e copie a **URL do app da Web** (termina em `/exec`).
5. Teste abrindo a URL no navegador: deve aparecer `{"ok":true,"status":"online"}`.
> Ao alterar o `Code.gs` depois, use **Implantar > Gerenciar implantações > editar > Nova versão**; a URL continua a mesma.

## 3. Conectar a aplicação à planilha
No início dos scripts do `index.html` (bloco `CONFIG`), troque `APPS_SCRIPT_URL` pela URL copiada.

**Login Google (opcional, para preencher o e-mail):**
1. console.cloud.google.com > crie um projeto > **APIs e serviços > Tela de consentimento OAuth**: tipo Externo, preencha nome do app e e-mail de suporte (escopos básicos: e-mail e perfil). Mude o status para **Em produção**; em "Teste", só e-mails cadastrados como testadores conseguem entrar.
2. **Credenciais > Criar credenciais > ID do cliente OAuth > Aplicativo da Web**. Em "Origens JavaScript autorizadas" coloque o endereço exato do site publicado (ex.: `https://seu-site.netlify.app`, sem barra no final). O login não funciona em `file://`.
3. Cole o ID do cliente em `GOOGLE_CLIENT_ID` (bloco `CONFIG` do `index.html`).
Se deixar vazio, ou se o login falhar, o e-mail é preenchido manualmente.

## 4. Publicar na internet
Opção simples e gratuita (Netlify): acesse app.netlify.com/drop e arraste a pasta `orientacao-ti` (pode apagar `apps-script/` antes; mantenha `img/`). Você recebe um endereço `https://...netlify.app`.
Alternativa: GitHub Pages (suba os arquivos em um repositório e ative Pages em Settings).
Se usou login Google, volte ao passo 3 e cadastre o endereço final.

## 5. Gerar e testar o QR Code
1. Abra `https://SEU-SITE/qr.html` (pelo endereço publicado, não pelo arquivo local).
2. Confira se o endereço exibido é o de `index.html` e clique em **Baixar PNG** (1200×1200 px, com margem para impressão).
3. Aponte a câmera de um celular para a tela: deve abrir a página inicial. Teste também o PNG impresso no tamanho final.

## 6. Testar cadastro e armazenamento
1. Responda as 3 perguntas (teste "Voltar" e tentar avançar sem marcar).
2. Preencha o cadastro e clique em **Ver resultado**; o resultado só aparece após o "Dados salvos com sucesso!".
3. Confira a nova linha na aba `Participantes`.
4. Clique várias vezes rápido no botão: deve existir apenas 1 linha (botão bloqueia e o ID evita duplicata).
5. Teste sem internet (modo avião): deve aparecer erro de conexão e nenhum resultado; ao reconectar, tente de novo.

## Segurança
- A URL do Apps Script é pública por natureza: o script valida todos os campos e grava tudo como texto.
- Não compartilhe a planilha com quem não deve ver os dados (nome, telefone, e-mail). Atenção à LGPD: informe os participantes sobre o uso dos dados.

## Colunas da planilha (aba `Participantes`)
ID do participante | Nome completo | Telefone | E-mail | Área de identificação | Data e horário

A planilha **não guarda as respostas de cada pergunta**, apenas a área calculada.

> Se a aba `Participantes` já existir com a estrutura antiga (colunas de respostas), o script a renomeia sozinho para `Participantes (antigo ...)`, sem apagar nada, e cria uma aba nova já na estrutura certa.
> Depois de colar o novo `Code.gs`, publique uma **nova versão** (Implantar > Gerenciar implantações > lápis > Nova versão > Implantar). A URL continua a mesma.

## Como a "Área de identificação" é definida
Cada resposta soma 1 ponto para uma área (A = Desenvolvimento de Software, B = Gestão e Tecnologia, C = Inteligência Artificial e Dados). A área com mais pontos é gravada na planilha e exibida ao participante. Se cada uma das 3 respostas apontar para uma área diferente (empate), vale a área da resposta da pergunta 1. A regra está no `Code.gs` (`identificarArea_`) e no `index.html` (`identificarArea`); se mudar uma, mude a outra.
