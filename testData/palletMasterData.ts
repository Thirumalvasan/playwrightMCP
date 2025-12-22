import { loginData } from './loginData';
export const palletMasterData = {
 
  addButton: 'add',
  submitButton: 'submit', 
  palletIdStart: 432, 
  palletIdCount: 6, 
  palletIdPrefix: '', 
  descriptionWords: [
    'auto', 'test', 'pallet', 'entry', 'desc', 'random', 'playwright', 'mcp', 'data', 'insert'
  ],
  palletIdLabel: 'Pallet Id',
  descriptionLabel: 'Description',
  errorPopupText: 'Pallet Id already exists',
  errorPopupOkButton: ['swal2-cancel', 'btn-primary'], 

  editButtonSelector: 'li.edit button.edit-item-btn', 
  clearButton: 'clear', 
  updateButtonSelector: 'button.btn-primary.btn-load', 
  editPalletId: '10', 
  editDescription: 'hello', 
  editPageUrl: 'master/palletmaster',

  toggleInputSelector: 'input.code-switcher',
  confirmPopupSelector: 'div.swal2-popup.swal2-modal.swal2-icon-warning',
  confirmPopupTextDeactivate: 'Are you sure want to Deactivate it?',
  confirmPopupTextActivate: 'Are you sure want to Activate it?',
  confirmButtonSelector: 'button.swal2-confirm',
  confirmButtonTextDeactivate: 'Yes, Deactivate it!',
  confirmButtonTextActivate: 'Yes, Activate it!',

  lastPageBtnRole: { name: /\d+/, exact: false },
  firstPageBtnRole: { name: '1', exact: true },
  nextBtnSelector: 'a.page-link[aria-label="Next"]',
  prevBtnSelector: 'a.page-link[aria-label="Previous"]',
  refreshBtnSelector: 'span#basic-addon1.input-group-text.refresh',
  tableRowSelector: 'table tbody tr',

  baseUrl: loginData.baseUrl,
  sampleFile: 'tests/master/Pallet-Master/sample-import.xlsx',
  importTitle: 'IMPORT EXCEL',
  previewTitle: 'Product List Preview Page',
  verifyButton: 'Verify & Confirm',
  importButton: 'Import',
  exportButton: 'Export',

  masterMenu: 'master',
  palletMasterMenu: 'Pallet Master',

};
