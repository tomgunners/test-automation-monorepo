import { BasePage }     from './base.page';
import { FormsLocators } from '../locators/forms.locators';

/** Opções disponíveis no dropdown de formulário. */
type DropdownOption = 'Option 1' | 'Option 2' | 'Option 3';

const DROPDOWN_LOCATOR_MAP: Record<DropdownOption, string> = {
  'Option 1': FormsLocators.dropdownOptionOne,
  'Option 2': FormsLocators.dropdownOptionTwo,
  'Option 3': FormsLocators.dropdownOptionThree,
} as const;

/**
 * Screen Object da tela de Formulários.
 * Cobre: campo de texto, switch toggle, dropdown e botões de estado.
 */
export class FormsScreen extends BasePage {

  /** Navega para a tela de Forms via menu inferior e aguarda carregamento. */
  async waitForScreen(): Promise<void> {
    await this.tap(FormsLocators.formsMenu);
    await this.waitForDisplayed(FormsLocators.inputField);
  }

  // ── Campo de texto ─────────────────────────────────────────────────────────

  async typeInField(value: string): Promise<void> {
    await this.fill(FormsLocators.inputField, value);
  }

  async getInputResult(): Promise<string> {
    return this.getText(FormsLocators.inputResult);
  }

  // ── Switch ─────────────────────────────────────────────────────────────────

  async tapSwitch(): Promise<void> {
    await this.tap(FormsLocators.switchToggle);
  }

  async isSwitchActive(): Promise<boolean> {
    return this.isDisplayed(FormsLocators.switchActiveText);
  }

  async isSwitchInactive(): Promise<boolean> {
    return this.isDisplayed(FormsLocators.switchInactiveText);
  }

  // ── Dropdown ───────────────────────────────────────────────────────────────

  async openDropdown(): Promise<void> {
    await this.tap(FormsLocators.dropdownTrigger);
  }

  async selectDropdownOption(option: DropdownOption): Promise<void> {
    await this.tap(DROPDOWN_LOCATOR_MAP[option]);
  }

  async getSelectedDropdownValue(): Promise<string> {
    return this.getText(FormsLocators.dropdownSelected);
  }

  // ── Botões de estado ───────────────────────────────────────────────────────

  async isActiveButtonVisible(): Promise<boolean> {
    return this.isDisplayed(FormsLocators.activeButton);
  }

  async isInactiveButtonVisible(): Promise<boolean> {
    return this.isDisplayed(FormsLocators.inactiveButton);
  }
}
