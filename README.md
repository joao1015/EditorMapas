# Radar Moto – Editor de Mapas

Um editor interativo de mapas construído em React + TypeScript, que utiliza **React Konva** para renderização Canvas, permitindo criar áreas geométricas, polígonos livres e “corredores” sobre um fundo em grade.

---

## 📦 Tecnologias & Bibliotecas

- **React** e **TypeScript**  
- **Next.js** (`"use client"`) — Para SSR/SSG e rotas de app  
- **react-konva** — Renderização de canvas e manipulação dos shapes  
- **Konva** — Biblioteca de baixo-nível para Canvas abstraída por react-konva  
- **uuid** — Geração de IDs únicos para shapes  
- **Custom Hooks**  
  - `useSnapToGrid` — snap à grade e anchors de outros objetos  
  - `useHistory` — undo/redo de ações (Ctrl+Z / Ctrl+Y + botões)  
  - `usePanZoom` — zoom (roda do mouse) e pan (botão direito)  

---

## ⚙️ Funcionalidades

1. **Criação de Shapes**  
   - **Retângulos**: clique em “Área Geométrica” e depois num ponto do canvas.  
   - **Polígonos livres**: modo “Área Livre”, clique em cada vértice, depois “Finalizar” ou tecla `Enter`.  
   - **Corredores**: modo “Corredor Livre” ou “Corredor Reto”, idem ao polígono.

2. **Transformações**  
   - **Mover**: arraste qualquer shape ou texto.  
   - **Redimensionar**: alças do `Transformer` em retângulos.  
   - **Editar propriedades** no painel lateral (nome, largura, altura, cor).

3. **Snap & Grade**  
   - Grade de fundo (configurável).  
   - Snap a linhas de grade e âncoras de outros shapes para alinhamento preciso.

4. **Pan & Zoom**  
   - *Pan*: arraste com o botão direito do mouse.  
   - *Zoom*: roda do mouse (scale centrado no cursor).

5. **Undo / Redo**  
   - **Ctrl+Z / Ctrl+Y** ou botões na toolbar para desfazer/refazer alterações.

6. **Painel Lateral**  
   - Exibe propriedades do shape ou corredor selecionado.  
   - Permite alterar nome, dimensões (em metros) e cor.

---

## 🚀 Como usar

1. **Clone o repositório**  
   ```bash
   git clone https://github.com/joao1015/EditorMapas.git
   cd EditorMapas
