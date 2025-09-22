import { loginData } from './loginData';
export const palletMasterData = {
 
  // Add-pallet specific data
  addButton: 'add', // Button name for Add
  submitButton: 'submit', // Button name for Submit
  palletIdStart: 432, // Starting Pallet ID
  palletIdCount: 6, // Number of Pallet IDs to add
  palletIdPrefix: '', // If you want a prefix for Pallet IDs
  descriptionWords: [
    'auto', 'test', 'pallet', 'entry', 'desc', 'random', 'playwright', 'mcp', 'data', 'insert'
  ],
  palletIdLabel: 'Pallet Id',
  descriptionLabel: 'Description',
  errorPopupText: 'Pallet Id already exists',
  errorPopupOkButton: ['swal2-cancel', 'btn-primary'], // Button classes for OK in error popup

    // Edit-pallet specific data
  editButtonSelector: 'li.edit button.edit-item-btn', // Selector for edit icon
  clearButton: 'clear', // Button name for Clear
  updateButtonSelector: 'button.btn-primary.btn-load', // Selector for Update button
  editPalletId: '10', // Pallet Id to use in edit
  editDescription: 'hello', // Description to use in edit
  editPageUrl: 'master/palletmaster',

  // Toggle/deactivate specific data
  toggleInputSelector: 'input.code-switcher',
  confirmPopupSelector: 'div.swal2-popup.swal2-modal.swal2-icon-warning',
  confirmPopupTextDeactivate: 'Are you sure want to Deactivate it?',
  confirmPopupTextActivate: 'Are you sure want to Activate it?',
  confirmButtonSelector: 'button.swal2-confirm',
  confirmButtonTextDeactivate: 'Yes, Deactivate it!',
  confirmButtonTextActivate: 'Yes, Activate it!',

  // Pagination/refresh specific data
  lastPageBtnRole: { name: /\d+/, exact: false },
  firstPageBtnRole: { name: '1', exact: true },
  nextBtnSelector: 'a.page-link[aria-label="Next"]',
  prevBtnSelector: 'a.page-link[aria-label="Previous"]',
  refreshBtnSelector: 'span#basic-addon1.input-group-text.refresh',
  tableRowSelector: 'table tbody tr',
  // Optionally, selector for datetime display if needed in future:
  // dateTimeDisplaySelector: '.datetime-display, .last-updated, .refresh-time',

  // Add more edit-pallet fields as needed
  baseUrl: loginData.baseUrl,
  sampleFile: 'tests/master/Pallet-Master/sample-import.xlsx',
  importTitle: 'IMPORT EXCEL',
  previewTitle: 'Product List Preview Page',
  verifyButton: 'Verify & Confirm',
  importButton: 'Import',
  exportButton: 'Export',

  // Navigation
  masterMenu: 'master',
  palletMasterMenu: 'Pallet Master',

  // Add more fields as needed for other tests
};
