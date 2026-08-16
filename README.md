# Never Paying Excalidraw Again

Eu costumava pagar o excalidraw mas depois achei esse motor de desenho do tldraw, juntei com um bdzinho serverless pra eu poder salvar as notas todas num bd sem me preocupar com o localstorage do navegador (pois é, o excalidraw salva lá essa resenha). Fiz só um projetinho e pra quem quiser usar, ta ai um tutorialzinho.

## Como usar essa resenha

**1. Cria sua conta no NeonDB**
Vai lá no [Neon](https://neon.tech/), cria uma conta gratuita e faz um projetinho novo. Pega a string de conexão que eles te dão lá no painel. Vai ser algo tipo `postgresql://neondb_owner:blabla@ep-blabla.neon.tech/neondb`.

**2. Clona o projeto**
Clona esse repositório aqui pro seu pc e roda um `npm install` pra baixar tudo.

**3. Configura a variável**
Cria um arquivo `.env` na pasta do projeto e cola a url do banco que você pegou:
```env
DATABASE_URL="postgresql://neondb_owner:blabla@ep-blabla.neon.tech/neondb"
```

**4. Sobe as tabelas e roda**
Roda o comando abaixo para criar as tabelas lá no Neon:
```bash
npx drizzle-kit push
```

Depois, como esse app agora é um **PWA Offline-First** (ou seja, você consegue usar mesmo sem internet!), você precisa fazer a build de produção e rodar o servidor oficial. Rode:
```bash
npm run build
```

E em seguida:
```bash
npm run start
```

Pronto! É só abrir o `localhost:3000` e ser feliz desenhando sem pagar nada pra ninguém (e agora sem precisar de Wi-Fi também).
