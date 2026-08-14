import { test, expect } from '@playwright/test';

test.describe('Offline Local Cache', () => {
  test('should restore drawing from local cache if remote save fails', async ({ page }) => {
    // 1. Ir para o dashboard
    await page.goto('/');
    
    // 2. Criar uma nota nova
    // Clica no botão de nova nota
    const newNoteBtn = page.locator('text="Nova Nota"');
    await newNoteBtn.waitFor();
    await newNoteBtn.click();
    
    // Preenche o nome da nota no modal e pressiona Enter para salvar
    await page.getByPlaceholder('Nome...').fill('Nota de Teste E2E');
    await page.getByPlaceholder('Nome...').press('Enter');
    
    // Espera o Tldraw carregar e focar
    await expect(page.locator('.tl-container')).toBeVisible({ timeout: 10000 });

    // 3. Simular falha de rede: Bloquear qualquer tentativa de salvar no servidor (PUT)
    await page.route('**/api/notes/**', route => {
      if (route.request().method() === 'PUT') {
        // Interrompe a requisição simulando falha de rede/offline
        route.abort(); 
      } else {
        route.continue();
      }
    });

    // 4. Desenhar algo na lousa
    const canvas = page.locator('.tl-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas bounding box not found');

    // Seleciona a ferramenta de desenho (lápis) pressionando 'd'
    await page.keyboard.press('d');

    // Faz um traço com o mouse
    await page.mouse.move(box.x + 100, box.y + 100);
    await page.mouse.down();
    await page.mouse.move(box.x + 300, box.y + 300, { steps: 5 });
    await page.mouse.up();

    // O localforage salva instantaneamente (0ms). 
    // O backend tenta salvar em 2000ms. Vamos esperar 2.5s para garantir que o PUT falhou.
    await page.waitForTimeout(2500);

    // 5. Recarregar a página (F5)
    // Como o PUT falhou, o banco de dados (Neon) tem uma lousa vazia.
    // Ao recarregar, o NoteClient deve notar que o Cache Local é mais recente e usá-lo.
    await page.reload();
    await expect(page.locator('.tl-container')).toBeVisible({ timeout: 10000 });

    // 6. Verificar se o desenho sobreviveu
    // O Tldraw renderiza os shapes com a classe 'tl-shape' ou 'tl-shape-indicator'
    const shapes = page.locator('.tl-shape');
    
    // Espera que exista pelo menos 1 shape na tela (nosso traço)
    await expect(shapes.first()).toBeVisible({ timeout: 5000 });
  });
});
