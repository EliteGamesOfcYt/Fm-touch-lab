# 🪪 GUIA COMPLETO — Ativar Perfis & Manager Card no FM Touch Lab

Chefe, segue esse passo a passo com calma que **qualquer pessoa consegue**, só no celular. São 3 partes: **banco (Supabase)** → **config** → **upload**. Leva uns 15 minutinhos. 💪

---

## PARTE 1 — Criar o banco grátis (Supabase)

1. Abre **https://supabase.com** no navegador e toca em **Start your project**.
2. Cria a conta (pode entrar com Google/GitHub — é grátis, sem cartão).
3. Toca em **New project**:
   - **Name:** `fmtouchlab`
   - **Database Password:** cria uma senha e **GUARDA BEM** (não vai pro site, é só tua).
   - **Region:** escolhe **South America (São Paulo)** se aparecer.
4. Espera ~1 minutinho o projeto ficar pronto (spin verde).

### Rode o SQL do banco
5. No menu lateral esquerdo, toca em **SQL Editor** (ícone de `</>`).
6. Toca em **New query** (ou `+`).
7. **Apaga** o que estiver escrito e **cola TODO o conteúdo** do arquivo **`supabase-setup.sql`** (está junto do site).
8. Toca em **RUN** (▶️). Tem que aparecer **"Success. No rows returned"**. ✅

### Pegue suas chaves públicas
9. Menu lateral → **Project Settings** (⚙️ engrenagem, lá embaixo).
10. Toca em **API** (essa tela tem "Publishable keys" e "Secret keys").
11. Copia essas duas coisas:
    - **Project URL** → fica lá NO TOPO dessa mesma tela (rola pra cima!) — algo como `https://abcdxyzw.supabase.co`
    - **Publishable key** → no bloco **"Publishable keys"**, linha "default", chave que começa com `sb_publishable_...` — toca no ícone de **copiar** (📄) do lado dela.
      *(Se o teu painel for o ANTIGO, o nome dela é **anon public key**, começando com `eyJ...`. As duas servem!)*

> ⚠️ **A publishable/anon key PODE aparecer no site** — ela foi feita pra isso! O próprio Supabase escreve isso no topo da tela: é segura porque o SQL que você rodou ativou o RLS (ninguém mexe nos dados dos outros).
> ⛔ **JAMAIS** copia a **Secret key** (`sb_secret_...`, no bloco de BAIXO) nem a antiga `service_role key`. Elas são secretas de verdade. Se você colar a secret no site por engano, ele se recusa a ligar o banco e avisa no console — aí apague ela no Supabase (⋮ → Delete) e gere outra.

### Ativar login instantâneo (recomendado pra testar)
12. Menu lateral → **Authentication** → **Sign In / Up** (ou **Providers**).
13. Procura **Confirm email** e **DESLIGA** (deixa cinza).
    - Assim a pessoa se cadastra e já entra na hora, sem precisar abrir e-mail.
    - (Quando o site crescer, você liga de volta se quiser.)

---

## PARTE 2 — Colocar as chaves no site

1. No seu PC/celular, abre o arquivo **`js/lab-config.js`** (está na pasta do site).
2. Preenche assim:

```js
window.LABCFG = {
  SUPABASE_URL: 'https://abcdxyzw.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_...sua-chave-aqui...'
};
```

3. Salva o arquivo. **Não erra as aspas e vírgulas!**

---

## PARTE 3 — Subir TUDO pro GitHub

Tem **arquivos novos + pasta nova (`js/`)**. Faz assim:

1. Abre **github.com/EliteGamesOfcYt/Fm-touch-lab**
2. **Add file → Upload files**
3. Arrasta TUDO isso de uma vez:
   - `index.html`
   - `entrar.html`
   - `manager.html`
   - `supabase-setup.sql` *(só referência, não precisa pro site rodar, mas guarda lá)*
   - `GUIA-PERFIL.md` *(idem)*
   - **a pasta `js` inteira** (arrasta a pasta! ela cria `js/` certinho com `lab-config.js`, `lab-clubes.js`, `lab-auth.js` dentro)
4. **Commit changes** — ⚠️ **NÃO FECHA A ABA antes da barrinha terminar!** ⚠️

> Dica: se arrastar a pasta não funcionar no seu navegador, cria arquivo por arquivo em **Create new file** escrevendo o caminho completo: `js/lab-config.js` → cola o conteúdo → Commit. Repete pros outros 2.

---

## ✅ TESTANDO (como visitante e como manager)

**Visitante (sem cadastro):**
1. Abre **elitegamesofcyt.github.io/Fm-touch-lab** (modo anônimo/abaa privada pra ver de novo).
2. Vai aparecer: **"BEM-VINDO AO FM TOUCH LAB"** → pesquisa teu clube → **Continuar**.
3. O site INTEIRO pega as cores do clube (com contraste ajustado) + chip do clube no topo 🎨
4. Quer trocar? Menu → **⚙️ Clube & Perfil** → **Alterar clube** (ou **Remover**).

**Manager (com cadastro):**
1. Menu → **⚙️ Clube & Perfil** → **👤 Criar meu perfil / Entrar**
2. Cria a conta (nome de manager, usuário único, país, clube, perfil público).
3. Cai direto no **MANAGER CARD** 🪪 — com escudo, cores, estatísticas.
4. Publica uma tática em **+ Publicar tática** e olha ela no card.
5. Copia o **link do perfil público** (na área de configurações) e manda pros amigos: `.../manager.html?u=teu_usuario` — eles veem teu card e dão ⭐ nas tuas táticas!

---

## 🆘 Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| "Plataforma em preparação" | `js/lab-config.js` vazio ou chave errada | Confere URL + **publishable key** (sem espaço no fim!). Se colou a `sb_secret_...` por engano, o site bloqueia de propósito — usa a publishable! |
| Erro ao criar perfil (username) | usuário já existe no banco | Troca o @usuario |
| "Confirme seu e-mail" | Confirmação de e-mail ligada | Desliga em Authentication (passo 12) — ou confere o e-mail |
| Site sem cores do clube | escolheu "tema padrão" ou removeu o clube | ⚙️ Clube & Perfil → ligar cores |
| Escudo do clube não aparece | serviço de ícones falhou | aparece monograma com as iniciais + cor do clube (normal ✅) |

## 👑 Você é o ADMIN
Nada de admin no código: você administra tudo pelo **painel do Supabase**:
- Ver/apagar usuários: **Authentication → Users**
- Ver táticas/perfis/publicações: **Table Editor**
- Site oficjal (conteúdos) você continua editando pelos arquivos no GitHub, como sempre.
