import { expect, test } from '@playwright/test';
import { PaginaRegistro} from '../../pages/PaginaRegistro';
import { esperarFlash } from '../../helpers/flash';


test('TC03: Registro con email repetido', async ({ page }) => {
    const Registro = new PaginaRegistro(page);
    await Registro.registrar({
        tipo: 'Paciente',
        nombre: 'Juan',
        email: 'ana@mail.com',
        password: 'juan123',
        extra: 'SEMM',
    });
    await expect(page).toHaveURL(/registro\.php/);
    await esperarFlash(page, 'error', 'Ya existe un usuario con ese email.');
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Registrarse' })).toBeVisible();
});
